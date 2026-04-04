// ============================
// IMPORTS
// ============================
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Wire.h>
#include <math.h>

// ============================
// WIFI / WEBSOCKET
// ============================
const char* WIFI_SSID = "Linux_24";
const char* WIFI_PASS = "2FAD6139EA4D";

WebSocketsServer webSocket = WebSocketsServer(81);

unsigned long lastSendMs = 0;
unsigned long startMs = 0;
const unsigned long wsIntervalMs = 100;  // 10 Hz

void onWebSocketEvent(uint8_t clientNum, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(clientNum);
        Serial.printf("[WS] Client connected: #%u from %d.%d.%d.%d\n",
                      clientNum, ip[0], ip[1], ip[2], ip[3]);
        break;
      }

    case WStype_DISCONNECTED:
      Serial.printf("[WS] Client disconnected: #%u\n", clientNum);
      break;

    case WStype_TEXT:
      Serial.printf("[WS] Received from #%u: %s\n", clientNum, payload);
      break;

    default:
      break;
  }
}

// ============================
// MPU9250
// ============================
#define SDA_PIN 8
#define SCL_PIN 9
#define MPU9250_ADDR 0x68

#define WHO_AM_I_REG 0x75
#define PWR_MGMT_1 0x6B
#define SMPLRT_DIV 0x19
#define CONFIG_REG 0x1A
#define GYRO_CONFIG 0x1B
#define ACCEL_CONFIG 0x1C
#define ACCEL_CONFIG2 0x1D
#define ACCEL_XOUT_H 0x3B

// ============================
// HELPERS
// ============================
void writeRegTo(uint8_t addr, uint8_t reg, uint8_t value) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.write(value);
  Wire.endTransmission();
}

bool readRegsFrom(uint8_t addr, uint8_t reg, uint8_t* buf, size_t len) {
  Wire.beginTransmission(addr);
  Wire.write(reg);

  if (Wire.endTransmission(false) != 0) {
    return false;
  }

  size_t n = Wire.requestFrom(addr, (uint8_t)len);
  if (n != len) {
    return false;
  }

  for (size_t i = 0; i < len; i++) {
    buf[i] = Wire.read();
  }

  return true;
}

int16_t makeInt16(uint8_t hi, uint8_t lo) {
  return (int16_t)((hi << 8) | lo);
}

// ============================
// CALIBRATION
// ============================
float gx_bias_dps = 0.0f;
float gy_bias_dps = 0.0f;
float gz_bias_dps = 0.0f;

bool readMPURaw(
  int16_t& temp_raw,
  int16_t& ax_raw, int16_t& ay_raw, int16_t& az_raw,
  int16_t& gx_raw, int16_t& gy_raw, int16_t& gz_raw) {
  uint8_t raw[14];

  if (!readRegsFrom(MPU9250_ADDR, ACCEL_XOUT_H, raw, 14)) {
    return false;
  }

  ax_raw = makeInt16(raw[0], raw[1]);
  ay_raw = makeInt16(raw[2], raw[3]);
  az_raw = makeInt16(raw[4], raw[5]);
  temp_raw = makeInt16(raw[6], raw[7]);
  gx_raw = makeInt16(raw[8], raw[9]);
  gy_raw = makeInt16(raw[10], raw[11]);
  gz_raw = makeInt16(raw[12], raw[13]);

  return true;
}

void calibrateGyro(int n_samples = 500, int delay_ms = 5) {
  Serial.println("Keep sensor perfectly still: gyro calibration starting...");

  float sx = 0.0f;
  float sy = 0.0f;
  float sz = 0.0f;
  int ok = 0;

  for (int i = 0; i < n_samples; i++) {
    int16_t temp_raw, ax_raw, ay_raw, az_raw, gx_raw, gy_raw, gz_raw;

    if (readMPURaw(temp_raw, ax_raw, ay_raw, az_raw, gx_raw, gy_raw, gz_raw)) {
      sx += gx_raw / 131.0f;
      sy += gy_raw / 131.0f;
      sz += gz_raw / 131.0f;
      ok++;
    }

    delay(delay_ms);
  }

  if (ok > 0) {
    gx_bias_dps = sx / ok;
    gy_bias_dps = sy / ok;
    gz_bias_dps = sz / ok;
  }

  Serial.print("Gyro bias dps: ");
  Serial.print(gx_bias_dps, 6);
  Serial.print(", ");
  Serial.print(gy_bias_dps, 6);
  Serial.print(", ");
  Serial.println(gz_bias_dps, 6);
}

// ============================
// FILTER
// ============================
float acc_mag_f = 0.0f;
float gyro_mag_f = 0.0f;
const float alpha = 0.1f;

// ============================
// SETUP
// ============================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000);

  Serial.println("I2C scanner start");
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    uint8_t error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("Found I2C device at 0x");
      if (addr < 16) Serial.print("0");
      Serial.println(addr, HEX);
    }
  }
  Serial.println("I2C scanner done");

  // WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi...");

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 40) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  Serial.println();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection failed.");
    while (true) delay(1000);
  }

  Serial.println("WiFi connected.");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  delay(15000);

  // WebSocket
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
  Serial.println("WebSocket server started on port 81");

  // MPU init
  uint8_t who = 0;
  if (!readRegsFrom(MPU9250_ADDR, WHO_AM_I_REG, &who, 1)) {
    Serial.println("Failed to read WHO_AM_I");
    while (true) delay(1000);
  }

  Serial.print("WHO_AM_I = 0x");
  Serial.println(who, HEX);

  if (who != 0x71 && who != 0x70) {
    Serial.println("Unexpected WHO_AM_I. Check sensor / wiring / address.");
  }

  writeRegTo(MPU9250_ADDR, PWR_MGMT_1, 0x00);
  delay(100);

  writeRegTo(MPU9250_ADDR, SMPLRT_DIV, 0x04);
  writeRegTo(MPU9250_ADDR, CONFIG_REG, 0x03);
  writeRegTo(MPU9250_ADDR, GYRO_CONFIG, 0x00);   // ±250 dps
  writeRegTo(MPU9250_ADDR, ACCEL_CONFIG, 0x00);  // ±2 g
  writeRegTo(MPU9250_ADDR, ACCEL_CONFIG2, 0x03);

  Serial.println("MPU9250 initialized.");

  calibrateGyro();

  startMs = millis();
  Serial.println("Streaming motion JSON over WebSocket...");
}

// ============================
// LOOP
// ============================
void loop() {
  webSocket.loop();

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  unsigned long now = millis();
  if (now - lastSendMs < wsIntervalMs) {
    return;
  }
  lastSendMs = now;

  int16_t temp_raw, ax_raw, ay_raw, az_raw, gx_raw, gy_raw, gz_raw;
  if (!readMPURaw(temp_raw, ax_raw, ay_raw, az_raw, gx_raw, gy_raw, gz_raw)) {
    Serial.println("Read failed");
    return;
  }

  // Raw -> engineering units
  const float G_TO_MPS2 = 9.80665f;
  // const float DEG_TO_RAD = PI / 180.0f;

  float temp_c = (temp_raw / 333.87f) + 21.0f;

  float ax_g = ax_raw / 16384.0f;
  float ay_g = ay_raw / 16384.0f;
  float az_g = az_raw / 16384.0f;

  float gx_dps = (gx_raw / 131.0f) - gx_bias_dps;
  float gy_dps = (gy_raw / 131.0f) - gy_bias_dps;
  float gz_dps = (gz_raw / 131.0f) - gz_bias_dps;

  float ax_mps2 = ax_g * G_TO_MPS2;
  float ay_mps2 = ay_g * G_TO_MPS2;
  float az_mps2 = az_g * G_TO_MPS2;

  float gx_rads = gx_dps * DEG_TO_RAD;
  float gy_rads = gy_dps * DEG_TO_RAD;
  float gz_rads = gz_dps * DEG_TO_RAD;

  // Quick derived values
  float acc_mag = sqrtf(ax_g * ax_g + ay_g * ay_g + az_g * az_g);
  float gyro_mag = sqrtf(gx_dps * gx_dps + gy_dps * gy_dps + gz_dps * gz_dps);

  acc_mag_f = alpha * acc_mag + (1.0f - alpha) * acc_mag_f;
  gyro_mag_f = alpha * gyro_mag + (1.0f - alpha) * gyro_mag_f;

  bool still = (gyro_mag_f < 0.5f) && (fabsf(acc_mag_f - 1.0f) < 0.15f);

  float roll_deg = atan2f(ay_g, az_g) * 180.0f / PI;
  float pitch_deg = atan2f(-ax_g, sqrtf(ay_g * ay_g + az_g * az_g)) * 180.0f / PI;

  // Minimal payload
  unsigned long t_ms = now - startMs;

  String msg = "{";
  msg += "\"t_ms\":";
  msg += t_ms;

  msg += ",\"temp_c\":";
  msg += String(temp_c, 2);

  msg += ",\"ax_mps2\":";
  msg += String(ax_mps2, 4);
  msg += ",\"ay_mps2\":";
  msg += String(ay_mps2, 4);
  msg += ",\"az_mps2\":";
  msg += String(az_mps2, 4);

  msg += ",\"gx_rads\":";
  msg += String(gx_rads, 5);
  msg += ",\"gy_rads\":";
  msg += String(gy_rads, 5);
  msg += ",\"gz_rads\":";
  msg += String(gz_rads, 5);

  msg += ",\"roll_deg\":";
  msg += String(roll_deg, 2);
  msg += ",\"pitch_deg\":";
  msg += String(pitch_deg, 2);

  msg += ",\"still\":";
  msg += (still ? "true" : "false");

  msg += "}";

  webSocket.broadcastTXT(msg);
  Serial.println(msg);
}
