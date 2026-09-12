import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  delta?: number; // percentual vs período anterior
  hint?: string;
  accent?: "plum" | "gold" | "sage" | "rose" | "ink";
  spark?: number[];
};

const ACCENTS = {
  plum: { chip: "bg-plum-900 text-gold-300", spark: "#4c2a6b" },
  gold: { chip: "bg-gold-500 text-plum-950", spark: "#a67f27" },
  sage: { chip: "bg-sage-600 text-cream-50", spark: "#566e3d" },
  rose: { chip: "bg-rose-deep text-cream-50", spark: "#7a2436" },
  ink: { chip: "bg-[#1a0e2b] text-gold-300", spark: "#1a0e2b" },
} as const;

function MiniSpark({ data, stroke }: { data: number[]; stroke: string }) {
  if (data.length < 2) return null;
  const w = 96;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2] as const);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="ml-auto">
      <path d={area} fill={`${stroke}18`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2} fill={stroke} />
    </svg>
  );
}

export default function AdminStat({ label, value, icon, delta, hint, accent = "plum", spark }: Props) {
  const a = ACCENTS[accent];
  const hasDelta = typeof delta === "number";
  const up = (delta ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-plum-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-plum-200 hover:shadow-lg">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 blur-2xl transition group-hover:opacity-20" style={{ background: a.spark }} />

      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.chip} shadow-sm`}>{icon}</span>
        {hasDelta && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold tabular-nums ${
              up ? "bg-sage-400/20 text-sage-700" : "bg-rose-deep/10 text-rose-deep"
            }`}
            title="Variação vs período anterior"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d={up ? "M5 2 L8 7 H2 Z" : "M5 8 L2 3 H8 Z"} fill="currentColor" />
            </svg>
            {Math.abs(delta!).toFixed(1)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-plum-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="font-display text-3xl font-bold leading-none tracking-tight text-plum-950 tabular-nums">{value}</p>
        {spark && spark.length > 1 && <MiniSpark data={spark} stroke={a.spark} />}
      </div>

      {hint && <p className="mt-2 text-[0.7rem] text-plum-500 leading-snug">{hint}</p>}
    </div>
  );
}
