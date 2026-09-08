"""Inspect az offline. Requires matplotlib (python -m pip install matplotlib)."""

import argparse
import json
import math
from pathlib import Path
from statistics import mean, median, pstdev


# Temporary Kinovea observations for rowing_5reps_009, not final Ground Truth.
# (label, arrival video seconds, departure video seconds)
VIDEO_ANNOTATIONS = [
    ("B1", 21.28, 21.38),
    ("T1", 22.72, 22.75),
    ("B2", 25.28, 25.41),
    ("T2", 25.66, 25.71),
    ("B3", 29.18, 29.23),
    ("T3", 30.46, 30.52),
    ("B4", 32.96, 33.00),
    ("T4", 34.23, 34.27),
    ("B5", 36.85, 36.95),
    ("T5", 38.15, 38.22),
    ("B6", 40.69, None),
]


# Temporary video observations selected by dataset, not final Ground Truth.
VIDEO_ANNOTATIONS_BY_DATASET = {
    "rowing_5reps_009.json": VIDEO_ANNOTATIONS,
    "rowing_5reps_010.json": [
        ("B1", 22.11, 23.25),
        ("T1", 24.58, 24.65),
        ("B2", 26.98, 27.35),  # First visible mini movement: preserve departure.
        ("T2", 28.58, 28.62),
        ("B3", 30.90, 31.03),
        ("T3", 32.35, 32.38),
        ("B4", 34.40, 34.50),
        ("T4", 35.79, 35.82),
        ("B5", 37.85, 38.21),
        ("T5", 39.35, 39.42),
        ("B6", 41.69, None),
    ],
}


def sync_diagnostic(ax, az, start, end, baseline_start, baseline_end):
    """Describe departures from a user-selected baseline, without selecting GT."""
    baseline = az[baseline_start:baseline_end]
    average, center, sigma = mean(baseline), median(baseline), pstdev(baseline)
    mad = median(abs(value - center) for value in baseline)
    robust_sigma = 1.4826 * mad
    print(f"\nBaseline [{baseline_start}, {baseline_end}) (manually selected):")
    print(f"n={len(baseline)} mean={average:.4f} median={center:.4f} "
          f"sigma(population)={sigma:.4f} MAD={mad:.4f}")
    print(f"range=[{min(baseline):g}, {max(baseline):g}]; "
          f"mean +/- 3 sigma=[{average - 3 * sigma:.4f}, {average + 3 * sigma:.4f}]")
    print("Baseline stability must be checked visually; a short window is not proof.")
    print("Robust z = (az - median) / (1.4826 * MAD); n/a if scale is zero.")
    print(" Sample          az         delta     abs delta         z    robust z   >3sigma")
    for index in range(start, end):
        delta = az[index] - average
        z = f"{delta / sigma:.3f}" if sigma else "n/a"
        robust_z = f"{(az[index] - center) / robust_sigma:.3f}" if robust_sigma else "n/a"
        outside = abs(delta) > 3 * sigma
        print(f"{index:7} {az[index]:11g} {delta:13.4f} {abs(delta):13.4f} "
              f"{z:>9} {robust_z:>11} {str(outside):>9}")

    # Search only after the baseline, within the displayed range.
    first = next((i for i in range(max(start, baseline_end), end)
                  if abs(az[i] - average) > 3 * sigma), None)
    print(f"First sample outside mean +/- 3 sigma after baseline, in displayed range: {first}")
    print("DIAGNOSTIC ONLY: threshold crossing is not a Ground Truth onset or a sync anchor.")
    if sigma == 0:
        print("Zero sigma: thresholds collapse to the mean; any deviation crosses them.")

    ax.axvspan(baseline_start, baseline_end - 1, color="grey", alpha=0.15,
               label="Selected baseline")
    ax.axhline(average, color="black", linewidth=1, label="Baseline mean")
    for sign in (-1, 1):
        ax.axhline(average + sign * 3 * sigma, color="tab:red", linestyle="--",
                   linewidth=1, label="Mean +/- 3 sigma" if sign == 1 else None)
        if robust_sigma:
            ax.axhline(center + sign * 3 * robust_sigma, color="tab:purple", linestyle=":",
                       linewidth=1, label="Median +/- 3 x 1.4826 MAD" if sign == 1 else None)
    ax.legend(loc="best", fontsize=8)


def main():
    parser = argparse.ArgumentParser(description="Plot dataset az by sample index.")
    parser.add_argument("dataset", type=Path, help="Calibration JSON file")
    parser.add_argument("--start", type=int, default=0, help="First index (inclusive)")
    parser.add_argument("--end", type=int, help="Last index (exclusive)")
    parser.add_argument("--sync-video-time", type=float, help="SYNC time in video seconds")
    parser.add_argument("--sync-sample", type=float, help="SYNC sample index in IMU")
    parser.add_argument("--show-annotations", action="store_true",
                        help="Overlay temporary video annotations for the selected dataset (009/010)")
    parser.add_argument("--sync-diagnostic", action="store_true",
                        help="Inspect az baseline departures in the displayed range (not GT)")
    parser.add_argument("--baseline-start", type=int, default=115,
                        help="Baseline first index (inclusive, default: 115)")
    parser.add_argument("--baseline-end", type=int, default=123,
                        help="Baseline last index (exclusive, default: 123)")
    args = parser.parse_args()

    try:
        with args.dataset.open(encoding="utf-8-sig") as source:
            dataset = json.load(source)
        az = [float(sample["az"]) for sample in dataset["samples"]]
        rate = float(dataset.get("samplingRateHz", 20))
        if not math.isfinite(rate) or rate <= 0:
            raise ValueError("samplingRateHz must be finite and positive")
        if not all(math.isfinite(value) for value in az):
            raise ValueError("az values must be finite")
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.error(f"Cannot read dataset: {error}")

    end = len(az) if args.end is None else args.end
    if not 0 <= args.start < end <= len(az):
        parser.error(f"Expected 0 <= start < end <= {len(az)}")
    if args.sync_diagnostic and not (
        args.start <= args.baseline_start < args.baseline_end <= end
        and args.baseline_end - args.baseline_start >= 2
    ):
        parser.error("Baseline must contain at least two samples within the displayed range")
    if (args.sync_video_time is None) != (args.sync_sample is None):
        parser.error("Provide both --sync-video-time and --sync-sample")
    if args.show_annotations and args.sync_sample is None:
        parser.error("--show-annotations requires --sync-video-time and --sync-sample")
    if args.show_annotations and args.dataset.name not in VIDEO_ANNOTATIONS_BY_DATASET:
        parser.error(f"No temporary video annotations for {args.dataset.name}")
    offset = None
    if args.sync_sample is not None:
        if not math.isfinite(args.sync_video_time) or args.sync_video_time < 0:
            parser.error("--sync-video-time must be finite and nonnegative")
        if not math.isfinite(args.sync_sample) or not 0 <= args.sync_sample < len(az):
            parser.error("--sync-sample must be a finite index within the dataset")
        offset = args.sync_video_time - args.sync_sample / rate
        print(f"SYNC: video {args.sync_video_time:g} s = IMU sample {args.sync_sample:g} "
              f"({args.sync_sample / rate:.4f} s at {rate:g} Hz)")
        print(f"Video - IMU offset: {offset:.6f} s")

    try:
        import matplotlib.pyplot as plt
    except ImportError:
        parser.error("Install matplotlib: python -m pip install matplotlib")

    fig, ax = plt.subplots(figsize=(12, 5), layout="constrained")
    ax.plot(range(args.start, end), az[args.start:end], linewidth=1,
            marker="o" if args.sync_diagnostic else ".", markersize=5 if args.sync_diagnostic else 3)
    ax.set(xlabel="Sample index (zero-based)", ylabel="az", title=args.dataset.name)
    ax.grid(True, alpha=0.3)
    time_axis = ax.secondary_xaxis("top", functions=(lambda x: x / rate, lambda t: t * rate))
    time_axis.set_xlabel(f"Time (s) — {rate:g} Hz")
    if args.sync_diagnostic:
        sync_diagnostic(ax, az, args.start, end, args.baseline_start, args.baseline_end)

    def marker(index, text, color, style, height):
        if args.start <= index < end:
            ax.axvline(index, color=color, linestyle=style, linewidth=1, alpha=0.8)
            ax.text(index, height, text, transform=ax.get_xaxis_transform(),
                    rotation=90, va="top", ha="right", fontsize=8, color=color,
                    clip_on=True, bbox=dict(fc="white", ec="none", alpha=0.7, pad=1))

    if offset is not None:
        ax.set_title(f"{args.dataset.name} | SYNC: {args.sync_video_time:g} s / "
                     f"sample {args.sync_sample:g} | Video - IMU offset: {offset:.3f} s")
        marker(args.sync_sample, f"SYNC sample {args.sync_sample:g}", "purple", "-.", 0.98)
    if args.show_annotations:
        print("Annotation          Video (s)   sampleFloat    Rounded")
        for name, arrival, departure in VIDEO_ANNOTATIONS_BY_DATASET[args.dataset.name]:
            for event, video_time, color, style, height in (
                ("arrival", arrival, "tab:green", "-", 0.98),
                ("departure", departure, "tab:orange", "--", 0.48),
            ):
                if video_time is None:
                    continue
                index = (video_time - offset) * rate
                rounded = round(index)
                text = f"{name} {event}: {index:.2f} (round {rounded})"
                print(f"{name + ' ' + event:<19} {video_time:9.2f} {index:13.4f} {rounded:10}")
                marker(index, text, color, style, height)

    # Snap to the nearest sample on X; also works while zoomed into the signal.
    def sample_at(x):
        return max(args.start, min(end - 1, round(x)))

    def label(index):
        return f"sample={index}   az={az[index]:g}   t={index / rate:.3f} s"

    ax.format_coord = lambda x, y: label(sample_at(x))
    annotation = ax.annotate(
        "", xy=(0, 0), xytext=(10, 15), textcoords="offset points",
        bbox=dict(boxstyle="round", fc="white", alpha=0.9),
        arrowprops=dict(arrowstyle="->"), annotation_clip=False,
    )
    annotation.set_visible(False)

    def inspect(event):
        if event.inaxes is not ax or event.xdata is None:
            annotation.set_visible(False)
        else:
            index = sample_at(event.xdata)
            annotation.xy = (index, az[index])
            annotation.set_text(label(index))
            # Keep the text inside the plot near its right edge.
            right_half = event.xdata > sum(ax.get_xlim()) / 2
            annotation.set_position((-10 if right_half else 10, 15))
            annotation.set_ha("right" if right_half else "left")
            annotation.set_visible(True)
        fig.canvas.draw_idle()

    fig.canvas.mpl_connect("motion_notify_event", inspect)
    fig.canvas.mpl_connect("button_press_event", inspect)
    plt.show()  # Matplotlib's toolbar provides zoom, pan, reset and save.


if __name__ == "__main__":
    main()
