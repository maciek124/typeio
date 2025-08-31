import TypingTest from "./components/TypingTest";
import FpsCounter from "./components/FpsCounter";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,color-mix(in_oklab,var(--accent) 25%,transparent),transparent_60%)] opacity-20" />
      <header className="px-6 pt-8 pb-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--accent)]">typeio</h1>
          <div className="text-sm text-[var(--muted-foreground)]">practice typing</div>
        </div>
      </header>
      <main className="px-6 pb-16">
        <TypingTest />
      </main>
      <FpsCounter />
    </div>
  );
}
