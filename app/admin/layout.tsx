import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/app/seo";

import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = createPageMetadata({
  title: "Admin",
  description: "Interner Talo-Adminbereich.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
