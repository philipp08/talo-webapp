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
        { name: "Punktevergabe", href: "/funktionen#punkte" },
        { name: "Workflows", href: "/funktionen#workflow" },
        { name: "Umgebungen", href: "/funktionen#admin" },
        { name: "Rangliste", href: "/funktionen#community" },
        { name: "Preise", href: "/preise" },
      ],
    },
    {
      title: "Lösungen",
      links: [
        { name: "Sportvereine", href: "/loesungen#sport" },
        { name: "Musik & Kultur", href: "/loesungen#kultur" },
        { name: "Feuerwehr", href: "/loesungen#feuerwehr" },
        { name: "Soziale Träger", href: "/loesungen" },
        { name: "Hilfsorganisationen", href: "/loesungen" },
      ],
    },
    {
      title: "Vergleichen",
      links: [
        { name: "Excel-Listen", href: "/hilfe" },
        { name: "WhatsApp", href: "/hilfe" },
        { name: "Stundenkarten", href: "/hilfe" },
        { name: "Andere Apps", href: "/hilfe" },
      ],
    },
    {
      title: "Ressourcen",
      links: [
        { name: "Hilfe-Center", href: "/hilfe" },
        { name: "Blog", href: "/blog" },
        { name: "Changelog", href: "/hilfe" },
        { name: "Newsletter", href: "/newsletter" },
        { name: "Videos", href: "/hilfe" },
      ],
    },
    {
      title: "Unternehmen",
      links: [
        { name: "Über uns", href: "/ueber-uns" },
        { name: "Karriere", href: "/ueber-uns" },
        { name: "Presse", href: "/ueber-uns" },
        { name: "Kontakt", href: "/ueber-uns" },
      ],
    },
  ];

  const taloAiQuery = encodeURIComponent(`Als potenzieller Kunde möchte ich konkret verstehen, was ich bei Talo™ (talo.app) erhalte.
Beschreibe Schritt für Schritt, was der Service beinhaltet: was Talo™ ist, wie das digitale Punktesystem für Vereine funktioniert, wie es die Mitgliederverwaltung automatisiert, welche Sicherheits- und DSGVO-Features es gibt und wie es Vorständen hilft, Zeit zu sparen.
Erkläre es einfach, als würdest du die reale Erfahrung des Services beschreiben.`);

  const aiProviders = [
    { name: "ChatGPT", href: `https://chatgpt.com/?q=${taloAiQuery}`, icon: "🤖" },
    { name: "Claude", href: `https://claude.ai/new?q=${taloAiQuery}`, icon: "🧠" },
    { name: "Gemini", href: `https://gemini.google.com/app?q=${taloAiQuery}`, icon: "✨" },
  ];


  const socialLinks = [
    { 
      label: "Github", 
      href: "https://github.com", 
      path: "M10.001 1.625a8.331 8.331 0 0 1 8.334 8.334 8.346 8.346 0 0 1-5.677 7.906c-.417.083-.573-.177-.573-.396 0-.281.01-1.177.01-2.291 0-.782-.26-1.282-.562-1.542 1.854-.208 3.802-.917 3.802-4.115 0-.916-.323-1.656-.855-2.24.084-.208.375-1.062-.083-2.208 0 0-.698-.229-2.292.855a7.733 7.733 0 0 0-2.083-.282c-.708 0-1.417.094-2.083.282-1.594-1.073-2.292-.855-2.292-.855-.458 1.146-.167 2-.083 2.209a3.243 3.243 0 0 0-.854 2.24c0 3.187 1.937 3.906 3.791 4.114-.24.208-.458.573-.53 1.115-.48.218-1.678.572-2.428-.688-.156-.25-.625-.865-1.281-.854-.698.01-.282.396.01.552.354.198.76.937.854 1.177.167.469.709 1.365 2.802.98 0 .697.01 1.353.01 1.551 0 .219-.155.469-.572.396A8.329 8.329 0 0 1 1.668 9.96a8.331 8.331 0 0 1 8.333-8.334Z" 
    },
    { 
      label: "Linkedin", 
      href: "https://linkedin.com", 
      path: "M16.375 2.5H3.625A1.125 1.125 0 0 0 2.5 3.625v12.75A1.125 1.125 0 0 0 3.625 17.5h12.75a1.125 1.125 0 0 0 1.125-1.125V3.625A1.125 1.125 0 0 0 16.375 2.5ZM7 15.25H4.75V8.5H7v6.75ZM5.875 7.187a1.313 1.313 0 1 1 1.35-1.312 1.335 1.335 0 0 1-1.35 1.313Zm9.375 8.063H13v-3.555c0-1.065-.45-1.447-1.035-1.447a1.304 1.304 0 0 0-1.215 1.395.498.498 0 0 0 0 .104v3.503H8.5V8.5h2.175v.975a2.332 2.332 0 0 1 2.025-1.05c1.163 0 2.52.645 2.52 2.745l.03 4.08Z" 
    },
    { 
      label: "Youtube", 
      href: "https://youtube.com", 
      path: "M16.837 3.34c.753.233 1.345.918 1.547 1.789.364 1.577.366 4.87.366 4.87s0 3.294-.366 4.872c-.202.871-.794 1.556-1.547 1.789-1.364.423-6.837.423-6.837.423s-5.473 0-6.837-.423c-.753-.233-1.345-.918-1.547-1.79C1.25 13.294 1.25 10 1.25 10s0-3.294.366-4.871c.202-.871.794-1.556 1.547-1.79C4.527 2.918 10 2.918 10 2.918s5.473 0 6.837.423ZM12.927 10l-4.762 2.75v-5.5L12.928 10Z" 
    },
    { 
      label: "X", 
      href: "https://x.com", 
      path: "M14.503 2.917h2.401l-5.246 6 6.172 8.166h-4.833l-3.785-4.952-4.332 4.952H2.477l5.612-6.418-5.921-7.748h4.956l3.421 4.526 3.958-4.526Zm-.843 12.728h1.33L6.4 4.279H4.974l8.687 11.366Z" 
    },
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
                Talo™
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
          <div className="col-span-3 md:col-span-10 lg:col-span-10 mt-12 md:mt-16 lg:mt-24 order-4 lg:order-1 border-t border-gray-100 dark:border-white/5 pt-8">
            <ul className="text-[0.75rem] sm:text-[0.725rem] lg:text-[0.75rem] md:gap-x-[1.5em] gap-y-3 flex flex-col md:flex-row flex-wrap">
              <li className="mb-2 md:mb-0 md:order-[-1]">
                <span className="opacity-60 text-gray-500 font-medium">© {currentYear} Talo</span>
              </li>
              {[
                { name: "Status", href: "/hilfe" },
                { name: "Sicherheit", href: "/hilfe" },
                { name: "Impressum", href: "/impressum" },
                { name: "AGB", href: "/datenschutz" },
                { name: "Datenschutz", href: "/datenschutz" },
                { name: "Cookie-Richtlinie", href: "/datenschutz" },
              ].map((link) => (
                <li key={link.name} className="flex flex-col">
                  <Link 
                    href={link.href} 
                    className="leading-[1] text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <button className="leading-[1] text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors">
                  Cookie-Präferenzen
                </button>
              </li>
            </ul>
          </div>

          {/* Bottom Middle: AI Section */}
          <div className="col-span-3 md:col-span-10 lg:col-span-6 mt-12 mb-4 lg:mb-0 md:mt-16 lg:mt-24 order-2 lg:order-2 flex flex-col items-start lg:items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-8 lg:border-t-0 lg:pt-0">
            <span className="text-[0.75rem] opacity-60 font-medium whitespace-nowrap">KI über Talo™ fragen</span>
            <ul className="flex gap-4">
              {aiProviders.map((ai) => (
                <li key={ai.name}>
                  <a 
                    href={ai.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 text-[18px] opacity-60 hover:opacity-100 transition-all hover:scale-110 grayscale hover:grayscale-0"
                    title={`Frage ${ai.name} über Talo™`}
                  >
                    {ai.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Right: Social */}
          <div className="col-span-3 md:col-span-20 lg:col-span-4 mt-12 md:mt-16 lg:mt-24 order-5 lg:order-3 flex gap-x-5 lg:justify-end border-t border-gray-100 dark:border-white/5 pt-8 lg:border-t-0 lg:pt-0">
            {socialLinks.map((social) => (
              <a 
                key={social.label} 
                aria-label={social.label} 
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col opacity-60 hover:opacity-100 transition-opacity duration-200 text-gray-500 dark:text-gray-400 dark:hover:text-white hover:text-black"
              >
                <i className="flex flex-col h-5 w-5">
                  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d={social.path} fill="currentColor"></path>
                  </svg>
                </i>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </ScrollReveal>
  );
}

