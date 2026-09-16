"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

function SessionSync() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const mergedOnce = useRef(false);

  useEffect(() => {
    setStatus(status);
    if (session?.user) {
      const user = session.user as { id?: string; role?: string };
      setUser({
        id: user.id,
        name: session.user.name,
        email: session.user.email,
        role: user.role,
      });
      if (status === "authenticated" && !mergedOnce.current) {
        mergedOnce.current = true;
        useCartStore.getState().mergeFromLocal();
        useWishlistStore.getState().mergeFromLocal();
      }
    } else {
      setUser(null);
      mergedOnce.current = false;
    }
  }, [session, status, setUser, setStatus]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      if (useAuthStore.getState().status === "authenticated") {
        useCartStore.getState().mergeFromLocal();
        useWishlistStore.getState().mergeFromLocal();
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}