"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ScrollReveal from "@/app/components/ScrollReveal";
import { Search, ArrowRight, Clock, User, ChevronRight } from "lucide-react";
import Link from "next/link";

export const posts = [
  {
    slug: "introducing-veto-security-for-associations",
    title: "Introducing Veto: Security for the next era of software",
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
  const featuredPost = posts[0];

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero Header (Ona Style) */}
      <section className="relative pt-[180px] pb-16 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-gray-950 dark:text-white mb-8">
              Stories.
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
              {["Alle", "Security", "AI", "Insights", "Product"].map((cat) => (
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

      {/* Featured Post Card */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
           <ScrollReveal direction="up">
              <Link href={`/blog/${featuredPost.slug}`} className="group relative block aspect-[21/10] rounded-[40px] overflow-hidden bg-gray-100">
                 <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 lg:p-16 flex flex-col justify-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-4">{featuredPost.category}</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-white max-w-3xl leading-[1.1] mb-6">
                       {featuredPost.title}
                    </h2>
                    <div className="flex items-center gap-4 text-white/80 font-medium">
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
                <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl transition-all">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex gap-2 mb-6">
                       <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[9px] font-black uppercase tracking-widest text-gray-500">
                          {post.category}
                       </span>
                    </div>
                    
                    <h2 className="text-xl lg:text-2xl font-serif font-medium text-gray-950 dark:text-white mb-4 leading-snug group-hover:underline transition-all">
                      {post.title}
                    </h2>
                    
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed mb-8 flex-1 line-clamp-3">
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

      {/* Global Newsletter (Ona Style) */}
      <section className="bg-gray-950 py-32 lg:py-48 text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
           <ScrollReveal direction="up">
              <h2 className="text-4xl md:text-6xl font-serif font-medium mb-8">Join the inner circle.</h2>
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
                    Join
                 </button>
              </form>
           </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}

