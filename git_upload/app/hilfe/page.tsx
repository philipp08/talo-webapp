"use client";

import { useState, useMemo } from "react";
import Navbar from "@/app/components/Navbar";
import ScrollReveal from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import {
  Search, HelpCircle, Mail, MessageCircle, FileText,
  ChevronRight, Zap, ShieldCheck, CreditCard, Users,
  Settings2, ClipboardList, CheckSquare, BarChart2, Download,
} from "lucide-react";

const sections = [
  {
    id: "setup",
    title: "Einrichtung & Setup",
    icon: <Zap className="w-5 h-5" />,
    items: [
      {
        q: "Wie erstelle ich einen neuen Verein?",
        a: "Nach der Registrierung wirst du direkt durch die Vereinserstellung geführt. Du gibst den Vereinsnamen, die Pflichtpunkte pro Saison und den Saisontyp an – fertig. Der Verein ist sofort aktiv und du bist automatisch Admin.",
      },
      {
        q: "Wie lade ich Mitglieder ein?",
        a: "Im Dashboard unter „Mitgliederverwaltung” findest du den Button „Neues Mitglied”. Du suchst zunächst nach der E-Mail-Adresse. Ist die Person bereits in Talo registriert, kannst du sie direkt hinzufügen. Für neue Personen vergibst du Vor- und Nachname – Talo erstellt automatisch ein Konto und zeigt dir das Einmalpasswort an, das du per E-Mail weiterleiten kannst.",
      },
      {
        q: "Was passiert nach dem ersten Login eines Mitglieds?",
        a: "Das Mitglied landet direkt auf dem Dashboard und sieht seinen aktuellen Punktestand, das Jahresziel und seine letzten Einträge. In der iOS-App erscheint beim allerersten Login zusätzlich ein kurzer Einführungs-Carousel.",
      },
      {
        q: "Wie konfiguriere ich die Pflichtpunkte?",
        a: "Unter „Einstellungen” im Admin-Bereich kannst du die Anzahl der Pflichtpunkte für aktive Mitglieder festlegen. Passive Mitglieder erhalten automatisch 30 % dieses Ziels, Jugend- und Vorstandsmitglieder sind befreit.",
      },
      {
        q: "Welchen Saisontyp soll ich wählen?",
        a: "Talo bietet drei Optionen: Kalenderjahr (Jan–Dez), Vereinssaison (z. B. Okt–Sep) und Schuljahr (Sep–Jul). Wähle den Zeitraum, der zu eurer Vereinsstruktur passt. Die Einstellung lässt sich jederzeit anpassen.",
      },
      {
        q: "Muss die Genehmigungspflicht aktiviert sein?",
        a: "Das ist optional. Mit aktivierter Genehmigungspflicht landen alle Einträge von regulären Mitgliedern zunächst in der Warteschlange und müssen von einem Admin freigegeben werden. Deaktivierst du die Option, werden Einträge sofort angerechnet. Admins und Trainer erhalten grundsätzlich immer eine sofortige Gutschrift.",
      },
      {
        q: "Kann ich mehreren Vereinen gleichzeitig angehören?",
        a: "Ja. Ein Talo-Konto kann mit mehreren Vereinen verknüpft sein. In der App und der Web-Console erscheint dann ein Vereinswechsler, mit dem du zwischen deinen Vereinen wechseln kannst.",
      },
    ],
  },
  {
    id: "eintragen",
    title: "Eintragen & Tätigkeiten",
    icon: <ClipboardList className="w-5 h-5" />,
    items: [
      {
        q: "Wie trage ich eine Tätigkeit ein?",
        a: "Klicke im Dashboard auf „Eintragen” oder nutze den weißen Button „+ Eintragen”. Du wählst die Tätigkeit aus dem Katalog, bestätigst das Datum und kannst optional eine Notiz hinzufügen. Die Punkte werden automatisch aus dem Katalog übernommen.",
      },
      {
        q: "Was bedeuten die Kategorien A, B, C und S?",
        a: "Die Kategorien helfen, Tätigkeiten zu strukturieren. Typisch: A = hochwertige Vereinseinsätze (z. B. Events), B = Standardtätigkeiten (z. B. Training), C = leichte Tätigkeiten (z. B. Materialtransport), S = Sonderaufgaben. Jede Kategorie kann eigene Tätigkeiten mit individuellen Punktwerten enthalten.",
      },
      {
        q: "Kann ich Einträge für andere Mitglieder erstellen?",
        a: "Ja – aber nur als Admin oder Trainer. Du siehst dann im Eintragen-Formular ein zusätzliches Feld zur Mitgliederauswahl. Einträge von Admins und Trainern werden sofort genehmigt, unabhängig von der Genehmigungseinstellung des Vereins.",
      },
      {
        q: "Kann ich das Datum eines Eintrags rückdatieren?",
        a: "Ja. Das Datum ist frei wählbar und standardmäßig auf den heutigen Tag gesetzt. Du kannst jeden beliebigen Zeitpunkt innerhalb der laufenden Saison eintragen.",
      },
      {
        q: "Kann ich einem Eintrag ein Foto anhängen?",
        a: "Das ist aktuell in der iOS-App möglich. Du kannst beim Eintragen ein Bild als Nachweis hochladen, das Admins direkt in der Genehmigungsansicht einsehen können.",
      },
      {
        q: "Wie verwalte ich den Tätigkeitskatalog?",
        a: "Unter „Tätigkeiten” im Dashboard kannst du als Admin neue Tätigkeiten anlegen, bestehende bearbeiten oder löschen. Jede Tätigkeit hat einen Namen, eine Kategorie (A/B/C/S) und einen Punktwert. Reguläre Mitglieder sehen den Katalog nur zum Auswählen.",
      },
      {
        q: "Was passiert mit Einträgen, wenn eine Tätigkeit gelöscht wird?",
        a: "Bestehende Einträge bleiben unberührt. Der Tätigkeitsname und die Punkte bleiben am Eintrag erhalten – nur neue Einträge können diese Tätigkeit nicht mehr wählen.",
      },
    ],
  },
  {
    id: "genehmigungen",
    title: "Genehmigungen",
    icon: <CheckSquare className="w-5 h-5" />,
    items: [
      {
        q: "Wo finde ich ausstehende Einträge?",
        a: "Im Dashboard gibt es den Bereich „Genehmigungen”, der nur für Admins sichtbar ist. Dort erscheinen alle Einträge mit Status „Ausstehend” als Karten. In der iOS-App ist die Genehmigungsansicht als eigener Tab zugänglich.",
      },
      {
        q: "Wie genehmige oder lehne ich einen Eintrag ab?",
        a: "Web-Console: Grüner „Genehmigen”- oder roter „Ablehnen”-Button auf der Karte. iOS-App: Tippe auf die Aktionsbuttons oder nutze Wischgesten – nach rechts wischen genehmigt, nach links wischen lehnt sofort ab.",
      },
      {
        q: "Kann ich beim Ablehnen einen Grund angeben?",
        a: "Ja. Bei der Ablehnung öffnet sich ein Formular, in dem du optional einen Ablehnungsgrund eingibst. Dieser wird dem Mitglied zusammen mit dem Eintrag angezeigt. In der iOS-App stehen außerdem Schnellauswahl-Chips bereit (z. B. „Nachweis fehlt”, „Falscher Zeitraum”).",
      },
      {
        q: "Sehen Mitglieder, warum ihr Eintrag abgelehnt wurde?",
        a: "Ja. Abgelehnte Einträge erscheinen in der Eintrags-History des Mitglieds mit dem roten Status-Badge und dem angegebenen Ablehnungsgrund, sofern einer hinterlegt wurde.",
      },
      {
        q: "Werden Admins über neue Einträge benachrichtigt?",
        a: "In der iOS-App können Push-Benachrichtigungen aktiviert werden, die bei neuen ausstehenden Einträgen informieren. In der Web-Console zeigt das Dashboard-Widget die aktuelle Anzahl offener Genehmigungen.",
      },
      {
        q: "Kann ein Trainer Einträge genehmigen?",
        a: "Nein. Die Genehmigungsfunktion ist ausschließlich Admins vorbehalten. Trainer können Einträge für andere Mitglieder erstellen (die dann sofort genehmigt werden), aber keine ausstehenden Einträge anderer Mitglieder freigeben.",
      },
    ],
  },
  {
    id: "punkte",
    title: "Punkte & Fortschritt",
    icon: <BarChart2 className="w-5 h-5" />,
    items: [
      {
        q: "Wie berechnet sich das Jahresziel?",
        a: "Das Ziel basiert auf den in den Vereinseinstellungen festgelegten Pflichtpunkten. Aktive Mitglieder müssen 100 % erreichen, passive Mitglieder 30 %. Jugend- und Vorstandsmitglieder sind vollständig befreit und haben kein Punkteziel.",
      },
      {
        q: "Was ist der Unterschied zwischen „Bestätigt” und „Ausstehend”?",
        a: "Bestätigte Punkte sind genehmigt und fließen in den Fortschrittsbalken sowie das Leaderboard ein. Ausstehende Punkte sind erfasst, aber noch nicht freigegeben – sie zählen noch nicht für das Ziel.",
      },
      {
        q: "Was passiert, wenn ein Mitglied sein Ziel nicht erreicht?",
        a: "Der Fortschrittsbalken bleibt unter 100 %. In der iOS-App wird zusätzlich ein „Fehlende Punkte”-Hinweis mit dem berechneten Ausgleichsbetrag angezeigt, sofern der Verein einen Ausgleichssatz konfiguriert hat.",
      },
      {
        q: "Wann wird der Fortschrittsbalken grün?",
        a: "Sobald das Mitglied 100 % seines individuellen Ziels mit genehmigten Punkten erreicht hat. Bei befreiten Mitgliedertypen (Jugend, Vorstand) ist der Balken dauerhaft grün.",
      },
      {
        q: "Wo sehe ich das Leaderboard?",
        a: "In der Mitgliederverwaltung gibt es eine Leaderboard-Ansicht. Die Top 3 werden auf einem Podest mit Medaillen-Emojis hervorgehoben, alle weiteren Mitglieder erscheinen als gerankte Liste mit ihren genehmigten Punkten.",
      },
      {
        q: "Kann ich Punkte manuell korrigieren?",
        a: "Admins können einzelne Einträge löschen. Wenn ein Fehler passiert ist, löschst du den fehlerhaften Eintrag und erstellst einen korrekten neuen Eintrag für das Mitglied.",
      },
      {
        q: "Werden Punkte am Saisonende zurückgesetzt?",
        a: "Ja. Mit dem Ende der konfigurierten Saison (Kalenderjahr, Vereinssaison oder Schuljahr) beginnt die Punktezählung neu. Historische Einträge bleiben in der Datenbank erhalten und sind im Verlauf einsehbar.",
      },
    ],
  },
  {
    id: "roles",
    title: "Rollen & Rechte",
    icon: <Users className="w-5 h-5" />,
    items: [
      {
        q: "Welche Rollen gibt es in Talo?",
        a: "Es gibt drei Rollen: Admin (voller Zugriff auf alle Funktionen), Trainer (kann Einträge für andere erstellen, hat Zugriff auf Mitgliederliste) und Mitglied (kann eigene Einträge erfassen und Statistiken einsehen).",
      },
      {
        q: "Was kann ein Trainer, was ein Mitglied nicht kann?",
        a: "Trainer können Einträge für beliebige Vereinsmitglieder erstellen (diese werden sofort gutgeschrieben), die Mitgliederliste einsehen und Ankündigungen verfassen. Sie haben jedoch keinen Zugriff auf Genehmigungen, Tätigkeitsverwaltung oder Vereinseinstellungen.",
      },
      {
        q: "Was kann nur ein Admin?",
        a: "Ausschließlich Admins können: Mitglieder hinzufügen oder entfernen, Mitglieder-Rollen ändern, Einträge genehmigen oder ablehnen, den Tätigkeitskatalog bearbeiten und die Vereinseinstellungen anpassen.",
      },
      {
        q: "Wie ändere ich die Rolle eines Mitglieds?",
        a: "Öffne das Mitgliederprofil über die Mitgliederverwaltung. Im Bearbeitungsbereich gibt es separate Toggles für „Admin” und „Trainer”. Die Änderung gilt sofort.",
      },
      {
        q: "Welche Mitgliedertypen gibt es und was ist der Unterschied zur Rolle?",
        a: "Mitgliedertypen (Aktiv, Passiv, Jugend, Vorstand) bestimmen das Punkteziel. Rollen (Admin, Trainer, Mitglied) bestimmen die Zugriffsrechte in der App. Beides ist unabhängig voneinander konfigurierbar.",
      },
      {
        q: "Kann ein Mitglied gleichzeitig Admin in mehreren Vereinen sein?",
        a: "Ja. Rollen gelten immer nur für einen spezifischen Verein. Dieselbe Person kann in Verein A Admin und in Verein B normales Mitglied sein.",
      },
    ],
  },
  {
    id: "mitglieder",
    title: "Mitgliederverwaltung",
    icon: <HelpCircle className="w-5 h-5" />,
    items: [
      {
        q: "Wie entferne ich ein Mitglied aus dem Verein?",
        a: "Öffne das Profil des Mitglieds in der Mitgliederverwaltung und scrolle nach unten zum Button „Aus Verein entfernen”. Ist das Mitglied nur in diesem einen Verein, wird auch sein gesamtes Konto deaktiviert. Bei Mehrvereinsmitgliedschaft wird nur die Vereinszugehörigkeit aufgelöst.",
      },
      {
        q: "Kann ich Zugangsdaten erneut senden?",
        a: "Ja. Im Mitgliederprofil gibt es den Button „Zugangsdaten erneut senden”. Talo schickt dann eine E-Mail mit den Zugangsdaten an die hinterlegte Adresse.",
      },
      {
        q: "Wie kann ein Mitglied sein Passwort ändern?",
        a: "Unter „Einstellungen” gibt es den Button „Passwort zurücksetzen”. Talo sendet dann einen Reset-Link an die hinterlegte E-Mail-Adresse. Das Passwort kann damit eigenständig geändert werden.",
      },
      {
        q: "Kann ein Mitglied sein eigenes Profilbild hochladen?",
        a: "Ja. Mitglieder können in ihren Einstellungen ein eigenes Profilbild hochladen. Admins können das Bild auch über das Mitgliederprofil in der Verwaltung ändern.",
      },
      {
        q: "Wie filtere ich Mitglieder nach Typ?",
        a: "In der Mitgliederliste werden Mitglieder automatisch nach Typ gruppiert: Aktiv, Vorstand, Passiv, Jugend. Zusätzlich gibt es eine Suchfunktion, um Mitglieder direkt nach Name zu finden.",
      },
      {
        q: "Was passiert mit den Einträgen eines Mitglieds, wenn es entfernt wird?",
        a: "Alle Einträge des Mitglieds werden zusammen mit dem Mitgliedsdatensatz aus dem Verein gelöscht. Dieser Vorgang ist nicht rückgängig zu machen.",
      },
    ],
  },
  {
    id: "security",
    title: "Sicherheit & Datenschutz",
    icon: <ShieldCheck className="w-5 h-5" />,
    items: [
      {
        q: "Wo werden die Daten gespeichert?",
        a: "Talo nutzt Google Firebase als Datenbankinfrastruktur (Google Ireland Limited, Dublin). Die Datenhaltung erfolgt gemäß DSGVO-Anforderungen. Details dazu findest du in unserer Datenschutzerklärung.",
      },
      {
        q: "Ist Talo DSGVO-konform?",
        a: "Ja. Talo verarbeitet personenbezogene Daten ausschließlich auf Grundlage der DSGVO. Es werden nur die für den Betrieb notwendigen Daten erhoben. Es findet keine Datenweitergabe an Dritte zu Werbezwecken statt.",
      },
      {
        q: "Werden Passwörter im Klartext gespeichert?",
        a: "Nein. Passwörter werden ausschließlich verschlüsselt über Firebase Authentication gespeichert. Weder Talo noch dein Vereinsadmin hat Zugriff auf dein Passwort.",
      },
      {
        q: "Wie kann ich meine Daten löschen lassen?",
        a: "Schreibe eine formlose E-Mail an philipp@pauli-one.de mit dem Betreff „Datenlöschung”. Wir löschen alle personenbezogenen Daten innerhalb von 30 Tagen gemäß Art. 17 DSGVO.",
      },
      {
        q: "Werden Daten für Werbung genutzt?",
        a: "Nein. Talo ist ein werbefreies Produkt. Deine Vereinsdaten werden ausschließlich für den Betrieb der Plattform genutzt und niemals an Dritte verkauft oder für Werbezwecke verwendet.",
      },
      {
        q: "Was passiert mit den Daten, wenn ich den Verein lösche?",
        a: "Beim Löschen eines Vereins werden alle verknüpften Mitgliederdaten, Einträge, Tätigkeiten und Bilder unwiderruflich entfernt. Dieser Vorgang kann nicht rückgängig gemacht werden.",
      },
    ],
  },
  {
    id: "billing",
    title: "Preise & Abrechnung",
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        q: "Was kostet Talo?",
        a: "Aktuelle Preisinformationen findest du auf unserer Preisseite unter talo.app/preise. Talo ist speziell für ehrenamtliche Strukturen und Vereine konzipiert.",
      },
      {
        q: "Gibt es eine kostenlose Testphase?",
        a: "Ja. Du kannst Talo unverbindlich testen. Auf der Preisseite findest du alle Details zu Umfang und Dauer der Testphase.",
      },
      {
        q: "Wie läuft die Abrechnung?",
        a: "Die Abrechnung erfolgt über den App Store (iOS-App) bzw. direkt über Talo. Für In-App-Käufe und Abonnements wird RevenueCat als Verwaltungsplattform eingesetzt. Die Zahlungsabwicklung erfolgt über Apple.",
      },
      {
        q: "Kann ich jederzeit kündigen?",
        a: "Ja. Es gibt keine Mindestlaufzeit. Du kannst im App Store oder direkt in der App kündigen. Nach Ablauf des bezahlten Zeitraums wird dein Konto auf den verfügbaren Basisumfang zurückgestuft – deine Daten bleiben erhalten.",
      },
      {
        q: "Gibt es Sonderkonditionen für gemeinnützige Vereine?",
        a: "Talo ist von Grund auf für Vereine und ehrenamtliche Strukturen gebaut. Schreib uns unter philipp@pauli-one.de – wir finden gemeinsam eine passende Lösung für euch.",
      },
    ],
  },
  {
    id: "technical",
    title: "Technik & Probleme",
    icon: <Settings2 className="w-5 h-5" />,
    items: [
      {
        q: "Gibt es eine native App?",
        a: "Ja, Talo ist als native iOS-App verfügbar. Die Web-Console (console.talo.app) ist vollständig responsiv und funktioniert auf jedem Gerät über den Browser.",
      },
      {
        q: "Die Seite lädt nicht – was tun?",
        a: "Prüfe deine Internetverbindung. Hilft das nicht, leere den Browser-Cache (Strg+Shift+R bzw. Cmd+Shift+R) oder öffne die Seite im Inkognito-Modus. Bei anhaltenden Problemen melde dich bei uns.",
      },
      {
        q: "Ich habe mein Passwort vergessen – wie komme ich rein?",
        a: "Klicke auf der Login-Seite auf „Passwort vergessen”. Gib deine E-Mail-Adresse ein – du erhältst innerhalb weniger Minuten einen Reset-Link. Prüfe auch deinen Spam-Ordner.",
      },
      {
        q: "Ich erhalte keine E-Mails von Talo – woran liegt das?",
        a: "Prüfe deinen Spam- bzw. Junk-Ordner. Füge philipp@pauli-one.de zu deinen Kontakten hinzu, damit künftige E-Mails zuverlässig ankommen. Bei weiterhin ausbleibenden E-Mails kontaktiere uns direkt.",
      },
      {
        q: "Kann ich Talo auf mehreren Geräten nutzen?",
        a: "Ja. Du kannst dich mit demselben Konto auf beliebig vielen Geräten anmelden. Alle Daten werden in Echtzeit synchronisiert.",
      },
      {
        q: "Wie aktualisiere ich die iOS-App?",
        a: "Updates werden automatisch über den App Store verteilt. Du kannst auch manuell unter App Store → Aktualisierungen nach der neuesten Version suchen.",
      },
      {
        q: "Wo melde ich einen Fehler oder schlage eine Funktion vor?",
        a: "Schreib uns eine E-Mail an philipp@pauli-one.de oder nutze das Kontaktformular auf dieser Seite. Wir freuen uns über jedes Feedback und prüfen Verbesserungsvorschläge regelmäßig.",
      },
    ],
  },
];

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    const results: { section: string; q: string; a: string }[] = [];
    sections.forEach((s) => {
      s.items.forEach((item) => {
        if (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) {
          results.push({ section: s.title, q: item.q, a: item.a });
        }
      });
    });
    return results;
  }, [query]);

  const activeData = sections.find((s) => s.id === activeSection)!;

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 lg:pt-[160px] pb-12 lg:pb-20 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 w-full text-center lg:text-left">
          <ScrollReveal direction="up" delay={0.1}>
            <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase mb-4 block">
              HILFECENTER
            </span>
            <h1 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tight font-logo text-gray-950 dark:text-white mb-8 leading-[1.1] md:leading-[1.05]">
              Wie können wir<br className="hidden md:block" /> euch heute{" "}
              <span className="opacity-40">unterstützen?</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.25}>
            <div className="max-w-xl mx-auto lg:mx-0 relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suche nach Themen (z. B. Punkte, Genehmigung, Passwort)…"
                className="w-full px-6 py-5 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/10 transition-all pl-14 font-medium text-[14px]"
              />
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors text-xl leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">

          {/* ── Search results ── */}
          {searchResults !== null ? (
            <div className="flex flex-col gap-10">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {searchResults.length === 0
                  ? `Keine Ergebnisse für „${query}”`
                  : `${searchResults.length} Ergebnis${searchResults.length !== 1 ? "se" : ""} für „${query}”`}
              </p>
              {searchResults.map((res, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold tracking-[0.15em] text-gray-400 dark:text-gray-500 uppercase">
                    {res.section}
                  </span>
                  <h4 className="text-[17px] font-bold text-gray-900 dark:text-white">{res.q}</h4>
                  <p className="text-[15px] text-gray-600 dark:text-[#8A8A8A] leading-relaxed">{res.a}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-16">

              {/* Sidebar */}
              <div className="lg:w-1/4 shrink-0 overflow-x-auto lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0">
                <div className="sticky top-32 flex lg:flex-col gap-2 pb-4 lg:pb-0 min-w-max lg:min-w-0">
                  <h3 className="hidden lg:block text-[10px] font-bold tracking-[0.15em] text-gray-400 dark:text-gray-500 uppercase mb-6 px-4">
                    KATEGORIEN
                  </h3>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3.5 rounded-xl transition-all font-medium whitespace-nowrap lg:whitespace-normal ${
                        activeSection === section.id
                          ? "bg-black/90 text-white dark:bg-white/10 dark:text-white shadow-lg"
                          : "text-gray-500 dark:text-[#8A8A8A] hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <div className={`p-1.5 lg:p-2 rounded-lg transition-colors ${activeSection === section.id ? "bg-white/20" : "bg-gray-100 dark:bg-white/5"}`}>
                        {section.icon}
                      </div>
                      <span className="text-[13px] lg:text-[14px]">{section.title}</span>
                      {activeSection === section.id && <ChevronRight className="hidden lg:block w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-3/4 flex flex-col gap-24 min-h-[400px]">
                <ScrollReveal key={activeSection} direction="up" delay={0.05}>
                  {/* Section header */}
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-10 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white/10 flex items-center justify-center text-white shrink-0">
                      {activeData.icon}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold font-logo text-gray-950 dark:text-white text-center lg:text-left">
                      {activeData.title}
                    </h2>
                  </div>

                  {/* Q&A */}
                  <div className="flex flex-col gap-10">
                    {activeData.items.map((item, j) => (
                      <div key={j} className="group flex flex-col gap-3 text-center lg:text-left">
                        <h4 className="text-[17px] font-bold text-gray-900 dark:text-white">
                          {item.q}
                        </h4>
                        <p className="text-[15px] text-gray-600 dark:text-[#8A8A8A] leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>

                {/* Contact CTA */}
                <div className="bg-[#080808] dark:bg-[#101010] rounded-[40px] p-8 md:p-14 text-center mt-4 relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-logo">Noch eine Frage?</h3>
                    <p className="text-gray-400 mb-8 text-base max-w-md mx-auto">
                      Unser Team hilft euch Mo–Fr von 09:00 bis 18:00 Uhr gerne weiter.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <a
                        href="mailto:philipp@pauli-one.de"
                        className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-bold hover:scale-105 transition-all text-sm"
                      >
                        <Mail size={16} /> philipp@pauli-one.de
                      </a>
                      <a
                        href="mailto:philipp@pauli-one.de?subject=Support-Anfrage"
                        className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 text-white font-bold border border-white/10 hover:bg-white/20 transition-all text-sm"
                      >
                        <MessageCircle size={16} /> Nachricht schreiben
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Resources */}
      <section className="py-24 border-t border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase mb-12 text-center">
            WEITERE RESSOURCEN
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/TALO-Benutzerhandbuch.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-[32px] bg-gray-50 dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm">
                <FileText className="text-blue-500 w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Benutzerhandbuch</h4>
              <p className="text-sm text-gray-500 dark:text-[#8A8A8A] mb-4 flex-1">
                Alle Funktionen der Web-Console und iOS-App im Detail erklärt – als PDF zum Download.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                <Download size={13} /> PDF herunterladen
              </div>
            </Link>

            <a
              href="mailto:philipp@pauli-one.de?subject=Demo-Anfrage"
              className="p-8 rounded-[32px] bg-gray-50 dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm">
                <MessageCircle className="text-emerald-500 w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Persönliche Demo</h4>
              <p className="text-sm text-gray-500 dark:text-[#8A8A8A] mb-4 flex-1">
                Wir zeigen euch Talo live und beantworten alle Fragen direkt im Gespräch.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                Demo anfragen <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a
              href="/datenschutz"
              className="p-8 rounded-[32px] bg-gray-50 dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="text-gray-400 w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Datenschutz & DSGVO</h4>
              <p className="text-sm text-gray-500 dark:text-[#8A8A8A] mb-4 flex-1">
                Vollständige Datenschutzerklärung – wie Talo eure Daten schützt und verarbeitet.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                Zur Datenschutzerklärung <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
