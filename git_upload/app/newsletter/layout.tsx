import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Newsletter für moderne Vereinsarbeit",
  description:
    "Erhalte Talo-Updates, Produktnotizen und praktische Impulse zur digitalen Vereinsverwaltung direkt per E-Mail.",
  path: "/newsletter",
  keywords: ["Talo Newsletter", "Vereinsverwaltung Newsletter", "Ehrenamt Tipps"],
});

export default function NewsletterLayout({ children }: { children: ReactNode }) {
  return children;
}
