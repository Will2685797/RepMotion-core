import assert from "node:assert/strict";
import test from "node:test";

import { parseLegacyMotionPayload } from "../services/ble/motionPayload";

test("parses a valid historical acceleration CSV payload", () => {
  assert.deepEqual(parseLegacyMotionPayload("12,345,6789"), {
    data: { ax: 12, ay: 345, az: 6789, gx: 0, gy: 0, gz: 0 },
  });
});

test("parses negative historical acceleration values", () => {
  assert.deepEqual(parseLegacyMotionPayload("-12,0,-345"), {
    data: { ax: -12, ay: 0, az: -345, gx: 0, gy: 0, gz: 0 },
  });
});

test("rejects a malformed historical CSV value", () => {
  assert.deepEqual(parseLegacyMotionPayload("1,nope,3"), {
    error: "invalid_value",
    axis: "ay",
    rawValue: "nope",
  });
});

test("rejects a historical payload with a field count other than three", () => {
  assert.deepEqual(parseLegacyMotionPayload("1,2"), {
    error: "missing_fields",
    receivedParts: 2,
  });
  assert.deepEqual(parseLegacyMotionPayload("1,2,3,4"), {
    error: "missing_fields",
    receivedParts: 4,
  });
});

test("keeps V1 gyroscope values at zero", () => {
  const result = parseLegacyMotionPayload("1,2,3");

  assert.ok("data" in result);
  assert.deepEqual(
    { gx: result.data.gx, gy: result.data.gy, gz: result.data.gz },
    { gx: 0, gy: 0, gz: 0 },
  );
});
