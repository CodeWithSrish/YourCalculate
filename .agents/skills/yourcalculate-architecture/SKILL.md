---
name: yourcalculate-architecture
description: Intended application architecture, tech stack, data-driven calculator definitions, and scalability principles for YourCalculate.
---

# YourCalculate Architecture

## Target Tech Stack
- **Framework**: Next.js (App Router, SSR/SSG for SEO)
- **Language**: TypeScript (strict typing for calculation inputs and outputs)
- **Styling**: Tailwind CSS
- **UI Architecture**: Modular, reusable UI components (inputs, result displays, breakdown cards)
- **Calculators**: Data-driven, schema-based definitions separate from UI
- **Calculation Engine**: Pure, deterministic TypeScript functions
- **Database Readiness**: Architecture compatible with future PostgreSQL / Prisma integration without premature database dependencies
- **Education/Grading**: Hierarchical conversion engine for global grading systems
- **SEO & Graph**: Programmatic SEO metadata generation and bidirectional calculator relationship graph

## Core Architectural Principles
1. **Separation of Concerns**: Keep calculation logic, calculator metadata/configuration, and presentation layers strictly decoupled.
2. **Data-Driven Definitions**: Define calculators via structured configs (inputs, outputs, formula descriptions, schemas) to minimize boilerplate.
3. **No Duplication**: Reusable mathematical formulas and common UI input/output controls must live in shared utility and component libraries.
4. **Deterministic & Testable**: All calculation engines must be pure functions with zero side effects, independently unit-tested without rendering DOM.
5. **Lightweight & Fast**: Minimize client-side JavaScript bundle size; favor static generation and server rendering for SEO performance.
6. **Scalability (10 to 1,000+ Calculators)**: Ensure directory structures, routing patterns, and registry lookups scale effortlessly without manual route wiring per calculator.
