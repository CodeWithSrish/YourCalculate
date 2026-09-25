export function parseNumericInput(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : null;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatResultNumber(num: number, maxDecimals: number = 4): string {
  if (!Number.isFinite(num)) {
    return "0";
  }
  // Trim trailing decimal zeroes for clean display (e.g., 12.5000 -> 12.5, 15.0000 -> 15)
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
    useGrouping: true,
  });
}

export function formatINR(amount: number, includeDecimals: boolean = false): string {
  if (!Number.isFinite(amount)) {
    return "₹0";
  }
  const rounded = includeDecimals
    ? Math.round((amount + Number.EPSILON) * 100) / 100
    : Math.round(amount);

  return "₹" + rounded.toLocaleString("en-IN", {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  });
}

export function validateRequiredInputs(
  inputs: Record<string, number | null | undefined>,
  requiredKeys: string[]
): { isValid: boolean; missingKey?: string } {
  for (const key of requiredKeys) {
    const val = inputs[key];
    if (val === null || val === undefined || !Number.isFinite(val)) {
      return { isValid: false, missingKey: key };
    }
  }
  return { isValid: true };
}
