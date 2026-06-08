#pragma once

#include <stdint.h>

struct Mpu6050RawData {
    int16_t accelX;
    int16_t accelY;
    int16_t accelZ;
    int16_t gyroX;
    int16_t gyroY;
    int16_t gyroZ;
};

bool initMpu6050();
bool readMpu6050Raw(Mpu6050RawData& data);
void printMpu6050Raw(const Mpu6050RawData& data);