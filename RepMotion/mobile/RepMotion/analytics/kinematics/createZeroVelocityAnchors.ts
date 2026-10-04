import type { QuasiStaticInterval } from "./detectQuasiStaticIntervals";

export type ZeroVelocityAnchor = {
  timestampMs: number;
  targetVelocityMps: 0;
  sampleIndex?: number;
};

/** Creates one zero-velocity anchor at the temporal midpoint sample of each interval. */
export function createZeroVelocityAnchors(
  intervals: readonly Readonly<QuasiStaticInterval>[],
): ZeroVelocityAnchor[] {
  return intervals.map((interval, index) => {
    if (
      !Number.isFinite(interval.anchorTimestampMs) ||
      (index > 0 &&
        interval.anchorTimestampMs <= intervals[index - 1].anchorTimestampMs)
    ) {
      throw new RangeError(
        `Interval anchor timestamps must be finite and strictly increasing at index ${index}.`,
      );
    }
    return {
      timestampMs: interval.anchorTimestampMs,
      targetVelocityMps: 0,
      ...(interval.anchorSampleIndex === undefined
        ? {}
        : { sampleIndex: interval.anchorSampleIndex }),
    };
  });
}
