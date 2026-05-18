import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { absoluteUrl, siteName } from "@/app/seo";

export type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta?: string;
  sections: Array<{
    title: string;
    text: string;
    points: string[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  related: Array<{
    title: string;
    href: string;
    text: string;
  }>;
  slug: string;
  serviceName: string;
};

export default function SeoLandingPage({
  eyebrow,
  title,
  intro,
  primaryCta = "Kostenlos starten",
  sections,
  faq,
  related,
  slug,
  serviceName,
}: SeoLandingPageProps) {
  const url = absoluteUrl(slug);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Startseite",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Vereinssoftware",
          item: absoluteUrl("/vereinssoftware"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: serviceName,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: serviceName,
      provider: {
        "@type": "Organization",
        name: siteName,
        url: absoluteUrl("/"),
      },
      areaServed: "DE",
      serviceType: "Vereinssoftware",
      url,
      description: intro,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-950 dark:bg-[#080808] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="relative overflow-hidden pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_62%)] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
            {eyebrow}
          </p>
          <h1 className="font-logo text-[2.7rem] font-medium leading-[1.02] tracking-tight text-gray-950 dark:text-white md:text-[5.4rem]">
            {title}
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-600 dark:text-[#9a9a9a] md:text-xl">
            {intro}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/anmelden"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-7 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black sm:w-auto"
            >
              {primaryCta}
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 px-7 py-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5 sm:w-auto"
            >
              Demo anfragen
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-[#f7f7f7] py-16 dark:border-white/5 dark:bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 md:grid-cols-3">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-gray-100 bg-white p-7 dark:border-white/5 dark:bg-[#111]"
            >
              <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-[#9a9a9a]">
                {section.text}
              </p>
              <ul className="mt-6 space-y-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
              Häufige Fragen
            </p>
            <h2 className="mt-5 font-logo text-3xl font-medium tracking-tight text-gray-950 dark:text-white md:text-5xl">
              Antworten, bevor ihr testet.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-gray-600 dark:text-[#9a9a9a]">
              Diese Inhalte sind bewusst konkret gehalten, damit Vorstände schnell prüfen können, ob Talo zum eigenen Ablauf passt.
            </p>
          </div>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white dark:divide-white/5 dark:border-white/5 dark:bg-[#111]">
            {faq.map((item) => (
              <article key={item.question} className="p-7">
                <h3 className="text-base font-semibold text-gray-950 dark:text-white">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-[#9a9a9a]">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-[#f7f7f7] py-16 dark:border-white/5 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                Weiter lesen
              </p>
              <h2 className="mt-4 font-logo text-3xl font-medium tracking-tight text-gray-950 dark:text-white">
                Passende SEO-Themen
              </h2>
            </div>
            <Link href="/funktionen" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white">
              Alle Funktionen ansehen
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-gray-100 bg-white p-6 transition-transform hover:-translate-y-0.5 dark:border-white/5 dark:bg-[#111]"
              >
                <h3 className="text-base font-semibold text-gray-950 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-[#9a9a9a]">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
