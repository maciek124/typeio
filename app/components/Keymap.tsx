"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  mode?: "off" | "next" | "always";
};

const topRow = "1234567890-=".split("");
const row2 = "qwertyuiop[]".split("");
const row3 = "asdfghjkl;'".split("");
const row4 = "zxcvbnm,./".split("");

export default function Keymap({ mode = "next" }: Props) {
  const [active, setActive] = useState<string>("");
  const [flash, setFlash] = useState<{ key: string; ok: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    type HighlightDetail = { key: string };
    type FlashDetail = { key: string; ok: boolean };

    const onHighlight = (ev: Event) => {
      const e = ev as CustomEvent<HighlightDetail>;
      setActive((e.detail?.key ?? " "));
    };
    const onFlash = (ev: Event) => {
      const e = ev as CustomEvent<FlashDetail>;
      const key = e.detail?.key ?? " ";
      const ok = Boolean(e.detail?.ok);
      setFlash({ key, ok });
      window.setTimeout(() => setFlash(null), 250);
    };
    window.addEventListener("keymap:highlight", onHighlight);
    window.addEventListener("keymap:flash", onFlash);
    return () => {
      window.removeEventListener("keymap:highlight", onHighlight);
      window.removeEventListener("keymap:flash", onFlash);
    };
  }, []);

  const rows = useMemo(() => [topRow, row2, row3, row4], []);

  const cell = (ch: string) => {
    const isActive = active && ("'".includes(ch) ? active.includes(ch) : active === ch);
    const didFlash = flash && ("'".includes(ch) ? flash.key.includes(ch) : flash.key === ch);
    const bg = didFlash ? (flash!.ok ? "bg-emerald-500" : "bg-red-500") : isActive ? "bg-[var(--accent)]" : "bg-[var(--border)]";
    const color = didFlash || isActive ? "text-[var(--background)]" : "text-[var(--foreground)]";
    return (
      <div key={ch} className={`keymapKey rounded-md px-2 py-2 text-sm font-mono flex items-center justify-center border border-[var(--border)] ${bg} ${color} transition-colors min-w-8`} data-key={ch}>
        <span className="letter select-none">{ch}</span>
      </div>
    );
  };

  if (mode === "off") return null;
  return (
    <div ref={containerRef} id="keymap" className="mt-4 select-none">
      <div className="flex gap-1 mb-1 opacity-70">{rows[0].map(cell)}</div>
      <div className="flex gap-1 mb-1">{rows[1].map(cell)}</div>
      <div className="flex gap-1 mb-1">{rows[2].map(cell)}</div>
      <div className="flex gap-1">{rows[3].map(cell)}</div>
      <div className="mt-2 flex items-center gap-1">
        <div className="keymapKey keySpace rounded-md px-6 py-2 text-sm font-mono flex items-center justify-center bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)]">Space</div>
      </div>
    </div>
  );
}
