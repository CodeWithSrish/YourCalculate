import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroFinder } from "@/components/home/HeroFinder";
import { PopularCalculators } from "@/components/home/PopularCalculators";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrustSection } from "@/components/home/TrustSection";

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
