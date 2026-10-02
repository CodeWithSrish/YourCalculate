"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandIcon } from "@/components/ui/BrandIcon";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScientific = pathname === "/scientific-calculator";

  // Automatically close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-base sm:text-lg tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity shrink-0"
          aria-label="YourCalculate Home"
        >
          <BrandIcon className="h-7 w-7 rounded-md shadow-xs shrink-0" />
          <span className="tracking-tight">YourCalculate</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link
            href="/scientific-calculator"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
              isScientific
                ? "bg-[var(--surface-sunken)] text-[var(--primary)] font-semibold border border-[var(--border)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            aria-current={isScientific ? "page" : undefined}
          >
            Scientific Calculator
          </Link>
          <Link
            href="/#popular-calculators"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            Calculators
          </Link>
          <Link
            href="/#calculator-directory"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            Categories
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-1 shadow-md">
          <Link
            href="/scientific-calculator"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isScientific
                ? "bg-[var(--surface-sunken)] text-[var(--primary)] font-semibold border border-[var(--border)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--text-primary)]"
            }`}
            aria-current={isScientific ? "page" : undefined}
          >
            Scientific Calculator
          </Link>
          <Link
            href="/#popular-calculators"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Calculators
          </Link>
          <Link
            href="/#calculator-directory"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Categories
          </Link>
        </div>
      )}
    </header>
  );
}
