#pragma once

#include <stdint.h>

#include "mpu6050_reader.h"

struct ImuSample {
    Mpu6050RawData sensorData;
    uint32_t sampleIndex;
    uint32_t timestampMs;
};
