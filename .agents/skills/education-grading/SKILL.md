---
name: education-grading
description: Architecture, verification taxonomy, and data schema for the education and grading conversion engine.
---

# Education & Grading Conversion Engine

## Core Philosophy
- **No Universal Formulas**: Grading scales, GPA calculations, and CGPA-to-percentage conversions vary substantially across countries, institutions, faculties, programs, and time periods. Never assume a single formula (e.g., `Percentage = CGPA * 9.5`) applies universally.
- **Data-Driven Rules**: All grading conversion methodologies must be represented as structured data with clear citations and effective dates.
- **Genuine Indexation Only**: Institution- or program-specific SEO pages must only be created when distinct, verified, documented rules exist for that institution.

## Conversion Resolution Hierarchy
The resolution flow for an educational conversion must follow:
```
Country
  └── Institution (University / Board)
        └── Degree / Faculty / Program
              └── Grading System (4.0, 7.0, 10.0, Letter, Percentage)
                    └── Conversion Rule (Formula / Grade Boundary Table)
                          └── Deterministic Result
```

## Conversion Classification Taxonomy
Every result or formula must clearly communicate its authenticity tier:
1. **Exact / Official**: Derived directly from published university statutes, official transcripts, or academic council guidelines.
2. **Standard / Recognized**: Standard national or institutional convention (e.g., standard AICTE, WES guidelines, or national board norms).
3. **Estimated / Approximate**: Mathematical approximation when no official conversion is prescribed by the awarding body; clearly labeled with caveats.

## Documented Grading Schema Fields
Data entries for educational conversion rules should conceptually include:
- `university`: Name of institution / examining body
- `country`: Country of operation
- `degree`: Specific program or qualification level (e.g., B.Tech, Master's, High School)
- `gradingScale`: Scale definition (e.g., 10-point scale, 4.0 scale, letter grades)
- `gradeBoundaries`: Specific grade thresholds and corresponding letter/percentage mappings
- `percentageFormula`: Explicit conversion formula or piecewise function
- `gpaFormula`: Explicit formula for GPA calculation
- `classification`: Division / Honors determination criteria (e.g., First Class with Distinction)
- `source`: URL, official document reference, or ordinance number
- `effectiveDate`: Batch years or timeframe the rule applies to
- `verificationStatus`: `verified`, `pending_verification`, or `community_reported`
