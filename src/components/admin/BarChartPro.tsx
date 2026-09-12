type Props = {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  highlightIndex?: number;
  showValues?: boolean;
};

/** Gráfico de barras profissional com eixos, grade e hover. */
export default function BarChartPro({
  data,
  height = 220,
  color = "#4c2a6b",
  highlightIndex = -1,
  showValues = false,
}: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  // Arredondar para "ticks" limpos
  const niceMax = niceNumber(max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));

  const padL = 52;
  const padR = 12;
  const padT = 16;
  const padB = 32;
  const w = 100; // viewbox width unit (percent based)
  const chartW = w - padL - padR;
  const chartH = height - padT - padB;

  const barGap = 8; // percent
  const barWidth = (chartW - barGap * (data.length - 1)) / data.length;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="Gráfico de barras">
        {/* Grid lines */}
        {ticks.map((t, i) => {
          const y = padT + chartH - (t / niceMax) * chartH;
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                stroke="#ede3f3"
                strokeWidth={0.3}
                strokeDasharray={i === 0 ? "0" : "1.5 2"}
              />
              <text x={padL - 3} y={y + 1} textAnchor="end" fontSize={2.2} fill="#a274bd" fontFamily="Jost, sans-serif">
                {formatShort(t)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / niceMax) * chartH;
          const x = padL + i * (barWidth + barGap);
          const y = padT + chartH - barH;
          const isHi = i === highlightIndex;
          return (
            <g key={i}>
              <defs>
                <linearGradient id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isHi ? "#d4b25c" : color} stopOpacity={isHi ? 1 : 0.95} />
                  <stop offset="100%" stopColor={isHi ? "#a67f27" : color} stopOpacity={isHi ? 0.8 : 0.55} />
                </linearGradient>
              </defs>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={1}
                fill={`url(#barGrad-${i})`}
                className="transition-all duration-500 hover:opacity-80"
              >
                <title>{`${d.label}: ${formatShort(d.value)}`}</title>
              </rect>
              {showValues && d.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 1.5}
                  textAnchor="middle"
                  fontSize={2}
                  fill={color}
                  fontWeight="600"
                  fontFamily="Jost, sans-serif"
                >
                  {formatShort(d.value)}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={height - padB + 4}
                textAnchor="middle"
                fontSize={2.2}
                fill="#653b80"
                fontFamily="Jost, sans-serif"
                style={{ textTransform: "uppercase" }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function niceNumber(n: number) {
  if (n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const f = n / Math.pow(10, exp);
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * Math.pow(10, exp);
}

function formatShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".0", "")}k`;
  return n.toFixed(0);
}
