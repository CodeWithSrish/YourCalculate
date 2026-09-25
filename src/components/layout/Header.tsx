import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-base sm:text-lg tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity"
          aria-label="YourCalculate Home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-white font-mono text-xs font-bold shadow-xs">
            YC
          </span>
          <span className="tracking-tight">YourCalculate</span>
        </Link>

        <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/#popular-calculators"
            className="rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            Calculators
          </Link>
          <Link
            href="/#calculator-directory"
            className="rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            Categories
          </Link>
        </nav>
      </div>
    </header>
  );
}
