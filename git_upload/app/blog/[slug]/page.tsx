"use client";

import { use } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ScrollReveal from "@/app/components/ScrollReveal";
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, ChevronRight, Quote } from "lucide-react";
import Link from "next/link";
import { posts } from "../page";

// Post Contents
const postContents: Record<string, { content: React.ReactNode, subHeadline: string }> = {
  "die-zukunft-des-ehrenamts-digitalisierung-mit-talo": {
    subHeadline: "Warum klassische Vereinssoftware ausgedient hat und wie Talo Vorstände durch Transparenz entlastet.",
    content: (
      <>
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-10 italic border-l-2 border-gray-200 dark:border-white/10 pl-6 py-2">
          Die größte Hürde im Ehrenamt ist heute nicht mehr der Mangel an Visionen, sondern die schiere Last der Administration und das Gefühl mangelnder Wertschätzung. Talo bricht diesen Teufelskreis durch ein System, das Engagement sichtbar und Verwaltung einfach macht.
        </p>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Stellen Sie sich vor, Sie müssten keine Excel-Listen mehr führen, keine Punkte händisch zusammenzählen und keine Mitgliederlisten mehr mühsam abgleichen. Das ist der Kern der Talo-Plattform: Wir digitalisieren die Prozesse, die bisher Zeit und Nerven gekostet haben, damit Sie sich wieder auf das Wesentliche konzentrieren können – Ihre Gemeinschaft.
        </p>
        
        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Sichtbarkeit schafft Wertschätzung</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Engagement im Verein findet oft im Stillen statt. Mit Talo machen wir diesen Einsatz sichtbar. Unser automatisiertes Punktesystem dokumentiert jede Helferstunde, jede Trainingseinheit und jedes organisierte Event. Mitglieder sehen ihren Beitrag in Echtzeit auf Leaderboards, was nicht nur motiviert, sondern auch eine neue Kultur der Anerkennung schafft.
        </p>

        <div className="grid md:grid-cols-2 gap-8 my-16">
          <div className="p-8 rounded-[32px] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 shadow-sm group hover:border-[#34C759]/30 transition-all">
            <Sparkles className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="text-xl font-bold mb-3">Faire Punktevergabe</h4>
            <p className="text-gray-600 dark:text-gray-400">Ein klares Regelwerk sorgt dafür, dass jeder Einsatz nach den gleichen Kriterien gewürdigt wird.</p>
          </div>
          <div className="p-8 rounded-[32px] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 shadow-sm group hover:border-[#34C759]/30 transition-all">
            <Clock className="text-[#34C759] mb-4 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="text-xl font-bold mb-3">Maximale Zeitersparnis</h4>
            <p className="text-gray-600 dark:text-gray-400">Automatisierte Prozesse übernehmen die repetitiven Aufgaben des Vorstands – effizient und fehlerfrei.</p>
          </div>
        </div>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Intelligente Genehmigungsworkflows</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
           Genehmigungen sind oft der Flaschenhals in der Vereinsarbeit. Talo löst dieses Problem durch einen optimierten Workflow. Trainer oder Helfer tragen ihre Leistungen ein, und der Administrator erhält eine übersichtliche Liste zur Prüfung. Mit nur einem Wisch können hunderte Einträge pro Woche orchestriert werden. Das System prüft dabei im Hintergrund auf Plausibilität, sodass Fehler minimiert werden.
        </p>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Berichte auf Knopfdruck</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
           Ob für die Mitgliederversammlung, den Vorstand oder das Finanzamt – Talo generiert präzise Berichte in Sekundenschnelle. Dank der Cloud-basierten Speicherung sind alle Daten jederzeit abrufbar, revisionssicher dokumentiert und DSGVO-konform auf EU-Servern gesichert.
        </p>

        <blockquote className="relative my-20 pl-12 pr-6 py-6 group">
           <Quote className="absolute -left-2 top-0 text-gray-200 dark:text-white/5 -z-10" size={80} />
           <p className="text-2xl font-logo font-medium text-gray-950 dark:text-white leading-snug italic">
              "Talo ist das Betriebssystem für das moderne Ehrenamt. Es sorgt dafür, dass Ehrenamt wieder Spaß macht, weil die Last der Zettelwirtschaft endlich wegfällt."
           </p>
           <footer className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">
              — Ihr Talo Development Team
           </footer>
        </blockquote>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Bereit für den Wandel?</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
           Digitalisierung im Verein ist keine Frage der Technik, sondern der Einstellung. Talo bietet Ihnen die Werkzeuge, um Ihren Verein zukunftssicher aufzustellen. Starten Sie jetzt in die neue Ära der Vereinsverwaltung und schenken Sie sich und Ihrem Team mehr Zeit für das, was wirklich zählt.
        </p>
      </>
    )
  }
};

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const post = posts.find((p) => p.slug === resolvedParams.slug);
  const content = postContents[resolvedParams.slug];

  if (!post || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post nicht gefunden.</h1>
          <Link href="/blog" className="text-blue-500 font-bold">Zurück zum Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero Header */}
      <section className="flex flex-col items-center justify-center px-6 pt-40 pb-16 lg:pt-56 lg:pb-24 max-w-5xl mx-auto text-center">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs font-bold uppercase tracking-widest text-gray-400">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <User size={12} className="text-gray-600 dark:text-gray-400" />
               </div>
               <span className="text-gray-900 dark:text-white">{post.author}</span>
            </div>
            <span className="opacity-30">/</span>
            <span>{post.date}</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[10px] text-gray-950 dark:text-white ml-2">
               {post.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-logo font-bold tracking-tight text-gray-950 dark:text-white leading-[1] mb-10 max-w-4xl mx-auto">
            {post.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] max-w-2xl mx-auto leading-relaxed font-logo">
            {content.subHeadline}
          </p>
        </ScrollReveal>
      </section>

      {/* Article Content */}
      <section className="pb-32 lg:pb-48">
        <div className="max-w-3xl mx-auto px-6">
           <ScrollReveal direction="up" delay={0.3}>
              <div className="prose prose-xl prose-slate dark:prose-invert max-w-none prose-headings:font-logo prose-blockquote:border-none prose-blockquote:p-0">
                 {content.content}
              </div>
           </ScrollReveal>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] py-24">
        <div className="max-w-7xl mx-auto px-6">
           <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h3 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mb-4 leading-tight">Bleiben Sie auf dem Laufenden.</h3>
                 <p className="text-lg text-gray-500 dark:text-[#8A8A8A] leading-relaxed">
                    Schließen Sie sich hunderten von Vorständen an, die monatlich exklusive Einblicke in Talo erhalten.
                 </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-3">
                 <input 
                    type="email" 
                    placeholder="E-Mail Adresse" 
                    className="flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                 />
                 <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all">
                    Abonnieren
                 </button>
              </form>
           </div>
        </div>
      </section>

      {/* Related Posts */}
      {posts.filter(p => p.slug !== post.slug).length > 0 && (
        <section className="py-24 lg:py-48 px-6 border-t border-gray-100 dark:border-white/5">
          <div className="max-w-7xl mx-auto">
             <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mb-16 text-center">Weitere Storys</h2>
             <div className="grid md:grid-cols-3 gap-8">
                {posts.filter(p => p.slug !== post.slug).slice(0, 3).map((related) => (
                  <Link key={related.slug} href={`/blog/${related.slug}`} className="group flex flex-col p-8 rounded-[38px] border border-gray-100 dark:border-white/5 bg-white dark:bg-[#121212] hover:shadow-2xl hover:scale-[1.02] transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">{related.category}</span>
                    <h3 className="text-xl font-logo font-bold text-gray-950 dark:text-white mb-4 leading-snug group-hover:underline">{related.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] line-clamp-3 mb-8">{related.excerpt}</p>
                    <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                       <span>{related.author}</span>
                       <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

