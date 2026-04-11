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
  "talo-app-wie-wir-sie-bauen": {
    subHeadline: "Kein Pitch, kein Marketing-Sprech. Nur ein ehrlicher Blick auf das, was wir gerade bauen, warum wir es so bauen – und was uns dabei antreibt.",
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8A8A8A]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
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
            "Vereinsverwaltung soll sich nicht nach Verwaltung anfühlen. Es soll sich anfühlen wie etwas, das man gerne macht."
          </p>
          <footer className="mt-10 text-gray-400 font-black uppercase tracking-[0.4em] text-[11px] italic flex items-center gap-4">
            <div className="w-12 h-[1px] bg-gray-200 dark:bg-white/10" />
            TALO DEVELOPMENT TEAM
          </footer>
        </blockquote>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Der aktuelle Stand</h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Wir sind mitten drin. Das Designsystem steht, die Kern-Architektur ist aufgebaut, die ersten Flows sind implementiert. Wir testen intern und sammeln Feedback von einer kleinen Gruppe an Pilotvereinen. Das gibt uns etwas, das man nicht kaufen kann: echte Reaktionen von echten Menschen, die das Tool unter echten Bedingungen benutzen.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Was dabei auffällt: Die Dinge, auf die wir am stolzesten sind, werden gar nicht als Features wahrgenommen. Die schnellen Animationen. Dass der Dark Mode automatisch greift. Dass man nie „Zurück" suchen muss. Das ist gutes Design – es verschwindet. Und genau das war das Ziel.
        </p>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Was als nächstes kommt</h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Der Launch rückt näher. Bevor wir live gehen, werden noch weitere Pilotvereine ongeboardet, der Genehmigungsflow wird verfeinert und die Export-Funktion für Steuer und Jahresbericht kommt als letztes großes Feature dazu. Wer jetzt Teil der Early-Access-Liste wird, bekommt als erstes Zugang – und hat direkten Einfluss darauf, wie das fertige Produkt aussieht.
        </p>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
          Wir bauen Talo, weil wir überzeugt sind, dass das Ehrenamt bessere Werkzeuge verdient. Nicht irgendwann. Jetzt.
        </p>
      </>
    )
  },
  "digitalisierung-im-ehrenamt-wie-talo-die-vereinsarbeit-revolutioniert": {
    subHeadline: "Tradition trifft Moderne: Warum digitale Werkzeuge heute über die Zukunft von Vereinen entscheiden und wie Talo dabei den Menschen in den Mittelpunkt stellt.",
    content: (
      <>
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-12 italic border-l-4 border-[#8A8A8A] pl-8 py-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-r-3xl pr-6">
          Hinter jedem erfolgreichen Verein stecken Menschen, die ihre Freizeit opfern, um Gemeinschaften zu stärken. Doch allzu oft wird diese Leidenschaft von Bergen aus Papierkram, unübersichtlichen Excel-Listen und dem ständigen Kampf um Transparenz erstickt. Talo wurde entwickelt, um dieses Feuer wieder zu entfachen und dem Ehrenamt die Leichtigkeit zurückzugeben, die es verdient.
        </p>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Das Ehrenamt ist das Rückgrat unserer Gesellschaft, doch die administrativen Anforderungen an Vorstände und Übungsleiter sind in den letzten Jahren massiv gestiegen. Wer heute einen Verein führt, muss sich nicht nur mit der sportlichen oder sozialen Ausrichtung beschäftigen, sondern ist oft gleichzeitig Buchhalter, Datenschützer und IT-Administrator. Diese wachsende Komplexität führt immer häufiger zu einem "administrativen Burnout" in den Führungsetagen. Talo setzt genau hier an: Wir machen Schluss mit der Zettelwirtschaft und bringen die Vereinsverwaltung dorthin, wo das Engagement stattfindet – direkt aufs Smartphone, nahtlos orchestriert in der Cloud.
        </p>
        
        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-20 mb-10">Die Krise der Vereinsverwaltung: Warum wir neue Wege brauchen</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Viele Vereine klagen über Nachwuchsmangel in den Führungsetagen. Der Grund ist selten ein Mangel an Interesse am Vereinszweck, sondern die abschreckende Last der Bürokratie. Wenn die Wochenenden nur noch damit verbracht werden, Anwesenheitslisten abzugleichen oder Punkte für Arbeitseinsätze händisch in Tabellen zu übertragen, geht der eigentliche Sinn des Vereinslebens verloren. Talo automatisiert diese kritischen Prozesse. Durch die einfache Erfassung von Tätigkeiten per Web- oder App-Interface wird die Administration zum Nebenprodukt des eigentlichen Handelns, statt dessen zeitfressendes Zentrum zu sein.
        </p>

        <div className="my-20 p-12 rounded-[48px] bg-[#8A8A8A]/5 border border-[#8A8A8A]/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8A8A8A]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
             <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-[#121212] border border-[#8A8A8A]/20 shadow-xl flex items-center justify-center text-[#8A8A8A] shrink-0">
                <Sparkles size={40} />
             </div>
             <div>
                <h4 className="text-2xl font-poppins font-black text-gray-950 dark:text-white mb-4 uppercase tracking-tight italic">Einfachheit als höchstes Prinzip</h4>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  Wir haben Talo so gestaltet, dass jede Generation im Verein damit arbeiten kann. Unser Ziel war es, eine Nutzeroberfläche zu schaffen, die sich so natürlich anfühlt wie moderne Social-Media-Apps, aber die Präzision einer Enterprise-Software bietet. Keine langen Schulungen, keine komplizierten Handbücher – Talo erklärt sich von selbst.
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
          Talo ist nicht nur für den kleinen Ortsverein gedacht, sondern skaliert mit Ihren Ambitionen. Ob Sie 50 oder 5.000 Mitglieder verwalten – unsere Architektur ist auf Hochleistung ausgelegt. Wir integrieren intelligente Genehmigungsworkflows, die Plausibilitätsprüfungen im Hintergrund durchführen und Administratoren nur dann benachrichtigen, wenn wirklich eine manuelle Prüfung erforderlich ist. So sparen wir Ihnen bis zu 90% der Zeit bei der wöchentlichen Punktevergabe.
        </p>

        <blockquote className="relative my-24 pl-12 pr-6 py-12 group">
           <Quote className="absolute -left-4 top-0 text-[#8A8A8A]/10 -z-10" size={160} />
           <p className="text-3xl md:text-4xl font-logo font-medium text-gray-950 dark:text-white leading-tight italic relative z-10">
              "Talo ist das Ende der Zettelwirtschaft. Es ist der Neubeginn für ein Ehrenamt, das sich wieder auf das Wesentliche konzentrieren darf: Die Gemeinschaft und das Wachstum."
           </p>
           <footer className="mt-10 text-gray-400 font-black uppercase tracking-[0.4em] text-[11px] italic flex items-center gap-4">
              <div className="w-12 h-[1px] bg-gray-200 dark:bg-white/10" />
              TALO DEVELOPMENT TEAM
           </footer>
        </blockquote>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-16 mb-8">Datenschutz als Fundament, nicht als Hindernis</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          In Zeiten von strengen DSGVO-Richtlinien ist Datensicherheit kein optionales Extra mehr. Talo bietet Ihnen die Sicherheit einer modernen Enterprise-Cloud. Alle Daten werden auf verschlüsselten Servern innerhalb der Europäischen Union gespeichert. Wir setzen auf Zero-Trust-Prinzipien und fein abgestufte Berechtigungssysteme. So stellen wir sicher, dass sensible Mitgliederdaten geschützt bleiben und Vorstände rechtlich auf der sicheren Seite stehen.
        </p>

        <h2 className="text-3xl font-logo font-bold text-gray-950 dark:text-white mt-20 mb-8">Startet in die digitale Ära</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 leading-relaxed">
          Digitalisierung ist kein Selbstzweck. Sie ist ein Werkzeug, um menschliches Engagement zu ermöglichen. Talo ist mehr als nur eine Software – es ist ein Partner für Ihre Vision des modernen Vereinswesens. Indem wir die Verwaltung modernisieren, bewahren wir die Energie für das, was wirklich zählt: Die Freude am gemeinsamen Erreichen von Zielen. Lasst uns heute beginnen, die Zukunft eures Vereins zu gestalten.
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

