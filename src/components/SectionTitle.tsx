import Divider from "./Divider";

export default function SectionTitle({
  overline,
  title,
  subtitle,
  center = true,
  light = false,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} reveal`}>
      {overline && (
        <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-gold-300" : "text-gold-600"}`}>
          {overline}
        </p>
      )}
      <h2 className={`font-serif text-3xl font-semibold leading-tight md:text-4xl ${light ? "text-cream-50" : "text-plum-800"}`}>
        {title}
      </h2>
      {center && <div className="mt-5"><Divider light={light} /></div>}
      {subtitle && (
        <p className={`mt-5 text-base leading-relaxed ${light ? "text-cream-100/80" : "text-plum-900/60"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
