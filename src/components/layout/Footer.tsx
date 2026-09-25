import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-xs text-[var(--text-muted)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-sm text-[var(--text-primary)]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--primary)] text-[10px] text-white font-mono">
              YC
            </span>
            <span>YourCalculate</span>
          </Link>
          <span className="text-[var(--text-muted)]">—</span>
          <span>Calculate Anything.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[var(--text-secondary)]">
          <a href="#calculators" className="hover:text-[var(--text-primary)] transition-colors">
            Popular Calculators
          </a>
          <a href="#categories" className="hover:text-[var(--text-primary)] transition-colors">
            Categories
          </a>
        </div>

        <div>
          <p>© {currentYear} YourCalculate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
