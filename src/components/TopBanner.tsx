import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useSettings } from "../store/useSettings";

const DISMISS_KEY = "odoya_banner_dismissed_v1";

export default function TopBanner() {
  const { banner } = useSettings();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(DISMISS_KEY);
    setDismissed(stored === banner.text); // dismiss só permanece se o texto for o mesmo
  }, [banner.text]);

  if (!banner.enabled || !banner.text || dismissed) return null;

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 bg-gradient-to-r from-plum-700 via-plum-800 to-plum-900 px-4 py-2 text-center text-xs font-medium text-cream-50 sm:text-sm">
      <Sparkles size={14} className="hidden shrink-0 text-gold-300 sm:block" />
      <p className="max-w-4xl">{banner.text}</p>
      {banner.cta && banner.ctaLink && (
        <a
          href={banner.ctaLink}
          className="rounded-full border border-gold-400/40 px-3 py-1 text-[0.7rem] font-semibold text-gold-300 transition hover:bg-white/10"
        >
          {banner.cta}
        </a>
      )}
      <button
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, banner.text);
          setDismissed(true);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-cream-50/70 hover:bg-white/10 hover:text-cream-50"
        title="Fechar aviso"
      >
        <X size={14} />
      </button>
    </div>
  );
}
