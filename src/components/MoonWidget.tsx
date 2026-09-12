import { useState, useEffect } from "react";
import { Moon, Star } from "lucide-react";

type MoonPhase = {
  phase: string;
  emoji: string;
  energy: string;
  recommendation: string;
};

// Algoritmo simplificado de fase lunar baseado em ciclo de 29.53 dias
function calculateMoonPhase(date: Date): MoonPhase {
  const lp = 2551443;
  const newMoon = new Date(1970, 0, 7, 20, 35, 0);
  const phase = ((date.getTime() - newMoon.getTime()) / 1000) % lp;
  const days = (phase / (24 * 3600)) * 29.53;

  if (days < 1.84) return { phase: "Lua Nova", emoji: "🌑", energy: "Novos começos & Intuição", recommendation: "Incenso de Arruda para purificar o terreno." };
  if (days < 5.53) return { phase: "Lua Crescente", emoji: "🌒", energy: "Ação & Crescimento", recommendation: "Incenso de Canela com Anis para atrair movimento." };
  if (days < 9.22) return { phase: "Quarto Crescente", emoji: "🌓", energy: "Decisão & Força", recommendation: "Incenso de Canela com Anis para prosperidade." };
  if (days < 12.91) return { phase: "Gibosa Crescente", emoji: "🌔", energy: "Refinamento", recommendation: "Incenso de Lavanda para focar as energias." };
  if (days < 16.6) return { phase: "Lua Cheia", emoji: "🌕", energy: "Plenitude & Magnetismo", recommendation: "Incenso de Lavanda com Rosas Rubras para o amor próprio." };
  if (days < 20.29) return { phase: "Gibosa Minguante", emoji: "🌖", energy: "Gratidão", recommendation: "Incenso de Rosas Rubras para agradecer as bênçãos." };
  if (days < 23.98) return { phase: "Quarto Minguante", emoji: "🌗", energy: "Libertação", recommendation: "Incenso de Arruda para limpeza energética." };
  return { phase: "Lua Minguante", emoji: "🌘", energy: "Descanso & Banimento", recommendation: "Incenso de Arruda para descarrego completo." };
}

export default function MoonWidget() {
  const [phase, setPhase] = useState<MoonPhase | null>(null);

  useEffect(() => {
    setPhase(calculateMoonPhase(new Date()));
  }, []);

  if (!phase) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold-400/30 bg-gradient-to-br from-plum-950/80 to-plum-900/60 p-6 text-cream-50 shadow-xl backdrop-blur">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold-400/10 blur-xl" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-4xl shadow-inner ring-1 ring-gold-400/20">
            {phase.emoji}
          </span>
          <div>
            <p className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.25em] text-gold-300">
              <Moon size={11} /> Oráculo Lunar
            </p>
            <h3 className="font-serif text-xl font-bold">{phase.phase}</h3>
          </div>
        </div>
        <span className="hidden rounded-full bg-gold-500/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-gold-300 sm:block">
          Energia de hoje
        </span>
      </div>

      <div className="mt-5 space-y-3 border-t border-cream-100/10 pt-4">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-cream-100/40">Foco energético</p>
          <p className="text-sm font-medium text-cream-100/85">{phase.energy}</p>
        </div>
        <div className="rounded-xl bg-plum-950/40 p-3 ring-1 ring-gold-400/15">
          <p className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-gold-300">
            <Star size={10} className="fill-gold-400" /> Ritual sugerido
          </p>
          <p className="mt-1 text-xs text-cream-100/80 leading-relaxed">
            {phase.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
