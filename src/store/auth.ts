import { create } from "zustand";
import type { AuthUser } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clearAuth: () => set({ user: null, status: "unauthenticated" }),
}));