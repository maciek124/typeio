"use client";

import { useEffect, useMemo, useState, useRef, useCallback, type ReactNode } from "react";
import { generateWords, type Language } from "../lib/words";
import LiveStats from "./LiveStats";
import TimerProgress from "./TimerProgress";
import Modal from "./Modal";
import Keymap from "./Keymap";

type Duration = 15 | 30 | 60;

type Stats = {
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalChars: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
};

function computeStats(words: string[], typed: string[], seconds: number, finished = false): Stats {
  let spaces = 0;
  let allCorrectChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;
  let correctSpaces = 0;

  const inputWords = [...typed];
  while (inputWords.length > 0 && inputWords[inputWords.length - 1] === "") {
    inputWords.pop();
  }
  const targetWords = words;

  const maxWordsToCheck = finished ? inputWords.length + 1 : Math.max(inputWords.length, 1);
  
  for (let i = 0; i < maxWordsToCheck && i < targetWords.length; i++) {
    const inputWord = inputWords[i] ?? "";
    const targetWord = targetWords[i] ?? "";
    
    let wordCorrect = true;

    if (i < inputWords.length) {
      spaces++;
    }

    for (let c = 0; c < Math.max(inputWord.length, targetWord.length); c++) {
      const inputChar = inputWord[c];
      const targetChar = targetWord[c];

      if (inputChar !== undefined && targetChar !== undefined) {
        if (inputChar === targetChar) {
          allCorrectChars++;
        } else {
          incorrectChars++;
          wordCorrect = false;
        }
      } else if (inputChar !== undefined && targetChar === undefined) {
        extraChars++;
        wordCorrect = false;
      } else if (inputChar === undefined && targetChar !== undefined) {
        if (i < inputWords.length || (finished && i == inputWords.length)) {
          missedChars++;
          wordCorrect = false;
        }
      }
    }

    if (i < inputWords.length && wordCorrect && inputWord === targetWord) {
      correctSpaces++;
    }
  }

  if (spaces > 0) {
    spaces--;
  }
  if (correctSpaces > 0 && correctSpaces > inputWords.length - 1) {
    correctSpaces = inputWords.length - 1;
  }

  const testSeconds = Math.max(seconds, 1);
  const minutes = testSeconds / 60;
  const totalTypedChars = allCorrectChars + incorrectChars + extraChars;
  const rawExact = totalTypedChars / 5 / minutes;
  const accFrac = totalTypedChars === 0 ? 0 : allCorrectChars / totalTypedChars;
  const wpmExact = rawExact * accFrac;
  const rawWpm = Math.round(rawExact);
  const wpm = Math.round(wpmExact);
  const accuracy = totalTypedChars === 0 ? 100 : Math.round(accFrac * 100);

  return {
    correctChars: allCorrectChars,
    incorrectChars,
    extraChars,
    missedChars,
    totalChars: totalTypedChars,
    wpm,
    rawWpm,
    accuracy
  };
}export default function TypingTest() {
  const [duration, setDuration] = useState<Duration>(15);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [lang, setLang] = useState<Language>("en");
  const [theme, setTheme] = useState<string>("charcoal");
  const [words, setWords] = useState<string[]>(() => generateWords(300, "en"));
  const [typed, setTyped] = useState<string[]>([""]);
  const [wordIndex, setWordIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [runKey, setRunKey] = useState<number>(0);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (started || finished) return;
    setWords(generateWords(300, lang));
  }, [lang, started, finished]);

  const restart = useCallback((keepDuration = true) => {
  const d = keepDuration ? duration : (15 as Duration);
    setDuration(d);
    setTimeLeft(d);
    setWords(generateWords(300, lang));
    setTyped([""]);
    setWordIndex(0);
    setStarted(false);
    setFinished(false);
  setRevealed(false);
    setWpmHistory([]);
  startedAtRef.current = null;
  setRunKey((k) => k + 1);
  }, [duration, lang]);

  useEffect(() => {
    if (!started || finished) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          setStarted(false);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, finished]);

  const elapsedSec = finished ? duration : started ? Math.max(duration - timeLeft, 1) : 1;
  const stats = useMemo(() => computeStats(words, typed, elapsedSec, finished), [words, typed, elapsedSec, finished]);
  const running = started && !finished;

  useEffect(() => {
    if (!started || finished) return;
  const elapsed = duration - timeLeft;
    if (elapsed <= 0) return;
  const { wpm } = computeStats(words, typed, Math.max(elapsed, 1), false);
    setWpmHistory((prev) => {
      const next = prev.slice();
      next[elapsed - 1] = wpm;
      return next;
    });
  }, [timeLeft, started, finished, duration, words, typed]);

  useEffect(() => {
    if (!finished) return;
  const final = computeStats(words, typed, duration, true).wpm;
    setWpmHistory((prev) => {
      const next = prev.slice();
      next[duration - 1] = final;
      return next;
    });
  }, [finished, duration, words, typed]);

  useEffect(() => {
    if (finished) return;
    const current = typed[wordIndex] ?? "";
    const w = words[wordIndex] ?? "";
  const nextChar = w[current.length] ?? " ";
  window.dispatchEvent(new CustomEvent<{ key: string }>("keymap:highlight", { detail: { key: nextChar } }));
  }, [typed, wordIndex, words, finished]);

  const startOnFirstTypingKey = useCallback(() => {
    if (!started && !finished) {
      setStarted(true);
      if (startedAtRef.current == null) startedAtRef.current = performance.now();
    }
  }, [started, finished]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === "Tab") {
        e.preventDefault();
        restart(true);
        return;
      }
  if (finished) return;
  if (["Shift", "Alt", "Control", "Meta"].includes(key)) return;
  if (key.length === 1 || key === "Backspace" || key === " " || key === "Spacebar") e.preventDefault();

  if (!revealed) {
    if (key === " " || key === "Spacebar") setRevealed(true);
    return;
  }

      if (key === "Backspace") {
  startOnFirstTypingKey();
        setTyped((prev) => {
          const next = [...prev];
          next[wordIndex] = (next[wordIndex] ?? "").slice(0, -1);
          return next;
        });
  window.dispatchEvent(new CustomEvent<{ key: string; ok: boolean }>("keymap:flash", { detail: { key: "Backspace", ok: true } }));
        return;
      }

      if (key === " " || key === "Spacebar") {
        if (!started) return;
        setTyped((prev) => {
          const next = [...prev];
          next[wordIndex] = next[wordIndex] ?? "";
          if (wordIndex + 1 >= next.length) next.push("");
          return next;
        });
        setWordIndex((i) => i + 1);
  window.dispatchEvent(new CustomEvent<{ key: string; ok: boolean }>("keymap:flash", { detail: { key: " ", ok: true } }));
        return;
      }

      if (key.length === 1) {
  startOnFirstTypingKey();
        setTyped((prev) => {
          const next = [...prev];
          next[wordIndex] = (next[wordIndex] ?? "") + key;
          return next;
        });
        const currentTyped = typed[wordIndex] ?? "";
        const expected = (words[wordIndex] ?? "")[currentTyped.length];
        const ok = expected ? key === expected : false;
  window.dispatchEvent(new CustomEvent<{ key: string }>("keymap:highlight", { detail: { key } }));
  window.dispatchEvent(new CustomEvent<{ key: string; ok: boolean }>("keymap:flash", { detail: { key, ok } }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, started, wordIndex, revealed, typed, words, restart, startOnFirstTypingKey]);

  const handleDurationChange = (d: Duration) => {
    if (started) return;
    setDuration(d);
    setTimeLeft(d);
  };

  const renderWord = (w: string, idx: number) => {
    const typedWord = typed[idx] ?? "";
    const isCurrent = idx === wordIndex && !finished;
    const chars: ReactNode[] = [];
    for (let i = 0; i < w.length; i++) {
      const expected = w[i];
      const got = typedWord[i];
      let cls = "";
      if (got == null) cls = "text-[var(--muted-foreground)]";
      else if (got === expected) cls = "text-[var(--bright-foreground)]";
      else cls = "text-red-400";
      chars.push(<span key={i} className={cls}>{expected}</span>);
    }
    if (typedWord.length > w.length) {
      const extra = typedWord.slice(w.length);
      chars.push(<span key="extra" className="text-red-400">{extra}</span>);
    }

    const dimClass = running ? (idx > wordIndex ? "opacity-60" : "opacity-100") : "";

    return (
      <span key={idx} className={`mr-4 inline-block relative ${dimClass} ${isCurrent ? "underline decoration-[var(--muted-foreground)]/40 decoration-2 underline-offset-4" : ""}`}>
        {chars}
        {isCurrent && (
          <span aria-hidden className="absolute top-0 bottom-0 my-auto w-[2px] h-[1em] bg-[var(--accent)] animate-caret z-10 pointer-events-none" style={{ left: `${typedWord.length}ch`, transition: "left 120ms ease-out" }} />
        )}
      </span>
    );
  };

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas || !finished) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = canvas.clientWidth || 800;
    const cssH = 220;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#e2b714";

    const raw = Array.from({ length: duration }, (_, i) => wpmHistory[i]);
    const lastIdx = (() => {
      for (let i = raw.length - 1; i >= 0; i--) if (typeof raw[i] === "number") return i;
      return -1;
    })();
    if (lastIdx < 1) return; // need at least 2 samples

    const series: number[] = raw.map((v, i) => (typeof v === "number" ? v : i > 0 ? (raw[i - 1] as number) ?? 0 : 0));
    const slice = series.slice(0, lastIdx + 1);
    const data = slice.length > 2
      ? slice.map((v, i, a) => ((a[i - 1] ?? v) + v + (a[i + 1] ?? v)) / 3)
      : slice;

  const padX = 36;
    const padY = 18;
    const top = padY;
    const left = padX;
    const right = cssW - padX;
    const bottom = cssH - padY;

  const n = data.length;
    const max = Math.max(10, ...data);
    const span = duration;
    const xAtSec = (s: number) => left + (s / span) * (right - left);
    const yAtVal = (v: number) => bottom - (v / max) * (bottom - top);

    const strokeLine = (a: number, b: number, c: number, d: number, color: string, w = 1) => {
      ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke();
    };

    [0.2, 0.4, 0.6, 0.8].forEach((p) => {
      const y = Math.round((bottom - p * (bottom - top)) + 0.5) - 0.5;
      strokeLine(left, y, right, y, "rgba(255,255,255,0.08)", 1);
    });
    strokeLine(left, bottom + 0.5, right, bottom + 0.5, "rgba(255,255,255,0.15)", 1);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let s = 0; s <= duration; s += 5) {
      const x = xAtSec(s);
      strokeLine(x, bottom, x, bottom - 6, "rgba(255,255,255,0.25)", 1);
      ctx.fillText(`${s}s`, x, bottom + 6);
    }
    if (duration % 5 !== 0) {
      const x = xAtSec(duration);
      strokeLine(x, bottom, x, bottom - 6, "rgba(255,255,255,0.25)", 1);
      ctx.fillText(`${duration}s`, x, bottom + 6);
    }
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const labelPad = 8;
    const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.round(f * max));
    yTicks.forEach((val) => {
      const y = yAtVal(val);
      ctx.fillText(String(val), left - labelPad, y);
    });
    ctx.restore();

    const plotVals: number[] = [];
    if (n > 0) {
      plotVals.push(data[0]);
      for (let s = 1; s <= duration; s++) {
        const idx = s - 1;
        plotVals.push(idx < n ? data[idx] : data[n - 1]);
      }
    } else {
      for (let s = 0; s <= duration; s++) plotVals.push(0);
    }
    const pts = plotVals.map((v, s) => ({ x: xAtSec(s), y: yAtVal(v) }));

    const hex = accent.replace('#','');
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0,2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2,4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4,6), 16);
    const grad = ctx.createLinearGradient(0, top, 0, bottom);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.22)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    const tension = 0.25;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? pts[i + 1];
      const c1x = p1.x + ((p2.x - p0.x) * (1 - tension)) / 6;
      const c1y = p1.y + ((p2.y - p0.y) * (1 - tension)) / 6;
      const c2x = p2.x - ((p3.x - p1.x) * (1 - tension)) / 6;
      const c2y = p2.y - ((p3.y - p1.y) * (1 - tension)) / 6;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
    }
    ctx.lineTo(pts[pts.length - 1].x, bottom);
    ctx.lineTo(pts[0].x, bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? pts[i + 1];
      const c1x = p1.x + ((p2.x - p0.x) * (1 - tension)) / 6;
      const c1y = p1.y + ((p2.y - p0.y) * (1 - tension)) / 6;
      const c2x = p2.x - ((p3.x - p1.x) * (1 - tension)) / 6;
      const c2y = p2.y - ((p3.y - p1.y) * (1 - tension)) / 6;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
    }
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

  for (let s = 5; s <= duration; s += 5) {
      const cx = xAtSec(s);
      const cy = yAtVal(plotVals[s]);
      ctx.beginPath();
      ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    }
  }, [finished, wpmHistory, duration]);

  const renderChart = () => <canvas ref={chartRef} className="w-full h-[220px] block" />;

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      <TimerProgress 
        isRunning={running}
        timeLeft={timeLeft}
        totalTime={duration}
        animateKey={runKey}
      />
      

  {finished && (
        <div className="absolute inset-x-0 top-10 md:top-14 bottom-0 flex items-start justify-center fade-in">
          <div className="flex flex-col items-stretch gap-8 md:gap-10 select-none w-[min(92vw,1000px)]">
            <div className="fade-in-up">{renderChart()}</div>
            <div className="flex justify-center items-end gap-12 fade-in-up-2">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold tabular-nums text-[var(--accent)] leading-none">{computeStats(words, typed, elapsedSec, true).wpm}</div>
                <div className="text-sm uppercase text-[var(--muted-foreground)] mt-1 tracking-wider">WPM</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold tabular-nums text-[var(--foreground)] leading-none">{computeStats(words, typed, elapsedSec, true).accuracy}%</div>
                <div className="text-sm uppercase text-[var(--muted-foreground)] mt-1 tracking-wider">ACCURACY</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold tabular-nums text-emerald-400 leading-none">{computeStats(words, typed, elapsedSec, true).correctChars}</div>
                <div className="text-sm uppercase text-[var(--muted-foreground)] mt-1 tracking-wider">CORRECT</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold tabular-nums text-[var(--foreground)] leading-none">{computeStats(words, typed, elapsedSec, true).totalChars}</div>
                <div className="text-sm uppercase text-[var(--muted-foreground)] mt-1 tracking-wider">TOTAL</div>
              </div>
            </div>
            <div className="flex items-center justify-center fade-in-up-3">
              <button onClick={() => restart(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--background)] bg-[var(--accent)] hover:opacity-90">restart</button>
              <span className="ml-3 text-xs text-[var(--muted-foreground)]">or press Tab</span>
            </div>
          </div>
        </div>
      )}

  {!finished && (
  <div className={`flex flex-wrap items-center justify-center gap-4 mb-2 transition-all ${running ? "blur-sm opacity-60 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setTimeOpen(true)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] bg-transparent">Time</button>
        </div>
        <div className="flex items-center gap-2">
      <button onClick={() => setLangOpen(true)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] bg-transparent">{lang === "en" ? "English" : "Polski"}</button>
      <button onClick={() => setThemeOpen(true)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] bg-transparent capitalize">{theme}</button>
        </div>
      </div>
  )}
  {!finished && (
  <div className="flex items-center justify-center gap-4 mb-6">
  <div className="text-3xl font-bold text-[var(--accent)] tabular-nums">{timeLeft}</div>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted-foreground)]/10 transition-all" onClick={() => restart(true)}>restart</button>
        {started && !finished && (
          <div className="text-xs text-[var(--muted-foreground)] select-none">Press Tab to restart</div>
        )}
      </div>
  )}

      <div
        className={`rounded-xl p-8 min-h-[200px] relative overflow-hidden cursor-text transition-opacity ${finished ? "opacity-0" : ""}`}
        role="textbox"
        aria-label="Typing test area"
        onClick={() => {
          if (!revealed && !finished) setRevealed(true);
        }}
      >
        <div className={`text-[28px] leading-[2.2rem] font-mono select-none break-words text-center ${!revealed && !finished ? "blur-sm opacity-60" : ""}`}>
          {words.slice(0, 70).map((w, i) => renderWord(w, i))}
        </div>
    {!revealed && !finished && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <p className="text-[var(--muted-foreground)] text-base select-none">Click here to start typing or press Space</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 mt-2">
        <LiveStats 
          wpm={stats.wpm}
          rawWpm={stats.rawWpm}
          accuracy={stats.accuracy}
          characters={`${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`}
          isActive={running}
          inline
        />
        {running && <Keymap />}
      </div>

      <Modal title="Language" open={langOpen} onClose={() => setLangOpen(false)}>
        <div className="grid grid-cols-2 gap-2">
          <button className={`px-3 py-2 rounded-lg border ${lang === "en" ? "bg-[var(--accent)] text-[var(--background)] border-transparent" : "border-[var(--border)] text-[var(--foreground)]"}`} onClick={() => { setLang("en"); setLangOpen(false); }}>English</button>
          <button className={`px-3 py-2 rounded-lg border ${lang === "pl" ? "bg-[var(--accent)] text-[var(--background)] border-transparent" : "border-[var(--border)] text-[var(--foreground)]"}`} onClick={() => { setLang("pl" as Language); setLangOpen(false); }}>Polski</button>
        </div>
      </Modal>
      <Modal title="Theme" open={themeOpen} onClose={() => setThemeOpen(false)}>
        <div className="grid grid-cols-2 gap-2">
          {(["charcoal","ocean","grape","forest","sunrise","paper"] as const).map((t) => (
            <button key={t} className={`px-3 py-2 rounded-lg border capitalize ${theme === t ? "bg-[var(--accent)] text-[var(--background)] border-transparent" : "border-[var(--border)] text-[var(--foreground)]"}`} onClick={() => { setTheme(t); setThemeOpen(false); }}>{t}</button>
          ))}
        </div>
      </Modal>
      <Modal title="Time" open={timeOpen} onClose={() => setTimeOpen(false)}>
        <div className="grid grid-cols-3 gap-2">
          {[15,30,60].map((t) => (
            <button key={t} className={`px-3 py-2 rounded-lg border ${duration === t ? "bg-[var(--accent)] text-[var(--background)] border-transparent" : "border-[var(--border)] text-[var(--foreground)]"}`} onClick={() => { handleDurationChange(t as Duration); setTimeOpen(false); }}>{t}s</button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
