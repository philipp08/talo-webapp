"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Heart, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      <section className="relative pt-[180px] pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6 w-full text-center">
          <ScrollReveal direction="up" delay={0.15}>
            <h1 className="text-[3.5rem] leading-[1.1] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-6">
              Unsere <br /> Mission
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-[#8A8A8A] max-w-2xl mx-auto">
              Wir bei Talo glauben, dass jedes Ehrenamt Wertschätzung verdient. <br className="hidden md:block" /> 
              Unsere Mission ist es, dies sichtbar und fair zu machen.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mb-8">Warum Talo?</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-[#8A8A8A] space-y-6">
              <p>
                In vielen Vereinen wird die Arbeit oft von den gleichen engagierten Köpfen getragen. 
                Vieles geschieht im Stillen, ohne dass der Rest des Vereins – oder gar der Vorstand – 
                wirklich sieht, wer wie viel beiträgt.
              </p>
              <p>
                Talo wurde entwickelt, um dieses Engagement aus dem Schatten zu holen. Wir wollen, 
                dass jeder kleine Beitrag zählt. Von der Platzpflege bis zum Fahrdienst, von der 
                Trainingsleitung bis zur Kuchenspende.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-12 mt-20">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-red-500/30">Fairness</h3>
                  <p className="text-sm text-gray-500 dark:text-[#8A8A8A]">Engagement ist keine Pflicht, sondern ein Geschenk. Wir sorgen dafür, dass es fair bewertet wird.</p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-blue-500/30">Transparenz</h3>
                  <p className="text-sm text-gray-500 dark:text-[#8A8A8A]">Keine "Zettelwirtschaft" mehr. Jeder sieht seinen Stand in Echtzeit – direkt in der App.</p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-yellow-500/30">Motivation</h3>
                  <p className="text-sm text-gray-500 dark:text-[#8A8A8A]">Gamifizierte Leaderboards motivieren dazu, dran zu bleiben und den eigenen Verein voranzubringen.</p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.4}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 underline underline-offset-4 decoration-green-500/30">Einfachheit</h3>
                  <p className="text-sm text-gray-500 dark:text-[#8A8A8A]">Admins verbringen weniger Zeit mit Excel und mehr Zeit mit dem, was wirklich wichtig ist: dem Verein.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── VISION/QUOTE ─────────────────────────────────────────── */}
      <section className="py-32 bg-white dark:bg-[#080808]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal direction="up">
            <span className="text-6xl text-gray-200 dark:text-white/10 font-serif leading-none">“</span>
            <p className="text-3xl md:text-4xl font-logo text-gray-900 dark:text-white leading-snug mb-8">
              Talo ist das Ende der Ausreden. Es ist der Anfang einer neuen Ära des Vereinslebens.
            </p>
            <span className="text-sm font-bold tracking-widest text-[#E87AA0] uppercase">Die Talo Vision</span>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
