"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Sparkles, Bell, Zap, ShieldCheck, ArrowRight, Check } from "lucide-react";

const benefits = [
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Neue Features zuerst",
    desc: "Erfahre als Erster von neuen Talo-Features, bevor sie öffentlich ausgerollt werden.",
    color: "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Praxis-Tipps & Tricks",
    desc: "Konkrete Tipps, wie andere Vereine Talo nutzen, um ihr Ehrenamt zu stärken.",
    color: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Kein Spam, versprochen",
    desc: "Maximal 2× pro Monat. Kein Weitergeben an Dritte. Jederzeit abmeldbar.",
    color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Exklusive Einblicke",
    desc: "Behind-the-Scenes aus dem Talo-Team: Was wir bauen, warum wir es bauen.",
    color: "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
  },
];

const recentIssues = [
  {
    tag: "Produkt",
    title: "Wie Talo bauen – und was wir dabei gelernt haben",
    date: "März 2026",
  },
  {
    tag: "Community",
    title: "5 Vereine, die ihr Ehrenamt neu gedacht haben",
    date: "Feb. 2026",
  },
  {
    tag: "Feature",
    title: "Workflows: Automatisierung für jeden Verein",
    date: "Jan. 2026",
  },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      // Notify owner
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: "philipp@pauli-one.de" }] }],
          from: { email: "philipp@pauli-one.de", name: "Talo Newsletter" },
          subject: `Neue Newsletter-Anmeldung: ${email}`,
          content: [{
            type: "text/html",
            value: `<p>Neue Anmeldung für den Talo Newsletter:</p><p><strong>${email}</strong></p>`,
          }],
        }),
      });
      // Confirmation to subscriber
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: "philipp@pauli-one.de", name: "Talo Newsletter" },
          subject: "Du bist dabei – willkommen beim Talo Newsletter 👋",
          content: [{
            type: "text/html",
            value: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#1a1a1a">
                <img src="https://talo-webapp.vercel.app/talo-logo.png" alt="Talo" style="width:40px;height:40px;margin-bottom:24px;filter:invert(1)">
                <h1 style="font-size:28px;font-weight:600;margin:0 0 12px">Willkommen beim Talo Newsletter.</h1>
                <p style="color:#555;line-height:1.6;margin:0 0 24px">
                  Du stehst jetzt auf der Liste. Wir melden uns maximal 2× im Monat –
                  mit echten Updates, Praxis-Tipps und Einblicken aus dem Talo-Team.
                </p>
                <p style="color:#555;line-height:1.6;margin:0 0 32px">
                  Bis bald,<br><strong>Philipp & das Talo-Team</strong>
                </p>
                <hr style="border:none;border-top:1px solid #eee;margin:0 0 20px">
                <p style="font-size:12px;color:#aaa">
                  Du hast dich unter <a href="https://talo-webapp.vercel.app/newsletter" style="color:#aaa">talo-webapp.vercel.app/newsletter</a> angemeldet.
                  <a href="mailto:philipp@pauli-one.de?subject=Newsletter abmelden" style="color:#aaa">Abmelden</a>
                </p>
              </div>`,
          }],
        }),
      });
    } catch (_) {
      // show success regardless – email delivery is best-effort
    }
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[160px] pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-[120px] -translate-y-1/4" />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Talo Newsletter
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white leading-[1.0] mb-6">
              Bleib im Bild.
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.35}>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#8A8A8A] max-w-xl mx-auto mb-12 leading-relaxed">
              News, Feature-Updates und Community-Storys direkt in dein Postfach —
              klar, kompakt und maximal 2× im Monat.
            </p>
          </ScrollReveal>

          {/* Signup form */}
          <ScrollReveal direction="up" delay={0.45}>
            {submitted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Du bist dabei!</p>
                  <p className="text-gray-500 dark:text-[#8A8A8A]">Schau auch mal in deinen Spam-Ordner, falls du nichts siehst.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="flex-1 w-full px-5 py-4 rounded-[16px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-[15px] outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-[16px] bg-black dark:bg-white text-white dark:text-black font-medium text-[15px] hover:opacity-80 active:scale-[0.97] transition-all disabled:opacity-60 whitespace-nowrap"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Anmelden
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.55}>
            <p className="mt-5 text-xs text-gray-400 dark:text-gray-600">
              Bereits über <span className="font-semibold text-gray-600 dark:text-gray-400">1.200</span> Vereins-Vorstände lesen mit. Jederzeit abmeldbar.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white text-center mb-14">
              Was dich erwartet
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <StaggerItem key={i}>
                <div className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.color}`}>
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{b.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Recent issues */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
              Zuletzt erschienen
            </h2>
            <p className="text-gray-500 dark:text-[#8A8A8A] mb-12">Ein Blick in unsere letzten Ausgaben.</p>
          </ScrollReveal>
          <StaggerContainer className="flex flex-col gap-4">
            {recentIssues.map((issue, i) => (
              <StaggerItem key={i}>
                <div className="flex items-center justify-between p-5 rounded-[1.25rem] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111] hover:border-gray-200 dark:hover:border-white/10 transition-colors group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">
                      {issue.tag}
                    </span>
                    <span className="text-[15px] font-medium text-gray-800 dark:text-gray-200">{issue.title}</span>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-400 dark:text-gray-600 ml-6 shrink-0">{issue.date}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up">
            <div className="relative overflow-hidden rounded-[2rem] bg-black dark:bg-white/[0.04] dark:border dark:border-white/[0.08] p-10 md:p-16 text-center">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[300px] rounded-full bg-violet-500/20 blur-[80px]" />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-4xl font-semibold font-logo text-white mb-4">
                  Verpasse nichts.
                </h2>
                <p className="text-white/60 mb-8 max-w-sm mx-auto">
                  Trag dich jetzt ein und erhalte die nächste Ausgabe direkt in dein Postfach.
                </p>
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.de"
                      className="flex-1 w-full px-5 py-3.5 rounded-[14px] bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-[14px] bg-white text-black font-medium text-sm hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60 whitespace-nowrap"
                    >
                      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : "Jetzt anmelden"}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-white font-medium">
                    <Check className="w-5 h-5 text-emerald-400" /> Du bist dabei!
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
