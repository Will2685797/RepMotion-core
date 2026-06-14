import { BleManager, Device } from "react-native-ble-plx";

const REPMOTION_DEVICE_NAME = "RepMotion";

const bleManager = new BleManager();

export function scanForRepMotion(
  onDeviceFound: (device: Device) => void,
  onError?: (error: unknown) => void
): void {
  console.log("[BLE] Starting scan...");

  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.log("[BLE] Scan error:", error);
      onError?.(error);
      return;
    }

    if (!device) return;

    console.log("[BLE] Device found:", {
      id: device.id,
      name: device.name,
      localName: device.localName,
      rssi: device.rssi,
    });

    const name = device.name ?? device.localName ?? "";

    if (name.includes(REPMOTION_DEVICE_NAME)) {
      console.log("[BLE] RepMotion device found:", name);
      bleManager.stopDeviceScan();
      onDeviceFound(device);
    }
  });
}

export function stopBleScan(): void {
  console.log("[BLE] Stopping scan...");
  bleManager.stopDeviceScan();
}