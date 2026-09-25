import assert from "node:assert/strict";
import { Buffer } from "buffer";
import test from "node:test";

import {
  decodeImuSampleV2,
  IMU_SAMPLE_V2_PAYLOAD_SIZE,
} from "../services/ble/imuSampleV2Payload";

test("decodes the firmware reference fixture byte for byte", () => {
  const payload = Uint8Array.from([
    0x02, 0x01,
    0x04, 0x03,
    0x06, 0x05,
    0x08, 0x07,
    0x0a, 0x09,
    0x0c, 0x0b,
    0x78, 0x56, 0x34, 0x12,
    0xef, 0xcd, 0xab, 0x90,
  ]);

  assert.equal(payload.byteLength, IMU_SAMPLE_V2_PAYLOAD_SIZE);
  assert.deepEqual(decodeImuSampleV2(payload), {
    ax: 0x0102,
    ay: 0x0304,
    az: 0x0506,
    gx: 0x0708,
    gy: 0x090a,
    gz: 0x0b0c,
    sampleIndex: 305419896,
    timestampMs: 2427178479,
  });
});

test("decodes negative int16 values encoded by the firmware fixture", () => {
  const payload = Uint8Array.from([
    0xff, 0xff,
    0xfe, 0xff,
    0x85, 0xff,
    0x00, 0xff,
    0x01, 0x80,
    0xd6, 0xff,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);

  assert.deepEqual(decodeImuSampleV2(payload), {
    ax: -1,
    ay: -2,
    az: -123,
    gx: -256,
    gy: -32767,
    gz: -42,
    sampleIndex: 0,
    timestampMs: 0,
  });
});

test("decodes signed int16 and unsigned uint32 boundaries", () => {
  const payload = Uint8Array.from([
    0x00, 0x80,
    0xff, 0x7f,
    0x00, 0x80,
    0xff, 0x7f,
    0x00, 0x80,
    0xff, 0x7f,
    0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff,
  ]);

  assert.deepEqual(decodeImuSampleV2(payload), {
    ax: -32768,
    ay: 32767,
    az: -32768,
    gx: 32767,
    gy: -32768,
    gz: 32767,
    sampleIndex: 4294967295,
    timestampMs: 4294967295,
  });
});

test("rejects a payload shorter than 20 bytes", () => {
  assert.equal(decodeImuSampleV2(new Uint8Array(19)), null);
});

test("rejects a payload longer than 20 bytes", () => {
  assert.equal(decodeImuSampleV2(new Uint8Array(21)), null);
});

test("preserves all 20 bytes through the BLE Base64 representation", () => {
  const source = Uint8Array.from([
    0x02, 0x01, 0x04, 0x03, 0x06, 0x05, 0x08, 0x07, 0x0a, 0x09,
    0x0c, 0x0b, 0x78, 0x56, 0x34, 0x12, 0xef, 0xcd, 0xab, 0x90,
  ]);
  const base64Value = Buffer.from(source).toString("base64");
  const restoredBytes = Buffer.from(base64Value, "base64");

  assert.equal(restoredBytes.byteLength, IMU_SAMPLE_V2_PAYLOAD_SIZE);
  assert.deepEqual(Array.from(restoredBytes), Array.from(source));
  assert.equal(decodeImuSampleV2(restoredBytes)?.sampleIndex, 305419896);
});
