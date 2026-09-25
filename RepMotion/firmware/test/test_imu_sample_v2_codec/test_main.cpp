#include <unity.h>

#include "ble/imu_sample_v2_codec.h"

void test_v2_payload_size_is_exactly_twenty_bytes() {
    const ImuSample sample = {};
    const ImuSampleV2Payload payload = encodeImuSampleV2(sample);

    TEST_ASSERT_EQUAL_UINT32(20, IMU_SAMPLE_V2_PAYLOAD_SIZE);
    TEST_ASSERT_EQUAL_UINT32(20, payload.size());
}

void test_v2_encodes_known_sample_byte_for_byte_in_little_endian() {
    const Mpu6050RawData sensorData = {
        0x0102,
        0x0304,
        0x0506,
        0x0708,
        0x090A,
        0x0B0C,
    };
    const ImuSample sample = {sensorData, 0x12345678, 0x90ABCDEF};
    const ImuSampleV2Payload payload = encodeImuSampleV2(sample);
    const uint8_t expected[IMU_SAMPLE_V2_PAYLOAD_SIZE] = {
        0x02, 0x01,
        0x04, 0x03,
        0x06, 0x05,
        0x08, 0x07,
        0x0A, 0x09,
        0x0C, 0x0B,
        0x78, 0x56, 0x34, 0x12,
        0xEF, 0xCD, 0xAB, 0x90,
    };

    TEST_ASSERT_EQUAL_UINT8_ARRAY(expected, payload.data(), payload.size());
}

void test_v2_encodes_negative_int16_values_as_twos_complement() {
    const Mpu6050RawData sensorData = {-1, -2, -123, -256, -32767, -42};
    const ImuSample sample = {sensorData, 0, 0};
    const ImuSampleV2Payload payload = encodeImuSampleV2(sample);
    const uint8_t expected[IMU_SAMPLE_V2_PAYLOAD_SIZE] = {
        0xFF, 0xFF,
        0xFE, 0xFF,
        0x85, 0xFF,
        0x00, 0xFF,
        0x01, 0x80,
        0xD6, 0xFF,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
    };

    TEST_ASSERT_EQUAL_UINT8_ARRAY(expected, payload.data(), payload.size());
}

void test_v2_encodes_int16_boundaries_byte_for_byte() {
    const Mpu6050RawData sensorData = {
        INT16_MIN,
        INT16_MAX,
        INT16_MIN,
        INT16_MAX,
        INT16_MIN,
        INT16_MAX,
    };
    const ImuSample sample = {sensorData, UINT32_MAX, UINT32_MAX};
    const ImuSampleV2Payload payload = encodeImuSampleV2(sample);
    const uint8_t expected[IMU_SAMPLE_V2_PAYLOAD_SIZE] = {
        0x00, 0x80,
        0xFF, 0x7F,
        0x00, 0x80,
        0xFF, 0x7F,
        0x00, 0x80,
        0xFF, 0x7F,
        0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF,
    };

    TEST_ASSERT_EQUAL_UINT8_ARRAY(expected, payload.data(), payload.size());
}

void setup() {
    UNITY_BEGIN();
    RUN_TEST(test_v2_payload_size_is_exactly_twenty_bytes);
    RUN_TEST(test_v2_encodes_known_sample_byte_for_byte_in_little_endian);
    RUN_TEST(test_v2_encodes_negative_int16_values_as_twos_complement);
    RUN_TEST(test_v2_encodes_int16_boundaries_byte_for_byte);
    UNITY_END();
}

void loop() {}
