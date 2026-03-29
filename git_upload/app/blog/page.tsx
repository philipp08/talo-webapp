"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ScrollReveal from "@/app/components/ScrollReveal";
import { Search, ArrowRight, Clock, User, ChevronRight } from "lucide-react";
import Link from "next/link";

export const posts = [
  {
    slug: "digitalisierung-im-ehrenamt-wie-talo-die-vereinsarbeit-revolutioniert",
    title: "Digitalisierung im Ehrenamt: Wie Talo™ die Vereinsarbeit revolutioniert",
    excerpt: "Die Verwaltung eines Vereins kann eine Herkulesaufgabe sein. Erfahren Sie, wie Talo™ die Brücke zwischen traditionellem Engagement und moderner Effizienz schlägt – ohne komplizierte Technik, dafür mit maximalem Fokus auf die Mitglieder.",
    category: "Vereinsmanagement",
    author: "Talo™ Development Team",
    date: "29. März 2026",
    readTime: "12 min",
    image: ""
  },
  {
    slug: "talo-app-wie-wir-sie-bauen",
    title: "Wie wir Talo bauen – und warum wir es anders machen",
    excerpt: "Ein ehrlicher Einblick hinter die Kulissen: Wie die Talo App entsteht, welche Entscheidungen uns antreiben und warum wir glauben, dass Vereinsverwaltung endlich so gut aussehen kann wie die Apps, die wir täglich nutzen.",
    category: "Produkt",
    author: "Talo™ Development Team",
    date: "1. April 2026",
    readTime: "9 min",
    image: ""
  }
];

export default function BlogPage() {
  const featuredPost = posts[0];

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-[180px] pb-16 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-logo font-medium tracking-tight text-gray-950 dark:text-white mb-8">
              Storys.
            </h1>
            <p className="text-xl text-gray-500 dark:text-[#8A8A8A] max-w-2xl mx-auto leading-relaxed">
              Updates, Insights und Best Practices für das moderne Vereinswesen. Erfahren Sie, wie wir die Zukunft des Ehrenamts gestalten.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories / Search Filter */}
      <section className="border-y border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
              {["Alle", "Sicherheit", "KI", "Einblicke", "Produkt"].map((cat) => (
                <button key={cat} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  {cat}
                </button>
              ))}
           </div>
           <div className="relative group w-full md:w-72">
              <input 
                type="text" 
                placeholder="Story suchen..." 
                className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pl-8 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
        </div>
      </section>

      {/* Featured Post Card (Text Only) */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
           <ScrollReveal direction="up">
              <Link href={`/blog/${featuredPost.slug}`} className="group relative block p-12 lg:p-20 rounded-[40px] border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">{featuredPost.category}</span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-logo font-medium text-gray-950 dark:text-white max-w-4xl leading-[1.1] mb-8">
                       {featuredPost.title}
                    </h2>
                    <div className="flex items-center gap-4 text-gray-500 dark:text-[#8A8A8A] font-medium">
                       <span>{featuredPost.author}</span>
                       <span className="opacity-30">/</span>
                       <span>{featuredPost.date}</span>
                    </div>
                 </div>
              </Link>
           </ScrollReveal>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-32 lg:pb-60 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.slice(1).map((post, i) => (
              <ScrollReveal key={post.slug} direction="up" delay={i * 0.1}>
                <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-3xl p-8 hover:shadow-2xl transition-all">
                  <div className="flex flex-col h-full">
                    <div className="flex gap-2 mb-6">
                       <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[9px] font-black uppercase tracking-widest text-gray-500">
                          {post.category}
                       </span>
                    </div>
                    
                    <h2 className="text-xl lg:text-2xl font-logo font-medium text-gray-950 dark:text-white mb-4 leading-snug group-hover:underline transition-all">
                      {post.title}
                    </h2>
                    
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed mb-8 flex-1 line-clamp-4">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      <span>{post.author}</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Global Newsletter */}
      <section className="bg-gray-950 py-32 lg:py-48 text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
           <ScrollReveal direction="up">
              <h2 className="text-4xl md:text-6xl font-logo font-medium mb-8">Werden Sie Teil der Community.</h2>
              <p className="text-xl text-white/60 max-w-xl mx-auto mb-12">
                 Exklusive Einblicke und News direkt in Ihr Postfach. Kein Spam, nur Relevanz.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                 <input 
                    type="email" 
                    placeholder="E-Mail Adresse" 
                    className="flex-1 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-lg"
                 />
                 <button className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors">
                    Senden
                 </button>
              </form>
           </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}


