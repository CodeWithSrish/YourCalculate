// =========================================================================
// FIRST-CLASS DETERMINISTIC COMPLEX NUMBER MATHEMATICS ENGINE
// =========================================================================

export interface ComplexNumber {
  readonly re: number;
  readonly im: number;
}

export type MathValue =
  | {
      readonly kind: "real";
      readonly value: number;
    }
  | {
      readonly kind: "complex";
      readonly value: ComplexNumber;
    };

const ZERO_THRESHOLD = 1e-13;

/**
 * Normalizes floating point -0 to +0 and snaps noise below 1e-13 to 0.
 */
export function normalizeZero(v: number): number {
  if (Object.is(v, -0) || Math.abs(v) < ZERO_THRESHOLD) {
    return 0;
  }
  return v;
}

/**
 * Creates an immutable normalized ComplexNumber.
 */
export function createComplex(re: number, im: number): ComplexNumber {
  if (Number.isNaN(re) || Number.isNaN(im)) {
    throw new Error("Math Error: Complex calculation produced an undefined or indeterminate result.");
  }
  if (!Number.isFinite(re) || !Number.isFinite(im)) {
    throw new Error("Math Error: Calculation overflow (magnitude exceeds IEEE-754 limit).");
  }
  return {
    re: normalizeZero(re),
    im: normalizeZero(im),
  };
}

export function realVal(v: number): MathValue {
  return { kind: "real", value: normalizeZero(v) };
}

export function complexVal(re: number, im: number): MathValue {
  const z = createComplex(re, im);
  if (z.im === 0) {
    return { kind: "real", value: z.re };
  }
  return { kind: "complex", value: z };
}

export function toCanonicalMathValue(z: ComplexNumber): MathValue {
  const norm = createComplex(z.re, z.im);
  if (norm.im === 0) {
    return { kind: "real", value: norm.re };
  }
  return { kind: "complex", value: norm };
}

export function isZero(z: ComplexNumber): boolean {
  return z.re === 0 && z.im === 0;
}

export function isReal(z: ComplexNumber): boolean {
  return z.im === 0;
}

export function isPureImaginary(z: ComplexNumber): boolean {
  return z.re === 0 && z.im !== 0;
}

// -------------------------------------------------------------------------
// Complex Arithmetic
// -------------------------------------------------------------------------

export function addComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return createComplex(a.re + b.re, a.im + b.im);
}

export function subComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return createComplex(a.re - b.re, a.im - b.im);
}

export function mulComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const re = a.re * b.re - a.im * b.im;
  const im = a.re * b.im + a.im * b.re;
  return createComplex(re, im);
}

/**
 * Numerically stable Smith's complex division algorithm to prevent intermediate overflow/underflow.
 */
export function divComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  if (isZero(b)) {
    throw new Error("Cannot divide by zero (0 + 0i).");
  }

  const c = b.re;
  const d = b.im;

  if (Math.abs(c) >= Math.abs(d)) {
    const r = d / c;
    const den = c + d * r;
    const re = (a.re + a.im * r) / den;
    const im = (a.im - a.re * r) / den;
    return createComplex(re, im);
  } else {
    const r = c / d;
    const den = c * r + d;
    const re = (a.re * r + a.im) / den;
    const im = (a.im * r - a.re) / den;
    return createComplex(re, im);
  }
}

export function absComplex(z: ComplexNumber): number {
  return normalizeZero(Math.hypot(z.re, z.im));
}

export function conjComplex(z: ComplexNumber): ComplexNumber {
  return createComplex(z.re, -z.im);
}

export function argComplex(z: ComplexNumber): number {
  if (isZero(z)) {
    return 0;
  }
  return Math.atan2(z.im, z.re);
}

export function realComponent(z: ComplexNumber): number {
  return z.re;
}

export function imagComponent(z: ComplexNumber): number {
  return z.im;
}

// -------------------------------------------------------------------------
// Complex Powers
// -------------------------------------------------------------------------

export function intPowComplex(z: ComplexNumber, n: number): ComplexNumber {
  if (!Number.isInteger(n)) {
    return realPowComplex(z, n);
  }

  if (n === 0) {
    if (isZero(z)) {
      throw new Error("Cannot divide by zero (0 raised to negative power)");
    }
    return createComplex(1, 0);
  }

  if (n < 0) {
    const posPow = intPowComplex(z, -n);
    return divComplex(createComplex(1, 0), posPow);
  }

  // Binary exponentiation (exponentiation by squaring)
  let base = z;
  let exp = n;
  let result = createComplex(1, 0);

  while (exp > 0) {
    if (exp % 2 === 1) {
      result = mulComplex(result, base);
    }
    if (exp > 1) {
      base = mulComplex(base, base);
    }
    exp = Math.floor(exp / 2);
  }

  return result;
}

export function realPowComplex(z: ComplexNumber, r: number): ComplexNumber {
  if (isZero(z)) {
    if (r === 0) return createComplex(1, 0);
    if (r > 0) return createComplex(0, 0);
    throw new Error("Cannot divide by zero (0 raised to negative power)");
  }

  const radius = Math.hypot(z.re, z.im);
  const theta = Math.atan2(z.im, z.re);

  const newRadius = Math.pow(radius, r);
  const newTheta = theta * r;

  const re = newRadius * Math.cos(newTheta);
  const im = newRadius * Math.sin(newTheta);

  return createComplex(re, im);
}

export const powerComplexReal = realPowComplex;
export const powerComplex = realPowComplex;

// -------------------------------------------------------------------------
// Complex Transcendental Functions (Operating in RADIANS)
// -------------------------------------------------------------------------

export function sqrtComplex(z: ComplexNumber): ComplexNumber {
  if (z.im === 0) {
    if (z.re >= 0) {
      return createComplex(Math.sqrt(z.re), 0);
    } else {
      return createComplex(0, Math.sqrt(-z.re));
    }
  }

  const r = Math.hypot(z.re, z.im);
  const u = Math.sqrt((r + z.re) / 2);
  const v = (z.im >= 0 ? 1 : -1) * Math.sqrt((r - z.re) / 2);
  return createComplex(u, v);
}

export function expComplex(z: ComplexNumber): ComplexNumber {
  const expX = Math.exp(z.re);
  const re = expX * Math.cos(z.im);
  const im = expX * Math.sin(z.im);
  return createComplex(re, im);
}

export function lnComplex(z: ComplexNumber): ComplexNumber {
  if (isZero(z)) {
    throw new Error("Invalid logarithm domain: ln(0) is undefined.");
  }
  const r = Math.hypot(z.re, z.im);
  const theta = Math.atan2(z.im, z.re);
  return createComplex(Math.log(r), theta);
}

export function log10Complex(z: ComplexNumber): ComplexNumber {
  const lnZ = lnComplex(z);
  return createComplex(lnZ.re / Math.LN10, lnZ.im / Math.LN10);
}

export function sinComplex(z: ComplexNumber): ComplexNumber {
  // sin(x + iy) = sin(x) cosh(y) + i cos(x) sinh(y)
  const re = Math.sin(z.re) * Math.cosh(z.im);
  const im = Math.cos(z.re) * Math.sinh(z.im);
  return createComplex(re, im);
}

export function cosComplex(z: ComplexNumber): ComplexNumber {
  // cos(x + iy) = cos(x) cosh(y) - i sin(x) sinh(y)
  const re = Math.cos(z.re) * Math.cosh(z.im);
  const im = -Math.sin(z.re) * Math.sinh(z.im);
  return createComplex(re, im);
}

export function tanComplex(z: ComplexNumber): ComplexNumber {
  // tan(x + iy) = (sin(2x) + i sinh(2y)) / (cos(2x) + cosh(2y))
  const den = Math.cos(2 * z.re) + Math.cosh(2 * z.im);
  if (Math.abs(den) < ZERO_THRESHOLD) {
    throw new Error("Undefined (tan has vertical asymptote at pole)");
  }
  const re = Math.sin(2 * z.re) / den;
  const im = Math.sinh(2 * z.im) / den;
  return createComplex(re, im);
}

export function sinhComplex(z: ComplexNumber): ComplexNumber {
  // sinh(x + iy) = sinh(x) cos(y) + i cosh(x) sin(y)
  const re = Math.sinh(z.re) * Math.cos(z.im);
  const im = Math.cosh(z.re) * Math.sin(z.im);
  return createComplex(re, im);
}

export function coshComplex(z: ComplexNumber): ComplexNumber {
  // cosh(x + iy) = cosh(x) cos(y) + i sinh(x) sin(y)
  const re = Math.cosh(z.re) * Math.cos(z.im);
  const im = Math.sinh(z.re) * Math.sin(z.im);
  return createComplex(re, im);
}

export function tanhComplex(z: ComplexNumber): ComplexNumber {
  // tanh(x + iy) = (sinh(2x) + i sin(2y)) / (cosh(2x) + cos(2y))
  const den = Math.cosh(2 * z.re) + Math.cos(2 * z.im);
  if (Math.abs(den) < ZERO_THRESHOLD) {
    throw new Error("Undefined (tanh pole)");
  }
  const re = Math.sinh(2 * z.re) / den;
  const im = Math.sin(2 * z.im) / den;
  return createComplex(re, im);
}

// -------------------------------------------------------------------------
// Complex Display Formatting
// -------------------------------------------------------------------------

export function formatComplexRectangular(
  z: ComplexNumber,
  formatNumberFn: (n: number) => string = (n) => String(n)
): string {
  const norm = createComplex(z.re, z.im);

  if (norm.im === 0) {
    return formatNumberFn(norm.re);
  }

  let imPartStr = "";
  const absIm = Math.abs(norm.im);
  if (absIm === 1) {
    imPartStr = norm.im < 0 ? "-i" : "i";
  } else {
    const formattedAbsIm = formatNumberFn(absIm);
    imPartStr = norm.im < 0 ? `-${formattedAbsIm}i` : `${formattedAbsIm}i`;
  }

  if (norm.re === 0) {
    return imPartStr;
  }

  const formattedRe = formatNumberFn(norm.re);
  if (norm.im < 0) {
    const posImStr = absIm === 1 ? "i" : `${formatNumberFn(absIm)}i`;
    return `${formattedRe} - ${posImStr}`;
  }

  return `${formattedRe} + ${imPartStr}`;
}

export function formatComplexPolar(
  z: ComplexNumber,
  angleMode: "DEG" | "RAD" | "GRAD" = "DEG",
  formatNumberFn: (n: number) => string = (n) => String(n)
): string {
  const r = absComplex(z);
  const thetaRad = argComplex(z);
  const formattedR = formatNumberFn(r);

  switch (angleMode) {
    case "DEG": {
      const deg = normalizeZero((thetaRad * 180) / Math.PI);
      const roundedDeg = Math.abs(deg - Math.round(deg)) < 1e-10 ? Math.round(deg) : deg;
      return `${formattedR}∠${formatNumberFn(roundedDeg)}°`;
    }
    case "GRAD": {
      const grad = normalizeZero((thetaRad * 200) / Math.PI);
      const roundedGrad = Math.abs(grad - Math.round(grad)) < 1e-10 ? Math.round(grad) : grad;
      return `${formattedR}∠${formatNumberFn(roundedGrad)} grad`;
    }
    case "RAD":
    default: {
      const roundedRad = Math.abs(thetaRad - Math.round(thetaRad * 1e8) / 1e8) < 1e-12 ? thetaRad : thetaRad;
      return `${formattedR}∠${formatNumberFn(roundedRad)} rad`;
    }
  }
}
