import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Datenschutz – Talo",
  description: "Datenschutzerklärung von Talo. Informationen über die Erhebung und Speicherung Ihrer Daten.",
};

export default function Datenschutz() {
  return (
    <main className="min-h-screen bg-white dark:bg-black selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 dark:text-white mb-4">
            Datenschutz
          </h1>
          <div className="h-1 w-20 bg-black dark:bg-white rounded-full"></div>
        </header>

        <section className="space-y-12 text-gray-600 dark:text-gray-400 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">1. Einleitung</h2>
            <p>
              Talo nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">2. Verantwortliche Stelle</h2>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Webseite ist:<br />
              <br />
              Philipp Pauli<br />
              Georg-Ertel-Straße 16A<br />
              76437 Rastatt<br />
              philipp@pauli-one.de
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">3. Datenerfassung auf unserer Webseite</h2>
            <h3 className="font-bold text-gray-900 dark:text-white mt-4 mb-2">Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse.
            </p>
            
            <h3 className="font-bold text-gray-900 dark:text-white mt-4 mb-2">Cookies</h3>
            <p>
              Unsere Webseite verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">4. Rechte der betroffenen Person</h2>
            <p>
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">5. Datensicherheit</h2>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung.
            </p>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-white/5 text-sm">
             <p>Bitte kontaktieren Sie uns für detaillierte Informationen oder bei Fragen zu unserer Datenschutzpraxis direkt.</p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
