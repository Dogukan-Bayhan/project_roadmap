import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-800/70 text-cyan-100 border border-white/10",
  success: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/50",
  warning: "bg-amber-500/10 text-amber-300 border border-amber-400/50",
  danger: "bg-rose-500/10 text-rose-300 border border-rose-400/50",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge };

