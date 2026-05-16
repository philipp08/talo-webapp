import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Lösungen für Sport-, Kultur- und Hilfsvereine",
  description:
    "Talo passt zu Sportvereinen, Kulturvereinen, Feuerwehren, Initiativen und sozialen Trägern, die Engagement fair erfassen wollen.",
  path: "/loesungen",
  keywords: ["Vereinssoftware Sportverein", "Kulturverein Software", "Feuerwehr Dienststunden", "Ehrenamt verwalten"],
});

export default function LoesungenLayout({ children }: { children: ReactNode }) {
  return children;
}
