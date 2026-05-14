import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Blog über digitale Vereinsarbeit",
  description:
    "Praxisnahe Artikel über Vereinsverwaltung, Ehrenamt, Punktesysteme und die Produktentwicklung von Talo.",
  path: "/blog",
  keywords: ["Vereinsverwaltung Blog", "Ehrenamt digital", "Talo Blog"],
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
