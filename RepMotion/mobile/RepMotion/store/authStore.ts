// imports
import { create } from "zustand";
import * as api from "../api/api";
import type { User } from "../models/User";


type AuthUser = {
  id: number;
  email: string;
  username: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;

  login: (u: Pick<User, "email" | "password">) => Promise<void>;
  register: (u: Pick<User, "email" | "password" | "username">) => Promise<void>;

  updateProfile: (p: { email?: string; username?: string }) => Promise<void>;
  changePassword: (p: { currentPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;

  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  login: async (u) => {
    if (!u.email || !u.password) throw new Error("Email ou mot de passe manquant");

    const data = await api.login({ email: u.email.trim(), password: u.password });

    const token = data.access_token ?? data.token ?? null;
    if (!token) throw new Error("Token manquant dans la réponse API");
    if (!data.user) throw new Error("User manquant dans la réponse API");

    set({
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
      },
    });
  },

  register: async (u) => {
    if (!u.email || !u.password || !u.username) {
      throw new Error("Email, mot de passe et username requis");
    }

    try {
      const data = await api.register({
        email: u.email.trim(),
        password: u.password,
        username: u.username.trim(),
      });

      const token = data.access_token ?? data.token ?? null;
      if (!token) throw new Error("Token manquant dans la réponse API");
      if (!data.user) throw new Error("User manquant dans la réponse API");

      set({
        token,
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
        },
      });
    } catch (err: any) {
      console.log("ERR FULL =", err);

      const detail =
        err?.data?.detail ??
        err?.data?.message ??
        err?.detail ??
        err?.message ??
        null;

      const msg =
        typeof detail === "string"
          ? detail
          : detail
            ? JSON.stringify(detail)
            : "Erreur inscription";

      throw new Error(msg);
    }
  },

  updateProfile: async (p) => {

    const { token, user } = get();
    if (!token) throw new Error("Non connecté");
    if (!user) throw new Error("Utilisateur manquant");

    // ton API s'appelle updateMe(token, patch)
    console.log("TOKEN USED FOR updateMe =", token);
    const data: any = await api.updateMe(token, {
      email: p.email,
      username: p.username,
    });

    // Ton API peut renvoyer {user: ...} ou directement l'user
    const updated = data?.user ?? data;

    set({
      user: {
        id: updated?.id ?? user.id,
        email: updated?.email ?? (p.email ?? user.email),
        username: updated?.username ?? (p.username ?? user.username),
      },
    });
  },

  changePassword: async (p) => {
    const { token } = get();
    if (!token) throw new Error("Non connecté");

    //ton API ne demande pas currentPassword, elle accepte juste password
    await api.updateMe(token, { password: p.newPassword });
  },

  deleteAccount: async () => {
    const { token } = get();
    if (!token) throw new Error("Non connecté");

    await api.deleteMe(token);

    set({
      user: null,
      token: null,
    });
  },

  logout: () => set({ user: null, token: null }),
}));
