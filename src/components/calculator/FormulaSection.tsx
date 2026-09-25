import { FormulaExplanation } from "@/calculators/engine/types";
import { MathFormula } from "./MathFormula";

interface FormulaSectionProps {
  title?: string;
  description?: string;
  formulas: FormulaExplanation[];
}

export function FormulaSection({
  title = "Formulas & Methodology",
  description = "Mathematical formulas, algorithms, and step-by-step methodologies.",
  formulas,
}: FormulaSectionProps) {
  return (
    <section className="border-t border-[var(--border)] pt-8 sm:pt-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {formulas.map((item) => (
          <div
            key={item.modeId}
            className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs"
          >
            <div>
              <h3 className="text-base sm:text-[17px] font-semibold text-[var(--text-primary)]">
                {item.title}
              </h3>

              <div className="my-4 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-center text-[var(--primary)] min-h-[68px]">
                <MathFormula formula={item.formulaMath} size="md" />
              </div>

              <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {item.explanation}
              </p>

              {item.whenToUse && (
                <p className="mt-2.5 text-[14px] sm:text-[15px] text-[var(--text-muted)] leading-relaxed">
                  <span className="font-semibold text-[var(--text-secondary)]">When to use: </span>
                  {item.whenToUse}
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-[var(--border)] pt-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              <span className="font-semibold text-[var(--text-secondary)]">Example: </span>
              <span className="tabular-nums">{item.example}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
