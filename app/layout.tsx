import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import AuthProvider from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import CookieBanner from "./components/CookieBanner";
import {
  createPageMetadata,
  defaultDescription,
  organizationJsonLd,
  siteName,
  siteUrl,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "./seo";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Talo | Vereinssoftware für Punktevergabe und Mitgliederverwaltung",
    description: defaultDescription,
    keywords: ["Vereinssoftware", "Vereinsverwaltung", "Punktevergabe Verein", "Mitgliederverwaltung", "Talo"],
  }),
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  creator: "Talo",
  publisher: "Talo",
  title: {
    default: "Talo | Vereinssoftware für Punktevergabe und Mitgliederverwaltung",
    template: "%s | Talo",
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { DemoProvider } from "@/lib/context/DemoContext";
import DemoModal from "./components/DemoModal";
import { Toaster } from "./components/ui/Toaster";
import { DialogRoot } from "./components/ui/DialogRoot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className={`${poppins.variable} ${montserrat.variable}`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd, softwareApplicationJsonLd]),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <AuthProvider>
            <DemoProvider>
              {children}
              <DemoModal />
              <CookieBanner />
              <Toaster />
              <DialogRoot />
            </DemoProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
