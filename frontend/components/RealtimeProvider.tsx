'use client';
import { useRealtime } from '@/hooks/useRealtime';

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtime();
  return <>{children}</>;
}
