import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Passwort zurücksetzen",
  description: "Setze dein Talo-Passwort zurück.",
  path: "/passwort-vergessen",
  noIndex: true,
});

export default function PasswortVergessenLayout({ children }: { children: ReactNode }) {
  return children;
}
