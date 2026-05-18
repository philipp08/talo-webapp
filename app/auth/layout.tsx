import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Authentifizierung",
  description: "Interne Authentifizierungsseite von Talo.",
  path: "/auth",
  noIndex: true,
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
