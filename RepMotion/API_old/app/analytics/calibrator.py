from __future__ import annotations
import math
from statistics import mean
from dataclasses import dataclass
from analyser import Analyser, RepCandidate
from models.models import FusedSample, AnalysisResult, RepMetric
"""
"""




# ==============================================================
# --- Calibrator Helper Dataclasses ---
# ==============================================================
@dataclass(frozen=True, slots=True)
class RepSegment:
    rep_index: int
    start_ms: int
    mid_ms: int | None
    end_ms: int
    samples: list[FusedSample]

@dataclass(frozen=True, slots=True)
class RepFeatures:
    rep_index: int
    duration_ms: int
    concentric_duration_ms: int | None
    eccentric_duration_ms: int | None
    rom_deg: float
    path_length_deg: float
    mean_velocity: float
    peak_velocity: float
    concentric_mean_velocity: float | None
    concentric_peak_velocity: float | None
    shaking_score: float
    path_deviation_score: float
    sticking_phase: float | None
    sticking_severity: float | None

@dataclass(frozen=True, slots=True)
class CalibrationProfile:
    axis_name: str
    template_angle: list[float]
    template_velocity: list[float]
    angle_std: list[float]
    velocity_std: list[float]
    feature_means: dict[str, float]
    feature_stds: dict[str, float]
    acceptable_ranges: dict[str, tuple[float, float]]




# ==============================================================
# --- Calibrator Class ---
# ==============================================================
class Calibrator:
    """
    Calibrator responsibilities:
        - call the analyzer to isolate clean reps
        - convert kept reps into segments
        - extract rep features
        - normalize reps to fixed length
        - build and store a calibration profile
    """
    def __init__(
        self,
        analyser: Analyser | None = None,
        normalize_points: int = 100,
        min_valid_reps: int = 5,
    ) -> None:
        self.analyser = analyser or Analyser()
        self.normalize_points = normalize_points
        self.min_valid_reps = min_valid_reps
        self.profile: CalibrationProfile | None = None


    # ---------- Main API ----------
    def analyze(self, fused_samples: list[FusedSample]) -> AnalysisResult:
        if not fused_samples:
            self.profile = None
            return AnalysisResult(rep_count=0, reps=[], summary={"calibration_accepted": False})

        detection = self.analyser.detect_rep_candidates(fused_samples)
        kept_reps = detection.kept_reps

        if len(kept_reps) < self.min_valid_reps:
            self.profile = None
            return AnalysisResult(
                rep_count=0,
                reps=[],
                summary={
                    "calibration_accepted": False,
                    "reason": f"not enough clean reps: kept={len(kept_reps)} required={self.min_valid_reps}",
                    "candidate_rep_count": len(detection.candidate_reps),
                    "kept_rep_count": len(kept_reps),
                    "dominant_axis": detection.axis_name,
                },
            )

        segments = self._build_segments(fused_samples, kept_reps)
        features = [self._extract_features(seg, detection.axis_name) for seg in segments]

        normalized_angle_curves: list[list[float]] = []
        normalized_velocity_curves: list[list[float]] = []

        for seg in segments:
            angle_curve, velocity_curve = self._normalize_rep(seg.samples, detection.axis_name)
            normalized_angle_curves.append(angle_curve)
            normalized_velocity_curves.append(velocity_curve)

        self.profile = self._build_profile(
            axis_name=detection.axis_name,
            angle_curves=normalized_angle_curves,
            velocity_curves=normalized_velocity_curves,
            features=features,
        )

        rep_metrics = self._to_rep_metrics(kept_reps)

        duration_s = (fused_samples[-1].t_ms - fused_samples[0].t_ms) / 1000.0
        summary = {
            "calibration_accepted": True,
            "sample_count": len(fused_samples),
            "duration_s": duration_s,
            "candidate_rep_count": len(detection.candidate_reps),
            "kept_rep_count": len(kept_reps),
            "dominant_axis": detection.axis_name,
            "kept_block_start_ms": kept_reps[0].start_ms if kept_reps else None,
            "kept_block_end_ms": kept_reps[-1].end_ms if kept_reps else None,
            "normalize_points": self.normalize_points,
            "profile_feature_means": self.profile.feature_means,
            "profile_feature_stds": self.profile.feature_stds,
        }

        return AnalysisResult(
            rep_count=len(rep_metrics),
            reps=rep_metrics,
            summary=summary,
        )

    # ---------- Segments ----------
    def _build_segments(
        self,
        fused_samples: list[FusedSample],
        kept_reps: list[RepCandidate],
    ) -> list[RepSegment]:
        out: list[RepSegment] = []

        for i, rep in enumerate(kept_reps):
            seg = fused_samples[rep.start_idx:rep.end_idx + 1]
            out.append(
                RepSegment(
                    rep_index=i,
                    start_ms=rep.start_ms,
                    mid_ms=rep.mid_ms,
                    end_ms=rep.end_ms,
                    samples=seg,
                )
            )

        return out

    # ---------- Feature extraction ----------
    def _extract_features(self, seg: RepSegment, axis_name: str) -> RepFeatures:
        angle_deg = self._axis_signal_deg(seg.samples, axis_name)
        times_ms = [s.t_ms for s in seg.samples]
        velocity_deg_s = self._axis_velocity_deg_s(times_ms, angle_deg)

        duration_ms = seg.end_ms - seg.start_ms
        rom_deg = max(angle_deg) - min(angle_deg) if angle_deg else 0.0
        path_length_deg = self._path_length(angle_deg)
        mean_velocity = mean(velocity_deg_s) if velocity_deg_s else 0.0
        peak_velocity = max(velocity_deg_s) if velocity_deg_s else 0.0
        shaking_score = self._compute_shaking_score(seg.samples)
        path_deviation_score = self._compute_path_deviation(seg.samples, axis_name)

        concentric_duration_ms = None
        eccentric_duration_ms = None
        concentric_mean_velocity = None
        concentric_peak_velocity = None
        sticking_phase = None
        sticking_severity = None

        if seg.mid_ms is not None:
            concentric_duration_ms = max(seg.end_ms - seg.mid_ms, 0)
            eccentric_duration_ms = max(seg.mid_ms - seg.start_ms, 0)

            mid_idx = self._closest_index_to_ms(times_ms, seg.mid_ms)
            concentric_vel = velocity_deg_s[mid_idx:] if mid_idx < len(velocity_deg_s) else []

            if concentric_vel:
                concentric_mean_velocity = mean(concentric_vel)
                concentric_peak_velocity = max(concentric_vel)
                sticking_phase, sticking_severity = self._compute_sticking(concentric_vel)

        return RepFeatures(
            rep_index=seg.rep_index,
            duration_ms=duration_ms,
            concentric_duration_ms=concentric_duration_ms,
            eccentric_duration_ms=eccentric_duration_ms,
            rom_deg=rom_deg,
            path_length_deg=path_length_deg,
            mean_velocity=mean_velocity,
            peak_velocity=peak_velocity,
            concentric_mean_velocity=concentric_mean_velocity,
            concentric_peak_velocity=concentric_peak_velocity,
            shaking_score=shaking_score,
            path_deviation_score=path_deviation_score,
            sticking_phase=sticking_phase,
            sticking_severity=sticking_severity,
        )

    # ---------- Normalization / profile ----------
    def _normalize_rep(self, samples: list[FusedSample], axis_name: str) -> tuple[list[float], list[float]]:
        angle_deg = self._axis_signal_deg(samples, axis_name)
        times_ms = [s.t_ms for s in samples]
        velocity_deg_s = self._axis_velocity_deg_s(times_ms, angle_deg)

        if len(angle_deg) < 2:
            flat = [0.0] * self.normalize_points
            return flat, flat

        angle_curve = self._resample_curve(angle_deg, self.normalize_points)
        velocity_curve = self._resample_curve(velocity_deg_s or [0.0], self.normalize_points)

        return angle_curve, velocity_curve

    def _build_profile(
        self,
        axis_name: str,
        angle_curves: list[list[float]],
        velocity_curves: list[list[float]],
        features: list[RepFeatures],
    ) -> CalibrationProfile:
        template_angle = self._pointwise_mean(angle_curves)
        template_velocity = self._pointwise_mean(velocity_curves)

        angle_std = self._pointwise_std(angle_curves, template_angle)
        velocity_std = self._pointwise_std(velocity_curves, template_velocity)

        feature_means = {
            "duration_ms": self._mean_of(features, lambda f: float(f.duration_ms)),
            "rom_deg": self._mean_of(features, lambda f: f.rom_deg),
            "path_length_deg": self._mean_of(features, lambda f: f.path_length_deg),
            "mean_velocity": self._mean_of(features, lambda f: f.mean_velocity),
            "peak_velocity": self._mean_of(features, lambda f: f.peak_velocity),
            "shaking_score": self._mean_of(features, lambda f: f.shaking_score),
            "path_deviation_score": self._mean_of(features, lambda f: f.path_deviation_score),
        }

        feature_stds = {
            "duration_ms": self._std_of(features, lambda f: float(f.duration_ms)),
            "rom_deg": self._std_of(features, lambda f: f.rom_deg),
            "path_length_deg": self._std_of(features, lambda f: f.path_length_deg),
            "mean_velocity": self._std_of(features, lambda f: f.mean_velocity),
            "peak_velocity": self._std_of(features, lambda f: f.peak_velocity),
            "shaking_score": self._std_of(features, lambda f: f.shaking_score),
            "path_deviation_score": self._std_of(features, lambda f: f.path_deviation_score),
        }

        acceptable_ranges = {
            name: (
                feature_means[name] - 2.0 * feature_stds[name],
                feature_means[name] + 2.0 * feature_stds[name],
            )
            for name in feature_means.keys()
        }

        return CalibrationProfile(
            axis_name=axis_name,
            template_angle=template_angle,
            template_velocity=template_velocity,
            angle_std=angle_std,
            velocity_std=velocity_std,
            feature_means=feature_means,
            feature_stds=feature_stds,
            acceptable_ranges=acceptable_ranges,
        )

    # ---------- Output ----------
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

    # ---------- Small helpers ----------
    def _axis_signal_deg(self, samples: list[FusedSample], axis_name: str) -> list[float]:
        if axis_name == "roll":
            return [math.degrees(s.roll) for s in samples]
        if axis_name == "pitch":
            return [math.degrees(s.pitch) for s in samples]
        return [math.degrees(s.yaw) for s in samples]

    def _axis_velocity_deg_s(self, times_ms: list[int], angle_deg: list[float]) -> list[float]:
        out: list[float] = []
        for i in range(1, len(angle_deg)):
            dt = max((times_ms[i] - times_ms[i - 1]) / 1000.0, 1e-6)
            out.append(abs(angle_deg[i] - angle_deg[i - 1]) / dt)
        return out

    def _path_length(self, xs: list[float]) -> float:
        if len(xs) < 2:
            return 0.0
        return sum(abs(xs[i] - xs[i - 1]) for i in range(1, len(xs)))

    def _compute_shaking_score(self, seg: list[FusedSample]) -> float:
        vals = [s.gyro_magnitude for s in seg]
        if len(vals) < 2:
            return 0.0
        mu = sum(vals) / len(vals)
        var = sum((v - mu) ** 2 for v in vals) / len(vals)
        return math.sqrt(var)

    def _compute_path_deviation(self, seg: list[FusedSample], axis_name: str) -> float:
        def unwrap_deg(xs: list[float]) -> list[float]:
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

        roll_deg = unwrap_deg([math.degrees(s.roll) for s in seg])
        pitch_deg = unwrap_deg([math.degrees(s.pitch) for s in seg])
        yaw_deg = unwrap_deg([math.degrees(s.yaw) for s in seg])

        series = {
            "roll": roll_deg,
            "pitch": pitch_deg,
            "yaw": yaw_deg,
        }

        main = series[axis_name]
        others = [v for k, v in series.items() if k != axis_name]

        main_energy = self._path_length(main)
        off_energy = sum(self._path_length(v) for v in others)

        return off_energy / max(main_energy, 1e-6)

    def _compute_path_deviation_old(self, seg: list[FusedSample], axis_name: str) -> float:
        roll_deg = [math.degrees(s.roll) for s in seg]
        pitch_deg = [math.degrees(s.pitch) for s in seg]
        yaw_deg = [math.degrees(s.yaw) for s in seg]

        series = {
            "roll": roll_deg,
            "pitch": pitch_deg,
            "yaw": yaw_deg,
        }

        main = series[axis_name]
        others = [v for k, v in series.items() if k != axis_name]

        main_energy = self._path_length(main)
        off_energy = sum(self._path_length(v) for v in others)

        return off_energy / max(main_energy, 1e-6)

    def _compute_sticking(self, concentric_vel: list[float]) -> tuple[float | None, float | None]:
        if len(concentric_vel) < 3:
            return None, None

        peak = max(concentric_vel)
        if peak <= 1e-9:
            return None, None

        min_idx = min(range(len(concentric_vel)), key=lambda i: concentric_vel[i])
        min_val = concentric_vel[min_idx]

        phase = min_idx / max(len(concentric_vel) - 1, 1)
        severity = 1.0 - (min_val / peak)

        return phase, severity

    def _closest_index_to_ms(self, times_ms: list[int], target_ms: int) -> int:
        return min(range(len(times_ms)), key=lambda i: abs(times_ms[i] - target_ms))

    def _resample_curve(self, xs: list[float], n_out: int) -> list[float]:
        if not xs:
            return [0.0] * n_out
        if len(xs) == 1:
            return [xs[0]] * n_out
        if n_out <= 1:
            return [xs[0]]

        out: list[float] = []
        n_in = len(xs)

        for k in range(n_out):
            pos = k * (n_in - 1) / (n_out - 1)
            left = int(math.floor(pos))
            right = int(math.ceil(pos))

            if left == right:
                out.append(xs[left])
                continue

            w = pos - left
            out.append(xs[left] * (1.0 - w) + xs[right] * w)

        return out

    def _pointwise_mean(self, curves: list[list[float]]) -> list[float]:
        if not curves:
            return [0.0] * self.normalize_points
        n = len(curves[0])
        return [sum(curve[i] for curve in curves) / len(curves) for i in range(n)]

    def _pointwise_std(self, curves: list[list[float]], mu: list[float]) -> list[float]:
        if not curves:
            return [0.0] * self.normalize_points

        n = len(curves[0])
        out: list[float] = []

        for i in range(n):
            var = sum((curve[i] - mu[i]) ** 2 for curve in curves) / len(curves)
            out.append(math.sqrt(var))

        return out

    def _mean_of(self, xs: list[RepFeatures], fn) -> float:
        vals = [fn(x) for x in xs]
        return sum(vals) / len(vals) if vals else 0.0

    def _std_of(self, xs: list[RepFeatures], fn) -> float:
        vals = [fn(x) for x in xs]
        if not vals:
            return 0.0
        mu = sum(vals) / len(vals)
        var = sum((v - mu) ** 2 for v in vals) / len(vals)
        return math.sqrt(var)
    