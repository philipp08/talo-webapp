"use client";

import { use } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ScrollReveal from "@/app/components/ScrollReveal";
import { ArrowLeft, Calendar, ChevronRight, Clock, Quote, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { absoluteUrl } from "@/app/seo";
import { posts } from "../posts";

// Post Contents
const postContents: Record<string, { content: React.ReactNode }> = {
  "talo-app-wie-wir-sie-bauen": {
    content: (
      <>
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-12 italic border-l-4 border-[#8A8A8A] pl-8 py-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-r-3xl pr-6">
          Talo ist gerade im Aufbau. Die App existiert noch nicht als fertiges Produkt – aber die Vision dahinter ist glasklar. Dieser Beitrag ist kein Launch-Announcement. Er ist ein Fenster in den Prozess. Weil wir glauben, dass die besten Produkte nicht im Verborgenen entstehen.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Die meisten Software-Projekte für Vereine entstehen so: Jemand hat ein Problem, bastelt eine Lösung, baut Features auf Features – und irgendwann hat man ein Tool, das zwar alles kann, sich aber anfühlt wie ein Formular beim Finanzamt. Wir wollten das nicht. Von Anfang an nicht.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Deshalb haben wir uns vor dem ersten Commit eine einzige Frage gestellt: <strong className="text-gray-950 dark:text-white">Wie würde diese App aussehen, wenn Apple sie für Vereine bauen würde?</strong> Klare Antwort: Sie würde sich nicht nach Software anfühlen. Sie würde sich anfühlen wie ein Werkzeug, das man gerne in die Hand nimmt.
        </p>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-20 mb-10">Woher die Idee kommt</h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Der Ausgangspunkt war eine simple Beobachtung aus dem echten Vereinsleben: Vorstände verbringen einen erschreckend großen Teil ihrer Freizeit damit, Dinge zu verwalten, die eigentlich automatisch laufen könnten. Arbeitsstunden-Nachweise per WhatsApp einsammeln. Punkte händisch in Excel-Tabellen eintragen. Am Jahresende alles nochmal zusammenrechnen, weil sich irgendwo ein Fehler eingeschlichen hat.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Das ist keine Ausnahme – das ist der Standard in den meisten deutschen Vereinen. Und das, obwohl jedes Mitglied täglich Apps benutzt, die zeigen, wie gut Software sein kann, wenn man sie wirklich durchdenkt.
        </p>

        <div className="my-20 p-12 rounded-[48px] bg-[#8A8A8A]/5 border border-[#8A8A8A]/10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
            <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-[#121212] border border-[#8A8A8A]/20 shadow-xl flex items-center justify-center text-[#8A8A8A] shrink-0">
              <Sparkles size={40} />
            </div>
            <div>
              <h4 className="text-2xl font-poppins font-black text-gray-950 dark:text-white mb-4 uppercase tracking-tight italic">Unser Designprinzip</h4>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Jede Funktion in Talo muss drei Fragen bestehen: Ist sie in drei Sekunden auffindbar? Ist sie in zwei Klicks erledigt? Und würde sich ein Mitglied ohne Einführung zurechtfinden? Wer das nicht besteht, kommt nicht rein.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Was wir bauen – und was bewusst nicht</h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Talo ist eine App zur Punktevergabe und Mitgliederverwaltung für Vereine. Klingt simpel – und das ist Absicht. Wir bauen keine All-in-One-Plattform, die auch Buchhaltung, Webseite und Newsletter kann. Wir bauen das eine Ding, das Vereine am meisten Zeit kostet, und bauen es so gut, dass es sich nach nichts anfühlt.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          <strong className="text-gray-950 dark:text-white">Für Mitglieder</strong> bedeutet das: einen Blick auf die App, und ich weiß, wo ich stehe. Mein Punktestand, meine letzten Aktivitäten, was noch aussteht. Kein Login-Chaos, kein Suchen im Menü.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          <strong className="text-gray-950 dark:text-white">Für Vorstände</strong> bedeutet das: eingereichte Nachweise in Sekunden genehmigen oder ablehnen. Exportfähige Berichte auf Knopfdruck. Nie wieder Jahresende-Stress wegen fehlender Daten.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          <strong className="text-gray-950 dark:text-white">Für den Verein als Ganzes</strong> bedeutet das: Transparenz. Jeder sieht, was geleistet wurde. Wertschätzung entsteht nicht mehr durch Zufall oder Lautstärke, sondern durch Daten.
        </p>

        <blockquote className="relative my-24 pl-12 pr-6 py-12 group">
          <Quote className="absolute -left-4 top-0 text-[#8A8A8A]/10 -z-10" size={160} />
          <p className="text-3xl md:text-4xl font-logo font-medium text-gray-950 dark:text-white leading-tight italic relative z-10">
            „Vereinsverwaltung soll sich nicht nach Verwaltung anfühlen. Sie soll sich anfühlen wie etwas, das man gerne erledigt.“
          </p>
          <footer className="mt-10 text-gray-400 font-black uppercase tracking-[0.4em] text-[11px] italic flex items-center gap-4">
            <div className="w-12 h-[1px] bg-gray-200 dark:bg-white/10" />
            PHILIPP PAULI
          </footer>
        </blockquote>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Der aktuelle Stand</h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Wir sind mitten drin. Das Designsystem steht, die Kern-Architektur ist aufgebaut, die ersten Flows sind implementiert. Wir testen intern und sammeln Feedback von einer kleinen Gruppe an Pilotvereinen. Das gibt uns etwas, das man nicht kaufen kann: echte Reaktionen von echten Menschen, die das Tool unter echten Bedingungen benutzen.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Was dabei auffällt: Die Dinge, auf die wir am stolzesten sind, werden gar nicht als Features wahrgenommen. Die schnellen Animationen. Dass sich Wege kurz anfühlen. Dass man nie „Zurück“ suchen muss. Das ist gutes Design: Es verschwindet. Genau das ist das Ziel.
        </p>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Was als nächstes kommt</h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Der Launch rückt näher. Bevor wir live gehen, werden weitere Pilotvereine eingebunden, der Genehmigungsflow wird verfeinert und die Export-Funktion für Jahresbericht und interne Auswertungen weiter geschärft. Wer jetzt Teil der Early-Access-Liste wird, bekommt zuerst Zugang und kann direkt mitprägen, wie sich das fertige Produkt anfühlt.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
          Wir bauen Talo, weil wir überzeugt sind, dass das Ehrenamt bessere Werkzeuge verdient. Nicht irgendwann. Jetzt.
        </p>
      </>
    )
  },
  "digitalisierung-im-ehrenamt-wie-talo-die-vereinsarbeit-revolutioniert": {
    content: (
      <>
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-12 italic border-l-4 border-[#8A8A8A] pl-8 py-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-r-3xl pr-6">
          Hinter jedem erfolgreichen Verein stecken Menschen, die ihre Freizeit opfern, um Gemeinschaften zu stärken. Doch allzu oft wird diese Leidenschaft von Bergen aus Papierkram, unübersichtlichen Excel-Listen und dem ständigen Kampf um Transparenz erstickt. Talo wurde entwickelt, um dieses Feuer wieder zu entfachen und dem Ehrenamt die Leichtigkeit zurückzugeben, die es verdient.
        </p>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Das Ehrenamt ist das Rückgrat vieler Gemeinschaften, doch die administrativen Anforderungen an Vorstände und Übungsleiter sind spürbar gestiegen. Wer heute einen Verein führt, kümmert sich oft gleichzeitig um Organisation, Datenschutz, Nachweise und Kommunikation. Talo setzt genau hier an: weniger Zettelwirtschaft, klarere Abläufe und eine Erfassung dort, wo Engagement tatsächlich passiert.
        </p>
        
        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-20 mb-10">Die Krise der Vereinsverwaltung: Warum wir neue Wege brauchen</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Viele Vereine klagen über Nachwuchsmangel in den Führungsetagen. Der Grund ist selten ein Mangel an Interesse am Vereinszweck, sondern die abschreckende Last der Bürokratie. Wenn die Wochenenden nur noch damit verbracht werden, Anwesenheitslisten abzugleichen oder Punkte für Arbeitseinsätze händisch in Tabellen zu übertragen, geht der eigentliche Sinn des Vereinslebens verloren. Talo automatisiert diese kritischen Prozesse. Durch die einfache Erfassung von Tätigkeiten per Web- oder App-Interface wird die Administration zum Nebenprodukt des eigentlichen Handelns, statt dessen zeitfressendes Zentrum zu sein.
        </p>

        <div className="my-20 p-12 rounded-[48px] bg-[#8A8A8A]/5 border border-[#8A8A8A]/10 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
             <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-[#121212] border border-[#8A8A8A]/20 shadow-xl flex items-center justify-center text-[#8A8A8A] shrink-0">
                <Sparkles size={40} />
             </div>
             <div>
                <h4 className="text-2xl font-poppins font-black text-gray-950 dark:text-white mb-4 uppercase tracking-tight italic">Einfachheit als höchstes Prinzip</h4>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  Wir haben Talo so gestaltet, dass jede Generation im Verein damit arbeiten kann. Unser Ziel war es, eine Oberfläche zu schaffen, die sich so natürlich anfühlt wie moderne Apps, aber genug Struktur für saubere Vereinsarbeit bietet. Keine langen Schulungen, keine komplizierten Handbücher – Talo erklärt sich von selbst.
                </p>
             </div>
          </div>
        </div>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Wertschätzung durch Sichtbarkeit: Das Talo-Punktesystem</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Eines der stärksten Instrumente von Talo ist die konsequente Sichtbarkeit von Leistungen. In vielen Vereinen wird die Arbeit der „stillen Helfer“ oft übersehen, während die „Lauten“ im Rampenlicht stehen. Mit unserem Punktesystem wird jeder Einsatz dokumentiert – vom Linienziehen auf dem Sportplatz bis zur Organisation des Sommerfests oder der Betreuung der Website. 
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Die Mitglieder sehen ihren Fortschritt gegenüber den jährlichen Anforderungen (oder Zielen) in Echtzeit. Dies schafft nicht nur eine neue Ebene der Fairness, sondern fördert auch eine Kultur der Wertschätzung. Wenn Engagement messbar wird, wird es auch greifbar – für das Mitglied, für das Team und für den Vorstand.
        </p>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Skalierbarkeit und Zukunftssicherheit</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Talo ist nicht nur für kleine Gruppen gedacht. Die Plattform ist so angelegt, dass Vereine mit wenigen Mitgliedern genauso damit arbeiten können wie größere Organisationen mit mehreren Teams. Genehmigungsworkflows, Rollen und Auswertungen helfen dabei, Routinearbeit zu reduzieren, ohne die Kontrolle aus der Hand zu geben.
        </p>

        <blockquote className="relative my-24 pl-12 pr-6 py-12 group">
           <Quote className="absolute -left-4 top-0 text-[#8A8A8A]/10 -z-10" size={160} />
           <p className="text-3xl md:text-4xl font-logo font-medium text-gray-950 dark:text-white leading-tight italic relative z-10">
              „Talo nimmt Verwaltung nicht wichtiger, als sie ist. Es macht sie nur so klar, dass wieder mehr Raum für Gemeinschaft entsteht.“
           </p>
           <footer className="mt-10 text-gray-400 font-black uppercase tracking-[0.4em] text-[11px] italic flex items-center gap-4">
              <div className="w-12 h-[1px] bg-gray-200 dark:bg-white/10" />
              PHILIPP PAULI
           </footer>
        </blockquote>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Datenschutz als Fundament, nicht als Hindernis</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          In Zeiten strenger Datenschutzanforderungen ist Datensicherheit kein optionales Extra. Talo setzt auf klare Rollen, geschützte Zugänge und eine Datenhaltung innerhalb der Europäischen Union. So behalten Vorstände sensible Mitgliederdaten geordnet im Blick und können nachvollziehen, wer welche Informationen sehen und bearbeiten darf.
        </p>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-20 mb-8">Startet in die digitale Ära</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
          Digitalisierung ist kein Selbstzweck. Sie ist ein Werkzeug, um menschliches Engagement zu ermöglichen. Talo soll Vereinen helfen, Verwaltung moderner zu organisieren und Energie für das zu behalten, was wirklich zählt: Gemeinschaft, Verantwortung und die Freude am gemeinsamen Erreichen von Zielen.
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Talo",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.ico"),
      },
    },
    datePublished: post.publishedTime,
    dateModified: post.publishedTime,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  const relatedPosts = posts.filter((related) => related.slug !== post.slug).slice(0, 3);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />

      <section className="relative overflow-hidden px-6 pt-36 pb-16 lg:pt-52 lg:pb-24">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.08),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_65%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors mb-12"
            >
              <ArrowLeft size={14} />
              Journal
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-9 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
              <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white">
                {post.category}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={13} />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={13} />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-[3rem] md:text-[5.5rem] lg:text-[7rem] font-logo font-medium tracking-tight text-gray-950 dark:text-white leading-[0.96] max-w-5xl">
              {post.title}
            </h1>

            <div className="mt-10 grid lg:grid-cols-[1fr_280px] gap-10 lg:gap-16 items-end">
              <p className="text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] max-w-3xl leading-relaxed">
                {post.subHeadline}
              </p>
              <div className="rounded-[28px] border border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                    <User size={16} className="text-gray-500 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Autor</p>
                    <p className="text-sm font-bold text-gray-950 dark:text-white">{post.presentedBy}</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 pb-28 lg:pb-44">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[220px_minmax(0,740px)_1fr] gap-10 lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
              <div className="h-px w-16 bg-gray-200 dark:bg-white/10" />
              <p>{post.category}</p>
              <p>{post.readTime}</p>
            </div>
          </aside>

          <ScrollReveal direction="up" delay={0.2} className="min-w-0">
            <article className="article-body max-w-none">
              {content.content}
            </article>
          </ScrollReveal>

          <aside className="hidden xl:block">
            <div className="sticky top-28 rounded-[28px] border border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.03] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 mb-4">Kurz gesagt</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02] py-20">
        <div className="max-w-7xl mx-auto px-6">
           <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                 <h3 className="text-3xl md:text-4xl font-logo font-medium text-gray-950 dark:text-white mb-4 leading-tight">Weitere Talo-Notizen erhalten.</h3>
                 <p className="text-lg text-gray-500 dark:text-[#8A8A8A] leading-relaxed">
                    Updates, Produktgedanken und konkrete Ideen für bessere Vereinsarbeit.
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

      {relatedPosts.length > 0 && (
        <section className="py-24 lg:py-40 px-6">
          <div className="max-w-7xl mx-auto">
             <div className="flex items-end justify-between gap-6 mb-12">
               <h2 className="text-3xl md:text-5xl font-logo font-medium text-gray-950 dark:text-white">Weiterlesen</h2>
               <Link href="/blog" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-950 dark:hover:text-white transition-colors">
                 Alle Artikel <ChevronRight size={16} />
               </Link>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <Link key={related.slug} href={`/blog/${related.slug}`} className="group flex flex-col p-8 rounded-[28px] border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">{related.category}</span>
                    <h3 className="text-xl md:text-2xl font-logo font-medium text-gray-950 dark:text-white mb-4 leading-snug group-hover:underline">{related.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] line-clamp-3 mb-8">{related.excerpt}</p>
                    <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                       <span>{related.readTime}</span>
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
