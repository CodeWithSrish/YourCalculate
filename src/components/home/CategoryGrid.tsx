import { CATEGORIES } from "@/data/homepage";

export function CategoryGrid() {
  return (
    <section id="categories" className="border-t border-[var(--border)] bg-[var(--surface)] py-8 sm:py-12 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[var(--border)] pb-3">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
            Calculator Directory
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
            Browse calculation engines organized across disciplines and everyday use cases.
          </p>
        </div>

        {/* Directory-style clean grid */}
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const isEducation = cat.id === "education-exams";
            return (
              <div
                key={cat.id}
                className={`flex flex-col justify-start rounded p-2.5 transition-colors ${
                  isEducation
                    ? "bg-[var(--secondary)]/70"
                    : "hover:bg-[var(--secondary)]/40"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold ${
                      isEducation
                        ? "text-[var(--primary)]"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {cat.name}
                  </span>
                  {isEducation && (
                    <span className="text-[10px] font-medium text-[var(--primary)] font-mono">
                      [Core]
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
