import type { Metadata } from "next";
import SeoLandingPage from "../SeoLandingPage";
import { createPageMetadata } from "@/app/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Mitgliederverwaltung für Vereine",
  description:
    "Mit Talo verwalten Vereine Mitglieder, Rollen, Gruppen, Zugänge und Punktestände digital und nachvollziehbar.",
  path: "/vereinssoftware/mitgliederverwaltung",
  keywords: ["Mitgliederverwaltung Verein", "Vereinsmitglieder verwalten", "digitale Mitgliederverwaltung", "Talo Mitglieder"],
});

export default function MitgliederverwaltungPage() {
  return (
    <SeoLandingPage
      eyebrow="Mitgliederverwaltung"
      title="Mitgliederverwaltung für Vereine mit Rollen und Punktestand."
      intro="Talo verbindet Mitgliederverwaltung mit dem tatsächlichen Vereinsalltag: Wer ist Mitglied, welche Rolle hat die Person, welcher Gruppe gehört sie an und wie steht es um die Punkte?"
      slug="/vereinssoftware/mitgliederverwaltung"
      serviceName="Mitgliederverwaltung für Vereine"
      sections={[
        {
          title: "Profile statt verstreuter Listen",
          text: "Mitgliedsdaten, Rolle, Typ und Punktestand liegen in einem System. Das reduziert doppelte Pflege und veraltete Tabellen.",
          points: ["Mitgliederprofile verwalten", "Aktiv, passiv, Jugend oder Vorstand unterscheiden", "Profilbilder und Basisdaten pflegen"],
        },
        {
          title: "Rollen sauber trennen",
          text: "Nicht jede Person braucht Adminrechte. Talo unterscheidet zwischen Admins, Trainern und Mitgliedern.",
          points: ["Adminrechte gezielt vergeben", "Trainer können operative Aufgaben übernehmen", "Mitglieder sehen nur relevante eigene Daten"],
        },
        {
          title: "Gruppen und Teams ordnen",
          text: "Gerade bei größeren Vereinen ist die Struktur entscheidend. Gruppen helfen, Abteilungen, Teams oder Trainingsgruppen übersichtlich zu halten.",
          points: ["Mitglieder Gruppen zuweisen", "Mehrere Vereine pro Konto möglich", "Übersichten für Vorstand und Trainer"],
        },
      ]}
      faq={[
        {
          question: "Kann Talo mehrere Gruppen oder Abteilungen abbilden?",
          answer:
            "Ja. Talo unterstützt Gruppen und Trainingsgruppen, damit Vereine Mitglieder nicht nur als lange Gesamtliste verwalten müssen.",
        },
        {
          question: "Sind Rollen und Mitgliedertypen dasselbe?",
          answer:
            "Nein. Rollen steuern Rechte in der App, etwa Admin oder Trainer. Mitgliedertypen bestimmen, wie ein Mitglied im Punktesystem behandelt wird.",
        },
        {
          question: "Können Mitglieder mehreren Vereinen angehören?",
          answer:
            "Ja. Ein Talo-Konto kann mit mehreren Vereinen verknüpft sein. Mitglieder können dann zwischen ihren Vereinen wechseln.",
        },
      ]}
      related={[
        {
          title: "Punkteverwaltung im Verein",
          href: "/vereinssoftware/punkteverwaltung",
          text: "Mitgliedsprofile mit Punkten, Tätigkeiten und Fortschritt verbinden.",
        },
        {
          title: "Vereinssoftware für Sportvereine",
          href: "/vereinssoftware/sportverein",
          text: "Für Teams, Training, Helferdienste und Saisonübersichten.",
        },
        {
          title: "Hilfe-Center",
          href: "/hilfe",
          text: "Detailfragen zu Rollen, Gruppen, Einrichtung und Datenschutz.",
        },
      ]}
    />
  );
}
