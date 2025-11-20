import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Roadmap" },
  { href: "/projects", label: "Projects" },
  { href: "/dashboard", label: "Dashboard" },
];

type NavbarProps = {
  streak?: number;
};

export function Navbar({ streak = 0 }: NavbarProps) {
  return (
    <header className="sticky top-4 z-40 mx-auto flex w-[min(1200px,95vw)] items-center justify-between rounded-3xl border border-white/10 bg-slate-900/50 px-6 py-4 text-sm text-slate-100 shadow-[0_20px_60px_rgba(8,47,73,0.45)] backdrop-blur-3xl">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-cyan-100"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
          C++
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Quant
          </span>
          <span>C++ Quant Mastery</span>
        </div>
      </Link>

      <nav className="flex items-center gap-6 text-sm">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium text-slate-400 transition hover:text-cyan-200",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-200">
          🔥 {streak} Day Streak
        </span>
        <Button variant="glass" size="sm" asChild>
          <Link href="/projects">Quant Portfolio</Link>
        </Button>
        <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-200">
          Hoşgeldin Teret1212
        </span>
      </div>
    </header>
  );
}

