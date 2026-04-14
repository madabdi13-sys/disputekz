import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950",
        secondary:
          "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300",
        ghost:
          "bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        link:
          "text-zinc-900 underline underline-offset-4 hover:text-zinc-700 p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-md",
        md: "h-9 px-3.5 text-[14px] rounded-md",
        lg: "h-10 px-4 text-[14px] rounded-md",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
