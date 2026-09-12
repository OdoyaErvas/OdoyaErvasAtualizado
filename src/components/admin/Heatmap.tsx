import { useMemo } from "react";

type Props = {
  data: { date: string; value: number }[]; // date: ISO
  rows?: 7;
  cols?: 12;
  cellSize?: number;
  cellGap?: number;
  colorScale?: (v: number, max: number) => string;
};

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Heatmap estilo GitHub de vendas por dia da semana × semana. */
export default function Heatmap({ data, cols = 12, cellSize = 14, cellGap = 3 }: Props) {
  const rows = 7;

  // Agrupa data → valor
  const byDate = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date.slice(0, 10), (m.get(d.date.slice(0, 10)) || 0) + d.value));
    return m;
  }, [data]);

  const today = new Date();
  // Gerar grid: 12 semanas × 7 dias, terminando hoje
  const cells = useMemo(() => {
    const list: { date: string; weekday: number; value: number; col: number; row: number }[] = [];
    const start = new Date(today);
    start.setDate(start.getDate() - (cols * 7 - 1));
    // alinhar ao domingo
    start.setDate(start.getDate() - start.getDay());
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const d = new Date(start);
        d.setDate(start.getDate() + c * 7 + r);
        const iso = d.toISOString().slice(0, 10);
        list.push({ date: iso, weekday: r, value: byDate.get(iso) || 0, col: c, row: r });
      }
    }
    return list;
  }, [byDate, cols]);

  const max = Math.max(1, ...cells.map((c) => c.value));

  const colorFor = (v: number) => {
    if (v === 0) return "#f5efe3";
    const t = Math.min(1, v / max);
    // plum scale
    if (t < 0.33) return "#dcc7e6";
    if (t < 0.66) return "#a274bd";
    if (t < 0.9) return "#653b80";
    return "#2a1740";
  };

  const w = cols * (cellSize + cellGap) + 20;
  const h = rows * (cellSize + cellGap) + 20;

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h} className="max-w-full">
        {/* Weekday labels */}
        {WEEKDAYS.map((label, i) => (
          <text
            key={i}
            x={14}
            y={10 + i * (cellSize + cellGap) + cellSize / 2 + 1}
            fontSize={9}
            fill="#a274bd"
            fontFamily="Jost, sans-serif"
            textAnchor="middle"
          >
            {i % 2 === 0 ? label : ""}
          </text>
        ))}

        {cells.map((c, i) => (
          <rect
            key={i}
            x={20 + c.col * (cellSize + cellGap)}
            y={10 + c.row * (cellSize + cellGap)}
            width={cellSize}
            height={cellSize}
            rx={3}
            fill={colorFor(c.value)}
            className="transition-colors"
          >
            <title>{`${c.date}: ${c.value}`}</title>
          </rect>
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-end gap-2 text-[0.65rem] text-plum-500">
        <span>Menos</span>
        {["#f5efe3", "#dcc7e6", "#a274bd", "#653b80", "#2a1740"].map((c) => (
          <span key={c} className="h-3 w-3 rounded" style={{ background: c }} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}
