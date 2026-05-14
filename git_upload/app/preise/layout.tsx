import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Preise für Vereine",
  description:
    "Vergleiche die Talo-Pläne für kleine Gruppen, Vereine und größere Organisationen mit digitaler Mitgliederverwaltung.",
  path: "/preise",
  keywords: ["Talo Preise", "Vereinssoftware Kosten", "Mitgliederverwaltung Preise"],
});

export default function PreiseLayout({ children }: { children: ReactNode }) {
  return children;
}
