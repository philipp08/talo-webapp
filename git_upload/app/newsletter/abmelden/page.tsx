"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type State = "loading" | "success" | "already" | "invalid";

function AbmeldenContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }

    (async () => {
      try {
        const q = query(
          collection(db, "newsletter_subscribers"),
          where("token", "==", token)
        );
        const snap = await getDocs(q);

        if (snap.empty) { setState("invalid"); return; }

        const doc = snap.docs[0];
        if (doc.data().active === false) { setState("already"); return; }

        await updateDoc(doc.ref, { active: false });
        setState("success");
      } catch (_) {
        setState("invalid");
      }
    })();
  }, [token]);

  const content: Record<State, { icon: React.ReactNode; title: string; desc: string }> = {
    loading: {
      icon: <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />,
      title: "Einen Moment …",
      desc: "Deine Abmeldung wird verarbeitet.",
    },
    success: {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
      title: "Erfolgreich abgemeldet.",
      desc: "Du erhältst keine weiteren Newsletter-E-Mails von uns. Schade, dass du gehst — du kannst dich jederzeit wieder anmelden.",
    },
    already: {
      icon: <CheckCircle2 className="w-8 h-8 text-gray-400" />,
      title: "Bereits abgemeldet.",
      desc: "Diese E-Mail-Adresse steht nicht mehr auf der Liste.",
    },
    invalid: {
      icon: <XCircle className="w-8 h-8 text-red-400" />,
      title: "Link ungültig.",
      desc: "Dieser Abmelde-Link ist nicht mehr gültig oder wurde bereits verwendet. Bei Problemen melde dich gerne direkt bei uns.",
    },
  };

  const c = content[state];

  return (
    <main className="min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      <section className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-32">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">{c.icon}</div>
          <h1 className="text-2xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
            {c.title}
          </h1>
          <p className="text-gray-500 dark:text-[#8A8A8A] leading-relaxed mb-8">
            {c.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {state === "success" && (
              <Link
                href="/newsletter"
                className="px-5 py-3 rounded-[12px] border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Wieder anmelden
              </Link>
            )}
            {state === "invalid" && (
              <a
                href="mailto:philipp@pauli-one.de?subject=Newsletter Abmeldeproblem"
                className="px-5 py-3 rounded-[12px] border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Support kontaktieren
              </a>
            )}
            <Link
              href="/"
              className="px-5 py-3 rounded-[12px] bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-all"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function AbmeldenPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white dark:bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </main>
    }>
      <AbmeldenContent />
    </Suspense>
  );
}
