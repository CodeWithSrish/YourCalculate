import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroFinder } from "@/components/home/HeroFinder";
import { PopularCalculators } from "@/components/home/PopularCalculators";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrustSection } from "@/components/home/TrustSection";

export const metadata: Metadata = {
  title: "YourCalculate — Free Online Calculators",
  description:
    "Free online calculators for math, finance, academic grading, health, and date computations. Fast, deterministic, and transparent with step-by-step formulas.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "YourCalculate — Free Online Calculators",
    description:
      "Deterministic calculation engines with transparent formulas and verified step-by-step methodologies.",
    url: "/",
    siteName: "YourCalculate",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />
      <main className="flex-1">
        <HeroFinder />
        <PopularCalculators />
        <CategoryGrid />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}
