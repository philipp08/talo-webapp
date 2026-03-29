"use client";

import { use } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ScrollReveal from "@/app/components/ScrollReveal";
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { posts } from "../page";

// Post Contents
const postContents: Record<string, { content: React.ReactNode, subHeadline: string }> = {
  "introducing-veto-security-for-associations": {
    subHeadline: "Agent security is the bottleneck to scale your AI workforce.",
    content: (
      <>
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-8 italic">
          \"We're excited to introduce Veto today to the Ona platform in early access, our kernel-level enforcement engine.\"
        </p>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Sicherheit im Vereinswesen war noch nie so wichtig wie heute. Mit der Einführung von Veto setzen wir neue Maßstäbe für den Schutz von sensiblen Mitgliederdaten in der Ära der Künstlichen Intelligenz.
        </p>
        
        <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mt-12 mb-6">Defense-in-depth</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Over the last six months, we grew daily agent interactions 24x inside the networks of Fortune 500 banks, insurers, and pharma companies. We think about security as defense in depth across the full stack we own. Each successive layer is harder to build, and is more effective than the last.
        </p>
        
        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 my-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-6xl">01</div>
           <h4 className="font-bold text-xl mb-4">Warum das für Vereine wichtig ist:</h4>
           <ul className="space-y-4 text-lg text-gray-600 dark:text-[#8A8A8A]">
              <li className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                 <span><strong>Isolierung:</strong> KI-Agenten haben keinen Zugriff auf Daten außerhalb ihres zugewiesenen Bereichs.</span>
              </li>
              <li className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 shrink-0" />
                 <span><strong>Audit-Trails:</strong> Jede Aktion eines Agenten wird unveränderlich protokolliert.</span>
              </li>
              <li className="flex gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] mt-2.5 shrink-0" />
                 <span><strong>Berechtigungen:</strong> Ihr kontrolliert, welche Tools und Netzwerke ein Agent nutzen darf.</span>
              </li>
           </ul>
        </div>

        <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mt-12 mb-6">Kernel-level enforcement</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
           Wir wissen, dass viele Vereinsvorstände skeptisch gegenüber Cloud-Lösungen sind. Veto wurde entwickelt, um dieses Misstrauen durch beweisbare Sicherheit zu entkräften. Durch die Integration von feingliedrigen Policies und einer strikten Trennung der Umgebungen garantieren wir, dass Talo die sicherste Plattform für moderne Vereinsarbeit bleibt.
        </p>
      </>
    )
  },
  "the-future-of-volunteer-management": {
    subHeadline: "From administration to creation: How autonomy changes the game.",
    content: (
      <>
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-8 italic">
          \"Die Art und Weise, wie wir uns engagieren, verändert sich. Klassische Vereinsverwaltung stößt an ihre Grenzen.\"
        </p>
        <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mt-12 mb-6">Vom Verwalten zum Gestalten</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
           In den letzten Jahrzehnten bestand die Arbeit im Vorstand oft zu 80% aus Administration und nur zu 20% aus eigentlicher Vereinsgestaltung. Excel-Listen, Zettelwirtschaft und endlose E-Mail-Ketten haben das Ehrenamt belastet. Doch die Vision von Talo ist es, dieses Verhältnis umzukehren.
        </p>
        <blockquote className="border-l-4 border-blue-500 pl-8 my-12 text-2xl font-serif text-gray-900 dark:text-white italic leading-relaxed">
           \"Künstliche Intelligenz im Verein bedeutet nicht, den Menschen zu ersetzen, sondern ihm den Rücken für das Wesentliche freizuhalten.\"
        </blockquote>
        <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mt-12 mb-6">Menschliche Zentrierung</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
           Am Ende geht es im Verein immer um Menschen. Digitalisierung darf nie Selbstzweck sein. Bei Talo steht das Mitglied im Mittelpunkt. Durch einfache mobile Interfaces und transparente Wertschätzung schaffen wir eine Umgebung, in der sich jeder gesehen fühlt.
        </p>
      </>
    )
  },
  "why-digitalization-matters-for-local-clubs": {
    subHeadline: "Three steps to success for small clubs in the digital age.",
    content: (
      <>
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-8 italic">
          \"Kleine Vereine stehen oft vor der größten Hürde bei der Digitalisierung. Dabei ist sie gerade für sie der Schlüssel zum Überleben.\"
        </p>
        <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mt-12 mb-6">Drei Schritte zum Erfolg</h2>
        <div className="grid gap-12 my-12">
          {[
            { n: 1, title: "Tools konsolidieren", desc: "Statt fünf verschiedener WhatsApp-Gruppen und einer alten Dropbox, nutzt eine zentrale Plattform wie Talo." },
            { n: 2, title: "Wertschätzung sichtbar machen", desc: "Nutzt Punkte-Systeme, um auch das stille Engagement im Hintergrund zu honorieren." },
            { n: 3, title: "Offen kommunizieren", desc: "Nehmt die Mitglieder mit auf die Reise. Erklärt den Mehrwert, statt nur neue Regeln einzuführen." }
          ].map(step => (
            <div key={step.n} className="flex gap-6 items-start">
              <span className="text-4xl font-serif text-gray-200 dark:text-white/10 leading-none">{step.n.toString().padStart(2, '0')}</span>
              <div>
                 <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                 <p className="text-lg text-gray-600 dark:text-[#8A8A8A]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
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

      {/* Hero Header (Ona Style) */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-16 lg:pt-48 lg:pb-24 max-w-5xl mx-auto text-center">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm font-medium text-gray-500 dark:text-[#8A8A8A]">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <User size={14} />
               </div>
               <span className="font-bold text-gray-900 dark:text-white">{post.author}</span>
            </div>
            <span className="opacity-30">/</span>
            <span>{post.date}</span>
            <div className="flex gap-2 ml-2">
               <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-black uppercase tracking-widest">
                  {post.category}
               </span>
               <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-black uppercase tracking-widest">
                  Product
               </span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-gray-950 dark:text-white leading-[1] mb-6 max-w-4xl mx-auto">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-500 dark:text-[#8A8A8A] max-w-2xl mx-auto leading-relaxed">
            {content.subHeadline}
          </p>
        </ScrollReveal>
      </section>

      {/* Featured Image */}
      <section className="max-w-5xl mx-auto px-6 mb-24 lg:mb-32">
        <ScrollReveal direction="up" delay={0.2}>
           <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
           </div>
        </ScrollReveal>
      </section>

      {/* Article Content */}
      <section className="pb-32 lg:pb-48">
        <div className="max-w-3xl mx-auto px-6 lg:px-0">
           <ScrollReveal direction="up" delay={0.3}>
              <div className="prose prose-xl prose-gray dark:prose-invert max-w-none">
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
                 <h3 className="text-3xl font-serif font-medium mb-4">Bleiben Sie up-to-date.</h3>
                 <p className="text-lg text-gray-500 dark:text-[#8A8A8A]">
                    Treten Sie hunderten von Vorständen bei, die monatlich Einblicke in die Modernisierung des Ehrenamts erhalten.
                 </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-3">
                 <input 
                    type="email" 
                    placeholder="E-Mail Adresse" 
                    className="flex-1 px-6 py-4 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                 />
                 <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity">
                    Abonnieren
                 </button>
              </form>
           </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-24 lg:py-48 px-6">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-2xl font-serif font-medium mb-12 text-center">Ähnliche Artikel</h2>
           <div className="grid md:grid-cols-3 gap-6">
              {posts.filter(p => p.slug !== post.slug).slice(0, 3).map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group flex flex-col p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#121212] hover:shadow-xl transition-all">
                  <h3 className="text-lg font-bold mb-3 leading-snug group-hover:underline">{related.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-[#8A8A8A] line-clamp-2 mb-6">{related.excerpt}</p>
                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                     <span>{related.author}</span>
                     <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

