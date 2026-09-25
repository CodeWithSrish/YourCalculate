---
name: calculator-engine
description: Rules for deterministic calculation engines, schema structures, and reusable calculator UI components.
---

# Calculator Engine Principles

## Calculation Engine Rules
- **Strictly Deterministic**: Given identical inputs, calculations must produce identical, mathematically verified outputs every single time.
- **Never Use LLMs for Numerical Calculation**: All computations must execute through standard TypeScript arithmetic, verified mathematical libraries, or exact formula implementations.
- **Independent Testability**: Engine logic must reside in standalone functions decoupled from React or DOM dependencies, covered by rigorous unit tests (edge cases, boundary values, rounding checks).
- **Explicit Assumptions & Rounding**: Document precision rules, rounding methods (e.g., Banker's rounding, floor, standard half-up), and underlying assumptions in output metadata.
- **Zero Duplication**: Shared financial, geometric, statistical, and unit conversion algorithms must be abstracted into centralized mathematical utilities.

## Conceptual Calculator Definition Schema
A standard calculator configuration should conceptually define:
- `id`: Unique identifier (e.g., `emi-calculator`)
- `slug`: URL routing path
- `category`: Primary domain grouping (e.g., `finance`, `education`, `health`, `math`)
- `title`: User-facing name
- `description`: Concise summary of what the calculator computes
- `inputs`: Field definitions (type, label, unit, default value, validation rules, min/max, step)
- `calculation`: Reference to pure calculation execution function
- `outputs`: Result definitions (primary metric, secondary metrics, unit formatting)
- `formula`: Mathematical formula representation (text, LaTeX/KaTeX, or step-by-step description)
- `assumptions`: Baseline assumptions or constants used in the calculation
- `examples`: Preset scenarios illustrating typical usage
- `relatedCalculators`: References to connected calculator IDs in the relationship graph
- `seoMetadata`: Title, description, keywords, OpenGraph data, schema markup
- `localization`: Currency, unit system (Metric/Imperial), locale-specific number formatting

## Conceptual Reusable UI Components
Future UI implementations will utilize standardized building blocks:
- **Input Controls**: `NumberInput`, `PercentageInput`, `CurrencyInput`, `DateInput`, `Dropdown`, `Slider`, `RadioGroup`, `UnitSelector`, `CountrySelector`, `UniversitySelector`
- **Action Controls**: `CalculateButton`, `ResetButton`
- **Output Controls**: `ResultCard`, `FormulaCard`, `BreakdownCard`, `Chart`, `AmortizationTable`
- **Content Controls**: `FAQ`, `RelatedCalculators`, `MethodologySection`
