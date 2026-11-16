import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-md border bg-white px-3 py-2 text-[14px] text-zinc-900",
        "placeholder:text-zinc-400 transition-colors duration-150",
        "focus-visible:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
        error ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400" : "border-zinc-200 hover:border-zinc-300",
        className,
      )}
      {...props}
    />
  );
}
