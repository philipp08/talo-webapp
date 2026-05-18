import type { Metadata } from "next";
import SeoLandingPage from "../SeoLandingPage";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Punkteverwaltung für Vereine",
  description:
    "Talo digitalisiert die Punkteverwaltung im Verein: Tätigkeiten, Pflichtpunkte, Genehmigungen und Fortschritte transparent erfassen.",
  path: "/vereinssoftware/punkteverwaltung",
  keywords: ["Punkteverwaltung Verein", "Punktesystem Verein", "Pflichtpunkte Verein", "Talo Punkte"],
});

export default function PunkteverwaltungPage() {
  return (
    <SeoLandingPage
      eyebrow="Punkteverwaltung"
      title="Punkteverwaltung für Vereine ohne Excel-Liste."
      intro="Viele Vereine arbeiten mit Pflichtpunkten, Arbeitsstunden oder Helferdiensten. Talo ersetzt verstreute Listen durch einen digitalen Ablauf vom Eintrag bis zur Auswertung."
      slug="/vereinssoftware/punkteverwaltung"
      serviceName="Punkteverwaltung für Vereine"
      sections={[
        {
          title: "Tätigkeiten definieren",
          text: "Der Verein legt fest, welche Tätigkeiten zählen und wie sie bewertet werden. So bleibt die Punktevergabe nachvollziehbar.",
          points: ["Kategorien und Punktwerte verwalten", "Aktive und passive Mitglieder unterscheiden", "Saisonziele zentral festlegen"],
        },
        {
          title: "Einträge prüfen",
          text: "Einträge können direkt gutgeschrieben oder erst durch Admins freigegeben werden. Das reduziert Streit über unklare Nachträge.",
          points: ["Genehmigungsworkflow optional aktivieren", "Ablehnungsgrund dokumentieren", "Ausstehende Punkte getrennt anzeigen"],
        },
        {
          title: "Fortschritt verstehen",
          text: "Mitglieder und Admins sehen, wie viele Punkte schon erreicht wurden und wo noch Lücken bestehen.",
          points: ["Fortschritt pro Mitglied", "Ranglisten und Saisonübersichten", "Export für Vorstand und Verwaltung"],
        },
      ]}
      faq={[
        {
          question: "Was ist der Unterschied zwischen Punkten und Pflichtstunden?",
          answer:
            "Talo arbeitet mit Punkten, weil Vereine damit unterschiedliche Tätigkeiten fairer gewichten können. Eine Stunde Training kann anders bewertet werden als ein ganzer Veranstaltungstag.",
        },
        {
          question: "Kann Talo Einträge automatisch genehmigen?",
          answer:
            "Ja. Vereine können die Genehmigungspflicht deaktivieren. Dann werden Einträge sofort angerechnet, wenn dieser Ablauf zum Verein passt.",
        },
        {
          question: "Können Mitglieder ihren Punktestand selbst sehen?",
          answer:
            "Ja. Mitglieder sehen ihren Fortschritt und ihre Historie, ohne beim Vorstand nachfragen zu müssen.",
        },
      ]}
      related={[
        {
          title: "Vereinssoftware für Sportvereine",
          href: "/vereinssoftware/sportverein",
          text: "Punkte, Helferdienste und Training für Sportvereine.",
        },
        {
          title: "Mitgliederverwaltung im Verein",
          href: "/vereinssoftware/mitgliederverwaltung",
          text: "Rollen, Gruppen und Mitgliederzugänge geordnet verwalten.",
        },
        {
          title: "Funktionen ansehen",
          href: "/funktionen#punkte",
          text: "Mehr zu Punktevergabe, Workflow, Auswertung und Export.",
        },
      ]}
    />
  );
}
