type Env = "development" | "production";
const ENV: Env = __DEV__ ? "development" : "production";


const CONFIG = {
  development: {
    // API_BASE_URL: "http://10.2.34.115:8000",
    // API_BASE_URL: "http://127.0.0.1:8000",
    API_BASE_URL: "http://172.16.84.102:8000",
    TIMEOUT_MS: 8000,
  },
  production: {
    // API_BASE_URL: "http://10.2.34.115:8000",
    // API_BASE_URL: "http://127.0.0.1:8000",
    API_BASE_URL: "http://172.16.84.102:8000",
    TIMEOUT_MS: 8000,
  },
};

export const env = {
  ENV,
  ...CONFIG[ENV],
};