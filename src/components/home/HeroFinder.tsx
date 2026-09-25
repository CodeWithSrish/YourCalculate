import { SEARCH_SUGGESTIONS } from "@/data/homepage";

export function HeroFinder() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            Calculate Anything.
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
            Fast, deterministic calculation utilities with transparent formulas and step-by-step methodology.
          </p>

          {/* Search Finder Input */}
          <div className="mx-auto mt-6 max-w-2xl">
            <form
              action="#calculators"
              className="relative flex items-center shadow-xs"
              role="search"
            >
              <label htmlFor="calculator-search" className="sr-only">
                Search calculators or enter a calculation
              </label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                <svg
                  className="h-4.5 w-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="calculator-search"
                name="q"
                placeholder="What do you want to calculate? (e.g. EMI, Percentage, CGPA)"
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] sm:text-base"
              />
            </form>

            {/* Example Queries */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-muted)]">Try:</span>
              {SEARCH_SUGGESTIONS.map((item) => (
                <span
                  key={item.text}
                  className="inline-flex items-center rounded border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 font-mono text-xs text-[var(--text-primary)]"
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
