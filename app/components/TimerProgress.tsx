"use client";

import { useEffect, useState } from "react";

type Props = {
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  animateKey?: number;
};

export default function TimerProgress({ isRunning, timeLeft, totalTime, animateKey }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isRunning) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isRunning]);

  if (!visible || !isRunning) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-[var(--border)] z-50 overflow-hidden">
      <div
        key={animateKey}
        className="h-full bg-[var(--accent)]"
        style={{
          animationName: 'progressGrow',
          animationDuration: `${totalTime}s`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
        }}
      />
    </div>
  );
}
