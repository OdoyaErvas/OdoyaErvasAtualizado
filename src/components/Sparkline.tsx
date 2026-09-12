type Props = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  className?: string;
};

/** Sparkline SVG desenhada à mão, sem dependências externas. */
export default function Sparkline({
  data,
  width = 120,
  height = 36,
  stroke = "#653b80",
  fill = "rgba(101,59,128,0.12)",
  strokeWidth = 1.75,
  className,
}: Props) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / Math.max(1, data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path d={area} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r={2.5}
          fill={stroke}
        />
      )}
    </svg>
  );
}
