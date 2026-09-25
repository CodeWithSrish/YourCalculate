import { getAllCalculators } from "../registry";
import { CalculatorDefinition } from "./types";

export interface CalculatorSearchResult {
  calculator: CalculatorDefinition;
  score: number;
  matchedReason?: string;
}

export function searchCalculators(
  query: string,
  limit = 8
): CalculatorSearchResult[] {
  const normalizedQuery = (query || "").trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const calculators = getAllCalculators();
  const results: CalculatorSearchResult[] = [];

  for (const calc of calculators) {
    const nameLower = calc.name.toLowerCase();
    const slugLower = calc.slug.toLowerCase();
    const catLower = calc.category.toLowerCase();
    const shortDescLower = calc.shortDescription.toLowerCase();
    const keywords = (calc.searchKeywords || []).map((k) => k.toLowerCase());

    let score = 0;
    let matchedReason: string | undefined;

    // 1. Exact Name / Slug Match
    if (nameLower === normalizedQuery || slugLower === normalizedQuery) {
      score = 100;
      matchedReason = "Exact name match";
    }
    // 2. Name Starts With Query
    else if (nameLower.startsWith(normalizedQuery)) {
      score = 80;
      matchedReason = "Title match";
    }
    // 3. Exact Keyword Match
    else if (keywords.includes(normalizedQuery)) {
      score = 75;
      matchedReason = `Keyword: ${normalizedQuery}`;
    }
    // 4. Name Contains Query
    else if (nameLower.includes(normalizedQuery)) {
      score = 60;
      matchedReason = "Title contains term";
    }
    // 5. Keyword Starts With / Contains Query
    else {
      const matchingKeyword = keywords.find((k) => k.includes(normalizedQuery));
      if (matchingKeyword) {
        score = 50;
        matchedReason = `Keyword: ${matchingKeyword}`;
      }
      // 6. Mode name / formula match
      else {
        const matchingMode = calc.modes.find((m) =>
          m.name.toLowerCase().includes(normalizedQuery) || m.description.toLowerCase().includes(normalizedQuery)
        );
        if (matchingMode) {
          score = 35;
          matchedReason = `Mode: ${matchingMode.name}`;
        }
        // 7. Short Description / Category Match
        else if (shortDescLower.includes(normalizedQuery) || catLower.includes(normalizedQuery)) {
          score = 25;
          matchedReason = "Description match";
        }
      }
    }

    if (score > 0) {
      results.push({
        calculator: calc,
        score,
        matchedReason,
      });
    }
  }

  // Sort results by score descending, then by name length ascending
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.calculator.name.length - b.calculator.name.length;
  });

  return results.slice(0, limit);
}
