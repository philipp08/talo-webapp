"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const menuSections = [
    {
      title: "Plattform",
      links: [
        { name: "Vereinssoftware", href: "/vereinssoftware" },
        { name: "Punktevergabe", href: "/funktionen#punkte" },
        { name: "Workflows", href: "/funktionen#workflow" },
        { name: "Mitgliederverwaltung", href: "/vereinssoftware/mitgliederverwaltung" },
        { name: "Rangliste", href: "/funktionen#community" },
        { name: "Preise", href: "/preise" },
      ],
    },
    {
      title: "Lösungen",
      links: [
        { name: "Sportvereine", href: "/vereinssoftware/sportverein" },
        { name: "Mehrspartenvereine", href: "/loesungen#abteilungen" },
        { name: "Punkteverwaltung", href: "/vereinssoftware/punkteverwaltung" },
      ],
    },
    {
      title: "Vergleichen",
      links: [
        { name: "Excel-Listen", href: "/vereinssoftware/punkteverwaltung" },
        { name: "WhatsApp", href: "/hilfe" },
        { name: "Stundenkarten", href: "/vereinssoftware/punkteverwaltung" },
        { name: "Andere Apps", href: "/hilfe" },
      ],
    },
    {
      title: "Ressourcen",
      links: [
        { name: "Hilfe-Center", href: "/hilfe" },
        { name: "Benutzerhandbuch", href: "/TALO-Benutzerhandbuch.pdf" },
        { name: "Blog", href: "/blog" },
        { name: "Changelog", href: "/changelog" },
        { name: "Newsletter", href: "/newsletter" },
        { name: "Videos", href: "/hilfe" },
      ],
    },
    {
      title: "Unternehmen",
      links: [
        { name: "Über uns", href: "/ueber-uns" },
        { name: "Karriere", href: "/karriere" },
        { name: "Presse", href: "/presse" },
        { name: "Kontakt", href: "/kontakt" },
      ],
    },
  ];

  const taloAiQuery = encodeURIComponent(`Als potenzieller Kunde möchte ich konkret verstehen, was ich bei Talo (talo-club.de) erhalte.
Beschreibe Schritt für Schritt, was der Service beinhaltet: was Talo ist, wie das digitale Punktesystem für Vereine funktioniert, wie es die Mitgliederverwaltung automatisiert, welche Sicherheits- und DSGVO-Features es gibt und wie es Vorständen hilft, Zeit zu sparen.
Erkläre es einfach, als würdest du die reale Erfahrung des Services beschreiben.`);

  const aiProviders = [
    { name: "ChatGPT", href: `https://chatgpt.com/?q=${taloAiQuery}`, icon: "🤖" },
    { name: "Claude", href: `https://claude.ai/new?q=${taloAiQuery}`, icon: "🧠" },
    { name: "Gemini", href: `https://gemini.google.com/app?q=${taloAiQuery}`, icon: "✨" },
  ];

  return (
    <ScrollReveal direction="up" duration={0.6} distance={20}>
      <footer className="relative !mt-5 md:!mt-10 px-5 md:px-10 pb-5 md:pb-10 container mx-auto decoration-none">
        <div 
          className="grid items-end grid-cols-3 md:grid-cols-20 p-5 md:p-8 lg:p-12 rounded-[0.625rem] lg:rounded-[1.25rem] gap-2.5 bg-white dark:bg-[#0F0F0F] border border-gray-100 dark:border-white/5 transition-colors duration-300" 
          style={{ boxShadow: "0 0 7.5rem 0 rgba(0, 0, 0, 0.07)" }}
        >
          {/* Logo Section */}
          <div className="order-1 md:mb-auto md:mt-0 mt-7 md:order-[unset] col-span-1 md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/talo-logo.png"
                alt="Talo logo"
                width={40}
                height={40}
                className="rounded-lg invert dark:invert-0 h-10 w-10 md:h-12.5 md:w-12.5"
              />
              <span className="font-logo font-medium text-[19px] tracking-[0.2em] text-[#080808] dark:text-white uppercase hidden md:block">
                Talo
              </span>
            </Link>
          </div>

          {/* Menus Section */}
          <div className="col-span-3 md:col-span-16 md:mt-0 mt-7 md:ml-auto grid grid-cols-2 md:grid-cols-5 gap-x-6 lg:gap-x-8 gap-y-12 order-3 lg:order-none">
            {menuSections.map((section) => (
              <div key={section.title} className="col-span-1">
                <h3 className="text-[0.75rem] opacity-60 mb-3 lg:mb-6 font-medium uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="text-[0.75rem] xl:text-[0.95rem] gap-y-2.5 lg:gap-y-4 flex flex-col">
                  {section.links.map((link) => (
                    <li key={link.name} className="flex flex-col items-start group">
                      <Link
                        href={link.href}
                        target={link.href.endsWith(".pdf") ? "_blank" : undefined}
                        rel={link.href.endsWith(".pdf") ? "noopener noreferrer" : undefined}
                        className="leading-[1] relative text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                      >
                        {link.name}
                        <i className="opacity-0 group-hover:opacity-10 absolute lg:left-[-0.625rem] lg:right-[-0.625rem] lg:top-[-0.5rem] lg:bottom-[-0.5rem] xl:left-[-0.72rem] xl:right-[-0.72rem] xl:top-[-0.575rem] xl:bottom-[-0.575rem] rounded-[0.5rem] bg-current pointer-events-none transition-opacity"></i>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Left: Legal */}
          <div className="col-span-3 md:col-span-12 lg:col-span-10 mt-12 md:mt-16 lg:mt-24 order-4 lg:order-1 border-t border-gray-100 dark:border-white/5 pt-8">
            <ul className="text-[0.75rem] sm:text-[0.725rem] lg:text-[0.75rem] flex flex-wrap items-center gap-x-[1.5em] gap-y-3">
              <li className="flex items-center">
                <span className="opacity-60 text-gray-500 font-medium leading-[1]">© {currentYear} Talo</span>
              </li>
              {[
                { name: "Status", href: "/status" },
                { name: "Impressum", href: "/impressum" },
                { name: "Datenschutz", href: "/datenschutz" },
                { name: "Cookie-Richtlinie", href: "/datenschutz" },
              ].map((link) => (
                <li key={link.name} className="flex items-center">
                  <Link
                    href={link.href}
                    className="leading-[1] text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="flex items-center">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("talo:openCookieBanner"))}
                  className="leading-[1] text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors"
                >
                  Cookie-Präferenzen
                </button>
              </li>
            </ul>
          </div>

          {/* Bottom Middle: AI Section */}
          <div className="col-span-3 md:col-span-10 lg:col-span-6 mt-12 mb-4 lg:mb-0 md:mt-16 lg:mt-24 order-2 lg:order-2 flex flex-col items-start lg:items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-8 lg:border-t-0 lg:pt-0">
            <span className="text-[0.75rem] opacity-60 font-medium whitespace-nowrap">KI über Talo fragen</span>
            <ul className="flex gap-4">
              {aiProviders.map((ai) => (
                <li key={ai.name}>
                  <a 
                    href={ai.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 text-[18px] opacity-60 hover:opacity-100 transition-all hover:scale-110 grayscale hover:grayscale-0"
                    title={`Frage ${ai.name} über Talo`}
                  >
                    {ai.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Right: Contact */}
          <div className="col-span-3 md:col-span-20 lg:col-span-4 mt-12 md:mt-16 lg:mt-24 order-5 lg:order-3 flex flex-col gap-2 lg:items-end border-t border-gray-100 dark:border-white/5 pt-8 lg:border-t-0 lg:pt-0">
            <span className="text-[0.75rem] opacity-60 font-medium">Direkter Kontakt</span>
            <a
              href="mailto:philipp@pauli-one.de"
              className="text-[0.75rem] font-medium text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              philipp@pauli-one.de
            </a>
          </div>
        </div>
      </footer>
    </ScrollReveal>
  );
}
