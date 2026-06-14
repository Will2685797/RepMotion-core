import { BleManager, Device } from "react-native-ble-plx";

const REPMOTION_DEVICE_NAME = "RepMotion";

const bleManager = new BleManager();

export function scanForRepMotion(
  onDeviceFound: (device: Device) => void,
  onError?: (error: unknown) => void
): void {
  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      onError?.(error);
      return;
    }

    if (device?.name === REPMOTION_DEVICE_NAME) {
      bleManager.stopDeviceScan();
      onDeviceFound(device);
    }
  });
}

export function stopBleScan(): void {
  bleManager.stopDeviceScan();
}