import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Datenschutz – Talo",
  description: "Datenschutzerklärung von Talo (PauliONE). Informationen über die Erhebung und Verarbeitung personenbezogener Daten.",
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
        {number}. {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

function Sub({ title }: { title: string }) {
  return <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-1">{title}</h3>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 pl-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white transition-colors">
      {children}
    </a>
  );
}

export default function Datenschutz() {
  return (
    <main className="min-h-screen bg-white dark:bg-black selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 dark:text-white mb-4">
            Datenschutzerklärung
          </h1>
          <div className="h-1 w-20 bg-black dark:bg-white rounded-full" />
        </header>

        <div className="space-y-12 text-gray-600 dark:text-gray-400 text-[15px]">

          <Section number="1" title="Verantwortlicher">
            <P>Verantwortlich für die Datenverarbeitung auf dieser Website und innerhalb der App ist:</P>
            <div className="mt-2 font-medium text-gray-800 dark:text-gray-200 leading-7">
              <span className="font-bold text-gray-900 dark:text-white">PauliONE</span><br />
              Vertreten durch Philipp Pauli<br />
              Georg-Ertel-Straße 16A<br />
              76437 Rastatt<br />
              Deutschland<br /><br />
              E-Mail:{" "}
              <a href="mailto:philipp@pauli-one.de" className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white transition-colors">
                philipp@pauli-one.de
              </a><br />
              Telefon: +49 155 63127126
            </div>
          </Section>

          <Section number="2" title="Allgemeine Hinweise zur Datenverarbeitung">
            <P>
              Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der gesetzlichen Datenschutzvorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO).
            </P>
            <P>Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</P>
          </Section>

          <Section number="3" title="Hosting und Bereitstellung der App">
            <P>Die Web-App wird über den Dienst <strong className="text-gray-800 dark:text-gray-200">Vercel</strong> bereitgestellt.</P>
            <Sub title="Anbieter" />
            <div className="leading-7">
              Vercel Inc.<br />
              440 N Barranca Ave #4133<br />
              Covina, CA 91723, USA
            </div>
            <P>Beim Aufruf der Website können technisch notwendige Daten verarbeitet werden, darunter:</P>
            <Ul items={["IP-Adresse", "Browsertyp und Browserversion", "Betriebssystem", "Datum und Uhrzeit des Zugriffs", "Referrer-URL", "angeforderte Inhalte"]} />
            <P>
              Die Verarbeitung erfolgt zur sicheren und stabilen Bereitstellung der Anwendung gemäß Art. 6 Abs. 1 lit. f DSGVO. Es kann nicht ausgeschlossen werden, dass Vercel Server-Logfiles speichert.
            </P>
            <P>
              Weitere Informationen:{" "}
              <ExtLink href="https://vercel.com/legal/privacy-policy">Vercel Datenschutzrichtlinie</ExtLink>
            </P>
          </Section>

          <Section number="4" title="Datenbank und Authentifizierung (Firebase)">
            <P>Zur Speicherung von Nutzerdaten und zur Authentifizierung verwenden wir <strong className="text-gray-800 dark:text-gray-200">Firebase</strong> von Google.</P>
            <Sub title="Anbieter" />
            <div className="leading-7">
              Google Ireland Limited<br />
              Gordon House, Barrow Street<br />
              Dublin 4, Irland
            </div>
            <P>Verarbeitet werden insbesondere:</P>
            <Ul items={["E-Mail-Adresse", "Passwort (verschlüsselt)", "Profilbild (optional)", "Kontodaten", "App-bezogene Nutzungsdaten"]} />
            <P>
              Die Verarbeitung erfolgt zur Bereitstellung von Benutzerkonten gemäß Art. 6 Abs. 1 lit. b DSGVO.
            </P>
            <P>
              Weitere Informationen:{" "}
              <ExtLink href="https://firebase.google.com/support/privacy">Firebase Datenschutzinformationen</ExtLink>
            </P>
          </Section>

          <Section number="5" title="Benutzerkonten">
            <P>
              Nutzer können innerhalb der App ein Benutzerkonto erstellen. Hierbei werden die bei der Registrierung angegebenen Daten gespeichert und verarbeitet. Die Daten werden ausschließlich zur Bereitstellung der jeweiligen Funktionen verwendet.
            </P>
            <P>
              Die Löschung des Accounts kann jederzeit über eine Anfrage an die oben genannte E-Mail-Adresse erfolgen.
            </P>
          </Section>

          <Section number="6" title="Hochladen von Bildern">
            <P>
              Innerhalb der App können Nutzer Bilder hochladen. Die hochgeladenen Inhalte werden ausschließlich zur Bereitstellung der jeweiligen App-Funktionen verarbeitet und gespeichert.
            </P>
            <P>
              Der Nutzer ist selbst dafür verantwortlich, keine rechtswidrigen oder fremden Inhalte ohne entsprechende Rechte hochzuladen.
            </P>
          </Section>

          <Section number="7" title="Push-Benachrichtigungen">
            <P>
              Die iOS-App kann Push-Mitteilungen versenden. Hierfür wird die Geräte-ID bzw. ein Push-Token verarbeitet, um Benachrichtigungen technisch zustellen zu können.
            </P>
            <P>Push-Mitteilungen können jederzeit in den Geräteeinstellungen deaktiviert werden.</P>
            <P>Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</P>
          </Section>

          <Section number="8" title="In-App-Käufe und RevenueCat">
            <P>
              Für die Verwaltung von Abonnements und In-App-Käufen verwenden wir <strong className="text-gray-800 dark:text-gray-200">RevenueCat</strong>.
            </P>
            <Sub title="Anbieter" />
            <div className="leading-7">
              RevenueCat, Inc.<br />
              San Francisco, USA
            </div>
            <P>Bei der Nutzung kostenpflichtiger Funktionen können folgende Daten verarbeitet werden:</P>
            <Ul items={["Kaufstatus", "Abonnementinformationen", "Gerätekennungen", "technische Transaktionsdaten"]} />
            <P>Die Zahlungsabwicklung selbst erfolgt über Apple (App Store).</P>
            <P>
              Weitere Informationen:{" "}
              <ExtLink href="https://www.revenuecat.com/privacy">RevenueCat Privacy Policy</ExtLink>
            </P>
          </Section>

          <Section number="9" title="Newsletter und Benachrichtigungen">
            <P>
              Nutzer können sich freiwillig für Newsletter oder Benachrichtigungen anmelden. Hierbei wird die angegebene E-Mail-Adresse gespeichert und ausschließlich für den jeweiligen Versand genutzt.
            </P>
            <P>Die Einwilligung kann jederzeit widerrufen werden.</P>
            <P>Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO.</P>
          </Section>

          <Section number="10" title="Cookies und Consent-Banner">
            <P>Die Website verwendet technisch notwendige Cookies. Zusätzlich kann ein Consent-Banner eingesetzt werden, um Einwilligungen zur Nutzung bestimmter Technologien einzuholen.</P>
            <P>Rechtsgrundlagen: Art. 6 Abs. 1 lit. c DSGVO · § 25 TTDSG</P>
          </Section>

          <Section number="11" title="Google Fonts">
            <P>Zur einheitlichen Darstellung von Schriftarten nutzt diese Website Google Fonts.</P>
            <Sub title="Anbieter" />
            <div className="leading-7">
              Google Ireland Limited<br />
              Gordon House, Barrow Street<br />
              Dublin 4, Irland
            </div>
            <P>
              Beim Laden der Schriftarten kann eine Verbindung zu Servern von Google hergestellt werden. Weitere Informationen:{" "}
              <ExtLink href="https://policies.google.com/privacy">Google Datenschutzerklärung</ExtLink>
            </P>
          </Section>

          <Section number="12" title="Rechtsgrundlagen der Verarbeitung">
            <P>Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage:</P>
            <Ul items={[
              "Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)",
              "Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)",
              "Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)",
            ]} />
          </Section>

          <Section number="13" title="Speicherdauer">
            <P>
              Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
            </P>
          </Section>

          <Section number="14" title="Rechte betroffener Personen">
            <P>Betroffene Personen haben das Recht auf:</P>
            <Ul items={[
              "Auskunft gemäß Art. 15 DSGVO",
              "Berichtigung gemäß Art. 16 DSGVO",
              "Löschung gemäß Art. 17 DSGVO",
              "Einschränkung der Verarbeitung gemäß Art. 18 DSGVO",
              "Datenübertragbarkeit gemäß Art. 20 DSGVO",
              "Widerspruch gegen die Verarbeitung gemäß Art. 21 DSGVO",
            ]} />
            <P>Außerdem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde.</P>
          </Section>

          <Section number="15" title="Datenverarbeitung außerhalb der Europäischen Union">
            <P>
              Einige eingesetzte Dienste können Daten in Staaten außerhalb der Europäischen Union, insbesondere die USA, übertragen. Die Übermittlung erfolgt auf Grundlage geeigneter Garantien gemäß Art. 44 ff. DSGVO, insbesondere Standardvertragsklauseln der Europäischen Kommission.
            </P>
          </Section>

          <Section number="16" title="Änderungen dieser Datenschutzerklärung">
            <P>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte rechtliche Anforderungen oder neue Funktionen der App anzupassen.
            </P>
          </Section>

          <div className="pt-10 border-t border-gray-100 dark:border-white/5 text-sm text-gray-400 dark:text-gray-600">
            Stand: Mai 2026
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
