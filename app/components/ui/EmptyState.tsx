"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  className = "",
}: {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.04]">
        {Icon ? (
          <Icon size={26} strokeWidth={1.8} className="text-[#52525B]" />
        ) : emoji ? (
          <span className="text-2xl" aria-hidden="true">{emoji}</span>
        ) : null}
      </div>
      <h3 className="font-poppins text-[16px] font-bold text-[#0A0A0A] mb-2">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-[#52525B]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
