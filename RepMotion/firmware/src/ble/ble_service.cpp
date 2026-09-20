#include "ble_service.h"
#include "imu_sample_v2_codec.h"
#include "legacy_motion_payload.h"

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

constexpr const char* MOTION_DATA_V2_CHARACTERISTIC_UUID =
    "7b7f0003-7c3a-4f6a-9f8e-1f2b3c4d5e6f";

BLECharacteristic* motionDataCharacteristic = nullptr;
BLECharacteristic* motionDataV2Characteristic = nullptr;

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
    motionDataCharacteristic->setValue("0,0,0");

    motionDataV2Characteristic = motionService->createCharacteristic(
        MOTION_DATA_V2_CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );

    motionDataV2Characteristic->addDescriptor(new BLE2902());
    ImuSampleV2Payload initialV2Payload = {};
    motionDataV2Characteristic->setValue(
        initialV2Payload.data(),
        initialV2Payload.size()
    );

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

/* Envoie le même sample acquis sur les transports BLE V1 et V2. */
void updateMotionDataCharacteristics(const ImuSample& sample) {
    if (motionDataCharacteristic != nullptr) {
        char legacyPayload[32];

        formatLegacyMotionPayload(
            legacyPayload,
            sizeof(legacyPayload),
            sample
        );

        motionDataCharacteristic->setValue(legacyPayload);
        motionDataCharacteristic->notify();
    }

    if (motionDataV2Characteristic != nullptr) {
        ImuSampleV2Payload v2Payload = encodeImuSampleV2(sample);

        motionDataV2Characteristic->setValue(
            v2Payload.data(),
            v2Payload.size()
        );
        motionDataV2Characteristic->notify();
    }
}
