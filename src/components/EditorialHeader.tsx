import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  edition?: string;
  right?: ReactNode;
  bgImage?: string;
  align?: "left" | "center";
};

/**
 * Header editorial full-bleed em plum profundo, com marcadores verticais
 * e headline em Cormorant. Substitui o antigo PageHeader.
 */
export default function EditorialHeader({
  eyebrow,
  title,
  subtitle,
  edition,
  right,
  bgImage,
  align = "left",
}: Props) {
  return (
    <section className="relative overflow-hidden bg-plum-950 text-cream-50 paper">
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(197,154,58,0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(127,77,156,0.35),transparent_60%)]" />

      {/* Vertical marker */}
      <div className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 lg:block">
        <div className="vertical-rl text-[0.65rem] uppercase tracking-[0.45em] text-gold-400/70">
          {edition ?? "Odoyá · Barretos · São Paulo"}
        </div>
      </div>

      <div
        className={`relative mx-auto grid max-w-[1400px] items-end gap-8 px-6 pb-16 pt-24 md:grid-cols-[1.4fr_1fr] md:gap-16 md:px-12 md:pb-24 md:pt-32 ${
          align === "center" ? "md:grid-cols-1 md:text-center" : ""
        }`}
      >
        <div>
          {eyebrow && (
            <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-400">
              <span className="h-px w-8 bg-gold-500/60" />
              {eyebrow}
            </p>
          )}
          <h1 className="mt-6 font-display font-medium leading-[0.9] tracking-[-0.02em] text-[clamp(3rem,7.5vw,6.5rem)]">
            {title}
          </h1>
          {subtitle && (
            <div className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/75 md:text-lg">
              {subtitle}
            </div>
          )}
        </div>

        {right && (
          <aside className="text-sm text-cream-100/70 md:pl-8 md:border-l md:border-cream-100/10">
            {right}
          </aside>
        )}
      </div>

      {/* Bottom decorative row */}
      <div className="relative border-t border-cream-100/10 bg-plum-950/50 px-6 py-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-cream-100/40 md:px-12">
        Feito à mão · Barretos — SP · Enviado para todo o Brasil
      </div>
    </section>
  );
}
