import type { ReactNode } from "react";

type Variant = "neutral" | "success" | "warning" | "danger" | "info" | "gold";

type Props = {
  children: ReactNode;
  variant?: Variant;
  dot?: boolean;
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
};

const STYLES: Record<Variant, string> = {
  neutral: "bg-plum-50 text-plum-700 ring-plum-200",
  success: "bg-sage-400/15 text-sage-700 ring-sage-400/40",
  warning: "bg-gold-300/25 text-gold-700 ring-gold-400/50",
  danger: "bg-rose-deep/10 text-rose-deep ring-rose-deep/30",
  info: "bg-plum-100/70 text-plum-700 ring-plum-300/40",
  gold: "bg-gold-300/25 text-gold-700 ring-gold-400/60",
};

const DOTS: Record<Variant, string> = {
  neutral: "bg-plum-500",
  success: "bg-sage-500",
  warning: "bg-gold-500",
  danger: "bg-rose-deep",
  info: "bg-plum-500",
  gold: "bg-gold-500",
};

export default function AdminBadge({ children, variant = "neutral", dot = false, icon, size = "sm", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset transition ${STYLES[variant]} ${
        size === "sm" ? "px-2 py-0.5 text-[0.65rem] uppercase tracking-wider" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[variant]} ${variant === "warning" || variant === "danger" ? "animate-pulse" : ""}`} />}
      {icon}
      {children}
    </span>
  );
}
