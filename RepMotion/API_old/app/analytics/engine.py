from __future__ import annotations
import os
import sys
import copy
import json
import time
import uuid
import math
import signal
import pprint
import random
import asyncio
import hashlib
# import requests
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from urllib.parse import urlparse
from datetime import time as dtime
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field, asdict, replace
from typing import Callable, List, Literal, Tuple, Dict, Union, Any
from utils.utils import (
    log_print,
    _dedupe_payloads,
    _utc_now,
    
    ConfigError, EngineError
)
from models.models import (
    RawSample, Quaternion, Vec3, 
    ComputedSample,
    AnalysisResult, RepMetric
)
from calibrator import (
    Calibrator
)
from analyser import (
    Analyser
)
from imuprocessor import (
    IMUProcessor
)
from imusimulator import (
    IMUSimulator
)
"""
-> preprocessing
-> orientation / fused features
-> rep segmentation
-> calibration template builder
-> live rep comparator
-> per-rep scoring
-> session summary
"""
import analyser
import imuprocessor
print("ANALYSER_FILE =", analyser.__file__)
print("IMUPROCESSOR_FILE =", imuprocessor.__file__)




# ==============================================================
# --- Engine Helpers Classes and Functions ---
# ==============================================================
@dataclass(slots=True)
class Job:
    kind: str
    payloads: Any
    attempt: int = 0
    ready_at_utc: float = 0.0  # monotonic seconds

def _now_mono() -> float:
    return asyncio.get_running_loop().time()




# ==============================================================
# --- Engine Class ---
# ==============================================================
class Engine:
    """
    Engine:
    ----------------
    1. App uploads raw rep/sensor data to FastAPI
    2. FastAPI stores raw data in DB
    3. FastAPI service calls analyzer module directly
    4. Analyzer returns:
        - rep boundaries
        - speeds
        - sticking point
        - shaking metrics
        - summary
    5. FastAPI stores analyzed results in DB
    6. API returns session summary/result to app
    """
    def __init__(
        self,
    ):
        self.analyser = Analyser()
        self.analyser_queue: asyncio.Queue[Job] = asyncio.Queue(maxsize=50_000)
        self.analyser_worker_task: asyncio.Task | None = None


    # ---------- Jobs/Workers (async) ----------
    async def _analysis_worker_loop(self) -> None:
        while True:
            job = await self.analyser_queue.get()
            try:
                with SessionLocal() as db:
                    raw_samples = sample_repo.get_session_samples(db, session_id=job.payloads["session_id"])
                    result = self.analyze(raw_samples)
                    analysis_repo.save_analysis_result(db, job.payloads["session_id"], result)
                    db.commit()
            except Exception as e:
                log_print(f"[ANALYSIS][worker] failed: {e}")
            finally:
                self.analyser_queue.task_done()    
    
    def enqueue_set_analysis(
        self,
    ):
        pass  
        
    def enqueue_set_analysis(
        self,
    ):
        pass
    
    def _api_put_nowait(
        self, 
        job: Job
    ) -> None:
        try:
            self.analyser_queue.put_nowait(job)
        except asyncio.QueueFull:
            log_print(f"[API][_api_put_nowait] queue full -> dropping job kind={job.kind} n={len(job.payloads)}")
  

    # ---------- Main API ----------
    def analyze(
        self,
        raw_samples: list[SensorSampleInput]
    ) -> AnalysisResult:
        filtered = filter_samples(raw_samples)
        reps = detect_reps(filtered)
        metrics = compute_metrics(filtered, reps)
        return AnalysisResult(reps=reps, summary=...)




# ==============================================================
# --- MAIN ---
# ==============================================================
def main() -> None:
    sim = IMUSimulator(
        sample_hz=100.0,
        accel_noise_std=0.02,
        gyro_noise_std=math.radians(0.10),
        mag_noise_std=0.003,
        gyro_bias=Vec3(
            math.radians(0.05),
            math.radians(-0.03),
            math.radians(0.08),
        ),
        seed=42,
    )

    processor = IMUProcessor(alpha=0.98)
    analyser = Analyser()

    raw_samples = []
    for _ in range(2000):  # 20 seconds at 100 Hz
        raw_samples.append(
            sim.step_rep_motion(
                rep_freq_hz=0.45,
                angle_amplitude_deg=32.0,
                axis="pitch",
                tremor_deg_s=1.5,
                tremor_freq_hz=7.0,
            )
        )

    fused_samples = [processor.process(s) for s in raw_samples]
    result = analyser.analyze(fused_samples)

    print("rep_count =", result.rep_count)
    print("summary =", result.summary)
    for rep in result.reps[:5]:
        print(rep)

def calibration() -> None:
    sim = IMUSimulator(
        sample_hz=100.0,
        accel_noise_std=0.02,
        gyro_noise_std=math.radians(0.10),
        mag_noise_std=0.003,
        gyro_bias=Vec3(
            math.radians(0.05),
            math.radians(-0.03),
            math.radians(0.08),
        ),
        seed=42,
    )

    processor = IMUProcessor(alpha=0.98)
    calibrator = Calibrator()

    raw_samples: list[RawSample] = []

    print("1) User taps Start calibration.")
    print("2) System enters armed / recording state.")

    # --------------------------------------------------
    # Phase A — armed / quiet before unrack
    # Small natural noise, almost stationary
    # --------------------------------------------------
    raw_samples += _record_phase(
        sim,
        duration_s=1.0,
        step_fn=lambda: sim.step_stationary(),
    )

    print("3) User unracks and gets into position.")

    # --------------------------------------------------
    # Phase B — unrack / setup garbage
    # Messy, non-periodic movement
    # --------------------------------------------------
    raw_samples += _record_phase(
        sim,
        duration_s=2.0,
        step_fn=lambda: sim.step_random_motion(
            max_rate_deg_s=65.0,
            linear_accel_scale=1.2,
        ),
    )

    print("4) User stays still for 1–2 seconds.")

    # --------------------------------------------------
    # Phase C — stillness window
    # This is useful baseline data
    # --------------------------------------------------
    raw_samples += _record_phase(
        sim,
        duration_s=1.5,
        step_fn=lambda: sim.step_stationary(),
    )

    print("5) User performs 5–10 clean reps.")

    # --------------------------------------------------
    # Phase D — valid rep block
    # Example: ~7 reps at 0.45 Hz over ~15.5 s
    # --------------------------------------------------
    raw_samples += _record_phase(
        sim,
        duration_s=15.5,
        step_fn=lambda: sim.step_rep_motion(
            rep_freq_hz=0.45,
            angle_amplitude_deg=32.0,
            axis="pitch",
            tremor_deg_s=1.5,
            tremor_freq_hz=7.0,
            linear_accel_scale=0.35,
        ),
    )

    print("6) User reracks.")

    # --------------------------------------------------
    # Phase E — rerack / suffix garbage
    # Messy ending motion + impact-like instability
    # --------------------------------------------------
    raw_samples += _record_phase(
        sim,
        duration_s=2.0,
        step_fn=lambda: sim.step_random_motion(
            max_rate_deg_s=85.0,
            linear_accel_scale=1.6,
        ),
    )

    print("7) User taps Stop calibration.")

    # Optional short quiet tail after rerack
    raw_samples += _record_phase(
        sim,
        duration_s=0.5,
        step_fn=lambda: sim.step_stationary(),
    )

    print(f"raw sample count = {len(raw_samples)}")

    fused_samples = [processor.process(s) for s in raw_samples]
    # inspect only the clean rep block roughly:
    # A=1.0s, B=2.0s, C=1.5s  => rep block starts around 4.5s
    for s in fused_samples[450:650:10]:
        print(
            "DBG_REP_BLOCK",
            {
                "t_ms": s.t_ms,
                "roll_deg": round(math.degrees(s.roll), 2),
                "pitch_deg": round(math.degrees(s.pitch), 2),
                "yaw_deg": round(math.degrees(s.yaw), 2),
                "gyro_mag": round(s.gyro_magnitude, 3),
                "accel_mag": round(s.accel_magnitude, 3),
            }
        )    
    
    
    
    result = calibrator.analyze(fused_samples)
    print("rep_count =", result.rep_count)
    print("summary =", result.summary)

    for rep in result.reps[:10]:
        print(rep)

def _record_phase(
    sim: IMUSimulator,
    duration_s: float,
    step_fn: Callable[[], RawSample],
) -> list[RawSample]:
    n = int(duration_s * sim.sample_hz)
    return [step_fn() for _ in range(n)]




if __name__ == "__main__":
    calibration()
    # main()
