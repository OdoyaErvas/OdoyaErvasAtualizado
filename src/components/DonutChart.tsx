type Slice = { value: number; color: string; label: string };

type Props = {
  slices: Slice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
};

/** Donut chart SVG próprio, sem libs. */
export default function DonutChart({ slices, size = 160, thickness = 22, centerLabel, centerValue }: Props) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ede3f3" strokeWidth={thickness} />
        {slices.map((s, i) => {
          const len = (s.value / total) * circumference;
          const dash = `${len} ${circumference - len}`;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="font-display text-2xl font-semibold text-plum-800 leading-none">{centerValue}</span>}
          {centerLabel && <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-plum-500">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
