import { cn } from "@/lib/utils";

const TONES = {
  neutral: "text-zinc-700 bg-zinc-100 border-zinc-200",
  info: "text-blue-700 bg-blue-50 border-blue-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  success: "text-emerald-700 bg-emerald-50 border-emerald-200",
  danger: "text-red-700 bg-red-50 border-red-200",
} as const;

export type BadgeTone = keyof typeof TONES;

/** Бейдж статуса по DESIGN.md: точка 6px + текст, радиус 6px, 12px/500. */
export function StatusBadge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[12px] font-medium",
        TONES[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {children}
    </span>
  );
}
