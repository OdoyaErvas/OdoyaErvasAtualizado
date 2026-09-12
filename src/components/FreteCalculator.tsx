import { useEffect, useState } from "react";
import { MapPin, Truck, Package, Loader2, Gift, Check } from "lucide-react";
import { calcularFrete } from "../data/frete";
import { useSettings } from "../store/useSettings";

type Props = {
  qtdItens?: number;
  totalPedido?: number;
  onSelectFrete?: (valor: number, label: string) => void;
  compact?: boolean;
};

export default function FreteCalculator({
  qtdItens = 1,
  totalPedido = 0,
  onSelectFrete,
  compact = false,
}: Props) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calcularFrete> | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const { storeConfig } = useSettings();
  const FRETE_GRATIS_ACIMA = storeConfig.freeShippingThreshold || 199;

  const freteGratis = totalPedido >= FRETE_GRATIS_ACIMA;
  const restante = Math.max(0, FRETE_GRATIS_ACIMA - totalPedido);
  const progresso = Math.min(100, FRETE_GRATIS_ACIMA > 0 ? (totalPedido / FRETE_GRATIS_ACIMA) * 100 : 100);
  const cepLimpo = cep.replace(/\D/g, "");

  // Quando o total cruza o limiar de frete grátis, força a seleção em 0
  useEffect(() => {
    if (freteGratis && onSelectFrete && selected !== null) {
      const opt = result?.options?.[selected];
      if (opt) onSelectFrete(0, opt.label);
    }
  }, [freteGratis, onSelectFrete, selected, result]);

  // Se o total voltar a ficar abaixo do limiar e a opção selecionada já não vale, limpa
  useEffect(() => {
    if (!freteGratis && result?.options && selected !== null && onSelectFrete) {
      const opt = result.options[selected];
      if (opt) onSelectFrete(opt.valor, opt.label);
    }
  }, [freteGratis]);

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return d;
  };

  const calcular = () => {
    if (cepLimpo.length < 8) return;
    setLoading(true);
    setSelected(null);
    setTimeout(() => {
      const r = calcularFrete(cep, qtdItens);
      setResult(r);
      setLoading(false);
    }, 500);
  };

  const selectOption = (i: number) => {
    setSelected(i);
    if (result?.options && onSelectFrete) {
      const opt = result.options[i];
      onSelectFrete(freteGratis ? 0 : opt.valor, opt.label);
    }
  };

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-plum-100 bg-white/60 p-4"
          : "rounded-2xl border border-plum-100 bg-white p-5 shadow-sm"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-plum-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-plum-100 text-plum-700">
            <Truck size={16} />
          </span>
          <h4 className={`font-serif font-semibold ${compact ? "text-base" : "text-lg"}`}>
            Calcular frete
          </h4>
        </div>
        <span className="hidden text-[0.65rem] font-semibold uppercase tracking-wider text-gold-600 sm:block">
          Barretos – SP
        </span>
      </div>

      {/* Progresso até frete grátis */}
      {totalPedido > 0 && totalPedido < FRETE_GRATIS_ACIMA && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[0.7rem] text-plum-700">
            <span className="flex items-center gap-1">
              <Gift size={12} className="text-gold-600" />
              Faltam <strong className="text-gold-700">R$ {restante.toFixed(2)}</strong> para frete grátis
            </span>
            <span className="tabular-nums text-plum-500">{Math.round(progresso)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-plum-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      )}
      {freteGratis && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-sage-400/40 bg-sage-400/15 px-3 py-2 text-xs font-semibold text-sage-600">
          <Check size={14} /> Frete grátis aplicado ao seu pedido 🎉
        </div>
      )}

      {/* Form — empilha em telas pequenas */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum-400" />
          <input
            inputMode="numeric"
            type="text"
            value={cep}
            onChange={(e) => {
              setCep(formatCep(e.target.value));
              setResult(null);
              setSelected(null);
            }}
            placeholder="00000-000"
            maxLength={9}
            aria-label="CEP de destino"
            className="w-full rounded-xl border border-plum-200 bg-cream-50 py-2.5 pl-9 pr-3 text-sm tabular-nums outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                calcular();
              }
            }}
          />
        </div>
        <button
          onClick={calcular}
          disabled={cepLimpo.length < 8 || loading}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-plum-700 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-plum-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
          {loading ? "Calculando…" : "Calcular"}
        </button>
      </div>

      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-[0.7rem] text-plum-500 underline-offset-2 hover:text-plum-700 hover:underline"
      >
        Não sabe seu CEP?
      </a>

      {result && !result.ok && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-rose-deep/10 px-3 py-2 text-xs text-rose-deep"
        >
          {result.error}
        </p>
      )}

      {result?.ok && result.options && (
        <div className="mt-4 space-y-2" role="radiogroup" aria-label="Opções de frete">
          {result.options.map((opt, i) => {
            const isSelected = selected === i;
            const finalVal = freteGratis ? 0 : opt.valor;
            return (
              <button
                key={opt.label}
                onClick={() => selectOption(i)}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                  isSelected
                    ? "border-plum-600 bg-plum-50 shadow-sm ring-1 ring-plum-300"
                    : "border-plum-100 bg-white hover:border-plum-300 hover:bg-plum-50/40"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isSelected ? "border-plum-700 bg-plum-700" : "border-plum-300 bg-white"
                  }`}
                >
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-cream-50" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-plum-800">{opt.label}</p>
                  <p className="text-[0.7rem] text-plum-900/55">{opt.prazo}</p>
                </div>
                <div className="text-right">
                  {freteGratis ? (
                    <>
                      <p className="text-[0.65rem] text-plum-400 line-through">R$ {opt.valor.toFixed(2)}</p>
                      <p className="font-serif text-base font-bold text-sage-600">Grátis</p>
                    </>
                  ) : (
                    <p className="font-serif text-base font-bold tabular-nums text-plum-800">
                      R$ {finalVal.toFixed(2)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
