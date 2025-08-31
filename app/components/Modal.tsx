"use client";

import { useEffect } from "react";

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, open, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl w-[min(92vw,520px)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
          <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]" onClick={onClose}>Esc</button>
        </div>
        {children}
      </div>
    </div>
  );
}
