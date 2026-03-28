"use client";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: string;
}

export default function FeatureCard({ icon, title, description, accent = "#080808" }: FeatureCardProps) {
  return (
    <div
      className="glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group transition-all duration-300"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `var(--t-glass-card-border)`;
        (e.currentTarget as HTMLElement).style.transform = `translateY(-4px)`;
      }}
      onMouseLeave={(e) => {
        // Reset to global CSS definition
        (e.currentTarget as HTMLElement).style.borderColor = `var(--t-glass-card-border)`;
        (e.currentTarget as HTMLElement).style.transform = `translateY(0)`;
      }}
    >
      {/* Ambient glow on hover */}
      <div
        className="ambient-blob w-24 h-24 opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-500 -top-8 -right-8"
        style={{ background: accent }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
      >
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-[#8A8A8A]">{description}</p>
      </div>
    </div>
  );
}
