#include <algorithm>
#include <cstring>

#include <unity.h>

#include "ble/legacy_motion_payload.h"
#include "imu_sample.h"
#include "motion_capture_config.h"

void test_formats_known_acceleration_as_legacy_csv() {
    char payload[32];

    formatLegacyMotionPayload(payload, sizeof(payload), 12, 345, 6789);

    TEST_ASSERT_EQUAL_STRING("12,345,6789", payload);
}

void test_formats_negative_acceleration_as_legacy_csv() {
    char payload[32];

    formatLegacyMotionPayload(payload, sizeof(payload), -12, 0, -345);

    TEST_ASSERT_EQUAL_STRING("-12,0,-345", payload);
}

void test_formats_int16_boundaries_as_legacy_csv() {
    char payload[32];

    formatLegacyMotionPayload(payload, sizeof(payload), INT16_MIN, 0, INT16_MAX);

    TEST_ASSERT_EQUAL_STRING("-32768,0,32767", payload);
}

void test_legacy_payload_contains_only_three_acceleration_fields() {
    char payload[32];

    formatLegacyMotionPayload(payload, sizeof(payload), 1, 2, 3);

    TEST_ASSERT_EQUAL_INT(2, std::count(payload, payload + strlen(payload), ','));
}

void test_read_interval_remains_fifty_milliseconds() {
    TEST_ASSERT_EQUAL_UINT32(50, READ_INTERVAL_MS);
}

void test_imu_sample_preserves_sensor_data_and_capture_metadata() {
    const Mpu6050RawData sensorData = {
        -32768,
        -123,
        32767,
        -456,
        0,
        789,
    };
    const ImuSample sample = {sensorData, 42, 123456};

    TEST_ASSERT_EQUAL_INT16(-32768, sample.sensorData.accelX);
    TEST_ASSERT_EQUAL_INT16(-123, sample.sensorData.accelY);
    TEST_ASSERT_EQUAL_INT16(32767, sample.sensorData.accelZ);
    TEST_ASSERT_EQUAL_INT16(-456, sample.sensorData.gyroX);
    TEST_ASSERT_EQUAL_INT16(0, sample.sensorData.gyroY);
    TEST_ASSERT_EQUAL_INT16(789, sample.sensorData.gyroZ);
    TEST_ASSERT_EQUAL_UINT32(42, sample.sampleIndex);
    TEST_ASSERT_EQUAL_UINT32(123456, sample.timestampMs);
}

void test_legacy_payload_ignores_gyro_and_capture_metadata() {
    const Mpu6050RawData sensorData = {1, 2, 3, -456, 789, -123};
    const ImuSample sample = {sensorData, 42, 123456};
    char payload[32];

    formatLegacyMotionPayload(payload, sizeof(payload), sample);

    TEST_ASSERT_EQUAL_STRING("1,2,3", payload);
}

void setup() {
    UNITY_BEGIN();
    RUN_TEST(test_formats_known_acceleration_as_legacy_csv);
    RUN_TEST(test_formats_negative_acceleration_as_legacy_csv);
    RUN_TEST(test_formats_int16_boundaries_as_legacy_csv);
    RUN_TEST(test_legacy_payload_contains_only_three_acceleration_fields);
    RUN_TEST(test_read_interval_remains_fifty_milliseconds);
    RUN_TEST(test_imu_sample_preserves_sensor_data_and_capture_metadata);
    RUN_TEST(test_legacy_payload_ignores_gyro_and_capture_metadata);
    UNITY_END();
}

void loop() {}
