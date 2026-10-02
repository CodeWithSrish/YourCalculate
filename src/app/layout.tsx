import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourcalculate.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YourCalculate — Free Online Calculators",
    template: "%s | YourCalculate",
  },
  description:
    "Free online calculators for math, finance, education, health, and date computations. Deterministic calculation engines with step-by-step formulas.",
  applicationName: "YourCalculate",
  authors: [{ name: "YourCalculate" }],
  creator: "YourCalculate",
  publisher: "YourCalculate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "YourCalculate — Free Online Calculators",
    description:
      "Deterministic calculation engines with transparent formulas and verified step-by-step methodologies.",
    url: "/",
    siteName: "YourCalculate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YourCalculate — Free Online Calculators",
    description:
      "Deterministic calculation engines with transparent formulas and verified step-by-step methodologies.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen`}>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-75B3BKS5V8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-75B3BKS5V8');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
