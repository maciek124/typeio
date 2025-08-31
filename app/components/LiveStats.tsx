"use client";

import { useEffect, useState } from "react";

type Props = {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  characters: string;
  isActive: boolean;
  inline?: boolean;
};

export default function LiveStats({ wpm, rawWpm, accuracy, characters, isActive, inline = false }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isActive]);

  if (!visible || !isActive) return null;

  const content = (
    <div className="flex gap-6 text-sm">
      <div className="flex flex-col items-center">
        <div className="text-lg font-bold text-[var(--accent)] tabular-nums">{wpm}</div>
        <div className="text-xs text-[var(--muted-foreground)] uppercase">WPM</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{rawWpm}</div>
        <div className="text-xs text-[var(--muted-foreground)] uppercase">RAW</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">{accuracy}%</div>
        <div className="text-xs text-[var(--muted-foreground)] uppercase">ACC</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-mono text-[var(--foreground)]">{characters}</div>
        <div className="text-xs text-[var(--muted-foreground)] uppercase">CHARS</div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="rounded-lg px-4 py-2 border border-[var(--border)] bg-[var(--background)]/60">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-40 bg-[var(--background)]/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-[var(--border)]">
      {content}
    </div>
  );
}
