import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-slate-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-cyan-500/90 text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:bg-cyan-400",
        secondary: "bg-slate-800/80 text-slate-100 hover:bg-slate-700/80",
        ghost: "bg-transparent text-slate-100 hover:bg-slate-800/60",
        outline:
          "border border-slate-700/70 bg-slate-900/40 text-slate-100 shadow-[inset_0_0_30px_rgba(15,23,42,0.6)] hover:border-cyan-400/60 hover:text-cyan-200",
        destructive: "bg-rose-600 text-white hover:bg-rose-500",
        glass:
          "border border-white/10 bg-white/5 text-cyan-100 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.5)] hover:border-cyan-300/40",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

