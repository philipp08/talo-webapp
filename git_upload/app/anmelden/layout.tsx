import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Anmelden",
  description: "Anmeldung für Talo.",
  path: "/anmelden",
  noIndex: true,
});

export default function AnmeldenLayout({ children }: { children: ReactNode }) {
  return children;
}
