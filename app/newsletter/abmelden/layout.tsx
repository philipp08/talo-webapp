import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Newsletter abmelden",
  description: "Newsletter-Abmeldung für Talo.",
  path: "/newsletter/abmelden",
  noIndex: true,
});

export default function NewsletterAbmeldenLayout({ children }: { children: ReactNode }) {
  return children;
}
