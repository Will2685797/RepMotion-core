from __future__ import annotations
import math
from statistics import mean
from typing import Literal
from dataclasses import dataclass
from models.models import FusedSample, AnalysisResult, RepMetric
"""
"""




# ==============================================================
# --- Analyser Helper Dataclasses ---
# ==============================================================
AxisName = Literal["roll", "pitch", "yaw"]
ExtremumKind = Literal["peak", "trough"]

@dataclass(frozen=True, slots=True)
class DetectionConfig:
    smoothing_window: int = 5
    min_extrema_prom_deg: float = 0.3
    min_extrema_distance_samples: int = 30
    extrema_prominence_look_samples: int = 25

    min_rep_duration_s: float = 0.40
    max_rep_duration_s: float = 6.00
    min_rep_samples: int = 15
    min_rep_rom_deg: float = 4.0
    min_peak_velocity_deg_s: float = 4.0
    max_off_axis_ratio: float = 6.0

    max_gap_between_reps_s: float = 1.75

@dataclass(frozen=True, slots=True)
class Extremum:
    index: int
    value_deg: float
    kind: ExtremumKind

@dataclass(frozen=True, slots=True)
class RepCandidate:
    rep_index: int
    axis_name: AxisName

    start_idx: int
    mid_idx: int
    end_idx: int

    start_ms: int
    mid_ms: int
    end_ms: int

    duration_s: float
    rom_deg: float
    peak_velocity_deg_s: float
    mean_velocity_deg_s: float
    shaking_score: float
    off_axis_ratio: float
    quality_score: float

@dataclass(frozen=True, slots=True)
class DetectionResult:
    axis_name: AxisName
    candidate_reps: list[RepCandidate]
    kept_reps: list[RepCandidate]
    kept_start_idx: int | None
    kept_end_idx: int | None

@dataclass(frozen=True, slots=True)
class AxisDetectionEval:
    axis_name: AxisName
    smoothed_deg: list[float]
    extrema: list[Extremum]
    candidate_reps: list[RepCandidate]
    accepted_reps: list[RepCandidate]
    kept_reps: list[RepCandidate]
    score: tuple[int, int, int, float, float]
    



# ==============================================================
# --- Analyser Class ---
# ==============================================================
class Analyser:
    """
    Analyzer responsibilities:
        - detect dominant motion axis
        - build rep candidates from extrema cycles
        - reject weak / fake reps
        - keep the main contiguous valid block
        - expose final rep metrics + summary
    """
    def __init__(self, config: DetectionConfig | None = None) -> None:
        self.config = config or DetectionConfig()

    # ---------- Main API ----------
    def analyze(self, fused_samples: list[FusedSample]) -> AnalysisResult:
        if not fused_samples:
            return AnalysisResult(rep_count=0, reps=[], summary={})

        detection = self.detect_rep_candidates(fused_samples)
        reps = self._to_rep_metrics(detection.kept_reps)

        summary = {
            "sample_count": len(fused_samples),
            "duration_s": (fused_samples[-1].t_ms - fused_samples[0].t_ms) / 1000.0,
            "rep_count": len(reps),
            "candidate_rep_count": len(detection.candidate_reps),
            "kept_rep_count": len(detection.kept_reps),
            "dominant_axis": detection.axis_name,
            "kept_block_start_ms": (
                fused_samples[detection.kept_start_idx].t_ms
                if detection.kept_start_idx is not None
                else None
            ),
            "kept_block_end_ms": (
                fused_samples[detection.kept_end_idx].t_ms
                if detection.kept_end_idx is not None
                else None
            ),
            "mean_accel_magnitude": mean(s.accel_magnitude for s in fused_samples),
            "mean_gyro_magnitude": mean(s.gyro_magnitude for s in fused_samples),
            "calibration_like_clean_block_found": len(detection.kept_reps) > 0,
        }

        return AnalysisResult(
            rep_count=len(reps),
            reps=reps,
            summary=summary,
        )

    def detect_rep_candidates(self, fused_samples: list[FusedSample]) -> DetectionResult:
        if len(fused_samples) < 3:
            return DetectionResult(
                axis_name="pitch",
                candidate_reps=[],
                kept_reps=[],
                kept_start_idx=None,
                kept_end_idx=None,
            )

        evals = [
            self._evaluate_axis(fused_samples, "roll"),
            self._evaluate_axis(fused_samples, "pitch"),
            self._evaluate_axis(fused_samples, "yaw"),
        ]

        best = max(evals, key=lambda e: e.score)

        if best.kept_reps:
            kept_start_idx = best.kept_reps[0].start_idx
            kept_end_idx = best.kept_reps[-1].end_idx
        else:
            kept_start_idx = None
            kept_end_idx = None

        print(
            "DBG_AXIS_EVALS",
            [
                {
                    "axis": e.axis_name,
                    "candidates": len(e.candidate_reps),
                    "accepted": len(e.accepted_reps),
                    "kept": len(e.kept_reps),
                    "score": e.score,
                }
                for e in evals
            ],
        )

        return DetectionResult(
            axis_name=best.axis_name,
            candidate_reps=best.candidate_reps,
            kept_reps=best.kept_reps,
            kept_start_idx=kept_start_idx,
            kept_end_idx=kept_end_idx,
        )
    
    def _evaluate_axis(
        self,
        fused_samples: list[FusedSample],
        axis_name: AxisName,
    ) -> AxisDetectionEval:
        axis_signal_deg = self._unwrap_deg(self._get_axis_signal_deg(fused_samples, axis_name))
        smoothed_deg = self._moving_average(axis_signal_deg, self.config.smoothing_window)

        extrema = self._find_extrema(smoothed_deg)
        if axis_name == "pitch":
            print("DBG_PITCH_EXTREMA", [
                {
                    "idx": e.index,
                    "t_ms": fused_samples[e.index].t_ms,
                    "kind": e.kind,
                    "deg": round(e.value_deg, 2),
                }
                for e in extrema[:30]
            ])            
            for s in fused_samples[450:2000:20]:
                print("DBG_PITCH_FULL", {
                    "t_ms": s.t_ms,
                    "pitch_deg": round(math.degrees(s.pitch), 2),
                    "yaw_deg": round(math.degrees(s.yaw), 2),
                })    

        candidate_reps = self._build_rep_candidates(
            fused_samples=fused_samples,
            axis_name=axis_name,
            smoothed_signal_deg=smoothed_deg,
            extrema=extrema,
        )

        accepted_reps = [c for c in candidate_reps if self._accept_candidate(c)]
        kept_reps = self._select_main_contiguous_block(accepted_reps)

        score = (
            len(kept_reps),
            len(accepted_reps),
            len(candidate_reps),
            sum(r.quality_score for r in accepted_reps),
            sum(r.rom_deg for r in accepted_reps),
        )

        return AxisDetectionEval(
            axis_name=axis_name,
            smoothed_deg=smoothed_deg,
            extrema=extrema,
            candidate_reps=candidate_reps,
            accepted_reps=accepted_reps,
            kept_reps=kept_reps,
            score=score,
        )
    
    def detect_rep_candidates_old(self, fused_samples: list[FusedSample]) -> DetectionResult:
        if len(fused_samples) < 3:
            return DetectionResult(
                axis_name="pitch",
                candidate_reps=[],
                kept_reps=[],
                kept_start_idx=None,
                kept_end_idx=None,
            )

        axis_name = self._detect_dominant_axis(fused_samples)
        axis_signal_deg = self._unwrap_deg(self._get_axis_signal_deg(fused_samples, axis_name))
        smoothed_deg = self._moving_average(axis_signal_deg, self.config.smoothing_window)

        extrema = self._find_extrema(smoothed_deg)
        candidate_reps = self._build_rep_candidates(
            fused_samples=fused_samples,
            axis_name=axis_name,
            smoothed_signal_deg=smoothed_deg,
            extrema=extrema,
        )

        accepted = [c for c in candidate_reps if self._accept_candidate(c)]
        kept = self._select_main_contiguous_block(accepted)

        print("DBG_CANDIDATE_COUNT", len(candidate_reps))
        for c in candidate_reps[:15]:
            print(
                "DBG_CANDIDATE",
                {
                    "rep_index": c.rep_index,
                    "axis": c.axis_name,
                    "start_ms": c.start_ms,
                    "end_ms": c.end_ms,
                    "duration_s": round(c.duration_s, 3),
                    "rom_deg": round(c.rom_deg, 3),
                    "peak_velocity_deg_s": round(c.peak_velocity_deg_s, 3),
                    "off_axis_ratio": round(c.off_axis_ratio, 3),
                    "quality_score": round(c.quality_score, 3),
                    "accepted": self._accept_candidate(c),
                }
            )      
            
        if kept:
            kept_start_idx = kept[0].start_idx
            kept_end_idx = kept[-1].end_idx
        else:
            kept_start_idx = None
            kept_end_idx = None

        return DetectionResult(
            axis_name=axis_name,
            candidate_reps=candidate_reps,
            kept_reps=kept,
            kept_start_idx=kept_start_idx,
            kept_end_idx=kept_end_idx,
        )

    # ---------- Axis ----------
    def _detect_dominant_axis(self, xs: list[FusedSample]) -> AxisName:
        roll_deg = self._unwrap_deg(self._get_axis_signal_deg(xs, "roll"))
        pitch_deg = self._unwrap_deg(self._get_axis_signal_deg(xs, "pitch"))
        yaw_deg = self._unwrap_deg(self._get_axis_signal_deg(xs, "yaw"))

        roll_energy = self._sum_abs_deltas(roll_deg)
        pitch_energy = self._sum_abs_deltas(pitch_deg)
        yaw_energy = self._sum_abs_deltas(yaw_deg)

        energies = {
            "roll": roll_energy,
            "pitch": pitch_energy,
            "yaw": yaw_energy,
        }
        return max(energies, key=energies.get)

    def _get_axis_signal_deg(self, xs: list[FusedSample], axis_name: AxisName) -> list[float]:
        if axis_name == "roll":
            return [math.degrees(s.roll) for s in xs]
        if axis_name == "pitch":
            return [math.degrees(s.pitch) for s in xs]
        return [math.degrees(s.yaw) for s in xs]

    # ---------- Candidate building ----------
    def _find_extrema(self, signal_deg: list[float]) -> list[Extremum]:
        if len(signal_deg) < 3:
            return []

        raw_extrema: list[Extremum] = []
        min_dist = self.config.min_extrema_distance_samples
        prom_min = self.config.min_extrema_prom_deg
        look = self.config.extrema_prominence_look_samples

        for i in range(1, len(signal_deg) - 1):
            prev_v = signal_deg[i - 1]
            cur_v = signal_deg[i]
            next_v = signal_deg[i + 1]

            is_peak = prev_v < cur_v and cur_v >= next_v
            is_trough = prev_v > cur_v and cur_v <= next_v

            if not is_peak and not is_trough:
                continue

            left_start = max(0, i - look)
            right_end = min(len(signal_deg), i + look + 1)
            left = signal_deg[left_start:i]
            right = signal_deg[i + 1:right_end]

            if not left or not right:
                continue

            if is_peak:
                prominence = cur_v - max(min(left), min(right))
                kind: ExtremumKind = "peak"
            else:
                prominence = min(max(left), max(right)) - cur_v
                kind = "trough"

            if prominence < prom_min:
                continue

            raw_extrema.append(Extremum(index=i, value_deg=cur_v, kind=kind))

        return self._compress_extrema(raw_extrema)

    def _compress_extrema(self, extrema: list[Extremum]) -> list[Extremum]:
        if not extrema:
            return []

        out: list[Extremum] = [extrema[0]]
        min_dist = self.config.min_extrema_distance_samples

        for ext in extrema[1:]:
            last = out[-1]

            if ext.kind == last.kind and (ext.index - last.index) <= min_dist:
                if ext.kind == "peak":
                    if ext.value_deg > last.value_deg:
                        out[-1] = ext
                else:
                    if ext.value_deg < last.value_deg:
                        out[-1] = ext
                continue

            if ext.kind == last.kind:
                last_more_extreme = (
                    last.value_deg >= ext.value_deg if ext.kind == "peak"
                    else last.value_deg <= ext.value_deg
                )
                if not last_more_extreme:
                    out[-1] = ext
                continue

            out.append(ext)

        return out

    def _build_rep_candidates(
        self,
        fused_samples: list[FusedSample],
        axis_name: AxisName,
        smoothed_signal_deg: list[float],
        extrema: list[Extremum],
    ) -> list[RepCandidate]:
        candidates: list[RepCandidate] = []
        i = 0

        while i + 2 < len(extrema):
            a = extrema[i]
            b = extrema[i + 1]
            c = extrema[i + 2]

            is_full_cycle = (a.kind == c.kind) and (a.kind != b.kind)
            if not is_full_cycle:
                i += 1
                continue

            start_idx = a.index
            mid_idx = b.index
            end_idx = c.index

            if end_idx <= start_idx:
                i += 1
                continue

            seg = fused_samples[start_idx:end_idx + 1]
            if len(seg) < 2:
                i += 2
                continue

            main_seg = smoothed_signal_deg[start_idx:end_idx + 1]
            duration_s = (seg[-1].t_ms - seg[0].t_ms) / 1000.0
            rom_deg = max(main_seg) - min(main_seg)

            velocities_deg_s = self._axis_velocity_deg_s(
                times_ms=[s.t_ms for s in seg],
                angle_deg=main_seg,
            )
            peak_velocity = max(velocities_deg_s) if velocities_deg_s else 0.0
            mean_velocity = mean(velocities_deg_s) if velocities_deg_s else 0.0

            shaking_score = self._compute_shaking_score(seg)
            off_axis_ratio = self._compute_off_axis_ratio(seg, axis_name)
            quality_score = self._compute_quality_score(
                duration_s=duration_s,
                rom_deg=rom_deg,
                peak_velocity_deg_s=peak_velocity,
                off_axis_ratio=off_axis_ratio,
            )

            candidates.append(
                RepCandidate(
                    rep_index=len(candidates),
                    axis_name=axis_name,
                    start_idx=start_idx,
                    mid_idx=mid_idx,
                    end_idx=end_idx,
                    start_ms=seg[0].t_ms,
                    mid_ms=fused_samples[mid_idx].t_ms,
                    end_ms=seg[-1].t_ms,
                    duration_s=duration_s,
                    rom_deg=rom_deg,
                    peak_velocity_deg_s=peak_velocity,
                    mean_velocity_deg_s=mean_velocity,
                    shaking_score=shaking_score,
                    off_axis_ratio=off_axis_ratio,
                    quality_score=quality_score,
                )
            )

            i += 2

        return candidates

    # ---------- Candidate filtering ----------
    def _accept_candidate(self, c: RepCandidate) -> bool:
        sample_count = c.end_idx - c.start_idx + 1

        if c.duration_s < self.config.min_rep_duration_s:
            return False
        if c.duration_s > self.config.max_rep_duration_s:
            return False
        if sample_count < self.config.min_rep_samples:
            return False
        if c.rom_deg < self.config.min_rep_rom_deg:
            return False
        if c.peak_velocity_deg_s < self.config.min_peak_velocity_deg_s:
            return False
        if c.off_axis_ratio > self.config.max_off_axis_ratio:
            return False

        return True

    def _select_main_contiguous_block(self, reps: list[RepCandidate]) -> list[RepCandidate]:
        if not reps:
            return []

        ordered = sorted(reps, key=lambda r: r.start_idx)

        groups: list[list[RepCandidate]] = []
        cur_group: list[RepCandidate] = [ordered[0]]

        for rep in ordered[1:]:
            prev = cur_group[-1]
            gap_s = (rep.start_ms - prev.end_ms) / 1000.0

            if gap_s <= self.config.max_gap_between_reps_s:
                cur_group.append(rep)
            else:
                groups.append(cur_group)
                cur_group = [rep]

        groups.append(cur_group)

        best_group = max(
            groups,
            key=lambda g: (
                len(g),
                sum(r.quality_score for r in g),
                sum(r.rom_deg for r in g),
            ),
        )

        return [
            self._reindex_candidate(rep, new_index=i)
            for i, rep in enumerate(best_group)
        ]

    # ---------- Metrics / summaries ----------
    def _to_rep_metrics(self, reps: list[RepCandidate]) -> list[RepMetric]:
        return [
            RepMetric(
                rep_index=i,
                start_ms=rep.start_ms,
                end_ms=rep.end_ms,
                peak_velocity=rep.peak_velocity_deg_s,
                mean_velocity=rep.mean_velocity_deg_s,
                shaking_score=rep.shaking_score,
                sticking_point_ms=rep.mid_ms,
            )
            for i, rep in enumerate(reps)
        ]

    def _compute_quality_score(
        self,
        duration_s: float,
        rom_deg: float,
        peak_velocity_deg_s: float,
        off_axis_ratio: float,
    ) -> float:
        duration_term = 1.0 if self.config.min_rep_duration_s <= duration_s <= self.config.max_rep_duration_s else 0.0
        rom_term = min(rom_deg / max(self.config.min_rep_rom_deg, 1e-6), 3.0)
        vel_term = min(peak_velocity_deg_s / max(self.config.min_peak_velocity_deg_s, 1e-6), 3.0)
        axis_term = max(0.0, 1.5 - off_axis_ratio)
        return duration_term + rom_term + vel_term + axis_term

    def _compute_shaking_score(self, seg: list[FusedSample]) -> float:
        vals = [s.gyro_magnitude for s in seg]
        if len(vals) < 2:
            return 0.0
        mu = sum(vals) / len(vals)
        var = sum((v - mu) ** 2 for v in vals) / len(vals)
        return math.sqrt(var)

    def _compute_off_axis_ratio(self, seg: list[FusedSample], axis_name: AxisName) -> float:
        roll_deg = self._unwrap_deg([math.degrees(s.roll) for s in seg])
        pitch_deg = self._unwrap_deg([math.degrees(s.pitch) for s in seg])
        yaw_deg = self._unwrap_deg([math.degrees(s.yaw) for s in seg])

        axis_series = {
            "roll": roll_deg,
            "pitch": pitch_deg,
            "yaw": yaw_deg,
        }

        main = axis_series[axis_name]
        others = [v for k, v in axis_series.items() if k != axis_name]

        main_energy = self._sum_abs_deltas(main)
        off_energy = sum(self._sum_abs_deltas(series) for series in others)

        return off_energy / max(main_energy, 1e-6)

    # ---------- Small helpers ----------
    def _axis_velocity_deg_s(self, times_ms: list[int], angle_deg: list[float]) -> list[float]:
        out: list[float] = []
        for i in range(1, len(angle_deg)):
            dt = max((times_ms[i] - times_ms[i - 1]) / 1000.0, 1e-6)
            out.append(abs(angle_deg[i] - angle_deg[i - 1]) / dt)
        return out

    def _moving_average(self, xs: list[float], window: int) -> list[float]:
        if window <= 1 or len(xs) <= 2:
            return xs[:]

        half = window // 2
        out: list[float] = []

        for i in range(len(xs)):
            lo = max(0, i - half)
            hi = min(len(xs), i + half + 1)
            out.append(sum(xs[lo:hi]) / (hi - lo))

        return out

    def _sum_abs_deltas(self, xs: list[float]) -> float:
        if len(xs) < 2:
            return 0.0
        return sum(abs(xs[i] - xs[i - 1]) for i in range(1, len(xs)))

    def _reindex_candidate(self, rep: RepCandidate, new_index: int) -> RepCandidate:
        return RepCandidate(
            rep_index=new_index,
            axis_name=rep.axis_name,
            start_idx=rep.start_idx,
            mid_idx=rep.mid_idx,
            end_idx=rep.end_idx,
            start_ms=rep.start_ms,
            mid_ms=rep.mid_ms,
            end_ms=rep.end_ms,
            duration_s=rep.duration_s,
            rom_deg=rep.rom_deg,
            peak_velocity_deg_s=rep.peak_velocity_deg_s,
            mean_velocity_deg_s=rep.mean_velocity_deg_s,
            shaking_score=rep.shaking_score,
            off_axis_ratio=rep.off_axis_ratio,
            quality_score=rep.quality_score,
        )

    def _unwrap_deg(self, xs: list[float]) -> list[float]:
        if not xs:
            return []

        out = [xs[0]]
        offset = 0.0

        for i in range(1, len(xs)):
            cur = xs[i]
            prev = xs[i - 1]
            delta = cur - prev

            if delta > 180.0:
                offset -= 360.0
            elif delta < -180.0:
                offset += 360.0

            out.append(cur + offset)

        return out 
        