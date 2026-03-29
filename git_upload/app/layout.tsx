import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import AuthProvider from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import CookieBanner from "./components/CookieBanner";
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
  title: "Talo™ – Jeder Beitrag zählt.",
  description: "Die smarte Plattform für Vereinsengagement. Punkte sammeln, Beiträge verwalten, Gemeinschaft stärken.",
  keywords: ["Verein", "Ehrenamt", "Punkte", "Vereinsverwaltung", "Mitglieder"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className={`${poppins.variable} ${montserrat.variable}`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <AuthProvider>
            {children}
            <CookieBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
