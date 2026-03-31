import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Impressum – Talo™",
  description: "Rechtliche Informationen und Kontaktangaben von Talo.",
};

export default function Impressum() {
  return (
    <main className="min-h-screen bg-white dark:bg-black selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 dark:text-white mb-4">
            Impressum
          </h1>
          <div className="h-1 w-20 bg-black dark:bg-white rounded-full"></div>
        </header>

        <section className="space-y-12 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Angaben gemäß § 5 TMG</h2>
            <p>
              Philipp Pauli<br />
              Georg-Ertel-Straße 16A<br />
              76437 Rastatt
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Kontakt</h2>
            <p>
              Telefon: +49 15563 127126<br />
              E-Mail: <a href="mailto:philipp@pauli-one.de" className="text-black dark:text-white underline decoration-gray-300 hover:decoration-black transition-colors">philipp@pauli-one.de</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Philipp Pauli<br />
              Georg-Ertel-Straße 16A<br />
              76437 Rastatt
            </p>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-white/5 text-sm text-gray-400">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Streitschlichtung</h3>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="ml-1 hover:text-black dark:hover:text-white transition-colors">https://ec.europa.eu/consumers/odr</a>.<br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
