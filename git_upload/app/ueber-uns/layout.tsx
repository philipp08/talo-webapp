import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Über Talo",
  description:
    "Warum Talo gebaut wird: für sichtbareres Engagement, weniger Verwaltungsaufwand und fairere Vereinsarbeit.",
  path: "/ueber-uns",
  keywords: ["Über Talo", "Talo Mission", "digitale Vereinsarbeit"],
});

export default function UeberUnsLayout({ children }: { children: ReactNode }) {
  return children;
}
