import type { MetadataRoute } from "next";
import { getAllCalculators } from "@/calculators/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourcalculate.com";
  const baseUrl = siteUrl.replace(/\/+$/, "");

  const calculators = getAllCalculators();

  const calculatorEntries: MetadataRoute.Sitemap = calculators.map((calc) => {
    const slug = calc.slug.startsWith("/") ? calc.slug : `/${calc.slug}`;
    return {
      url: `${baseUrl}${slug}`,
      lastModified: new Date("2026-09-26T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: slug === "/scientific-calculator" ? 0.9 : 0.8,
    };
  });

  const staticTrustPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-09-26T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date("2026-09-26T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2026-09-26T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-09-26T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date("2026-09-26T00:00:00.000Z"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...calculatorEntries,
    ...staticTrustPages,
  ];
}
