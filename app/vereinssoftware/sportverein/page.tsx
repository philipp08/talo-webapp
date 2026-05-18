import type { Metadata } from "next";
import SeoLandingPage from "../SeoLandingPage";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Vereinssoftware für Sportvereine",
  description:
    "Talo unterstützt Sportvereine bei Punktevergabe, Helferdiensten, Trainingsbeteiligung, Genehmigungen und Mitgliederverwaltung.",
  path: "/vereinssoftware/sportverein",
  keywords: ["Vereinssoftware Sportverein", "Sportverein Software", "Helferdienste Sportverein", "Punkte Sportverein"],
});

export default function SportvereinSoftwarePage() {
  return (
    <SeoLandingPage
      eyebrow="Sportvereine"
      title="Vereinssoftware für Sportvereine mit klarer Punktevergabe."
      intro="Im Sportverein entstehen viele kleine Einsätze: Training, Spieltag, Verkauf, Aufbau, Abbau oder organisatorische Aufgaben. Talo macht diese Beiträge sichtbar und hilft, Punkte fair zu erfassen."
      slug="/vereinssoftware/sportverein"
      serviceName="Vereinssoftware für Sportvereine"
      sections={[
        {
          title: "Helferdienste erfassen",
          text: "Talo eignet sich für wiederkehrende Dienste rund um Spieltage, Veranstaltungen und Vereinsbetrieb.",
          points: ["Tätigkeiten mit festen Punktwerten anlegen", "Einträge prüfen und freigeben", "Offene Aufgaben im Blick behalten"],
        },
        {
          title: "Training sichtbar machen",
          text: "Trainingsbeteiligung und Engagement lassen sich strukturiert erfassen, ohne Listen zwischen Trainern und Vorstand hin und her zu schicken.",
          points: ["Gruppen und Teams strukturieren", "Trainerrechte getrennt vom Adminzugriff", "Punktehistorie für jedes Mitglied"],
        },
        {
          title: "Saison auswerten",
          text: "Am Ende einer Saison zählt nicht nur der einzelne Eintrag, sondern die Übersicht: Wer hat sein Ziel erreicht, wo fehlen Punkte, welche Daten müssen exportiert werden.",
          points: ["Fortschritt pro Mitglied", "CSV-, Excel- und PDF-Exporte", "Nachvollziehbare Grundlage für Gespräche im Verein"],
        },
      ]}
      faq={[
        {
          question: "Kann Talo Helferdienste im Sportverein abbilden?",
          answer:
            "Ja. Vereine können Tätigkeiten wie Verkauf, Aufbau, Abbau, Training oder Turnierhilfe anlegen und mit Punkten bewerten.",
        },
        {
          question: "Können Trainer Einträge für Mitglieder erfassen?",
          answer:
            "Ja. Trainer können in Talo Einträge für Mitglieder erstellen, ohne automatisch alle Adminrechte des Vereins zu bekommen.",
        },
        {
          question: "Hilft Talo bei Pflichtstunden oder Pflichtpunkten?",
          answer:
            "Talo ist auf Punktziele und transparente Fortschritte ausgelegt. Der Verein kann festlegen, wie viele Punkte pro Saison erreicht werden sollen.",
        },
      ]}
      related={[
        {
          title: "Punkteverwaltung im Verein",
          href: "/vereinssoftware/punkteverwaltung",
          text: "Pflichtpunkte, Kategorien und Fortschritt ohne Tabellenchaos.",
        },
        {
          title: "Mitgliederverwaltung im Verein",
          href: "/vereinssoftware/mitgliederverwaltung",
          text: "Mitglieder, Rollen, Gruppen und Zugänge sauber verwalten.",
        },
        {
          title: "Alle Lösungen",
          href: "/loesungen",
          text: "Weitere Einsatzbereiche für Sport-, Mehrsparten- und Jugendvereine.",
        },
      ]}
    />
  );
}
