'use client';

import { useEffect } from 'react';

export function useRealtime() {
  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const connect = () => {
      if (stopped) return;

      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("access_token")
          : null;

      if (!token) return;

      const wsBase =
        process.env.NEXT_PUBLIC_WS_URL ||
        (
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:8000"
        ).replace(/^http/, "ws");

      try {
        ws = new WebSocket(`${wsBase}/ws?token=${token}`);

        ws.onopen = () => {
          console.info("[Realtime] connected");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            window.dispatchEvent(
              new CustomEvent("hrhub:realtime", {
                detail: msg,
              }),
            );
          } catch (error) {
            console.error("[Realtime] invalid event", error);
          }
        };

        ws.onclose = () => {
          if (!stopped) {
            timer = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        timer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      ws?.close();
    };
  }, []);
}
