import Divider from "./Divider";

export default function PageHeader({
  overline,
  title,
  subtitle,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-plum-800 via-plum-700 to-plum-900 pt-32 pb-20 text-center">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-plum-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6">
        {overline && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">{overline}</p>
        )}
        <h1 className="font-serif text-4xl font-semibold text-cream-50 md:text-5xl">{title}</h1>
        <div className="mt-6"><Divider light /></div>
        {subtitle && <p className="mt-6 text-lg italic text-cream-100/80">{subtitle}</p>}
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
          <path fill="#fbf8f2" d="M0,30 C360,70 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
