#pragma once

#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

inline int formatLegacyMotionPayload(
    char* payload,
    size_t payloadSize,
    int16_t accelX,
    int16_t accelY,
    int16_t accelZ
) {
    return snprintf(payload, payloadSize, "%d,%d,%d", accelX, accelY, accelZ);
}
