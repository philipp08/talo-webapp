import type { MetadataRoute } from "next";
import { posts } from "./blog/posts";
import { absoluteUrl, defaultOgImage } from "./seo";

const lastModified = new Date("2026-05-18");

const staticRoutes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1, images: [defaultOgImage.url] },
  { path: "/vereinssoftware", changeFrequency: "monthly" as const, priority: 0.95 },
  { path: "/vereinssoftware/sportverein", changeFrequency: "monthly" as const, priority: 0.88 },
  { path: "/vereinssoftware/punkteverwaltung", changeFrequency: "monthly" as const, priority: 0.88 },
  { path: "/vereinssoftware/mitgliederverwaltung", changeFrequency: "monthly" as const, priority: 0.88 },
  { path: "/funktionen", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/loesungen", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/preise", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/kontakt", changeFrequency: "monthly" as const, priority: 0.75 },
  { path: "/hilfe", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/ueber-uns", changeFrequency: "monthly" as const, priority: 0.65 },
  { path: "/presse", changeFrequency: "monthly" as const, priority: 0.55 },
  { path: "/karriere", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/newsletter", changeFrequency: "monthly" as const, priority: 0.45 },
  { path: "/changelog", changeFrequency: "monthly" as const, priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...(route.images ? { images: route.images } : {}),
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.publishedTime),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
