#pragma once

#include "../mpu6050_reader.h"

void initBleService();
void updateMotionDataCharacteristic(const Mpu6050RawData& data);