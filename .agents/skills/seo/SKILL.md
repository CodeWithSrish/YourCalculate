---
name: seo
description: Search engine optimization principles, URL routing structures, content hierarchy, and anti-thin-content rules for YourCalculate.
---

# SEO Architecture & Principles

## Objective
Build a massive, sustainable organic search presence by delivering genuinely useful, lightning-fast, and mathematically accurate calculator utilities.

## Core Principles
1. **Utility is Primary**: The calculator interface itself is the core value proposition. Do not bury the calculator under blocks of SEO filler text.
2. **Distinct Search Intent Only**: Create dedicated indexable pages only when there is distinct user search intent or genuine programmatic value.
3. **No Thin or Near-Duplicate Pages**: Never generate low-value programmatic variations (e.g., separate URLs for trivial numeric changes like `/calculate-10-percent-of-50` vs `/calculate-10-percent-of-60`).
4. **No AI Keyword Stuffing**: Avoid walls of generic AI-generated articles solely targeting search keywords.
5. **No Ranking Guarantees**: Focus strictly on technical SEO excellence, relevance, and superior user experience rather than guaranteeing search rankings.

## URL Structure & Intent Hierarchy
- **Homepage (`/`)**: Broad general intent ("online calculator", "free calculation tools").
- **Category Pages (`/finance`, `/education`, `/health`)**: Broad category exploration and discovery.
- **Specific Intent Calculator URLs**:
  - `/calculator`
  - `/percentage-calculator`
  - `/emi-calculator`
  - `/sip-calculator`
  - `/cgpa-to-percentage`
  - `/gpa-calculator`
  - `/mortgage-calculator`
  - `/bmi-calculator`
  - `/age-calculator`
  - `/unit-converter`

## Page Content Hierarchy
Every calculator page should adhere to a structured, semantic layout:
1. **Breadcrumb Navigation**: Clear hierarchical trail (`Home > Finance > EMI Calculator`).
2. **H1 Title**: Concise, intent-matching title.
3. **Concise Introduction**: 1–2 sentences clarifying what the tool solves.
4. **Interactive Calculator UI**: Input fields, actions, and controls.
5. **Result Display**: Direct answer with visual breakdowns where helpful.
6. **Formula & Methodology**: Exact mathematical formulas and underlying logic.
7. **How It Works & Step-by-Step Guide**: Plain-language explanation with worked examples.
8. **Assumptions & Caveats**: Boundary conditions, rounding logic, and regional variations.
9. **FAQ Section**: Collapsible, high-value questions addressing specific edge cases or related queries.
10. **Related Calculators**: Contextual internal links to relevant calculators across the relationship graph.

## Technical SEO Requirements
- Strict canonical URL tags.
- Schema.org structured data (e.g., `WebApplication`, `SoftwareApplication`, `FAQPage`, `BreadcrumbList`).
- Fast Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms).
- Dynamic OpenGraph and Twitter card metadata for every calculator.
