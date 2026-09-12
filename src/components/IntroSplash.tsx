import { useState } from "react";
import { Sparkles, Moon } from "lucide-react";

type Props = {
  onEnter: () => void;
};

export default function IntroSplash({ onEnter }: Props) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const handleEnter = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      onEnter();
    }, 1200);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09040d] px-6 text-center transition-all duration-1000 ease-in-out ${
        fading ? "pointer-events-none scale-105 opacity-0 blur-md" : "opacity-100"
      }`}
    >
      {/* Texture & gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(127,77,156,0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-repeat opacity-15 mix-blend-color-dodge" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")` }} />

      {/* Sparks / embers particles floating up */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => {
          const size = 2 + (i % 3);
          const left = 10 + (i * 27) % 80;
          const delay = (i * 0.4).toFixed(1);
          const dur = 6 + (i % 4);
          const scale = 0.8 + (i % 3) * 0.2;
          return (
            <span
              key={i}
              className="absolute rounded-full bg-gradient-to-t from-gold-400 to-gold-200 opacity-0"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                bottom: "-10%",
                animation: `ember-rise ${dur}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                transform: `scale(${scale})`,
                boxShadow: "0 0 8px rgba(212,178,92,0.8)",
              }}
            />
          );
        })}
      </div>

      {/* Smoke SVG curled strands */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-30">
        <svg viewBox="0 0 200 400" className="h-[60vh] w-96" aria-hidden>
          <path className="smoke-strand" d="M100 400 Q80 300 110 240 T100 120 T115 20" fill="none" stroke="rgba(245,239,227,0.3)" strokeWidth="3" strokeLinecap="round" />
          <path className="smoke-strand" d="M110 400 Q130 310 95 250 T110 130 T90 30" fill="none" stroke="rgba(212,178,92,0.15)" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: "2s" }} />
        </svg>
      </div>

      {/* Main cinematic content */}
      <div className="relative flex max-w-2xl flex-col items-center">
        {/* Glowing Logo Circle */}
        <div className="relative group flex h-52 w-52 items-center justify-center rounded-full transition-transform duration-1000 hover:scale-[1.03] md:h-64 md:w-64">
          <div className="absolute inset-0 rounded-full bg-gold-400/10 blur-2xl transition-all duration-1000 group-hover:bg-gold-400/20 group-hover:blur-3xl" />
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-gold-500/20 via-plum-500/10 to-gold-400/20 opacity-60 animate-spin-slow" />
          <img
            src="/images/logo.png"
            alt="Odoyá Ervas de Aruanda"
            className="relative h-48 w-48 rounded-full object-cover shadow-2xl ring-2 ring-gold-400/30 md:h-56 md:w-56"
          />
        </div>

        {/* Impact Subheading / Text */}
        <div className="mt-10 space-y-4">
          <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.45em] text-gold-400 animate-[fadein_1.5s_ease-out]">
            <Sparkles size={12} className="animate-pulse" /> Sinta o Sagrado
          </p>
          <h2 className="font-serif text-3xl font-light italic leading-tight text-cream-100/90 md:text-4xl lg:text-5xl animate-[fadein_2s_ease-out]">
            “Conecte-se com o sagrado que habita em você.”
          </h2>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-cream-100/50 md:text-sm animate-[fadein_2.5s_ease-out]">
            Cada fumaça que eleva, cada aroma que acalma. Permita-se vivenciar um ritual de conexão profunda e bem-estar.
          </p>
        </div>

        {/* Cinematic CTA Button */}
        <div className="relative mt-12 animate-[fadein_3s_ease-out]">
          {/* Pulsing ring */}
          <span className="absolute -inset-4 rounded-full bg-gold-400/5 opacity-0 transition-opacity duration-1000 group-hover:opacity-100 group-hover:animate-ping" />
          <button
            onClick={handleEnter}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-10 py-4.5 text-base font-bold text-plum-950 shadow-[0_0_30px_rgba(212,178,92,0.3)] transition-all duration-300 hover:scale-105 hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_45px_rgba(212,178,92,0.5)] focus:outline-none"
          >
            {/* Shimmer reflection */}
            <span className="absolute inset-y-0 left-0 w-12 -skew-x-12 bg-white/20 -translate-x-16 transition-transform duration-1000 ease-out group-hover:translate-x-[320px]" />
            <Moon size={16} className="transition-transform group-hover:rotate-12" />
            Iniciar a experiência
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ember-rise {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-110vh) translateX(24px) scale(1.1); opacity: 0; }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
