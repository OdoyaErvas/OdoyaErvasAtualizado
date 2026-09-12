import { Moon, ArrowRight, Flame } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { Link } from "react-router-dom";

/**
 * Ritual do dia — recomenda um incenso baseado na fase lunar.
 * Cálculo simplificado: ciclo 29.53 dias a partir de uma lua nova conhecida.
 */
export default function RitualOfDay() {
  const { products } = useStore();

  const ritual = useMemo(() => {
    const now = new Date();
    const newMoon = new Date(Date.UTC(2024, 0, 11, 11, 57)); // Lua nova conhecida
    const daysSince = (now.getTime() - newMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phase = ((daysSince % 29.53) + 29.53) % 29.53;

    const stages = [
      { name: "Lua Nova", emoji: "🌑", energy: "Plantar intenções", productId: "arruda", desc: "Tempo de silenciar e preparar terreno. Na tradição, a arruda acompanha práticas de renovação para um novo ciclo." },
      { name: "Lua Crescente", emoji: "🌒", energy: "Ação & impulso", productId: "canela-anis", desc: "O movimento pede intenção. Canela e anis são tradicionalmente escolhidos para rituais ligados à prosperidade." },
      { name: "Quarto Crescente", emoji: "🌓", energy: "Foco & disciplina", productId: "canela-anis", desc: "Metade do caminho. Sustentar a intenção pede calor e constância." },
      { name: "Gibosa Crescente", emoji: "🌔", energy: "Refinar & ajustar", productId: "lavanda-rosas-rubras", desc: "Quase cheia. Ajustar detalhes pede equilíbrio e afeto." },
      { name: "Lua Cheia", emoji: "🌕", energy: "Plenitude & amor", productId: "rosas-rubras", desc: "Luz máxima. Rosas rubras compõem rituais de afeto, celebração e presença." },
      { name: "Gibosa Minguante", emoji: "🌖", energy: "Gratidão", productId: "rosas-rubras", desc: "Começar a soltar. Agradecer o que foi colhido fortalece o ciclo." },
      { name: "Quarto Minguante", emoji: "🌗", energy: "Liberar o que não serve", productId: "arruda", desc: "Descanso ativo. A arruda acompanha práticas simbólicas de encerramento e preparação para o próximo ciclo." },
      { name: "Lua Minguante", emoji: "🌘", energy: "Silêncio & limpeza", productId: "lavanda", desc: "A calmaria antes do novo. A lavanda é uma escolha tradicional para rituais de pausa e presença." },
    ];

    const idx = Math.min(stages.length - 1, Math.floor((phase / 29.53) * stages.length));
    const stage = stages[idx];
    const product = products.find((p) => p.id === stage.productId) || products[0];
    const illumination = Math.round((1 - Math.cos((phase / 29.53) * 2 * Math.PI)) / 2 * 100);
    return { stage, product, illumination, phase };
  }, [products]);

  const { stage, product, illumination } = ritual;

  return (
    <section className="relative overflow-hidden bg-cream-50 py-24 md:py-32 paper">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(127,77,156,0.08),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          {/* Lado esquerdo: a lua */}
          <div className="relative flex flex-col items-center">
            <p className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-plum-500">
              <span className="inline-block h-px w-10 bg-plum-300" /> Ritual do dia
            </p>

            <div className="relative mt-8 flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
              {/* Halo */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(197,154,58,0.3),transparent_70%)] blur-2xl" />
              {/* Lua SVG */}
              <svg viewBox="0 0 100 100" className="relative h-full w-full">
                <defs>
                  <radialGradient id="moon-surface" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#f5efe3" />
                    <stop offset="100%" stopColor="#d8c9a9" />
                  </radialGradient>
                  <radialGradient id="moon-shadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a0e2b" />
                    <stop offset="100%" stopColor="#1a0e2b" />
                  </radialGradient>
                  <mask id="moon-mask">
                    <circle cx="50" cy="50" r="42" fill="white" />
                    <circle
                      cx={50 + (illumination > 50 ? -1 : 1) * (Math.abs(illumination - 50) / 50) * 42}
                      cy="50"
                      r={Math.max(5, 42 - (Math.abs(illumination - 50) / 50) * 42)}
                      fill={illumination > 50 ? "black" : "white"}
                    />
                  </mask>
                </defs>
                {/* Lua iluminada */}
                <circle cx="50" cy="50" r="42" fill="url(#moon-surface)" mask="url(#moon-mask)" />
                {/* Lua escura (sempre presente, atrás) */}
                <circle cx="50" cy="50" r="42" fill="url(#moon-shadow)" opacity="0.15" />
                {/* Crateras sutis */}
                <g opacity="0.15" fill="#7c5a3c">
                  <circle cx="38" cy="42" r="3" />
                  <circle cx="55" cy="55" r="4" />
                  <circle cx="62" cy="38" r="2" />
                  <circle cx="42" cy="62" r="2.5" />
                </g>
              </svg>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-6xl">{stage.emoji}</div>
            </div>

            <div className="mt-8 text-center">
              <p className="font-display text-3xl font-bold text-plum-900">{stage.name}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.25em] text-gold-600">{stage.energy}</p>
              <p className="mt-2 text-xs text-plum-500">Iluminação: <span className="font-bold tabular-nums text-plum-800">{illumination}%</span></p>
            </div>
          </div>

          {/* Lado direito: recomendação */}
          <div className="relative overflow-hidden rounded-3xl border border-plum-100 bg-white p-8 shadow-xl md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-plum-200/30 blur-3xl" />

            <div className="relative">
              <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-plum-500">
                <Flame size={12} className="text-gold-600" /> Composição do dia
              </p>
              <h3 className="mt-3 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
                {product.name.replace(/^Incenso\s/, "")}
              </h3>
              <p className="mt-1 font-display text-lg italic" style={{ color: product.color }}>{product.short}</p>

              <p className="mt-5 text-base leading-relaxed text-plum-800/85">
                {stage.desc}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {product.benefits.slice(0, 4).map((b) => (
                  <span key={b} className="rounded-full bg-plum-50 px-3 py-1 text-xs font-medium text-plum-700">{b}</span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-plum-100 pt-6">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider text-plum-500">{product.weight}</p>
                  <p className="font-display text-2xl font-bold tabular-nums text-plum-950">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                </div>
                <Link
                  to="/produtos"
                  className="group flex items-center gap-2 rounded-full bg-plum-900 px-5 py-3 text-sm font-bold text-cream-50 shadow-lg transition hover:bg-plum-950"
                >
                  Ver composição
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[0.7rem] text-plum-500">
          <Moon size={11} className="mr-1 inline" /> Cálculo baseado no ciclo sinódico lunar · apenas orientação espiritual, não substitui conselho médico.
        </p>
      </div>
    </section>
  );
}
