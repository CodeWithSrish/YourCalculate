"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { POPULAR_CALCULATORS } from "@/data/homepage";
import "./globals.css";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error for client-side debugging
    console.error("YourCalculate runtime error:", error);
  }, [error]);

  const quickCalculators = POPULAR_CALCULATORS.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          {/* Main 500 Error Message */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-md bg-red-500/10 px-3 py-1 font-mono text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20">
              Application Error
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Something Went Wrong
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              An unexpected error occurred while processing this calculation or loading this page. You can try refreshing the calculator or return to the directory.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                Return to Homepage
              </Link>
            </div>
          </div>

          {/* Popular Calculators Grid */}
          <div className="mt-12 sm:mt-16 border-t border-[var(--border)] pt-8 sm:pt-10">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Popular Calculation Engines
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Direct links to verified mathematical, financial, and academic utilities.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickCalculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs hover:border-[var(--primary)] hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                        {calc.category}
                      </span>
                      <span
                        className="text-xs font-semibold text-[var(--primary)] group-hover:translate-x-0.5 transition-transform"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {calc.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {calc.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
