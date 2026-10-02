import React from "react";

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * Option 9 Official Brand Mark for YourCalculate
 * Unified YC Monogram + Integrated Calculator Keypad Matrix
 */
export function BrandIcon({ size = 28, className = "", ...props }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="brandYcBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        <linearGradient id="brandYcCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Base Rounded Squircle */}
      <rect width="512" height="512" rx="116" fill="url(#brandYcBg)" />
      <rect
        x="6"
        y="6"
        width="500"
        height="500"
        rx="110"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="6"
        strokeOpacity="0.25"
      />

      {/* The Bold White 'Y' */}
      <path
        d="M 112 144 L 176 256 L 176 368 M 240 144 L 176 256"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The Stylized Cyan 'C' (Outer Frame) */}
      <path
        d="M 400 144 L 308 144 C 286 144 268 162 268 184 L 268 328 C 268 350 286 368 308 368 L 400 368"
        fill="none"
        stroke="url(#brandYcCyan)"
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Integrated Calculator Keypad inside the 'C' */}
      {/* Row 1 */}
      <rect x="328" y="196" width="28" height="26" rx="7" fill="#38BDF8" />
      <rect x="368" y="196" width="28" height="26" rx="7" fill="#38BDF8" />

      {/* Row 2 */}
      <rect x="328" y="234" width="28" height="26" rx="7" fill="#38BDF8" />
      <rect x="368" y="234" width="28" height="26" rx="7" fill="#38BDF8" />

      {/* Row 3 */}
      <rect x="328" y="272" width="28" height="26" rx="7" fill="#38BDF8" />
      <rect x="368" y="272" width="28" height="26" rx="7" fill="#F59E0B" />
    </svg>
  );
}
