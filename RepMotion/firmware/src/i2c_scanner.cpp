#include "i2c_scanner.h"

#include <Arduino.h>
#include <Wire.h>

void scanI2CBus() {
    Serial.println("Scanning I2C bus...");

    int deviceCount = 0;

    for (byte address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        byte error = Wire.endTransmission();

        if (error == 0) {
            Serial.print("I2C device found at 0x");

            if (address < 16) {
                Serial.print("0");
            }

            Serial.println(address, HEX);
            deviceCount++;
        }
    }

    if (deviceCount == 0) {
        Serial.println("No I2C devices found.");
    } else {
        Serial.print("I2C scan complete. Devices found: ");
        Serial.println(deviceCount);
    }
}