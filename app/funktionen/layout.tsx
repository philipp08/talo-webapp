import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Funktionen für digitale Vereinsverwaltung",
  description:
    "Entdecke Talo-Funktionen für Punktevergabe, Genehmigungen, Rollen, Auswertungen und Exporte in modernen Vereinen.",
  path: "/funktionen",
  keywords: ["Talo Funktionen", "Punktevergabe Verein", "Genehmigungsworkflow", "Vereinssoftware"],
});

export default function FunktionenLayout({ children }: { children: ReactNode }) {
  return children;
}
