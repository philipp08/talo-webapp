import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Kontakt und Demo anfragen",
  description:
    "Kontaktiere Talo für Support, Pressefragen oder eine persönliche Demo zur digitalen Vereinsverwaltung.",
  path: "/kontakt",
  keywords: ["Talo Kontakt", "Vereinssoftware Demo", "Talo Support"],
});

export default function KontaktLayout({ children }: { children: ReactNode }) {
  return children;
}
