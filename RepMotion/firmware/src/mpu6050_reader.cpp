#include "mpu6050_reader.h"

#include <Arduino.h>
#include <Wire.h>

constexpr uint8_t MPU6050_ADDRESS = 0x68;
constexpr uint8_t MPU6050_PWR_MGMT_1 = 0x6B;
constexpr uint8_t MPU6050_ACCEL_XOUT_H = 0x3B;

bool initMpu6050() {
    Wire.beginTransmission(MPU6050_ADDRESS);
    Wire.write(MPU6050_PWR_MGMT_1);
    Wire.write(0x00);

    byte error = Wire.endTransmission();

    if (error != 0) {
        Serial.println("Failed to initialize MPU6050.");
        return false;
    }

    Serial.println("MPU6050 initialized.");
    return true;
}

bool readMpu6050Raw(Mpu6050RawData& data) {
    Wire.beginTransmission(MPU6050_ADDRESS);
    Wire.write(MPU6050_ACCEL_XOUT_H);

    byte error = Wire.endTransmission(false);

    if (error != 0) {
        return false;
    }

    uint8_t bytesRead = Wire.requestFrom(MPU6050_ADDRESS, static_cast<uint8_t>(14));

    if (bytesRead != 14) {
        return false;
    }

    data.accelX = static_cast<int16_t>((Wire.read() << 8) | Wire.read());
    data.accelY = static_cast<int16_t>((Wire.read() << 8) | Wire.read());
    data.accelZ = static_cast<int16_t>((Wire.read() << 8) | Wire.read());

    Wire.read();
    Wire.read();

    data.gyroX = static_cast<int16_t>((Wire.read() << 8) | Wire.read());
    data.gyroY = static_cast<int16_t>((Wire.read() << 8) | Wire.read());
    data.gyroZ = static_cast<int16_t>((Wire.read() << 8) | Wire.read());

    return true;
}

void printMpu6050Raw(const Mpu6050RawData& data) {
    Serial.print("ACCEL x=");
    Serial.print(data.accelX);
    Serial.print(" y=");
    Serial.print(data.accelY);
    Serial.print(" z=");
    Serial.print(data.accelZ);

    Serial.print(" | GYRO x=");
    Serial.print(data.gyroX);
    Serial.print(" y=");
    Serial.print(data.gyroY);
    Serial.print(" z=");
    Serial.println(data.gyroZ);
}