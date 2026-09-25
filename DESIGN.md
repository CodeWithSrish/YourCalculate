# YOURCALCULATE DESIGN SYSTEM SPECIFICATION

## Brand Identity & Personality
- **Brand**: YourCalculate
- **Tagline**: Calculate Anything.
- **Product Type**: Global calculation utility and deterministic answer platform.
- **Personality**:
  - **Precise & Trustworthy**: Accuracy and mathematical clarity above all.
  - **Utility-First**: "Give me the input → get the answer."
  - **Calm & Modern**: Uncluttered, distraction-free environment.
  - **Professional & Human-Designed**: Engineered for everyday utility; deliberately avoiding generic AI SaaS template clichés.

---

## Visual Anti-Patterns (Strictly Prohibited)
- Generic AI/SaaS visual clichés (floating blur orbs, iridescent rainbow meshes, AI glitter badges).
- Excessive, distracting gradients and multi-stop colorful backgrounds.
- Glassmorphism, blurred backdrop cards, and frosted acrylic layering.
- Excessively rounded containers (e.g., 24px–32px pill containers).
- Heavy, muddy drop shadows or glowing neon borders.
- Giant hero banners pushing the interactive tool below the fold.
- Unnecessary entrance animations, bouncing counters, or slow transition delays.
- Decorative illustrations and vanity icons lacking functional meaning.
- Fake product dashboards and vanity metrics.
- Excessive badges, pills, and chip clutter.
- Giant walls of generic SEO text placed above the calculator.

---

## Layout Philosophy
- **Calculator-First**: The calculator tool is the immediate visual anchor of every calculator page.
- **Content Hierarchy**:
  1. What the user wants to calculate (H1 + concise 1-sentence intro)
  2. Input controls (well-spaced, clear units, sensible defaults)
  3. Action (Calculate / Reset / Instant computation)
  4. Prominent Result display (Primary answer + secondary breakdown)
  5. Mathematical formula & methodology
  6. Practical example & assumptions
  7. FAQs (high-value edge cases only)
  8. Related calculators in the internal relationship graph
- **Readable Content Width**: Maximum content container width of `1200px` for overall layouts; `720px–860px` for focused calculator forms.
- **Alignment & Grouping**: Related inputs grouped logically with consistent vertical rhythm.

---

## Typography System
- **Primary Font**: `Inter`, system fallback stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Numbers & Metrics**: Strict use of `tabular-nums` (monospaced figures) across all numerical inputs, result readouts, and amortization tables to prevent jitter and maintain alignment.

### Typographic Scale
| Role | Size | Weight | Line Height | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | 2rem–2.25rem (32–36px) | 700 (Bold) | 1.2 | -0.02em | Page title / Calculator primary heading |
| **H2** | 1.5rem (24px) | 600 (Semibold) | 1.3 | -0.01em | Section titles (Formula, Methodology, FAQs) |
| **H3** | 1.125rem (18px) | 600 (Semibold) | 1.4 | 0 | Subsections, card headers, breakdown titles |
| **Body Text** | 1rem (16px) | 400 (Regular) | 1.5 | 0 | Explanatory text, methodology, guide steps |
| **Label** | 0.875rem (14px) | 500 (Medium) | 1.4 | 0 | Input field labels, selector headers |
| **Helper / Muted**| 0.75rem–0.875rem (12–14px) | 400 (Regular) | 1.4 | 0 | Units, guidance notes, validation hints |
| **Primary Result**| 2rem–2.5rem (32–40px) | 700 (Bold) | 1.1 | -0.02em | Main computed output number (tabular-nums) |
| **Secondary Result**| 1.25rem (20px) | 600 (Semibold) | 1.3 | -0.01em | Key derived metrics (tabular-nums) |
| **Navigation** | 0.875rem (14px) | 500 (Medium) | 1.4 | 0 | Header links, breadcrumb items |
| **Button Text** | 0.875rem–1rem (14–16px)| 600 (Semibold) | 1.25 | 0 | Action trigger labels |

---

## Color System (Semantic & Restrained)
A disciplined slate/neutral foundation with a focused, authoritative sapphire-blue brand accent.

### Palette Tokens
- **Page Background (`--background`)**: `#f8fafc` (Slate 50) / Dark `#090d16`
- **Surface (`--surface`)**: `#ffffff` / Dark `#0f172a`
- **Elevated Surface (`--surface-elevated`)**: `#ffffff` / Dark `#1e293b`
- **Text Primary (`--text-primary`)**: `#0f172a` (Slate 900) / Dark `#f8fafc`
- **Text Secondary (`--text-secondary`)**: `#475569` (Slate 600) / Dark `#94a3b8`
- **Text Muted (`--text-muted`)**: `#64748b` (Slate 500) / Dark `#64748b`
- **Border Default (`--border`)**: `#e2e8f0` (Slate 200) / Dark `#1e293b`
- **Border Strong (`--border-strong`)**: `#cbd5e1` (Slate 300) / Dark `#334155`
- **Primary Action (`--primary`)**: `#0284c7` (Sky 600) / `#2563eb` (Blue 600)
- **Primary Action Hover (`--primary-hover`)**: `#0369a1` (Sky 700) / `#1d4ed8` (Blue 700)
- **Primary Foreground (`--primary-foreground`)**: `#ffffff`
- **Secondary Action (`--secondary`)**: `#f1f5f9` (Slate 100) / Dark `#1e293b`
- **Secondary Action Hover (`--secondary-hover`)**: `#e2e8f0` (Slate 200) / Dark `#334155`
- **Secondary Foreground (`--secondary-foreground`)**: `#0f172a` / Dark `#f8fafc`
- **Success (`--success`)**: `#15803d` (Green 700) / Dark `#22c55e`
- **Success Background (`--success-surface`)**: `#f0fdf4` / Dark `#052e16`
- **Warning (`--warning`)**: `#b45309` (Amber 700) / Dark `#f59e0b`
- **Warning Background (`--warning-surface`)**: `#fffbeb` / Dark `#451a03`
- **Error (`--error`)**: `#b91c1c` (Red 700) / Dark `#ef4444`
- **Error Background (`--error-surface`)**: `#fef2f2` / Dark `#450a0a`
- **Focus Ring (`--ring`)**: `#0284c7` (Sky 600)

---

## Spacing Scale
Based on a clean 4px baseline grid:
- `space-1`: `4px` (Tight spacing, badge padding)
- `space-2`: `8px` (Icon gap, input inner padding X)
- `space-3`: `12px` (Stack gap between label and input)
- `space-4`: `16px` (Standard component padding, mobile page gutter)
- `space-5`: `20px` (Input field vertical stack gap)
- `space-6`: `24px` (Card padding, desktop section inner gap)
- `space-8`: `32px` (Major block spacing, layout grid gap)
- `space-12`: `48px` (Section separator spacing)
- `space-16`: `64px` (Major layout boundary spacing)

---

## Borders, Radius & Elevation
- **Border Treatment**: 1px crisp hairline borders on all cards, inputs, and dividers.
- **Border Radius**:
  - Small (`--radius-sm` = `4px`): Badges, tooltips, tags
  - Medium (`--radius-md` = `6px`): Input fields, buttons, dropdown triggers
  - Large (`--radius-lg` = `8px`): Sub-cards, result banners
  - Extra Large (`--radius-xl` = `12px`): Main calculator containers
- **Elevation / Shadows**:
  - None / Flat: Default state for page sections and standard inputs.
  - Subtle (`shadow-sm`): `0 1px 2px 0 rgb(0 0 0 / 0.05)` for cards and calculator container.
  - Raised (`shadow-md`): `0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)` for active dropdowns and popovers.

---

## Button Principles
- **Primary**: Solid brand background (`--primary`), white text, font-medium/semibold, 44px min touch height. Used for explicit calculation triggers or primary actions.
- **Secondary**: Light slate background (`--secondary`), bordered (`--border-strong`), dark text (`--text-primary`). Used for Reset, Copy Result, or Alternative Options.
- **Tertiary / Text**: Transparent background, underline on hover, text (`--text-secondary`). Used for inline actions or quick clears.
- **Disabled**: Reduced opacity (0.5), cursor `not-allowed`, no hover transformation.
- **Focus State**: 2px visible focus ring (`--ring`) with 2px offset.

---

## Form Inputs & Interactive Controls
- **Touch Target**: Minimum `44px` touch height for mobile accessibility.
- **Input Variants**:
  - `NumberInput`: Direct numerical entry with step controls and tabular numbers.
  - `CurrencyInput`: Built-in localized currency prefix addon (`$`, `₹`, `€`, `£`).
  - `PercentageInput`: Built-in `%` suffix addon.
  - `DateInput`: Clean calendar / ISO date selector.
  - `Dropdown / Select`: Standardized selector with clear chevron and option list.
  - `Slider`: Clean 4px track, 18px thumb, synchronized bidirectionally with direct numeric input.
  - `RadioGroup`: Segmented pill control or structured radio cards for mutually exclusive modes.
- **Input States**:
  - **Default**: 1px border (`--border-strong`), white surface, dark text.
  - **Hover**: 1px border (`--text-muted`).
  - **Focus**: 1px border (`--primary`), 2px focus ring (`--ring`) with offset.
  - **Error**: 1px border (`--error`), error message displayed directly below input with alert icon.
  - **Disabled**: Background (`--secondary`), text (`--text-muted`), cursor `not-allowed`.

---

## Calculator Result Hierarchy
Results must deliver immediate cognitive clarity without ambiguity:
1. **Primary Output**: Large, unmistakable hero number (32px–40px bold) in a dedicated high-contrast result surface.
2. **Secondary Outputs**: Grid of supporting metrics (e.g., Total Interest, Principal, Effective Rate) in clean sub-cards.
3. **Breakdown / Visualization**: Structured data table or clean bar/pie visualization.
4. **Formula & Logic**: Explicit mathematical formula rendered in clean monospace or KaTeX notation with defined variables.
5. **Assumptions & Boundary Conditions**: Clearly stated constants, compounding intervals, and rounding rules.

---

## Card Usage Rules
- **When to Use Cards**:
  - Main Calculator Container
  - Result Summary Area
  - Formula & Step-by-Step Box
- **When NOT to Use Cards**:
  - Do NOT wrap every single paragraph, heading, or FAQ item in independent floating cards.
  - Do NOT create nested cards inside cards unless structurally required (e.g., secondary result chips inside the result surface).

---

## Navigation Principles
- **Desktop**: Clean, compact top bar with brand logo, tagline, category links, search trigger. Sticky, minimal height (56px–64px).
- **Mobile**: Touch-accessible header with search bar access and streamlined drawer menu.
- **Breadcrumbs**: Hierarchical trail (`Home > Category > Specific Calculator`) placed above H1 for navigational context.

---

## Responsive Breakpoints
- **Mobile (`<768px`)**: Single-column vertical flow. Full-width inputs, stacked calculation controls, sticky result summary or direct inline result.
- **Tablet (`768px–1023px`)**: Single-column optimized with side-by-side grouped inputs (2-column form grid where logical).
- **Desktop (`≥1024px`)**: Split 2-column layout (60% interactive form / 40% sticky result summary) or centered focus column.
- **Wide Desktop (`≥1280px`)**: Centered max-width container with comfortable margins.

---

## Accessibility (WCAG 2.1 AA Compliance)
- **Contrast**: Minimum 4.5:1 for normal text and 3:1 for large text / graphical UI elements.
- **Keyboard Navigation**: Full keyboard tab-order through all inputs, selects, and action triggers. Visible 2px focus ring on all interactive elements.
- **Dynamic Updates**: Result regions use `aria-live="polite"` so screen readers announce calculated answers without interrupting workflow.
- **Labels**: Every input has an explicit `<label htmlFor="...">` tag.
- **Reduced Motion**: Respect `prefers-reduced-motion: reduce` by disabling smooth transitions and non-essential movement.
