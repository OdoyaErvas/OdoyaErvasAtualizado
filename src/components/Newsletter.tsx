import { useState } from "react";
import { Send, Check, Sparkles } from "lucide-react";
import { whatsappLink } from "../data/site";

/**
 * Newsletter captura de e-mail — envia por WhatsApp formatado.
 * Respeita privacidade: não armazena localmente.
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    const msg = `Olá! Quero entrar na lista de espera da Odoyá 🌿\nMeu e-mail: ${email.trim()}\nQuero saber primeiro sobre novos lotes e rituais.`;
    window.open(whatsappLink(msg), "_blank");
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 6000);
  };

  return (
    <section className="relative overflow-hidden bg-[#1a0e2b] py-20 text-cream-50 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,154,58,0.18),transparent_55%)]" />

      {/* Folhas decorativas */}
      <svg className="pointer-events-none absolute left-4 top-8 h-24 w-24 text-sage-400/20 md:left-16 md:h-40 md:w-40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M50 90 Q 20 60 30 30 Q 50 50 50 90 Z" />
        <path d="M50 90 Q 80 60 70 30 Q 50 50 50 90 Z" />
        <path d="M50 90 L50 30" />
      </svg>
      <svg className="pointer-events-none absolute bottom-8 right-4 h-24 w-24 -scale-x-100 text-sage-400/20 md:right-16 md:h-40 md:w-40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M50 90 Q 20 60 30 30 Q 50 50 50 90 Z" />
        <path d="M50 90 Q 80 60 70 30 Q 50 50 50 90 Z" />
        <path d="M50 90 L50 30" />
      </svg>

      <div className="relative mx-auto max-w-3xl px-6 text-center md:px-12">
        <p className="flex items-center justify-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-gold-300">
          <Sparkles size={12} /> Lista de espera
        </p>
        <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-medium leading-tight">
          Novos lotes nascem<br />
          <span className="italic text-gold-300">a cada lua.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream-100/70 md:text-base">
          Deixamos seu e-mail guardado com cuidado. Quando um novo lote artesanal ficar pronto, você é a primeira a saber — antes mesmo de ir pro site.
        </p>

        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="newsletter-input flex-1 rounded-full px-5 py-3.5 text-sm"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3.5 text-sm font-bold text-plum-950 shadow-lg shadow-gold-500/30 transition hover:bg-gold-300"
          >
            {sent ? <><Check size={15} /> Enviado</> : <><Send size={15} /> Entrar na lista</>}
          </button>
        </form>

        <p className="mt-4 text-[0.7rem] text-cream-100/40">
          Sem spam, sem frequência fixa. Só quando tiver algo com alma pra contar.
        </p>
      </div>
    </section>
  );
}
