import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Karriere bei Talo",
  description:
    "Arbeite an Talo mit und hilf dabei, digitale Werkzeuge für Vereine und ehrenamtliche Organisationen besser zu machen.",
  path: "/karriere",
  keywords: ["Talo Karriere", "Vereinssoftware Jobs", "Startup Rastatt"],
});

export default function KarriereLayout({ children }: { children: ReactNode }) {
  return children;
}
