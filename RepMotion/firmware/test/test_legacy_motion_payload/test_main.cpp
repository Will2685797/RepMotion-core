#include <algorithm>
#include <cstring>

#include <unity.h>

#include "ble/legacy_motion_payload.h"
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

void setup() {
    UNITY_BEGIN();
    RUN_TEST(test_formats_known_acceleration_as_legacy_csv);
    RUN_TEST(test_formats_negative_acceleration_as_legacy_csv);
    RUN_TEST(test_formats_int16_boundaries_as_legacy_csv);
    RUN_TEST(test_legacy_payload_contains_only_three_acceleration_fields);
    RUN_TEST(test_read_interval_remains_fifty_milliseconds);
    UNITY_END();
}

void loop() {}
