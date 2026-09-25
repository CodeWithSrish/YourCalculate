"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { POPULAR_CALCULATORS } from "@/data/homepage";
import { isCalculatorAvailable } from "@/calculators/registry";
import { searchCalculators } from "@/calculators/engine/search";

const QUICK_SEARCH_EXAMPLES = [
  "EMI",
  "GPA",
  "CGPA",
  "Percentage",
  "SIP",
  "Loan",
];

export function HeroFinder() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const heroQuickLinks = POPULAR_CALCULATORS.slice(0, 6);

  const results = useMemo(() => {
    return searchCalculators(query, 6);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleSelectResult = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(slug.startsWith("/") ? slug : `/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setHighlightedIndex((prev) => (prev + 1 >= results.length ? 0 : prev + 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 < 0 ? results.length - 1 : prev - 1));
      }
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && results[highlightedIndex]) {
        e.preventDefault();
        handleSelectResult(results[highlightedIndex].calculator.slug);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleExampleClick = (term: string) => {
    setQuery(term);
    setIsOpen(true);
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] py-8 sm:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: Hero Finder */}
          <div className="lg:col-span-7 xl:col-span-8">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
              Calculate Anything.
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base max-w-2xl">
              Deterministic calculation engines with transparent formulas and verified step-by-step methodologies.
            </p>

            {/* Search Container with Popover Dropdown */}
            <div ref={containerRef} className="relative mt-6 max-w-2xl">
              <div
                role="search"
                className="relative flex items-center shadow-xs"
              >
                <label htmlFor="calculator-search" className="sr-only">
                  Search calculators
                </label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)]">
                  <svg
                    className="h-5 w-5"
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
                  ref={inputRef}
                  type="text"
                  id="calculator-search"
                  name="q"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search calculators (e.g. EMI, GPA, CGPA, percentage)"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={isOpen && hasQuery}
                  aria-controls="search-results-listbox"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    isOpen && hasQuery && highlightedIndex >= 0 && results[highlightedIndex]
                      ? `search-result-${results[highlightedIndex].calculator.id}`
                      : undefined
                  }
                  className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] py-3.5 pl-11 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] sm:text-base"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setIsOpen(false);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search input"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete / Instant Search Dropdown Popover */}
              {isOpen && hasQuery && (
                <div
                  id="search-results-listbox"
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg backdrop-blur-md"
                >
                  {results.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                      {results.map((res, index) => {
                        const isHighlighted = index === highlightedIndex;
                        const calc = res.calculator;

                        return (
                          <div
                            key={calc.id}
                            id={`search-result-${calc.id}`}
                            role="option"
                            aria-selected={isHighlighted}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onClick={() => handleSelectResult(calc.slug)}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors ${
                              isHighlighted
                                ? "bg-[var(--primary)]/10 text-[var(--text-primary)]"
                                : "hover:bg-[var(--background)] text-[var(--text-primary)]"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--background)] text-base font-bold shadow-2xs">
                              {calc.icon || "🧮"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm sm:text-[15px] font-semibold text-[var(--text-primary)] truncate">
                                  {calc.name}
                                </span>
                                <span className="rounded-xs bg-[var(--background)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
                                  {calc.category}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                                {calc.shortDescription}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm font-medium text-[var(--text-secondary)]">
                        No matching calculator found.
                      </p>
                      <Link
                        href="/#calculator-directory"
                        onClick={() => setIsOpen(false)}
                        className="mt-2 inline-flex items-center text-xs font-semibold text-[var(--primary)] hover:underline"
                      >
                        Browse all calculators →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Example Queries */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-muted)]">Quick Search:</span>
                {QUICK_SEARCH_EXAMPLES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleExampleClick(item)}
                    className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Compact Discovery Element */}
          <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-[var(--border)] lg:pl-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Popular Right Now
            </h2>

            <div className="mt-3 divide-y divide-[var(--border)]">
              {heroQuickLinks.map((calc) => {
                const isAvailable = isCalculatorAvailable(calc.slug.replace(/^\//, ""));

                return (
                  <div
                    key={calc.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    {isAvailable ? (
                      <Link
                        href={calc.slug}
                        className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:underline flex items-center justify-between w-full focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-xs py-0.5"
                      >
                        <span className="truncate">{calc.name}</span>
                        <span className="text-[var(--text-muted)] ml-2 text-xs" aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-[var(--text-secondary)] cursor-default">
                        {calc.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
