import { CalculatorFAQ } from "@/calculators/engine/types";

interface FAQSectionProps {
  title?: string;
  description?: string;
  faqs: CalculatorFAQ[];
}

export function FAQSection({
  title = "Frequently Asked Questions",
  description = "Common questions regarding formulas, methodologies, and calculation conventions.",
  faqs,
}: FAQSectionProps) {
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

      <div className="mt-6 divide-y divide-[var(--border)]">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-4.5">
            <h3 className="text-base sm:text-[17px] font-semibold text-[var(--text-primary)]">
              {faq.question}
            </h3>
            <p className="mt-2 text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-4xl">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
