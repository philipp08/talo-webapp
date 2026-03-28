"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import { Search, ArrowRight, Clock, User } from "lucide-react";
import Link from "next/link";

export const posts = [
  {
    slug: "introducing-veto-security-for-associations",
    title: "Introducing Veto: Sicherheit für das nächste Zeitalter der Vereinssoftware",
    excerpt: "Wir stellen Veto vor: Unser neues Kernel-Level Security Framework, das KI-Agenten und Vereinsdaten in einer geschützten Umgebung isoliert.",
    category: "Security",
    author: "Johannes Landgraf",
    date: "28. März 2026",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
  },
  {
    slug: "the-future-of-volunteer-management",
    title: "Die Zukunft des Ehrenamts: Warum klassische Verwaltung nicht mehr ausreicht",
    excerpt: "Wie generative KI und autonome Agenten den Vorständen helfen, sich wieder auf das Wesentliche zu konzentrieren: Die Gemeinschaft.",
    category: "Insights",
    author: "Christian Weichel",
    date: "24. März 2026",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070"
  },
  {
    slug: "why-digitalization-matters-for-local-clubs",
    title: "Warum Digitalisierung für lokale Vereine überlebenswichtig ist",
    excerpt: "Ein detaillierter Guide, wie kleine Vereine durch moderne Tools Mitglieder binden und neue Talente für das Ehrenamt begeistern.",
    category: "Best Practice",
    author: "Talo Team",
    date: "20. März 2026",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2070"
  }
];

export default function BlogPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      <section className="relative pt-[180px] pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 w-full text-center">
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="text-[3.5rem] leading-[1] md:text-[5rem] lg:text-[7rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-8">
              Talo-Blog
            </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.2}>
            <div className="max-w-xl mx-auto relative group">
              <input 
                type="text" 
                placeholder="Suche in Storys..." 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34C759]/50 transition-all pl-14"
              />
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#34C759] transition-colors" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/1">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar py-4 flex items-center justify-center gap-8 whitespace-nowrap">
           {["Alle Stories", "Security", "AI", "Use Cases", "Product Updates", "Insights"].map((cat) => (
             <button key={cat} className="text-sm font-bold text-gray-500 hover:text-black dark:text-[#8A8A8A] dark:hover:text-white transition-colors uppercase tracking-widest">
               {cat}
             </button>
           ))}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <ScrollReveal key={post.slug} direction="up" delay={i * 0.1}>
                <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white dark:bg-[#121212] rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-6 left-6">
                      <span className="px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400 mb-4">
                       <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author}</span>
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                    
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-snug group-hover:text-[#34C759] transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed mb-8 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white pt-6 border-t border-gray-50 dark:border-white/5">
                      Vollständige Story lesen <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
