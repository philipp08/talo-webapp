import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Changelog",
  description: "Produktupdates und Verbesserungen an Talo für digitale Vereinsarbeit.",
  path: "/changelog",
  keywords: ["Talo Changelog", "Talo Updates", "Vereinssoftware Updates"],
});

export default function ChangelogLayout({ children }: { children: ReactNode }) {
  return children;
}
