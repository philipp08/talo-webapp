interface StepCardProps {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function StepCard({ number, title, description, isLast }: StepCardProps) {
  return (
    <div className="flex gap-5 relative">
      {/* Number + line */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 font-logo bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
        >
          {number}
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 mt-3 bg-gradient-to-b from-gray-200 to-transparent dark:from-white/15 dark:to-transparent"
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-10">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-[#8A8A8A]">{description}</p>
      </div>
    </div>
  );
}
