#pragma once

#include "../imu_sample.h"

void initBleService();
void updateMotionDataCharacteristics(const ImuSample& sample);
