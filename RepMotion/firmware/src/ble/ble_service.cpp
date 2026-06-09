#include "ble_service.h"

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

constexpr const char* BLE_DEVICE_NAME = "RepMotion";

void initBleService() {
    Serial.println("Initializing BLE...");

    BLEDevice::init(BLE_DEVICE_NAME);

    BLEServer* server = BLEDevice::createServer();

    BLEAdvertising* advertising = BLEDevice::getAdvertising();
    advertising->setScanResponse(true);
    advertising->setMinPreferred(0x06);
    advertising->setMinPreferred(0x12);

    BLEDevice::startAdvertising();

    Serial.println("BLE service started.");
    Serial.print("BLE advertising as: ");
    Serial.println(BLE_DEVICE_NAME);
}