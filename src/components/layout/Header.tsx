import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity"
          aria-label="YourCalculate Home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-white font-mono text-xs font-bold shadow-xs">
            YC
          </span>
          <span>YourCalculate</span>
        </Link>

        <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-4">
          <a
            href="#calculators"
            className="rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            Calculators
          </a>
          <a
            href="#categories"
            className="rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            Categories
          </a>
        </nav>
      </div>
    </header>
  );
}
