import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-xs text-[var(--text-muted)]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-sm text-[var(--text-primary)] hover:opacity-90 transition-opacity"
            aria-label="YourCalculate Home"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--primary)] text-[10px] text-white font-mono">
              YC
            </span>
            <span className="tracking-tight">YourCalculate</span>
          </Link>
          <span className="text-[var(--text-muted)]">—</span>
          <span>Calculate Anything.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-[var(--text-secondary)]">
          <Link
            href="/#popular-calculators"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Popular Calculators
          </Link>
          <Link
            href="/#calculator-directory"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Calculator Directory
          </Link>
        </div>

        <div>
          <p>© {currentYear} YourCalculate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
