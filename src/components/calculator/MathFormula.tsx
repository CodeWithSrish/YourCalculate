"use client";

import React from "react";

interface MathFormulaProps {
  formula: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Parses and renders LaTeX-like math strings into semantic, pure-CSS mathematical markup.
 * Supports:
 * - \frac{numerator}{denominator} -> True vertical fraction layout
 * - ^{exponent} or ^x -> Superscript
 * - _{subscript} or _x -> Subscript
 * - \times or * -> Multiplication symbol (×)
 * - \div -> Division symbol (÷)
 * - \left[ \right] or [ ] -> Scaled brackets
 * - \text{...} -> Roman/Normal text
 * - Single letter variables -> Italic mathematical variables
 */
export function MathFormula({ formula, className = "", size = "md" }: MathFormulaProps) {
  const sizeClasses = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg lg:text-xl",
    lg: "text-lg sm:text-xl lg:text-2xl",
  }[size];

  return (
    <div
      className={`inline-flex flex-wrap items-center justify-center font-sans tracking-normal select-all ${sizeClasses} ${className}`}
      aria-label={formula.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)").replace(/\\[a-zA-Z]+/g, "")}
    >
      {renderMathTokens(formula)}
    </div>
  );
}

function renderMathTokens(input: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = input.trim();
  let keyIndex = 0;

  while (remaining.length > 0) {
    // 1. Match \frac{numerator}{denominator}
    const fracMatch = remaining.match(/^\\frac\{((?:[^{}]|\{[^{}]*\})+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/);
    if (fracMatch) {
      const num = fracMatch[1];
      const den = fracMatch[2];
      nodes.push(
        <span
          key={`frac-${keyIndex++}`}
          className="inline-flex flex-col items-center align-middle mx-1.5 my-1"
        >
          <span className="border-b-2 border-current px-1.5 text-center pb-0.5 leading-none font-medium">
            {renderMathTokens(num)}
          </span>
          <span className="px-1.5 text-center pt-0.5 leading-none font-medium">
            {renderMathTokens(den)}
          </span>
        </span>
      );
      remaining = remaining.slice(fracMatch[0].length);
      continue;
    }

    // 1b. Match \sqrt{...} or \sqrt(...)
    const sqrtMatch = remaining.match(/^\\sqrt(?:\{((?:[^{}]|\{[^{}]*\})+)\}|\(((?:[^()]|\([^()]*\))+)\})/);
    if (sqrtMatch) {
      const inner = sqrtMatch[1] || sqrtMatch[2];
      nodes.push(
        <span key={`sqrt-${keyIndex++}`} className="inline-flex items-center align-middle mx-1">
          <span className="text-[1.15em] font-light leading-none mr-0.5">√</span>
          <span className="border-t border-current pt-0.5 px-1 leading-none">
            {renderMathTokens(inner)}
          </span>
        </span>
      );
      remaining = remaining.slice(sqrtMatch[0].length);
      continue;
    }

    // 2. Match \text{...}
    const textMatch = remaining.match(/^\\text\{((?:[^{}]|\{[^{}]*\})+)\}/);
    if (textMatch) {
      nodes.push(
        <span key={`text-${keyIndex++}`} className="font-normal mx-0.5">
          {textMatch[1]}
        </span>
      );
      remaining = remaining.slice(textMatch[0].length);
      continue;
    }

    // 3. Match exponents: ^{...} or ^x or unicode superscripts
    if (remaining.startsWith("²") || remaining.startsWith("³")) {
      const char = remaining[0];
      nodes.push(
        <sup key={`exp-${keyIndex++}`} className="text-[0.7em] font-medium leading-none ml-0.5 -top-1.5">
          {char === "²" ? "2" : "3"}
        </sup>
      );
      remaining = remaining.slice(1);
      continue;
    }

    const expMatch = remaining.match(/^\^(\{((?:[^{}]|\{[^{}]*\})+)\}|([a-zA-Z0-9ⁿ]))/);
    if (expMatch) {
      const expContent = expMatch[2] || expMatch[3];
      nodes.push(
        <sup key={`exp-${keyIndex++}`} className="text-[0.7em] font-medium leading-none ml-0.5 -top-1.5">
          {renderMathTokens(expContent)}
        </sup>
      );
      remaining = remaining.slice(expMatch[0].length);
      continue;
    }

    // 4. Match subscripts: _{...} or _x or unicode subscripts
    if (/^[₁₂₃₄₅₆₇₈₉₀]/.test(remaining)) {
      const char = remaining[0];
      const digitMap: Record<string, string> = { "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₀": "0" };
      nodes.push(
        <sub key={`sub-${keyIndex++}`} className="text-[0.7em] font-medium leading-none ml-0.5 -bottom-1">
          {digitMap[char] || char}
        </sub>
      );
      remaining = remaining.slice(1);
      continue;
    }

    const subMatch = remaining.match(/^_(\{((?:[^{}]|\{[^{}]*\})+)\}|([a-zA-Z0-9]))/);
    if (subMatch) {
      const subContent = subMatch[2] || subMatch[3];
      nodes.push(
        <sub key={`sub-${keyIndex++}`} className="text-[0.7em] font-medium leading-none ml-0.5 -bottom-1">
          {renderMathTokens(subContent)}
        </sub>
      );
      remaining = remaining.slice(subMatch[0].length);
      continue;
    }

    // 5. Match LaTeX symbols & Greek letters
    if (remaining.startsWith("\\pi") || remaining.startsWith("π")) {
      const len = remaining.startsWith("\\pi") ? 3 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="font-serif italic font-semibold px-0.5">
          π
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\theta") || remaining.startsWith("θ")) {
      const len = remaining.startsWith("\\theta") ? 6 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="font-serif italic font-semibold px-0.5">
          θ
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\mu") || remaining.startsWith("μ")) {
      const len = remaining.startsWith("\\mu") ? 3 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="font-serif italic font-semibold px-0.5">
          μ
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\sigma") || remaining.startsWith("σ")) {
      const len = remaining.startsWith("\\sigma") ? 6 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="font-serif italic font-semibold px-0.5">
          σ
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\Delta") || remaining.startsWith("Δ")) {
      const len = remaining.startsWith("\\Delta") ? 6 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="font-normal mx-0.5">
          Δ
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\longrightarrow") || remaining.startsWith("\\rightarrow") || remaining.startsWith("\\to") || remaining.startsWith("→")) {
      let len = 1;
      if (remaining.startsWith("\\longrightarrow")) len = 15;
      else if (remaining.startsWith("\\rightarrow")) len = 11;
      else if (remaining.startsWith("\\to")) len = 3;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="mx-2 font-normal text-[var(--text-muted)]">
          →
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\lfloor") || remaining.startsWith("⌊")) {
      const len = remaining.startsWith("\\lfloor") ? 7 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="text-[1.2em] font-light text-[var(--text-muted)] mx-0.5">
          ⌊
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\rfloor") || remaining.startsWith("⌋")) {
      const len = remaining.startsWith("\\rfloor") ? 7 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="text-[1.2em] font-light text-[var(--text-muted)] mx-0.5">
          ⌋
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\approx") || remaining.startsWith("≈")) {
      const len = remaining.startsWith("\\approx") ? 7 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="mx-1.5 font-normal">
          ≈
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\leq") || remaining.startsWith("\\le") || remaining.startsWith("≤")) {
      let len = 1;
      if (remaining.startsWith("\\leq")) len = 4;
      else if (remaining.startsWith("\\le")) len = 3;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="mx-1.5 font-normal">
          ≤
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\geq") || remaining.startsWith("\\ge") || remaining.startsWith("≥")) {
      let len = 1;
      if (remaining.startsWith("\\geq")) len = 4;
      else if (remaining.startsWith("\\ge")) len = 3;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="mx-1.5 font-normal">
          ≥
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\times") || remaining.startsWith("×")) {
      const len = remaining.startsWith("\\times") ? 6 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="mx-1.5 font-normal text-[var(--text-muted)]">
          ×
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\cdot") || remaining.startsWith("·")) {
      const len = remaining.startsWith("\\cdot") ? 5 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="mx-1 font-normal text-[var(--text-muted)]">
          ·
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\div") || remaining.startsWith("÷")) {
      const len = remaining.startsWith("\\div") ? 4 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="mx-1.5 font-normal text-[var(--text-muted)]">
          ÷
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\quad")) {
      nodes.push(<span key={`sym-${keyIndex++}`} className="mx-3" />);
      remaining = remaining.slice(5);
      continue;
    }

    if (remaining.startsWith("\\,") || remaining.startsWith("\\;") || remaining.startsWith("\\:")) {
      nodes.push(<span key={`sym-${keyIndex++}`} className="mx-1" />);
      remaining = remaining.slice(2);
      continue;
    }

    if (remaining.startsWith("\\left[") || remaining.startsWith("[")) {
      const len = remaining.startsWith("\\left[") ? 6 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="text-[1.25em] font-light text-[var(--text-muted)] mx-0.5">
          [
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\right]") || remaining.startsWith("]")) {
      const len = remaining.startsWith("\\right]") ? 7 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="text-[1.25em] font-light text-[var(--text-muted)] mx-0.5">
          ]
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\left(") || remaining.startsWith("(")) {
      const len = remaining.startsWith("\\left(") ? 6 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="text-[1.15em] font-light text-[var(--text-muted)] mx-0.5">
          (
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    if (remaining.startsWith("\\right)") || remaining.startsWith(")")) {
      const len = remaining.startsWith("\\right)") ? 7 : 1;
      nodes.push(
        <span key={`sym-${keyIndex++}`} className="text-[1.15em] font-light text-[var(--text-muted)] mx-0.5">
          )
        </span>
      );
      remaining = remaining.slice(len);
      continue;
    }

    // 6. Match operators: =, +, -, |, /
    const opMatch = remaining.match(/^([=+\-|/])/);
    if (opMatch) {
      const op = opMatch[1];
      const spacing = op === "|" ? "mx-1 text-[var(--text-muted)] font-light" : "mx-1.5 font-normal";
      nodes.push(
        <span key={`op-${keyIndex++}`} className={spacing}>
          {op === "-" ? "−" : op}
        </span>
      );
      remaining = remaining.slice(1);
      continue;
    }

    // 7. Match words / identifiers / variables
    const wordMatch = remaining.match(/^([a-zA-Z%0-9.,]+)/);
    if (wordMatch) {
      const word = wordMatch[1];
      // Single letters like P, r, n, X, Y, A, B, M are rendered as italic variables
      if (/^[a-zA-Z]$/.test(word)) {
        nodes.push(
          <span key={`var-${keyIndex++}`} className="font-serif italic font-semibold px-0.5">
            {word}
          </span>
        );
      } else {
        nodes.push(
          <span key={`word-${keyIndex++}`} className="font-medium">
            {word}
          </span>
        );
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // 8. Skip spaces or fallback single character
    if (remaining.startsWith(" ")) {
      nodes.push(<span key={`space-${keyIndex++}`}> </span>);
      remaining = remaining.slice(1);
      continue;
    }

    // Fallback: render next character
    nodes.push(<span key={`char-${keyIndex++}`}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return nodes;
}
