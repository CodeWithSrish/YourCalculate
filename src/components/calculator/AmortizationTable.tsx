"use client";

import React, { useState } from "react";
import { AmortizationRow } from "@/calculators/engine/types";

interface AmortizationTableProps {
  schedule: AmortizationRow[];
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12; // 1 year of monthly payments per page

  if (!schedule || schedule.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(schedule.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = schedule.slice(startIndex, startIndex + rowsPerPage);

  const startYear = Math.floor(startIndex / 12) + 1;

  return (
    <section className="border-t border-[var(--border)] pt-8 sm:pt-10">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Loan Amortization Schedule
          </h2>
          <p className="mt-1 text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Detailed month-by-month repayment breakdown showing interest, principal, and remaining balance.
          </p>
        </div>
        <div className="mt-2 sm:mt-0 text-xs sm:text-sm font-medium tabular-nums text-[var(--text-muted)]">
          Total Installments: {schedule.length} Months
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Showing Year {startYear} (Months {startIndex + 1}–{Math.min(startIndex + rowsPerPage, schedule.length)} of {schedule.length})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              ← Prev Year
            </button>

            <span className="px-2 text-xs sm:text-sm font-medium tabular-nums text-[var(--text-muted)]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              Next Year →
            </button>
          </div>
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Monthly Amortization Schedule</caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--secondary)] text-[var(--text-primary)] font-semibold text-sm sm:text-[15px]">
              <th scope="col" className="px-4 py-3.5 sm:px-5">Month</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right">Monthly EMI</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right">Principal Paid</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right">Interest Paid</th>
              <th scope="col" className="px-4 py-3.5 sm:px-5 text-right">Remaining Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-sm sm:text-[15px]">
            {currentRows.map((row) => (
              <tr
                key={row.paymentNumber}
                className="hover:bg-[var(--background)] transition-colors"
              >
                <td className="px-4 py-3 sm:px-5 font-semibold text-[var(--text-secondary)] tabular-nums">
                  #{row.paymentNumber}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right text-[var(--primary)] font-semibold tabular-nums">
                  {row.formattedEmi}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right text-[var(--text-primary)] tabular-nums">
                  {row.formattedPrincipal}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right text-amber-700 dark:text-amber-400 tabular-nums">
                  {row.formattedInterest}
                </td>
                <td className="px-4 py-3 sm:px-5 text-right font-semibold text-[var(--text-primary)] tabular-nums">
                  {row.formattedBalance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
