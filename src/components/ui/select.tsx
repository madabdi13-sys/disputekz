import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border bg-white px-3 pr-9 text-[14px] text-zinc-900 appearance-none",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-zinc-900",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-400 focus-visible:ring-red-400"
              : "border-zinc-200 hover:border-zinc-300",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
