"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  visible?: boolean;
  className?: string;
};

export default function FpsCounter({ visible = true, className = "" }: Props) {
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const framesRef = useRef<number>(0);
  const [fps, setFps] = useState<number>(0);

  useEffect(() => {
    if (!visible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    framesRef.current = 0;
    startRef.current = performance.now();

    const loop = (ts: number) => {
      framesRef.current += 1;
      const elapsed = ts - startRef.current;
      if (elapsed > 500) {
        const next = (framesRef.current * 1000) / elapsed;
        setFps(Number(next.toFixed(2)));
        framesRef.current = 0;
        startRef.current = ts;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [visible]);

  if (!visible) return null;
  const cls = fps < 30 ? "error" : fps > 55 ? "main" : "";
  return (
    <div
      id="fpsCounter"
      className={`fixed bottom-3 right-4 z-50 rounded-md px-2 py-1 text-xs font-mono bg-[var(--border)]/60 text-[var(--foreground)] border border-[var(--border)] backdrop-blur ${cls} ${className}`}
      aria-live="polite"
    >
      FPS {fps.toFixed(2)}
    </div>
  );
}
