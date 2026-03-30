// config
import { env } from "./config/env";
// models
import { HttpMethod, RequestOptions, ApiError } from "./models/api_models";


function _buildQueryString(params?: RequestOptions["params"]) {
  if (!params) return "";
  const filtered = Object.entries(params).filter(([_, v]) => v !== undefined);

  if (filtered.length === 0) return "";

  const qs = new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)]),
  ).toString();

  return `?${qs}`;
}

export async function request<T>(
  method: HttpMethod,
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.TIMEOUT_MS);

  const url = `${env.API_BASE_URL}${path}` + _buildQueryString(options?.params);

  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      // FastAPI renvoie souvent { detail: "..." } ou { detail: [...] }
      let detail: any = null;

      if (isJson && data && typeof data === "object") {
        detail = (data as any).detail ?? (data as any).message ?? null;
      }

      const msg =
        typeof detail === "string"
          ? detail
          : `Request failed with status ${res.status}`;

      throw new ApiError(res.status, msg, data);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new ApiError(408, "Request timeout", null);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
