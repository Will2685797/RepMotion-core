from __future__ import annotations
import math
from typing import Optional, List, Literal, Tuple, Dict, Union, Any
from utils.utils import (
    _utc_now,
)
from models.models import (
    RawSample, Quaternion, Vec3, FusedSample, Quaternion,
    ComputedSample,
    AnalysisResult, RepMetric
)
"""
"""




# ==============================================================
# --- IMUProcessor Helpers Classes and Functions ---
# ==============================================================




# ==============================================================
# --- IMUProcessor Class ---
# ==============================================================
class IMUProcessor:
    def __init__(self, alpha: float = 0.98):
        self.alpha = alpha
        self.prev_t_ms: int | None = None

        self.roll = 0.0
        self.pitch = 0.0
        self.yaw = 0.0

        self.q = Quaternion(1.0, 0.0, 0.0, 0.0)


    # ---------- Main API ----------
    def process(self, sample: RawSample) -> FusedSample:
        is_first = self.prev_t_ms is None
        dt = self._compute_dt(sample.t_ms)

        accel_mag = self._compute_magnitude(sample.ax, sample.ay, sample.az)
        gyro_mag = self._compute_magnitude(sample.gx, sample.gy, sample.gz)

        if is_first:
            roll_acc, pitch_acc = self._compute_roll_pitch_from_accel(sample.ax, sample.ay, sample.az)
            yaw_mag = self._compute_yaw_from_mag(sample.mx, sample.my, sample.mz, roll_acc, pitch_acc)
            self.roll, self.pitch, self.yaw = roll_acc, pitch_acc, yaw_mag
        else:
            self.roll, self.pitch, self.yaw = self._compute_orientation_complementary(
                sample,
                dt,
                self.roll,
                self.pitch,
                self.yaw,
                self.alpha,
            )

        self.q = self._euler_to_quaternion(self.roll, self.pitch, self.yaw)

        if sample.t_ms <= 100:
            print(
                "DBG_PROCESS",
                {
                    "t_ms": sample.t_ms,
                    "ax": round(sample.ax, 4),
                    "ay": round(sample.ay, 4),
                    "az": round(sample.az, 4),
                    "gx": round(sample.gx, 4),
                    "gy": round(sample.gy, 4),
                    "gz": round(sample.gz, 4),
                    "roll_deg": round(math.degrees(self.roll), 3),
                    "pitch_deg": round(math.degrees(self.pitch), 3),
                    "yaw_deg": round(math.degrees(self.yaw), 3),
                }
            )

        return FusedSample(
            t_ms=sample.t_ms,
            ax=sample.ax,
            ay=sample.ay,
            az=sample.az,
            gx=sample.gx,
            gy=sample.gy,
            gz=sample.gz,
            mx=sample.mx,
            my=sample.my,
            mz=sample.mz,
            accel_magnitude=accel_mag,
            gyro_magnitude=gyro_mag,
            roll=self.roll,
            pitch=self.pitch,
            yaw=self.yaw,
            qw=self.q.w,
            qx=self.q.x,
            qy=self.q.y,
            qz=self.q.z,
        )

    def _compute_roll_pitch_from_accel(self, ax: float, ay: float, az: float) -> tuple[float, float]:
        roll = math.atan2(ay, -az)
        pitch = math.atan2(-ax, math.sqrt(ay * ay + az * az))
        return roll, pitch

    def _compute_dt(self, t_ms: int) -> float:
        if self.prev_t_ms is None:
            self.prev_t_ms = t_ms
            return 0.0
        dt = max(0.0, (t_ms - self.prev_t_ms) / 1000.0)
        self.prev_t_ms = t_ms
        return dt

    def _compute_magnitude(self, x: float, y: float, z: float) -> float:
        return math.sqrt(x*x + y*y + z*z)

    def _compute_yaw_from_mag(
        self,
        mx: float,
        my: float,
        mz: float,
        roll: float,
        pitch: float,
    ) -> float:
        cr = math.cos(roll)
        sr = math.sin(roll)
        cp = math.cos(pitch)
        sp = math.sin(pitch)

        mx2 = mx * cp + mz * sp
        my2 = mx * sr * sp + my * cr - mz * sr * cp
        return math.atan2(-my2, mx2)

    def _compute_orientation_complementary(
        self,
        sample: RawSample,
        dt: float,
        prev_roll: float,
        prev_pitch: float,
        prev_yaw: float,
        alpha: float,
    ) -> tuple[float, float, float]:
        roll_acc, pitch_acc = self._compute_roll_pitch_from_accel(sample.ax, sample.ay, sample.az)
        yaw_mag = self._compute_yaw_from_mag(sample.mx, sample.my, sample.mz, roll_acc, pitch_acc)

        roll_gyro = prev_roll + sample.gx * dt
        pitch_gyro = prev_pitch + sample.gy * dt
        yaw_gyro = prev_yaw + sample.gz * dt

        roll = alpha * roll_gyro + (1.0 - alpha) * roll_acc
        pitch = alpha * pitch_gyro + (1.0 - alpha) * pitch_acc

        yaw_err = self._wrap_angle_pi(yaw_mag - yaw_gyro)
        yaw = self._wrap_angle_pi(yaw_gyro + (1.0 - alpha) * yaw_err)

        return roll, pitch, yaw

    def _wrap_angle_pi(self, angle: float) -> float:
        while angle > math.pi:
            angle -= 2.0 * math.pi
        while angle < -math.pi:
            angle += 2.0 * math.pi
        return angle

    def _euler_to_quaternion(self, roll: float, pitch: float, yaw: float) -> Quaternion:
        cr = math.cos(roll * 0.5)
        sr = math.sin(roll * 0.5)
        cp = math.cos(pitch * 0.5)
        sp = math.sin(pitch * 0.5)
        cy = math.cos(yaw * 0.5)
        sy = math.sin(yaw * 0.5)

        return Quaternion(
            w=cr*cp*cy + sr*sp*sy,
            x=sr*cp*cy - cr*sp*sy,
            y=cr*sp*cy + sr*cp*sy,
            z=cr*cp*sy - sr*sp*cy,
        ).normalized()
