#include <Arduino.h>
#include <Wire.h>

#include "i2c_scanner.h"
#include "mpu6050_reader.h"

#include "ble/ble_service.h"

constexpr int I2C_SDA_PIN = 8;
constexpr int I2C_SCL_PIN = 9;
constexpr unsigned long READ_INTERVAL_MS = 500;

unsigned long lastReadMs = 0;
bool mpuReady = false;

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

        Mpu6050RawData data;

        if (readMpu6050Raw(data)) {
            printMpu6050Raw(data);
            updateMotionDataCharacteristic(data);
        } else {
            Serial.println("Failed to read MPU6050 data.");
        }
    }
}