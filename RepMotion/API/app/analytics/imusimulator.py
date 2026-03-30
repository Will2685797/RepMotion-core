from __future__ import annotations
import math
import random
from typing import Optional, List, Callable, Tuple, Dict, Union, Any
from utils.utils import (
    _utc_now,
)
from models.models import (
    RawSample, Quaternion, Vec3, 
    ComputedSample,
    AnalysisResult, RepMetric
)
"""
"""




# ==============================================================
# --- IMUSimulator Helpers Classes and Functions ---
# ==============================================================




# ==============================================================
# --- IMUSimulator Class ---
# ==============================================================
class IMUSimulator:
    """
    Realistic IMU simulator:
      - maintains orientation with quaternion integration
      - projects gravity + magnetic field into body frame
      - outputs accel/gyro/mag samples
      - supports noise, gyro bias, and optional linear acceleration

    Coordinate convention used here:
      - World frame:
          +Z = up
          gravity vector = (0, 0, -g)
      - Body frame:
          sensor-fixed frame
      - Quaternion q represents body -> world orientation

    Output units:
      - accel: m/s^2
      - gyro:  rad/s
      - mag:   arbitrary normalized field units (consistent, not absolute uT)
    """
    def __init__(
        self,
        sample_hz: float = 100.0,
        gravity_mps2: float = 9.80665,
        mag_field_world: Vec3 = Vec3(0.45, 0.0, -0.20),   # arbitrary but realistic tilted field
        accel_noise_std: float = 0.03,                    # m/s^2
        gyro_noise_std: float = math.radians(0.15),       # rad/s
        mag_noise_std: float = 0.005,                     # arbitrary field units
        gyro_bias: Vec3 = Vec3(0.0, 0.0, 0.0),            # rad/s
        seed: Optional[int] = None,
    ) -> None:
        self.sample_hz = sample_hz
        self.dt = 1.0 / sample_hz
        self.gravity = gravity_mps2
        self.mag_field_world = mag_field_world.normalized()

        self.accel_noise_std = accel_noise_std
        self.gyro_noise_std = gyro_noise_std
        self.mag_noise_std = mag_noise_std
        self.gyro_bias = gyro_bias

        self._rng = random.Random(seed)

        self.reset()

    def reset(
        self,
        q_body_to_world: Quaternion = Quaternion(1.0, 0.0, 0.0, 0.0),
        t_ms: int = 0,
    ) -> None:
        self.q = q_body_to_world.normalized()
        self.t_ms = t_ms


    # ---------- Main API ----------
    def step(
        self,
        body_rates_rad_s: Vec3,
        linear_accel_body_mps2: Vec3 = Vec3(0.0, 0.0, 0.0),
    ) -> RawSample:
        """
        Advance simulator by one timestep.

        Inputs:
          - body_rates_rad_s: angular velocity in body frame [rad/s]
          - linear_accel_body_mps2: optional translational acceleration in body frame [m/s^2]

        Returns:
          RawSample with:
            accel = gravity projection + linear accel + noise
            gyro  = true body rates + bias + noise
            mag   = projected earth field + noise
        """
        dt = self.dt

        # 1) Integrate orientation from true body angular rate
        self.q = self._integrate_quaternion(self.q, body_rates_rad_s, dt)

        # 2) World vectors
        gravity_world = Vec3(0.0, 0.0, -self.gravity)
        mag_world = self.mag_field_world

        # 3) Project world vectors into body frame
        gravity_body = self.q.rotate_world_to_body(gravity_world)
        mag_body = self.q.rotate_world_to_body(mag_world)

        # 4) Simulated sensor outputs
        accel_true = gravity_body + linear_accel_body_mps2
        gyro_true = body_rates_rad_s
        mag_true = mag_body

        accel_meas = Vec3(
            accel_true.x + self._gauss(0.0, self.accel_noise_std),
            accel_true.y + self._gauss(0.0, self.accel_noise_std),
            accel_true.z + self._gauss(0.0, self.accel_noise_std),
        )

        gyro_meas = Vec3(
            gyro_true.x + self.gyro_bias.x + self._gauss(0.0, self.gyro_noise_std),
            gyro_true.y + self.gyro_bias.y + self._gauss(0.0, self.gyro_noise_std),
            gyro_true.z + self.gyro_bias.z + self._gauss(0.0, self.gyro_noise_std),
        )

        mag_meas = Vec3(
            mag_true.x + self._gauss(0.0, self.mag_noise_std),
            mag_true.y + self._gauss(0.0, self.mag_noise_std),
            mag_true.z + self._gauss(0.0, self.mag_noise_std),
        )

        sample = RawSample(
            t_ms=self.t_ms,
            ax=accel_meas.x,
            ay=accel_meas.y,
            az=accel_meas.z,
            gx=gyro_meas.x,
            gy=gyro_meas.y,
            gz=gyro_meas.z,
            mx=mag_meas.x,
            my=mag_meas.y,
            mz=mag_meas.z,
        )

        self.t_ms += int(round(dt * 1000.0))
        return sample

    def step_rep_motion(
        self,
        rep_freq_hz: float = 0.5,
        angle_amplitude_deg: float = 35.0,
        axis: str = "pitch",
        base_yaw_rate_deg_s: float = 0.0,
        tremor_deg_s: float = 2.0,
        tremor_freq_hz: float = 8.0,
        linear_accel_scale: float = 0.35,
    ) -> RawSample:
        """
        Simulate repetitive exercise-like motion.
        Useful for mock reps.
        """
        t = self.t_ms / 1000.0

        # target angle = A * sin(2*pi*f*t)
        # angular rate = derivative
        amp_rad = math.radians(angle_amplitude_deg)
        omega = 2.0 * math.pi * rep_freq_hz

        primary_rate = amp_rad * omega * math.cos(omega * t)
        tremor = math.radians(tremor_deg_s) * math.sin(2.0 * math.pi * tremor_freq_hz * t)
        yaw_rate = math.radians(base_yaw_rate_deg_s)

        wx = 0.0
        wy = 0.0
        wz = yaw_rate + 0.2 * tremor

        if axis == "roll":
            wx = primary_rate + tremor
        elif axis == "pitch":
            wy = primary_rate + tremor
        else:
            raise ValueError("axis must be 'roll' or 'pitch'")

        # crude translational accel tied to rep phase
        # enough to stress the filter without being nonsense
        lin_main = linear_accel_scale * math.sin(omega * t)
        if axis == "roll":
            lin = Vec3(0.0, lin_main, 0.0)
        else:
            lin = Vec3(lin_main, 0.0, 0.0)

        return self.step(
            body_rates_rad_s=Vec3(wx, wy, wz),
            linear_accel_body_mps2=lin,
        )
        
    def step_stationary(self) -> RawSample:
        return self.step(
            body_rates_rad_s=Vec3(0.0, 0.0, 0.0),
            linear_accel_body_mps2=Vec3(0.0, 0.0, 0.0),
        )

    def step_constant_rotation(
        self,
        wx_deg_s: float = 0.0,
        wy_deg_s: float = 0.0,
        wz_deg_s: float = 30.0,
        linear_accel_body_mps2: Vec3 = Vec3(0.0, 0.0, 0.0),
    ) -> RawSample:
        return self.step(
            body_rates_rad_s=Vec3(
                math.radians(wx_deg_s),
                math.radians(wy_deg_s),
                math.radians(wz_deg_s),
            ),
            linear_accel_body_mps2=linear_accel_body_mps2,
        )

    def step_sinusoidal_tilt(self) -> RawSample:
        """
        Example:
          - oscillating roll and pitch rate
          - weak forward/back translational accel
        """
        t = self.t_ms / 1000.0

        wx = math.radians(35.0) * math.sin(2.0 * math.pi * 0.35 * t)
        wy = math.radians(20.0) * math.sin(2.0 * math.pi * 0.55 * t + 0.6)
        wz = math.radians(10.0) * math.sin(2.0 * math.pi * 0.20 * t + 1.1)

        ax_lin = 0.6 * math.sin(2.0 * math.pi * 0.40 * t)
        ay_lin = 0.2 * math.sin(2.0 * math.pi * 0.70 * t + 0.2)
        az_lin = 0.0

        return self.step(
            body_rates_rad_s=Vec3(wx, wy, wz),
            linear_accel_body_mps2=Vec3(ax_lin, ay_lin, az_lin),
        )

    def step_random_motion(
        self,
        max_rate_deg_s: float = 60.0,
        linear_accel_scale: float = 1.0,
    ) -> RawSample:
        max_rate = math.radians(max_rate_deg_s)

        wx = self._rng.uniform(-max_rate, max_rate)
        wy = self._rng.uniform(-max_rate, max_rate)
        wz = self._rng.uniform(-max_rate, max_rate)

        ax = self._rng.uniform(-linear_accel_scale, linear_accel_scale)
        ay = self._rng.uniform(-linear_accel_scale, linear_accel_scale)
        az = self._rng.uniform(-0.25 * linear_accel_scale, 0.25 * linear_accel_scale)

        return self.step(
            body_rates_rad_s=Vec3(wx, wy, wz),
            linear_accel_body_mps2=Vec3(ax, ay, az),
        )
    
    def step_random_motion_old(
        self,
        max_rate_deg_s: float = 60.0,
        max_linear_accel_mps2: float = 1.2,
    ) -> RawSample:
        """
        Random-but-physically-valid one-step motion.
        Still much better than random sensor fields because
        gravity and magnetic field remain consistent with orientation.
        """
        rate = Vec3(
            math.radians(self._rng.uniform(-max_rate_deg_s, max_rate_deg_s)),
            math.radians(self._rng.uniform(-max_rate_deg_s, max_rate_deg_s)),
            math.radians(self._rng.uniform(-max_rate_deg_s, max_rate_deg_s)),
        )

        lin = Vec3(
            self._rng.uniform(-max_linear_accel_mps2, max_linear_accel_mps2),
            self._rng.uniform(-max_linear_accel_mps2, max_linear_accel_mps2),
            self._rng.uniform(-max_linear_accel_mps2, max_linear_accel_mps2),
        )

        return self.step(rate, lin)


    # ---------- Batch generators ----------
    def generate(
        self,
        n: int,
        motion_fn: Callable[[], RawSample],
    ) -> list[RawSample]:
        return [motion_fn() for _ in range(n)]

    def _current_euler_rad(self) -> Tuple[float, float, float]:
        """
        Returns roll, pitch, yaw in radians from current quaternion.
        """
        q = self.q.normalized()

        sinr_cosp = 2.0 * (q.w * q.x + q.y * q.z)
        cosr_cosp = 1.0 - 2.0 * (q.x * q.x + q.y * q.y)
        roll = math.atan2(sinr_cosp, cosr_cosp)

        sinp = 2.0 * (q.w * q.y - q.z * q.x)
        if abs(sinp) >= 1.0:
            pitch = math.copysign(math.pi / 2.0, sinp)
        else:
            pitch = math.asin(sinp)

        siny_cosp = 2.0 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z)
        yaw = math.atan2(siny_cosp, cosy_cosp)

        return roll, pitch, yaw

    def _current_euler_deg(self) -> Tuple[float, float, float]:
        r, p, y = self._current_euler_rad()
        return (
            math.degrees(r),
            math.degrees(p),
            math.degrees(y),
        )


    # ---------- Math ----------
    def _integrate_quaternion(
        self,
        q_body_to_world: Quaternion,
        body_rates_rad_s: Vec3,
        dt: float,
    ) -> Quaternion:
        """
        Quaternion kinematics for body->world quaternion:
            q_dot = 0.5 * q ⊗ omega_quat
        where omega_quat = [0, wx, wy, wz]
        """
        omega = Quaternion(0.0, body_rates_rad_s.x, body_rates_rad_s.y, body_rates_rad_s.z)
        q_dot = q_body_to_world * omega

        q_next = Quaternion(
            q_body_to_world.w + 0.5 * q_dot.w * dt,
            q_body_to_world.x + 0.5 * q_dot.x * dt,
            q_body_to_world.y + 0.5 * q_dot.y * dt,
            q_body_to_world.z + 0.5 * q_dot.z * dt,
        )
        return q_next.normalized()

    def _gauss(self, mean: float, std: float) -> float:
        return self._rng.gauss(mean, std)
    