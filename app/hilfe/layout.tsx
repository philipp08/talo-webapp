import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Hilfe und Fragen zur Vereinsverwaltung",
  description:
    "Antworten auf häufige Fragen zu Talo, Einrichtung, Punktesystem, Rollen, Datenschutz und Support.",
  path: "/hilfe",
  keywords: ["Talo Hilfe", "Vereinssoftware FAQ", "Punktesystem Hilfe"],
});

export default function HilfeLayout({ children }: { children: ReactNode }) {
  return children;
}
