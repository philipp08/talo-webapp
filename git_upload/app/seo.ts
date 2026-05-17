import type { Metadata } from "next";

export const siteName = "Talo";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talo.app";
export const defaultDescription =
  "Talo hilft Vereinen, Engagement, Punkte, Genehmigungen und Mitgliederverwaltung fair und transparent zu organisieren.";

export type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "de_DE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl("/favicon.ico"),
  founder: {
    "@type": "Person",
    name: "Philipp Pauli",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "philipp@pauli-one.de",
    contactType: "customer support",
    availableLanguage: ["German"],
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  inLanguage: "de-DE",
  description: defaultDescription,
};
