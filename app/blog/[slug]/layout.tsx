import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPostBySlug } from "@/app/blog/posts";
import { absoluteUrl, createPageMetadata, siteName } from "@/app/seo";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

type MetadataProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return createPageMetadata({
      title: "Artikel nicht gefunden",
      description: "Dieser Talo-Artikel konnte nicht gefunden werden.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    ...createPageMetadata({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      keywords: post.keywords,
    }),
    title: {
      absolute: `${post.title} | ${siteName}`,
    },
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName,
      locale: "de_DE",
      type: "article",
      publishedTime: post.publishedTime,
      authors: [post.author],
      tags: post.keywords,
    },
  };
}

export default function BlogArticleLayout({ children }: Props) {
  return children;
}
