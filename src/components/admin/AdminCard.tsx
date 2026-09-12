import type { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  variant?: "default" | "ink" | "ghost";
};

const PADDINGS = {
  none: "",
  sm: "p-4 md:p-5",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
} as const;

const VARIANTS = {
  default: "border-plum-100 bg-white",
  ink: "border-plum-950/10 bg-plum-950 text-cream-50",
  ghost: "border-dashed border-plum-200 bg-cream-50/40",
} as const;

export default function AdminCard({
  title,
  subtitle,
  eyebrow,
  action,
  padding = "md",
  className = "",
  children,
  variant = "default",
}: Props) {
  const titleColor = variant === "ink" ? "text-cream-50" : "text-plum-950";
  const subColor = variant === "ink" ? "text-cream-100/60" : "text-plum-500";
  const eyeColor = variant === "ink" ? "text-gold-400" : "text-plum-400";

  return (
    <section className={`rounded-2xl border shadow-sm ${PADDINGS[padding]} ${VARIANTS[variant]} ${className}`}>
      {(title || subtitle || eyebrow || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p className={`mb-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] ${eyeColor}`}>{eyebrow}</p>
            )}
            {title && <h3 className={`font-display text-xl font-bold leading-tight md:text-2xl ${titleColor}`}>{title}</h3>}
            {subtitle && <p className={`mt-1 text-sm ${subColor}`}>{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
