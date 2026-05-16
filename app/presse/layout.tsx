import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Presse und Medien",
  description:
    "Presseinformationen, Fakten und Kontakt für redaktionelle Anfragen rund um Talo und digitale Vereinsarbeit.",
  path: "/presse",
  keywords: ["Talo Presse", "Vereinssoftware Presse", "Philipp Pauli"],
});

export default function PresseLayout({ children }: { children: ReactNode }) {
  return children;
}
