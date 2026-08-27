'use client';
import { useEffect } from 'react';

export function useRealtime() {
  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;
    if (!token) return;

    const wsBase = (process.env.NEXT_PUBLIC_WS_URL) || ((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/^http/, "ws"));
    const ws = new WebSocket(`${wsBase}/ws?token=${token}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      window.dispatchEvent(new CustomEvent("hrhub:realtime", { detail: msg }));
    };

    return () => ws.close();
  }, []);
}
