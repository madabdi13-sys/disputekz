import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border bg-white px-3 text-[14px] text-zinc-900",
          "placeholder:text-zinc-400",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-0 focus-visible:border-zinc-900",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
          error
            ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
            : "border-zinc-200 hover:border-zinc-300",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
