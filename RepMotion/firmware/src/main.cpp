#include <Arduino.h>
#include <Wire.h>

#include "i2c_scanner.h"
#include "imu_sample.h"
#include "motion_capture_config.h"
#include "mpu6050_reader.h"

#include "ble/ble_service.h"

constexpr int I2C_SDA_PIN = 8;
constexpr int I2C_SCL_PIN = 9;
unsigned long lastReadMs = 0;
uint32_t nextSampleIndex = 0;
bool mpuReady = false;

void printImuSample(const ImuSample& sample) {
    Serial.print("sampleIndex=");
    Serial.print(sample.sampleIndex);
    Serial.print(" timestampMs=");
    Serial.print(sample.timestampMs);
    Serial.print(" | ");
    printMpu6050Raw(sample.sensorData);
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("RepMotion firmware boot");
    Serial.println("Initializing I2C...");

    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

    Serial.println("I2C ready");

    scanI2CBus();

    mpuReady = initMpu6050();
    initBleService();
}

void loop() {
    if (!mpuReady) {
        delay(1000);
        return;
    }

    unsigned long now = millis();

    if (now - lastReadMs >= READ_INTERVAL_MS) {
        lastReadMs = now;

        const uint32_t sampleIndex = nextSampleIndex++;
        const uint32_t timestampMs = static_cast<uint32_t>(millis());
        Mpu6050RawData sensorData;

        if (readMpu6050Raw(sensorData)) {
            const ImuSample sample = {
                sensorData,
                sampleIndex,
                timestampMs,
            };

            printImuSample(sample);
            updateMotionDataCharacteristics(sample);
        } else {
            Serial.print("Failed to read MPU6050 data at sampleIndex=");
            Serial.print(sampleIndex);
            Serial.print(" timestampMs=");
            Serial.println(timestampMs);
        }
    }
}
