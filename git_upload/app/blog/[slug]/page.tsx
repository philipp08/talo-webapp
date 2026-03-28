"use client";

import { use } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ScrollReveal from "../../components/ScrollReveal";
import { ArrowLeft, Clock, Calendar, User, Share2 } from "lucide-react";
import Link from "next/link";
import { posts } from "../page";

// Post Contents (Mock for now, but with real high-quality text)
const postContents: Record<string, { content: React.ReactNode }> = {
  "introducing-veto-security-for-associations": {
    content: (
      <>
        <p className="text-xl text-gray-600 dark:text-[#8A8A8A] leading-relaxed mb-8 font-medium">
          Sicherheit im Vereinswesen war noch nie so wichtig wie heute. Mit der Einführung von Veto setzen wir neue Maßstäbe für den Schutz von sensiblen Mitgliederdaten in der Ära der Künstlichen Intelligenz.
        </p>
        
        <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mt-12 mb-6">Was ist Veto?</h2>
        <p className="mb-6">
          Veto ist nicht einfach nur ein Sicherheits-Update; es ist ein grundlegendes Framework, das im Herzen von Talo operiert. Es fungiert als Kernel-Level Enforcement Engine für unsere KI-Agenten. Wenn ein Agent eine Aufgabe für euren Verein ausführt – sei es die Analyse von Beitragsdaten oder die Automatisierung von Mitgliederlisten – stellt Veto sicher, dass dieser Prozess in einer sogenannten "Isolated Area" stattfindet.
        </p>
        
        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 my-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Share2 className="w-12 h-12" />
           </div>
           <h4 className="font-bold mb-4">Warum das für Vereine wichtig ist:</h4>
           <ul className="space-y-3 text-sm text-gray-600 dark:text-[#8A8A8A]">
              <li className="flex gap-2"><span>•</span> <span><strong>Isolierung:</strong> KI-Agenten haben keinen Zugriff auf Daten außerhalb ihres zugewiesenen Bereichs.</span></li>
              <li className="flex gap-2"><span>•</span> <span><strong>Audit-Trails:</strong> Jede Aktion eines Agenten wird unveränderlich protokolliert.</span></li>
              <li className="flex gap-2"><span>•</span> <span><strong>Berechtigungen:</strong> Ihr kontrolliert, welche Tools und Netzwerke ein Agent nutzen darf.</span></li>
           </ul>
        </div>

        <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mt-12 mb-6">Vertrauen durch Transparenz</h2>
        <p className="mb-6">
          Wir wissen, dass viele Vereinsvorstände skeptisch gegenüber Cloud-Lösungen sind. Veto wurde entwickelt, um dieses Misstrauen durch beweisbare Sicherheit zu entkräften. Durch die Integration von feingliedrigen Policies und einer strikten Trennung der Umgebungen garantieren wir, dass Talo die sicherste Plattform für moderne Vereinsarbeit bleibt.
        </p>
        <p>
          Veto ist ab sofort für alle Talo-Kunden im Pro-Plan verfügbar und wird kontinuierlich erweitert, um den neuesten Sicherheitsstandards gerecht zu werden.
        </p>
      </>
    )
  },
  "the-future-of-volunteer-management": {
    content: (
      <>
        <p className="text-xl text-gray-600 dark:text-[#8A8A8A] leading-relaxed mb-8 font-medium">
           Die Art und Weise, wie wir uns engagieren, verändert sich. Klassische Vereinsverwaltung stößt an ihre Grenzen. Wir werfen einen Blick in die Zukunft.
        </p>
        <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mt-12 mb-6">Vom Verwalten zum Gestalten</h2>
        <p className="mb-6">
           In den letzten Jahrzehnten bestand die Arbeit im Vorstand oft zu 80% aus Administration und nur zu 20% aus eigentlicher Vereinsgestaltung. Excel-Listen, Zettelwirtschaft und endlose E-Mail-Ketten haben das Ehrenamt belastet. Doch die Vision von Talo ist es, dieses Verhältnis umzukehren.
        </p>
        <p className="mb-6">
           Durch den Einsatz von autonomen Agenten kann Talo Routineaufgaben übernehmen, die früher Stunden gedauert haben. Stellt euch vor, der Kassenbericht erstellt sich fast von selbst, und die Punkteabrechnung für eure Trainer ist mit einem Klick erledigt. Das ist kein Traum mehr, sondern die Realität, an der wir arbeiten.
        </p>
        <blockquote className="border-l-4 border-[#34C759] pl-6 py-2 my-10 italic text-xl text-gray-700 dark:text-gray-300">
           "Künstliche Intelligenz im Verein bedeutet nicht, den Menschen zu ersetzen, sondern ihm den Rücken für das Wesentliche freizuhalten."
        </blockquote>
        <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mt-12 mb-6">Menschliche Zentrierung</h2>
        <p>
           Am Ende geht es im Verein immer um Menschen. Digitalisierung darf nie Selbstzweck sein. Bei Talo steht das Mitglied im Mittelpunkt. Durch einfache mobile Interfaces und transparente Wertschätzung (Punkte-System) schaffen wir eine Umgebung, in der sich jeder gesehen fühlt. Die Zukunft des Ehrenamts ist digital, aber sie bleibt zutiefst menschlich.
        </p>
      </>
    )
  },
  "why-digitalization-matters-for-local-clubs": {
    content: (
      <>
        <p className="text-xl text-gray-600 dark:text-[#8A8A8A] leading-relaxed mb-8 font-medium">
           Kleine Vereine stehen oft vor der größten Hürde bei der Digitalisierung. Dabei ist sie gerade für sie der Schlüssel zum Überleben.
        </p>
        <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mt-12 mb-6">Die Barrieren überwinden</h2>
        <p className="mb-6">
           "Das haben wir schon immer so gemacht." – Diesen Satz hört man oft. Doch die Welt um uns herum verändert sich. Jüngere Generationen erwarten digitale Erreichbarkeit und einfache Prozesse. Ein Verein, der heute noch auf Papier setzt, wird es schwer haben, morgen noch Nachwuchs für den Vorstand zu finden.
        </p>
        <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mt-12 mb-6">Drei Schritte zum Erfolg</h2>
        <ol className="space-y-6 my-10">
          <li className="flex gap-4">
             <span className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold flex-shrink-0">1</span>
             <div>
                <h4 className="font-bold mb-1">Tools konsolidieren</h4>
                <p className="text-sm text-gray-500">Statt fünf verschiedener WhatsApp-Gruppen und einer alten Dropbox, nutzt eine zentrale Plattform wie Talo.</p>
             </div>
          </li>
          <li className="flex gap-4">
             <span className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold flex-shrink-0">2</span>
             <div>
                <h4 className="font-bold mb-1">Wertschätzung sichtbar machen</h4>
                <p className="text-sm text-gray-500">Nutzt Punkte-Systeme, um auch das stille Engagement im Hintergrund (z.B. Aufräumen nach dem Fest) zu honorieren.</p>
             </div>
          </li>
          <li className="flex gap-4">
             <span className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold flex-shrink-0">3</span>
             <div>
                <h4 className="font-bold mb-1">Offen kommunizieren</h4>
                <p className="text-sm text-gray-500">Nehmt die Mitglieder mit auf die Reise. Erklärt den Mehrwert, statt nur neue Regeln einzuführen.</p>
             </div>
          </li>
        </ol>
        <p>
           Digitalisierung ist kein Projekt, sondern ein Prozess. Startet klein, aber startet jetzt.
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
          <Link href="/blog" className="text-[#34C759] font-bold">Zurück zum Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-[180px] pb-16 lg:pb-24 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest mb-12">
              <ArrowLeft className="w-4 h-4" /> Zurück zum Blog
            </Link>
            
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#34C759]">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Calendar className="w-3.5 h-3.5" /> {post.date}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Clock className="w-3.5 h-3.5" /> {post.readTime} Lesezeit
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-logo font-medium tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-8">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 py-8 border-y border-gray-100 dark:border-white/5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5">
                <User className="w-full h-full p-2 text-gray-400" />
              </div>
              <div>
                 <p className="text-sm font-bold text-gray-900 dark:text-white">{post.author}</p>
                 <p className="text-xs text-gray-500">Talo Editorial Team</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Image */}
      <section className="max-w-7xl mx-auto px-6 mb-20 lg:mb-32">
        <ScrollReveal direction="up" delay={0.25} duration={1}>
           <div className="w-full aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
           </div>
        </ScrollReveal>
      </section>

      {/* Article Content */}
      <section className="pb-32 lg:pb-60">
        <div className="max-w-3xl mx-auto px-6">
           <ScrollReveal direction="up" delay={0.3}>
              <div className="prose prose-lg dark:prose-invert prose-p:text-gray-600 prose-p:dark:text-[#8A8A8A] prose-p:leading-relaxed prose-headings:font-logo prose-headings:font-medium prose-headings:tracking-tight max-w-none">
                 {content.content}
              </div>
           </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
