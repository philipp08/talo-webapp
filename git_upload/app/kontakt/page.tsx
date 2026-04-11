"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Mail, MessageSquare, Phone, MapPin, ArrowRight, Check, Clock, Headphones } from "lucide-react";

const contactOptions = [
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Support",
    desc: "Technische Fragen, Bugs oder Nutzungsprobleme.",
    action: "philipp@pauli-one.de",
    href: "mailto:philipp@pauli-one.de",
    color: "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
    badge: "Ø 4 h Antwortzeit",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Vertrieb",
    desc: "Enterprise-Anfragen, Demos und Partnerschaften.",
    action: "philipp@pauli-one.de",
    href: "mailto:philipp@pauli-one.de",
    color: "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    badge: "Werktags bis 18 Uhr",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Presse",
    desc: "Medienanfragen, Interviews und Pressematerial.",
    action: "philipp@pauli-one.de",
    href: "mailto:philipp@pauli-one.de",
    color: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    badge: "In 24 h zurück",
  },
];

const faqs = [
  {
    q: "Gibt es eine kostenlose Testphase?",
    a: "Ja — der Start-Plan ist dauerhaft kostenlos für bis zu 15 Mitglieder. Kein Abo, keine Kreditkarte.",
  },
  {
    q: "Kann ich Talo für mehrere Vereine nutzen?",
    a: "Mit dem Pro- und Enterprise-Plan kannst du mehrere Vereine unter einem Account verwalten.",
  },
  {
    q: "Ist Talo DSGVO-konform?",
    a: "Ja. Alle Daten werden ausschließlich auf EU-Servern (Deutschland) gespeichert. Wir bieten auf Anfrage einen Auftragsverarbeitungsvertrag.",
  },
  {
    q: "Wie lange dauert die Einrichtung?",
    a: "Die meisten Vereine sind in unter 30 Minuten live. Unser Onboarding-Guide führt dich Schritt für Schritt.",
  },
];

export default function KontaktPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[160px] pb-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[700px] h-[400px] rounded-full bg-sky-400/10 dark:bg-sky-600/8 blur-[140px] -translate-y-1/3" />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/40 text-sky-700 dark:text-sky-300 text-sm font-medium mb-8">
              <Clock className="w-3.5 h-3.5" />
              Werktags Ø 4 h Antwortzeit
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white leading-[1.0] mb-6">
              Wir sind <br className="hidden md:block" /> für euch da.
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.35}>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#8A8A8A] max-w-xl leading-relaxed">
              Fragen, Feedback oder eine Demo-Anfrage? Schreib uns direkt —
              wir antworten schnell und persönlich.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact options */}
      <section className="py-16 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-6">
          <StaggerContainer className="grid sm:grid-cols-3 gap-5">
            {contactOptions.map((opt, i) => (
              <StaggerItem key={i}>
                <a
                  href={opt.href}
                  className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm transition-all group h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${opt.color}`}>
                      {opt.icon}
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">
                      {opt.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{opt.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] mb-3 leading-relaxed">{opt.desc}</p>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300 group-hover:underline underline-offset-2">
                      {opt.action}
                    </span>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <ScrollReveal direction="up">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-2">
                Formular
              </h2>
              <p className="text-gray-500 dark:text-[#8A8A8A] mb-8">
                Wir melden uns innerhalb eines Werktags bei dir.
              </p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center rounded-[1.5rem] border border-gray-100 dark:border-white/[0.06]">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Nachricht erhalten!</p>
                    <p className="text-gray-500 dark:text-[#8A8A8A] max-w-xs">
                      Wir melden uns so schnell wie möglich bei dir. Versprochen.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Max Mustermann"
                        className="px-4 py-3 rounded-[12px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-[14px] outline-none focus:ring-2 focus:ring-sky-400/30 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="max@verein.de"
                        className="px-4 py-3 rounded-[12px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-[14px] outline-none focus:ring-2 focus:ring-sky-400/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Betreff</label>
                    <select
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-[12px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white text-[14px] outline-none focus:ring-2 focus:ring-sky-400/30 transition-all appearance-none"
                    >
                      <option value="" disabled>Thema auswählen …</option>
                      <option value="support">Support-Anfrage</option>
                      <option value="demo">Demo anfragen</option>
                      <option value="enterprise">Enterprise / Verbände</option>
                      <option value="presse">Presseanfrage</option>
                      <option value="sonstiges">Sonstiges</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nachricht</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Was beschäftigt dich?"
                      className="px-4 py-3 rounded-[12px] border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-[14px] outline-none focus:ring-2 focus:ring-sky-400/30 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-[14px] bg-black dark:bg-white text-white dark:text-black font-medium text-[15px] hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Nachricht senden
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-1">
                    Mit dem Absenden stimmst du unserer{" "}
                    <a href="/datenschutz" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                      Datenschutzerklärung
                    </a>{" "}
                    zu.
                  </p>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* Info sidebar */}
          <ScrollReveal direction="up" delay={0.15}>
            <div className="flex flex-col gap-6">
              {/* Office info */}
              <div className="p-6 rounded-[1.5rem] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Büro</h3>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-[#8A8A8A]">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400 dark:text-gray-600 shrink-0" />
                    <span>PauliONE<br />Georg-Ertel-Straße 16A<br />76437 Rastatt, Deutschland</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#8A8A8A]">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
                    <a href="mailto:philipp@pauli-one.de" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                      philipp@pauli-one.de
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#8A8A8A]">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
                    <a href="tel:+4915563127126" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                      +49 155 631 27126
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-[#8A8A8A]">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
                    <span>Mo – Fr, 9:00 – 18:00 Uhr</span>
                  </li>
                </ul>
              </div>

              {/* FAQ */}
              <div className="p-6 rounded-[1.5rem] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Häufige Fragen</h3>
                <div className="flex flex-col gap-0 divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {faqs.map((faq, i) => (
                    <div key={i} className="py-3">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-start justify-between gap-3 text-left group"
                      >
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                          {faq.q}
                        </span>
                        <span className="mt-0.5 text-gray-400 dark:text-gray-600 shrink-0 text-lg leading-none">
                          {openFaq === i ? "−" : "+"}
                        </span>
                      </button>
                      {openFaq === i && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed pr-6">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
