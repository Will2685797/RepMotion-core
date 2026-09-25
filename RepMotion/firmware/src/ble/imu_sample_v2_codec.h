#pragma once

#include <array>
#include <stddef.h>
#include <stdint.h>

#include "../imu_sample.h"

constexpr size_t IMU_SAMPLE_V2_PAYLOAD_SIZE = 20;
using ImuSampleV2Payload = std::array<uint8_t, IMU_SAMPLE_V2_PAYLOAD_SIZE>;

inline void writeInt16LittleEndian(
    ImuSampleV2Payload& payload,
    size_t offset,
    int16_t value
) {
    const uint16_t bits = static_cast<uint16_t>(value);
    payload[offset] = static_cast<uint8_t>(bits & 0xFF);
    payload[offset + 1] = static_cast<uint8_t>((bits >> 8) & 0xFF);
}

inline void writeUint32LittleEndian(
    ImuSampleV2Payload& payload,
    size_t offset,
    uint32_t value
) {
    payload[offset] = static_cast<uint8_t>(value & 0xFF);
    payload[offset + 1] = static_cast<uint8_t>((value >> 8) & 0xFF);
    payload[offset + 2] = static_cast<uint8_t>((value >> 16) & 0xFF);
    payload[offset + 3] = static_cast<uint8_t>((value >> 24) & 0xFF);
}

inline ImuSampleV2Payload encodeImuSampleV2(const ImuSample& sample) {
    ImuSampleV2Payload payload = {};

    writeInt16LittleEndian(payload, 0, sample.sensorData.accelX);
    writeInt16LittleEndian(payload, 2, sample.sensorData.accelY);
    writeInt16LittleEndian(payload, 4, sample.sensorData.accelZ);
    writeInt16LittleEndian(payload, 6, sample.sensorData.gyroX);
    writeInt16LittleEndian(payload, 8, sample.sensorData.gyroY);
    writeInt16LittleEndian(payload, 10, sample.sensorData.gyroZ);
    writeUint32LittleEndian(payload, 12, sample.sampleIndex);
    writeUint32LittleEndian(payload, 16, sample.timestampMs);

    return payload;
}

static_assert(
    IMU_SAMPLE_V2_PAYLOAD_SIZE == 20,
    "IMU V2 payload must remain exactly 20 bytes"
);
