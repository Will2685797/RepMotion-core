#include "ble_service.h"

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

constexpr const char* BLE_DEVICE_NAME = "RepMotion";

constexpr const char* MOTION_SERVICE_UUID =
    "7b7f0001-7c3a-4f6a-9f8e-1f2b3c4d5e6f";

constexpr const char* MOTION_DATA_CHARACTERISTIC_UUID =
    "7b7f0002-7c3a-4f6a-9f8e-1f2b3c4d5e6f";

BLECharacteristic* motionDataCharacteristic = nullptr;

/*
 * Callbacks du serveur BLE.
 *
 * Objectif :
 * - détecter quand le téléphone se connecte
 * - détecter quand le téléphone se déconnecte
 * - relancer l'advertising après déconnexion
 */
class RepMotionServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* server) override {
        Serial.println("BLE client connected.");
    }

    void onDisconnect(BLEServer* server) override {
        Serial.println("BLE client disconnected.");
        Serial.println("Restarting BLE advertising...");

        BLEDevice::startAdvertising();
    }
};

/*Sert à démarrer le Bluetooth.*/
void initBleService() {
    Serial.println("Initializing BLE...");

    BLEDevice::init(BLE_DEVICE_NAME);

    BLEServer* server = BLEDevice::createServer();

    // Important :
    // sans ces callbacks, l'ESP32 peut arrêter d'annoncer le service
    // après une déconnexion.
    server->setCallbacks(new RepMotionServerCallbacks());

    BLEService* motionService = server->createService(MOTION_SERVICE_UUID);

    motionDataCharacteristic = motionService->createCharacteristic(
        MOTION_DATA_CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );

    motionDataCharacteristic->addDescriptor(new BLE2902());
    motionDataCharacteristic->setValue("ax=0,ay=0,az=0,gx=0,gy=0,gz=0");

    motionService->start();

    BLEAdvertising* advertising = BLEDevice::getAdvertising();
    advertising->addServiceUUID(MOTION_SERVICE_UUID);
    advertising->setScanResponse(true);
    advertising->setMinPreferred(0x06);
    advertising->setMinPreferred(0x12);

    BLEDevice::startAdvertising();

    Serial.println("BLE service started.");
    Serial.print("BLE advertising as: ");
    Serial.println(BLE_DEVICE_NAME);
}

/*Sert à envoyer les données MPU6050 dans la characteristic BLE.*/
void updateMotionDataCharacteristic(const Mpu6050RawData& data) {
    if (motionDataCharacteristic == nullptr) {
        return;
    }

    char payload[96];

    snprintf(
        payload,
        sizeof(payload),
        "ax=%d,ay=%d,az=%d,gx=%d,gy=%d,gz=%d",
        data.accelX,
        data.accelY,
        data.accelZ,
        data.gyroX,
        data.gyroY,
        data.gyroZ
    );

    motionDataCharacteristic->setValue(payload);
    motionDataCharacteristic->notify();
}