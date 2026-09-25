"use client";

import React from "react";
import { SIPGrowthRow } from "@/calculators/engine/types";

interface SIPGrowthTableProps {
  growthSchedule: SIPGrowthRow[];
}

export function SIPGrowthTable({ growthSchedule }: SIPGrowthTableProps) {
  if (!growthSchedule || growthSchedule.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[var(--border)] pt-8 sm:pt-10">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Year-by-Year SIP Growth Projection
          </h2>
          <p className="mt-1 text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Cumulative annual breakdown of capital invested, wealth gain from compounding, and estimated corpus.
          </p>
        </div>
        <div className="mt-2 sm:mt-0 text-xs sm:text-sm font-medium tabular-nums text-[var(--text-muted)]">
          Projection Horizon: {growthSchedule.length} Timeline Steps
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Annual SIP Compounding Growth Schedule</caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--secondary)] text-[var(--text-primary)] font-semibold text-sm sm:text-[15px]">
              <th scope="col" className="px-4 py-3.5 sm:px-5">Year</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right">Monthly Investment</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right">Amount Invested</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right text-emerald-700 dark:text-emerald-400">Estimated Returns</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right">Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-sm sm:text-[15px]">
            {growthSchedule.map((row) => (
              <tr
                key={row.yearLabel}
                className="hover:bg-[var(--background)] transition-colors"
              >
                <td className="px-4 py-3 sm:px-5 font-semibold text-[var(--text-secondary)] tabular-nums">
                  {row.yearLabel}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right text-[var(--text-primary)] tabular-nums">
                  {row.formattedMonthlyInvestment}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right text-[var(--text-primary)] tabular-nums">
                  {row.formattedAmountInvested}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
                  +{row.formattedEstimatedReturns}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right font-bold text-[var(--primary)] tabular-nums">
                  {row.formattedTotalValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
