import type { Metadata } from "next";

export const siteName = "Talo";
export const siteUrl = "https://www.talo-club.de";
export const defaultDescription =
  "Talo ist die digitale Vereinsverwaltung für Punktevergabe, Genehmigungen, Mitglieder und transparente Vereinsarbeit.";

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

export const defaultOgImage = {
  url: absoluteUrl("/dashboard-mockup.png"),
  width: 1024,
  height: 609,
  alt: "Talo Dashboard für Punktevergabe, Genehmigungen und Mitgliederverwaltung",
};

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
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "de_DE",
      type: "website",
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage.url],
    },
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl("/talo-logo.png"),
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
  "@id": absoluteUrl("/#website"),
  name: siteName,
  url: siteUrl,
  inLanguage: "de-DE",
  description: defaultDescription,
  publisher: {
    "@id": absoluteUrl("/#organization"),
  },
};

export const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": absoluteUrl("/#software"),
  name: siteName,
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS",
  description: defaultDescription,
  image: defaultOgImage.url,
  publisher: {
    "@id": absoluteUrl("/#organization"),
  },
  offers: {
    "@type": "Offer",
    name: "Starter",
    price: "0",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
};
