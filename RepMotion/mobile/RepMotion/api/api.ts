// classes
import { request } from "./httpClient";


// Auth
export type LoginResponse = {
  access_token?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    username: string;
  };
};

export function login(payload: { email: string; password: string }) {
  return request<LoginResponse>("POST", "/auth/login", { body: payload });
}

export function register(payload: {
  email: string;
  password: string;
  username: string;
}) {
  return request<LoginResponse>("POST", "/auth/register", { body: payload });
}

export function me(token: string) {
  return request("GET", "/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateMe(
  token: string,
  patch: { email?: string; username?: string; password?: string }
) {
  return request("PUT", "/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
    body: patch,
  });
}
export function deleteMe(token: string) {
  return request("DELETE", "/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// forgot password 
export function forgotPassword(payload: { email: string }) {
  return request<{ message: string }>("POST", "/auth/forgot-password", {
    body: payload,
  });
}

export function resetPassword(payload: {
  token: string;
  new_password: string;
}) {
  return request<{ message: string }>("POST", "/auth/reset-password", {
    body: payload,
  });
}