import { CalculatorExample } from "@/calculators/engine/types";

interface ExampleSectionProps {
  examples: CalculatorExample[];
}

export function ExampleSection({ examples }: ExampleSectionProps) {
  return (
    <section className="border-t border-[var(--border)] pt-8 sm:pt-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Practical Calculation Examples
        </h2>
        <p className="mt-1 text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Real-world scenarios illustrating step-by-step numbers, inputs, and verified outputs.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((ex) => (
          <div
            key={ex.title}
            className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs"
          >
            <div>
              <h3 className="text-base sm:text-[17px] font-semibold text-[var(--text-primary)]">
                {ex.title}
              </h3>
              <p className="mt-2 text-[14px] sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {ex.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">Result</span>
              <span className="text-base sm:text-[17px] font-bold text-[var(--primary)] tabular-nums">
                {ex.expectedOutput}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
