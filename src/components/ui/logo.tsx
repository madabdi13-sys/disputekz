import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
}

/**
 * DisputeKZ logo — два пересекающихся наклонных квадрата
 * как метафора диспута (противостояние, встречающееся в центре).
 */
export function Logo({
  className,
  size = "md",
  withWordmark = true,
}: LogoProps) {
  const sizes = {
    sm: { mark: 14, text: "text-[13px]" },
    md: { mark: 18, text: "text-[15px]" },
    lg: { mark: 28, text: "text-[22px]" },
  };

  const s = sizes[size];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Внешний квадрат (outlined) */}
        <rect
          x="4"
          y="4"
          width="12"
          height="12"
          transform="rotate(45 10 10)"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Внутренний квадрат (filled) — сдвинут */}
        <rect
          x="10"
          y="10"
          width="9"
          height="9"
          transform="rotate(45 14.5 14.5)"
          fill="currentColor"
        />
      </svg>
      {withWordmark && (
        <span
          className={cn(
            s.text,
            "font-semibold tracking-[-0.03em] text-zinc-900 lowercase"
          )}
        >
          disputekz
        </span>
      )}
    </div>
  );
}
