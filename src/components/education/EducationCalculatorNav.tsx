import Link from "next/link";

interface EducationCalculatorNavProps {
  currentSlug: "cgpa-calculator" | "gpa-calculator" | "percentage-to-cgpa-calculator" | string;
}

interface NavItem {
  id: string;
  name: string;
  slug: string;
  badge?: string;
}

const EDUCATION_TOOLS: NavItem[] = [
  {
    id: "cgpa-calculator",
    name: "CGPA Calculator",
    slug: "/cgpa-calculator",
    badge: "10-Point Scale",
  },
  {
    id: "gpa-calculator",
    name: "GPA Calculator",
    slug: "/gpa-calculator",
    badge: "4.0 Scale",
  },
  {
    id: "percentage-to-cgpa-calculator",
    name: "Percentage ↔ CGPA",
    slug: "/percentage-to-cgpa-calculator",
    badge: "Quick Converter",
  },
];

export function EducationCalculatorNav({ currentSlug }: EducationCalculatorNavProps) {
  return (
    <nav
      aria-label="Education & Exams Tools"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 sm:p-2.5 shadow-2xs"
    >
      <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        <span className="text-sm leading-none" aria-hidden="true">🎓</span>
        <span>Education Tools</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
        {EDUCATION_TOOLS.map((tool) => {
          const isActive = currentSlug === tool.id || currentSlug === tool.slug.replace(/^\//, "");
          return (
            <Link
              key={tool.id}
              href={tool.slug}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>{tool.name}</span>
              {tool.badge && (
                <span
                  className={`hidden md:inline rounded-xs px-1.5 py-0.5 text-[10px] font-medium ${
                    isActive ? "bg-white/20 text-white" : "bg-[var(--background)] text-[var(--text-muted)]"
                  }`}
                >
                  {tool.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
