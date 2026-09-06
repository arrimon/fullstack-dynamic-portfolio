"use client";

import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (mounted) setStatus(data.authenticated ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (mounted) setStatus("unauthenticated");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error || "Login failed. Please try again." };
      setStatus("authenticated");
      return { error: null };
    } catch {
      return { error: "Could not reach the server." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setStatus("unauthenticated");
    }
  }, []);

  return {
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
  };
}