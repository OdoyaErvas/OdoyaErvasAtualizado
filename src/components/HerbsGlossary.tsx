import { useMemo, useState } from "react";

type Herb = {
  name: string;
  latin: string;
  glyph: string;
  element: string;
  keywords: string[];
  lore: string;
  color: string;
};

const HERBS: Herb[] = [
  {
    name: "Alecrim",
    latin: "Salvia rosmarinus",
    glyph: "🌿",
    element: "Sol · Fogo",
    keywords: ["Presença", "Vitalidade", "Tradição"],
    lore: "Erva solar por excelência. Na tradição popular, o alecrim é associado à presença, à vitalidade e ao perfume de novos começos. Um ramo à porta aparece em muitos costumes brasileiros.",
    color: "#566e3d",
  },
  {
    name: "Arruda",
    latin: "Ruta graveolens",
    glyph: "☘️",
    element: "Lua · Terra",
    keywords: ["Proteção", "Limpeza", "Descarrego"],
    lore: "Em tradições populares e espirituais, a arruda é associada a práticas simbólicas de proteção e renovação do ambiente. Em cada prática, a intenção de quem prepara faz parte do ritual.",
    color: "#6e8a4f",
  },
  {
    name: "Lavanda",
    latin: "Lavandula angustifolia",
    glyph: "💜",
    element: "Ar · Água",
    keywords: ["Pausa", "Noite", "Ritual"],
    lore: "Na tradição aromática, a lavanda é escolhida para momentos de pausa, leitura, meditação e rituais noturnos. Seu perfume floral compõe uma atmosfera mais acolhedora.",
    color: "#7f4d9c",
  },
  {
    name: "Canela",
    latin: "Cinnamomum verum",
    glyph: "🔥",
    element: "Sol · Fogo",
    keywords: ["Prosperidade", "Amor", "Vitalidade"],
    lore: "Casca de perfume quente e especiado. Em práticas tradicionais, a canela aparece em rituais simbólicos ligados a movimento, abundância e celebração.",
    color: "#a67f27",
  },
  {
    name: "Anis-estrelado",
    latin: "Illicium verum",
    glyph: "✦",
    element: "Sol · Éter",
    keywords: ["Sorte", "Intuição", "Caminhos"],
    lore: "Fruto em forma de estrela de oito pontas. Na tradição simbólica, aparece em rituais de caminhos, intenção e contemplação. Seu aroma é marcante e especiado.",
    color: "#8a5a2b",
  },
  {
    name: "Rosa rubra",
    latin: "Rosa gallica",
    glyph: "🌹",
    element: "Água · Terra",
    keywords: ["Afeto", "Beleza", "Harmonia"],
    lore: "Símbolo marcante do amor e da beleza. Pétalas secas aparecem em banhos e incensos de tradição afetiva, para ocasiões de cuidado, presença e celebração dos vínculos.",
    color: "#7a2436",
  },
];

export default function HerbsGlossary() {
  const [active, setActive] = useState<string | null>("Lavanda");

  // Determina o próximo índice para seta
  const idx = useMemo(() => HERBS.findIndex((h) => h.name === active), [active]);
  const current = HERBS[idx] ?? HERBS[0];

  return (
    <section className="relative overflow-hidden bg-cream-50 py-24 md:py-32 paper">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(127,77,156,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6 md:px-12">
        <div className="mb-12 max-w-2xl">
          <p className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-plum-500">
            <span className="inline-block h-px w-10 bg-plum-300" /> Herbário
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[0.95] text-plum-950">
            O que dizem<br />
            <span className="italic text-plum-600">as ervas.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-plum-800/70">
            Cada erva carrega uma assinatura: elemento, intenção, história. Passe o dedo pelas fichas abaixo e descubra qual conversa com o seu momento.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          {/* Lista vertical */}
          <ul className="space-y-2">
            {HERBS.map((h) => {
              const isActive = h.name === active;
              return (
                <li key={h.name}>
                  <button
                    onClick={() => setActive(h.name)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? "border-plum-300 bg-white shadow-lg"
                        : "border-transparent bg-white/50 hover:border-plum-200 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                      style={{ backgroundColor: `${h.color}20` }}
                    >
                      {h.glyph}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`font-display text-lg font-bold leading-tight ${isActive ? "text-plum-950" : "text-plum-800"}`}>{h.name}</p>
                      <p className="truncate text-[0.7rem] italic text-plum-500">{h.latin}</p>
                    </div>
                    <span
                      className={`text-[0.65rem] font-bold uppercase tracking-wider transition ${isActive ? "text-gold-600" : "text-plum-400"}`}
                    >
                      {h.element}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Ficha aberta */}
          <article
            key={current.name}
            className="page-enter relative overflow-hidden rounded-3xl border border-plum-100 bg-white p-8 shadow-xl md:p-10"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
              style={{ background: current.color }}
            />
            <div className="pointer-events-none absolute inset-0 paper opacity-30" />

            <div className="relative">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-plum-500">
                    Ficha {idx + 1} de {HERBS.length}
                  </p>
                  <h3 className="mt-2 font-display text-5xl font-bold leading-none text-plum-950 md:text-6xl">{current.name}</h3>
                  <p className="mt-1 font-display text-lg italic text-plum-500">{current.latin}</p>
                </div>
                <span className="text-7xl md:text-8xl">{current.glyph}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-plum-900 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-gold-300">
                  {current.element}
                </span>
                {current.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-plum-50 px-3 py-1 text-xs font-medium text-plum-700">{k}</span>
                ))}
              </div>

              <div className="mt-8 border-l-2 pl-5" style={{ borderColor: current.color }}>
                <p className="font-display text-xl italic leading-relaxed text-plum-900 md:text-2xl">
                  “{current.lore}”
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-plum-100 pt-5">
                <button
                  onClick={() => setActive(HERBS[(idx - 1 + HERBS.length) % HERBS.length].name)}
                  className="text-sm font-semibold text-plum-700 hover:text-plum-950"
                >
                  ← Anterior
                </button>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-plum-400">
                  {idx + 1} / {HERBS.length}
                </span>
                <button
                  onClick={() => setActive(HERBS[(idx + 1) % HERBS.length].name)}
                  className="text-sm font-semibold text-plum-700 hover:text-plum-950"
                >
                  Próxima →
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
