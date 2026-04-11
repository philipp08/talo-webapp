import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Impressum – Talo",
  description: "Rechtliche Informationen und Kontaktangaben von Talo.",
};

const sections = [
  {
    title: "Angaben gemäß § 5 TMG",
    content: (
      <address className="not-italic leading-loose text-gray-600 dark:text-[#8A8A8A]">
        <span className="font-semibold text-gray-900 dark:text-white">PauliONE</span>
        <br />
        Vertreten durch: Philipp Pauli
        <br />
        Georg-Ertel-Straße 16A
        <br />
        76437 Rastatt
        <br />
        Deutschland
      </address>
    ),
  },
  {
    title: "Kontakt",
    content: (
      <ul className="space-y-2 text-gray-600 dark:text-[#8A8A8A]">
        <li>
          <span className="text-gray-400 dark:text-gray-600 text-sm uppercase tracking-wider font-medium mr-2">Telefon</span>
          <a
            href="tel:+4915563127126"
            className="text-gray-900 dark:text-white hover:underline underline-offset-4 transition-colors"
          >
            +49 155 631 27126
          </a>
        </li>
        <li>
          <span className="text-gray-400 dark:text-gray-600 text-sm uppercase tracking-wider font-medium mr-2">E-Mail</span>
          <a
            href="mailto:philipp@pauli-one.de"
            className="text-gray-900 dark:text-white hover:underline underline-offset-4 transition-colors"
          >
            philipp@pauli-one.de
          </a>
        </li>
      </ul>
    ),
  },
  {
    title: "Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)",
    content: (
      <address className="not-italic leading-loose text-gray-600 dark:text-[#8A8A8A]">
        Philipp Pauli
        <br />
        Georg-Ertel-Straße 16A
        <br />
        76437 Rastatt
      </address>
    ),
  },
  {
    title: "Haftung für Inhalte",
    content: (
      <p className="text-gray-600 dark:text-[#8A8A8A] leading-relaxed">
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
        Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf
        eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
        erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von
        entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
      </p>
    ),
  },
  {
    title: "Haftung für Links",
    content: (
      <p className="text-gray-600 dark:text-[#8A8A8A] leading-relaxed">
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
        Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
        wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
        Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
        jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
        Rechtsverletzungen werden wir derartige Links umgehend entfernen.
      </p>
    ),
  },
  {
    title: "Urheberrecht",
    content: (
      <p className="text-gray-600 dark:text-[#8A8A8A] leading-relaxed">
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
        Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
        Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit
        die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
        Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
        Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis.
      </p>
    ),
  },
  {
    title: "Streitschlichtung",
    content: (
      <p className="text-gray-600 dark:text-[#8A8A8A] leading-relaxed">
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 dark:text-white underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        . Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    ),
  },
];

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="pt-[160px] pb-16 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400 text-xs font-medium tracking-wider uppercase mb-8">
            Rechtliches
          </div>
          <h1 className="text-[3rem] md:text-[5rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white leading-[1.05] mb-6">
            Impressum
          </h1>
          <p className="text-gray-500 dark:text-[#8A8A8A] text-lg max-w-xl leading-relaxed">
            Informationspflichten gemäß § 5 TMG und § 55 RStV für das Angebot
            unter talo-webapp.vercel.app.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid gap-0 divide-y divide-gray-100 dark:divide-white/[0.06]">
            {sections.map((section, i) => (
              <div
                key={i}
                className="grid md:grid-cols-[280px_1fr] gap-6 md:gap-16 py-10"
              >
                <div>
                  <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-snug">
                    {section.title}
                  </h2>
                </div>
                <div>{section.content}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer links */}
      <section className="py-10 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400 dark:text-gray-600">
          <span>© {new Date().getFullYear()} PauliONE</span>
          <Link href="/datenschutz" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Datenschutz
          </Link>
          <Link href="/kontakt" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Kontakt
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
