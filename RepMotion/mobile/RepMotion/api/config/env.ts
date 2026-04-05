type Env = "development" | "production";
const ENV: Env = __DEV__ ? "development" : "production";


const CONFIG = {
  development: {
    API_BASE_URL: "http://10.0.0.121:8000",
    TIMEOUT_MS: 8000,
  },
  production: {
    API_BASE_URL: "http://10.0.0.121:8000",
    TIMEOUT_MS: 8000,
  },
};

export const env = {
  ENV,
  ...CONFIG[ENV],
};