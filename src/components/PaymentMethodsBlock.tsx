import { ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useSettings } from "../store/useSettings";

export default function PaymentMethodsBlock({ compact = false }: { compact?: boolean }) {
  const { paymentMethods, pixKey } = useSettings();
  const [copied, setCopied] = useState(false);

  const enabled = paymentMethods.filter((p) => p.enabled);
  if (enabled.length === 0) return null;

  const copyPix = () => {
    navigator.clipboard?.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`grid gap-${compact ? "3" : "4"}`}>
      <div className={`grid gap-${compact ? "2.5" : "3"} sm:grid-cols-2 lg:grid-cols-3`}>
        {enabled.map((m) => (
          <div
            key={m.id}
            className={`relative flex items-start gap-3 rounded-2xl border p-4 transition ${
              m.featured
                ? "border-gold-400/50 bg-gradient-to-br from-gold-300/15 to-plum-100/20 shadow-md"
                : "border-plum-100 bg-white shadow-sm"
            }`}
          >
            {m.featured && (
              <span className="absolute -top-2 right-3 rounded-full bg-gold-500 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">
                Recomendado
              </span>
            )}
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-50 text-2xl">
              {m.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-base font-semibold text-plum-800">{m.name}</p>
              <p className="text-xs text-plum-900/60">{m.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[0.65rem]">
                {m.installments && (
                  <span className="rounded-full bg-plum-100 px-2 py-0.5 font-medium text-plum-700">{m.installments}</span>
                )}
                {m.discount && (
                  <span className="rounded-full bg-sage-400/20 px-2 py-0.5 font-medium text-sage-600">{m.discount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PIX key badge (if PIX enabled) */}
      {enabled.some((p) => p.id === "pix" || p.name.toLowerCase().includes("pix")) && pixKey && (
        <div className="flex flex-col gap-2 rounded-2xl border border-plum-200 bg-plum-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-plum-700 text-cream-50">⚡</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-plum-500">Chave PIX</p>
              <p className="truncate font-mono text-sm font-medium text-plum-800">{pixKey}</p>
            </div>
          </div>
          <button
            onClick={copyPix}
            className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              copied ? "bg-sage-500 text-white" : "bg-plum-700 text-cream-50 hover:bg-plum-800"
            }`}
          >
            {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar chave</>}
          </button>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-plum-900/55">
        <ShieldCheck size={14} className="text-sage-500" />
        As condições de pagamento são confirmadas diretamente com a Jéssica pelo WhatsApp antes do fechamento.
      </div>
    </div>
  );
}
