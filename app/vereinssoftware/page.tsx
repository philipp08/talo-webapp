import type { Metadata } from "next";
import SeoLandingPage from "./SeoLandingPage";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Vereinssoftware für Punkte, Mitglieder und Genehmigungen",
  description:
    "Talo bündelt Punkteverwaltung, Mitgliederverwaltung und Genehmigungen in einer ruhigen Vereinssoftware für deutsche Vereine.",
  path: "/vereinssoftware",
  keywords: ["Vereinssoftware", "Vereinsverwaltung Software", "digitale Vereinsverwaltung", "Talo"],
});

export default function VereinssoftwarePage() {
  return (
    <SeoLandingPage
      eyebrow="Vereinssoftware"
      title="Eine Vereinssoftware für Punkte, Mitglieder und klare Abläufe."
      intro="Talo hilft Vorständen, Trainern und Mitgliedern, Vereinsarbeit ohne Tabellenchaos zu organisieren. Punkte, Tätigkeiten, Genehmigungen und Mitglieder bleiben an einem Ort nachvollziehbar."
      slug="/vereinssoftware"
      serviceName="Vereinssoftware"
      sections={[
        {
          title: "Für Vorstände",
          text: "Der Vorstand sieht, welche Tätigkeiten eingetragen wurden, welche Punkte fehlen und wo noch Entscheidungen offen sind.",
          points: ["Schneller Überblick über offene Genehmigungen", "Exportierbare Daten für Auswertungen", "Rollen und Berechtigungen für klare Zuständigkeiten"],
        },
        {
          title: "Für Trainer und Teams",
          text: "Trainer können Einträge vorbereiten und Mitglieder ohne Umwege in die laufende Saison einbinden.",
          points: ["Einträge für Mitglieder erfassen", "Teams und Gruppen sauber strukturieren", "Ankündigungen und Abläufe zentral halten"],
        },
        {
          title: "Für Mitglieder",
          text: "Mitglieder sehen ihren Fortschritt und reichen Tätigkeiten direkt digital ein, statt Punkte nachträglich in Listen zu suchen.",
          points: ["Eigener Punktestand in Echtzeit", "Nachvollziehbare Historie", "Weniger Rückfragen an Vorstand und Trainer"],
        },
      ]}
      faq={[
        {
          question: "Welche Vereinssoftware-Funktionen deckt Talo ab?",
          answer:
            "Talo konzentriert sich auf Punktevergabe, Tätigkeiten, Genehmigungen, Mitgliederverwaltung, Rollen, Auswertungen und Exporte. Dadurch bleibt das System klar statt überladen.",
        },
        {
          question: "Ist Talo nur für Sportvereine gedacht?",
          answer:
            "Nein. Sportvereine sind ein typischer Einsatzfall, aber Talo passt auch zu Vereinen und Gruppen, die Engagement, Dienste oder Pflichtpunkte transparent verwalten möchten.",
        },
        {
          question: "Kann ein Verein klein starten?",
          answer:
            "Ja. Kleine Vereine können mit dem Starter-Plan beginnen und später auf größere Pläne wechseln, wenn mehr Mitglieder oder Funktionen gebraucht werden.",
        },
      ]}
      related={[
        {
          title: "Vereinssoftware für Sportvereine",
          href: "/vereinssoftware/sportverein",
          text: "Für Trainingsdienste, Spieltage, Helferlisten und Punkte im Sportverein.",
        },
        {
          title: "Punkteverwaltung im Verein",
          href: "/vereinssoftware/punkteverwaltung",
          text: "Wie Talo Tätigkeiten, Pflichtpunkte und Fortschritte transparent macht.",
        },
        {
          title: "Mitgliederverwaltung im Verein",
          href: "/vereinssoftware/mitgliederverwaltung",
          text: "Profile, Rollen, Gruppen und Zugänge für den Vereinsalltag.",
        },
      ]}
    />
  );
}
