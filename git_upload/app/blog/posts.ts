export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  subHeadline: string;
  category: string;
  author: string;
  presentedBy: string;
  date: string;
  publishedTime: string;
  readTime: string;
  keywords: string[];
};

export const posts: BlogPost[] = [
  {
    slug: "digitalisierung-im-ehrenamt-wie-talo-die-vereinsarbeit-revolutioniert",
    title: "Digitalisierung im Ehrenamt: Wie Talo Vereinsarbeit leichter macht",
    excerpt:
      "Warum Vereine bessere Werkzeuge brauchen: weniger Excel, weniger Nachfragen, mehr Transparenz bei Engagement und Aufgaben.",
    subHeadline:
      "Ein praktischer Blick darauf, wie digitale Punkte, klare Genehmigungen und einfache Auswertungen den Alltag im Verein entlasten.",
    category: "Vereinsmanagement",
    author: "Philipp Pauli",
    presentedBy: "Vorgestellt von Philipp Pauli",
    date: "29. März 2026",
    publishedTime: "2026-03-29",
    readTime: "8 min",
    keywords: ["Vereinsverwaltung", "Ehrenamt digitalisieren", "Punktesystem Verein", "Talo"],
  },
  {
    slug: "talo-app-wie-wir-sie-bauen",
    title: "Wie wir Talo bauen und warum es anders wirkt",
    excerpt:
      "Ein ruhiger Blick hinter die Kulissen: Welche Entscheidungen Talo prägen und warum gute Vereinssoftware sich fast unsichtbar anfühlen sollte.",
    subHeadline:
      "Kein Pitch, kein aufgeblasener Produkttext. Nur ein ehrlicher Blick auf das, was Talo für Vereine einfacher machen soll.",
    category: "Produkt",
    author: "Philipp Pauli",
    presentedBy: "Vorgestellt von Philipp Pauli",
    date: "1. April 2026",
    publishedTime: "2026-04-01",
    readTime: "7 min",
    keywords: ["Talo App", "Vereinssoftware", "Produktentwicklung", "digitale Vereinsarbeit"],
  },
];

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}
