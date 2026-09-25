import type { ImuData } from "../../types/imu";

export type { ImuData } from "../../types/imu";

export type LegacyMotionPayloadParseResult =
  | { data: ImuData }
  | {
      error: "missing_fields";
      receivedParts: number;
    }
  | {
      error: "invalid_value";
      axis: "ax" | "ay" | "az";
      rawValue: string;
    };

/** Parses the historical three-axis CSV payload emitted by the firmware. */
export function parseLegacyMotionPayload(
  payload: string,
): LegacyMotionPayloadParseResult {
  const parts = payload.split(",");

  if (parts.length !== 3) {
    return { error: "missing_fields", receivedParts: parts.length };
  }

  const [rawAx, rawAy, rawAz] = parts;
  const rawValues = [rawAx, rawAy, rawAz];
  const axes = ["ax", "ay", "az"] as const;
  const values: Partial<Pick<ImuData, "ax" | "ay" | "az">> = {};

  for (let index = 0; index < rawValues.length; index += 1) {
    const rawValue = rawValues[index].trim();
    const axis = axes[index];
    const value = Number(rawValue);

    if (rawValue.length === 0 || !Number.isFinite(value)) {
      return { error: "invalid_value", axis, rawValue };
    }

    values[axis] = value;
  }

  return {
    data: {
      ax: values.ax ?? 0,
      ay: values.ay ?? 0,
      az: values.az ?? 0,
      gx: 0,
      gy: 0,
      gz: 0,
    },
  };
}
