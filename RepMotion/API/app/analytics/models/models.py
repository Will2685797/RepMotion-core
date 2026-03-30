from __future__ import annotations
import os
import sys
import copy
import json
import math
import time
import uuid
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
from typing import Optional, List, Literal, Tuple, Dict, Union, Any
from utils.utils import (
    log_print,
    _dedupe_payloads,
    _utc_now,
    
    ConfigError, EngineError
)
"""
"""




# ==============================================================
# --- Analyser Helpers Dataclasses and Models ---
# ==============================================================
@dataclass(frozen=True, slots=True)
class RawSample:
    """
    MPU-9250 is a 9-axis IMU (Inertial Measurement Unit). It combines 3 sensors internally:
        Accelerometer (3-axis, linear acceleration):
        - ax, ay, az
        - Unit: g (or raw counts)
        - Measures acceleration including gravity
        - Used for tilt / motion detection

        Gyroscope (3-axis, (angular velocity):
        - gx, gy, gz
        - Unit: degrees/sec (°/s) or rad/s
        - Measures rotation speed
        
        Magnetometer (3-axis, compass/heading, actually a separate AK8963 chip inside):
        - mx, my, mz
        - Unit: microtesla (µT) or raw counts
        - Used for absolute orientation (north)
        
        Temperature:
        - Unit: °C
        
        
    What the chip returns:
        It outputs raw binary registers over I2C or SPI.
        
        
        Typical registers: (Each axis = 16-bit signed integer)
            ACCEL_XOUT_H
            ACCEL_XOUT_L
            ACCEL_YOUT_H
            ACCEL_YOUT_L
            ACCEL_ZOUT_H
            ACCEL_ZOUT_L

            TEMP_OUT_H
            TEMP_OUT_L

            GYRO_XOUT_H
            GYRO_XOUT_L
            GYRO_YOUT_H
            GYRO_YOUT_L
            GYRO_ZOUT_H
            GYRO_ZOUT_L
            
    Python formatting:
        {
        "ts": 1710000000,
        "ax": -0.02,
        "ay": 0.04,
        "az": 0.98,
        "gx": 1.25,
        "gy": -0.42,
        "gz": 0.11,
        "mx": 23.1,
        "my": -4.3,
        "mz": 39.8,
        "temp": 28.4
        }        
    
    """
    t_ms: int
    
    ax: float
    ay: float
    az: float
    
    gx: float
    gy: float
    gz: float

    mx: float
    my: float
    mz: float

@dataclass(frozen=True, slots=True)
class Vec3:
    x: float
    y: float
    z: float

    def __add__(self, other: "Vec3") -> "Vec3":
        return Vec3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other: "Vec3") -> "Vec3":
        return Vec3(self.x - other.x, self.y - other.y, self.z - other.z)

    def __mul__(self, scalar: float) -> "Vec3":
        return Vec3(self.x * scalar, self.y * scalar, self.z * scalar)

    def __rmul__(self, scalar: float) -> "Vec3":
        return self.__mul__(scalar)

    def norm(self) -> float:
        return math.sqrt(self.x * self.x + self.y * self.y + self.z * self.z)

    def normalized(self) -> "Vec3":
        n = self.norm()
        if n <= 1e-12:
            return Vec3(0.0, 0.0, 0.0)
        return Vec3(self.x / n, self.y / n, self.z / n)

    def as_tuple(self) -> tuple[float, float, float]:
        return (self.x, self.y, self.z)

@dataclass(frozen=True, slots=True)
class Quaternion:
    # q = w + x*i + y*j + z*k
    w: float
    x: float
    y: float
    z: float

    def normalized(self) -> "Quaternion":
        n = math.sqrt(self.w * self.w + self.x * self.x + self.y * self.y + self.z * self.z)
        if n <= 1e-12:
            return Quaternion(1.0, 0.0, 0.0, 0.0)
        return Quaternion(self.w / n, self.x / n, self.y / n, self.z / n)

    def conjugate(self) -> "Quaternion":
        return Quaternion(self.w, -self.x, -self.y, -self.z)

    def __mul__(self, other: "Quaternion") -> "Quaternion":
        return Quaternion(
            self.w * other.w - self.x * other.x - self.y * other.y - self.z * other.z,
            self.w * other.x + self.x * other.w + self.y * other.z - self.z * other.y,
            self.w * other.y - self.x * other.z + self.y * other.w + self.z * other.x,
            self.w * other.z + self.x * other.y - self.y * other.x + self.z * other.w,
        )

    def rotate_world_to_body(self, v_world: Vec3) -> Vec3:
        """
        Rotate a world-frame vector into the body frame using q that represents body->world.
        body_vec = q_conj * world_vec * q
        """
        qv = Quaternion(0.0, v_world.x, v_world.y, v_world.z)
        out = self.conjugate() * qv * self
        return Vec3(out.x, out.y, out.z)

    def rotate_body_to_world(self, v_body: Vec3) -> Vec3:
        """
        world_vec = q * body_vec * q_conj
        """
        qv = Quaternion(0.0, v_body.x, v_body.y, v_body.z)
        out = self * qv * self.conjugate()
        return Vec3(out.x, out.y, out.z)



@dataclass(frozen=True, slots=True)
class ComputedSample:
    t_ms: int
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float
    mx: float
    my: float
    mz: float
    accel_magnitude: float
    gyro_magnitude: float
    roll: float
    pitch: float
    yaw: float

@dataclass(frozen=True, slots=True)
class Orientation:
    roll: float
    pitch: float
    yaw: float

@dataclass(frozen=True, slots=True)
class FusedSample:
    t_ms: int
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float
    mx: float
    my: float
    mz: float
    accel_magnitude: float
    gyro_magnitude: float
    roll: float
    pitch: float
    yaw: float
    qw: float
    qx: float
    qy: float
    qz: float


# ==============================================================
# --- Analyser Helpers Models ---
# ==============================================================
@dataclass
class RepMetric:
    rep_index: int
    start_ms: int
    end_ms: int
    peak_velocity: float
    mean_velocity: float
    shaking_score: float
    sticking_point_ms: int | None

@dataclass
class AnalysisResult:
    rep_count: int
    reps: list[RepMetric]
    summary: dict
