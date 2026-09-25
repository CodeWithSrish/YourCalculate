import { getAllCalculators } from "../registry";
import { CalculatorDefinition } from "./types";

export interface CalculatorSearchResult {
  calculator: CalculatorDefinition;
  score: number;
  matchedReason?: string;
}

function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ");
}

export function searchCalculators(
  query: string,
  limit = 8
): CalculatorSearchResult[] {
  const rawQuery = (query || "").trim().toLowerCase();
  const normalizedQuery = normalizeText(query);

  if (!rawQuery) {
    return [];
  }

  const calculators = getAllCalculators();
  const results: CalculatorSearchResult[] = [];

  for (const calc of calculators) {
    const rawName = calc.name.toLowerCase();
    const normalizedName = normalizeText(calc.name);
    const rawSlug = calc.slug.toLowerCase().replace(/^\//, "");
    const normalizedSlug = normalizeText(rawSlug);
    const catLower = calc.category.toLowerCase();
    const shortDescLower = calc.shortDescription.toLowerCase();
    const keywords = (calc.searchKeywords || []).map((k) => k.toLowerCase());
    const normalizedKeywords = keywords.map((k) => normalizeText(k));

    let score = 0;
    let matchedReason: string | undefined;

    // 1. Exact Calculator Name or Slug Match
    if (
      rawName === rawQuery ||
      normalizedName === normalizedQuery ||
      rawSlug === rawQuery ||
      normalizedSlug === normalizedQuery
    ) {
      score = 100;
      matchedReason = "Exact name match";
    }
    // 2. Calculator Name Starts With Query
    else if (
      rawName.startsWith(rawQuery) ||
      normalizedName.startsWith(normalizedQuery)
    ) {
      score = 95;
      matchedReason = "Title match";
    }
    // 3. Exact Keyword Match
    else if (
      keywords.includes(rawQuery) ||
      normalizedKeywords.includes(normalizedQuery)
    ) {
      score = 90;
      matchedReason = `Keyword: ${rawQuery}`;
    }
    // 4. Keyword Starts With Query
    else if (
      keywords.some((k) => k.startsWith(rawQuery)) ||
      normalizedKeywords.some((k) => k.startsWith(normalizedQuery))
    ) {
      score = 70;
      matchedReason = "Keyword prefix match";
    }
    // 5. Calculator Name Contains Query
    else if (
      rawName.includes(rawQuery) ||
      normalizedName.includes(normalizedQuery)
    ) {
      score = 60;
      matchedReason = "Title contains term";
    }
    // 6. Keyword Contains Query
    else {
      const matchingKeyword = keywords.find(
        (k, idx) => k.includes(rawQuery) || normalizedKeywords[idx].includes(normalizedQuery)
      );
      if (matchingKeyword) {
        score = 50;
        matchedReason = `Keyword: ${matchingKeyword}`;
      }
      // 7. Mode name / description match
      else {
        const matchingMode = calc.modes.find((m) =>
          m.name.toLowerCase().includes(rawQuery) ||
          normalizeText(m.name).includes(normalizedQuery) ||
          m.description.toLowerCase().includes(rawQuery)
        );
        if (matchingMode) {
          score = 35;
          matchedReason = `Mode: ${matchingMode.name}`;
        }
        // 8. Short Description / Category Match
        else if (
          shortDescLower.includes(rawQuery) ||
          normalizeText(shortDescLower).includes(normalizedQuery) ||
          catLower.includes(rawQuery)
        ) {
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
