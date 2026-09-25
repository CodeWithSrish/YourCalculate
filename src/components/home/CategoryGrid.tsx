import Link from "next/link";
import { CATEGORIES, CategoryTopic } from "@/data/homepage";
import { isCalculatorAvailable } from "@/calculators/registry";

export function CategoryGrid() {
  return (
    <section id="calculator-directory" className="border-t border-[var(--border)] bg-[var(--surface)] py-8 sm:py-12 scroll-mt-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[var(--border)] pb-2.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Explore Calculators
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Comprehensive directory of calculation engines indexed across primary disciplines and applications.
            </p>
          </div>
          <span className="mt-1 sm:mt-0 text-xs font-mono text-[var(--text-muted)]">
            16 Primary Domains
          </span>
        </div>

        {/* Directory-style text-first multi-column layout without cards */}
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const isEducation = cat.id === "education-exams";
            return (
              <div key={cat.id} className="flex flex-col">
                <div className="flex items-center gap-1.5 pb-1 border-b border-[var(--border)]">
                  <h3
                    className={`text-sm font-bold tracking-tight ${
                      isEducation
                        ? "text-[var(--primary)]"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {cat.name}
                  </h3>
                  {isEducation && (
                    <span className="text-[10px] font-semibold text-[var(--primary)] font-mono">
                      *
                    </span>
                  )}
                </div>

                <ul className="mt-2.5 space-y-1.5 text-xs text-[var(--text-secondary)]">
                  {cat.topics.map((topic: CategoryTopic, idx: number) => {
                    const isObj = typeof topic === "object" && topic !== null;
                    const name = isObj ? topic.name : topic;
                    const slug = isObj ? topic.slug : undefined;
                    const isAvailable = slug
                      ? isCalculatorAvailable(slug.replace(/^\//, ""))
                      : false;

                    if (isAvailable && slug) {
                      return (
                        <li key={slug || idx}>
                          <Link
                            href={slug}
                            className="font-medium text-[var(--primary)] hover:underline flex items-center justify-between transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--ring)] rounded-2xs"
                          >
                            <span>{name}</span>
                            <span className="text-[10px]" aria-hidden="true">→</span>
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li
                        key={name || idx}
                        className="text-[var(--text-secondary)] cursor-default"
                      >
                        {name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
