import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Systemstatus",
  description: "Aktueller Status der Talo-Plattform und Hinweise bei Störungen.",
  path: "/status",
  noIndex: true,
});

export default function StatusLayout({ children }: { children: ReactNode }) {
  return children;
}
