import type { ImuSampleV2 } from "../../types/imu";

export const IMU_SAMPLE_V2_PAYLOAD_SIZE = 20;

function readInt16LittleEndian(bytes: Uint8Array, offset: number): number {
  const value = bytes[offset] | (bytes[offset + 1] << 8);
  return value & 0x8000 ? value - 0x10000 : value;
}

function readUint32LittleEndian(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

export function decodeImuSampleV2(bytes: Uint8Array): ImuSampleV2 | null {
  if (bytes.byteLength !== IMU_SAMPLE_V2_PAYLOAD_SIZE) {
    return null;
  }

  return {
    ax: readInt16LittleEndian(bytes, 0),
    ay: readInt16LittleEndian(bytes, 2),
    az: readInt16LittleEndian(bytes, 4),
    gx: readInt16LittleEndian(bytes, 6),
    gy: readInt16LittleEndian(bytes, 8),
    gz: readInt16LittleEndian(bytes, 10),
    sampleIndex: readUint32LittleEndian(bytes, 12),
    timestampMs: readUint32LittleEndian(bytes, 16),
  };
}
