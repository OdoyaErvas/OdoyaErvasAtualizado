import { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, ShoppingBag, Check, MessageCircle, Sparkles, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useCart } from "../store/useCart";
import { whatsappLink } from "../data/site";
import type { Product } from "../data/products";

/* ═══════════════════════════════════════════════════════
   Perguntas — cada valor alimenta o engine de recomendação
   ═══════════════════════════════════════════════════════ */

type Option = { label: string; value: string; emoji: string };

const Q1: Option[] = [
  { label: "Proteção", value: "protecao", emoji: "🛡️" },
  { label: "Amor", value: "amor", emoji: "❤️" },
  { label: "Prosperidade", value: "prosperidade", emoji: "✨" },
  { label: "Calma", value: "calma", emoji: "🌙" },
  { label: "Renovação", value: "renovacao", emoji: "🌿" },
];

const Q2: Option[] = [
  { label: "Casa", value: "casa", emoji: "🏠" },
  { label: "Quarto", value: "quarto", emoji: "🛏️" },
  { label: "Trabalho", value: "trabalho", emoji: "💼" },
  { label: "Momento espiritual", value: "espiritual", emoji: "🕯️" },
  { label: "Presente", value: "presente", emoji: "🎁" },
];

const Q3: Option[] = [
  { label: "Até R$30", value: "30", emoji: "💰" },
  { label: "R$30 a R$60", value: "60", emoji: "💎" },
  { label: "R$60 a R$100", value: "100", emoji: "👑" },
  { label: "Quero um ritual completo", value: "999", emoji: "✦" },
];

const STEPS = [
  { id: "busca", title: "O que você busca hoje?", subtitle: "Selecione a intenção que mais faz sentido para o seu momento.", options: Q1 },
  { id: "local", title: "Onde você pretende usar?", subtitle: "Isso nos ajuda a sugerir formato e intensidade ideais.", options: Q2 },
  { id: "investimento", title: "Quanto deseja investir?", subtitle: "Encontramos a melhor combinação no seu orçamento.", options: Q3 },
];

/* ═══════════════════════════════════════════════════════
   Engine de recomendação — mapeia respostas para IDs reais
   ═══════════════════════════════════════════════════════ */

const INTENTION_PRODUCTS: Record<string, string[]> = {
  protecao: ["arruda", "defumacao-ervas", "banho-sete-ervas"],
  amor: ["rosas-rubras", "lavanda-rosas-rubras", "banho-alecrim"],
  prosperidade: ["canela-anis", "alecrim-ervas", "defumacao-ervas"],
  calma: ["lavanda", "lavanda-rosas-rubras", "banho-alecrim"],
  renovacao: ["banho-sete-ervas", "arruda", "alecrim-ervas"],
};

const INTENTION_LABELS: Record<string, { label: string; emoji: string }> = {
  protecao: { label: "Proteção & Limpeza", emoji: "🛡️" },
  amor: { label: "Amor & Harmonia", emoji: "❤️" },
  prosperidade: { label: "Prosperidade & Abundância", emoji: "✨" },
  calma: { label: "Calma & Serenidade", emoji: "🌙" },
  renovacao: { label: "Renovação & Recomeço", emoji: "🌿" },
};

function recommend(
  answers: Record<string, string>,
  catalog: Product[]
): { main: Product | null; complementary: Product[]; kit: Product | null; intention: string } {
  const busca = answers.busca ?? "calma";
  const maxPrice = parseInt(answers.investimento ?? "30", 10);
  const isPresente = answers.local === "presente";

  const candidateIds = INTENTION_PRODUCTS[busca] ?? [];
  const candidates = candidateIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Product => !!p && p.available && p.stock > 0);

  // Filter by budget
  const inBudget = candidates.filter((p) => p.price <= maxPrice);
  const pool = inBudget.length > 0 ? inBudget : candidates;

  const main = pool[0] ?? null;
  const complementary = pool.slice(1, 3);

  // Kit suggestion: if "ritual completo" or budget allows, suggest the kit
  const kit =
    maxPrice >= 60 || isPresente
      ? catalog.find((p) => p.id === "kit-composicoes" && p.available && p.stock > 0) ?? null
      : null;

  return { main, complementary, kit, intention: busca };
}

/* ═══════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════ */

export default function AuraQuiz() {
  const { products } = useStore();
  const { addItem } = useCart();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const totalSteps = STEPS.length;
  const showResult = step >= totalSteps;
  const current = STEPS[step];

  const handleSelect = (val: string) => {
    const next = { ...answers, [current.id]: val };
    setAnswers(next);
    setStep(step + 1);
  };

  const result = useMemo(
    () => (showResult ? recommend(answers, products) : null),
    [showResult, answers, products]
  );

  const reset = () => {
    setStep(0);
    setAnswers({});
    setAddedIds(new Set());
  };

  const handleAdd = (p: Product) => {
    addItem(p);
    setAddedIds((prev) => new Set(prev).add(p.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const n = new Set(prev);
        n.delete(p.id);
        return n;
      });
    }, 2000);
  };

  const intentionMeta = result ? INTENTION_LABELS[result.intention] ?? { label: "Seu ritual", emoji: "✦" } : null;

  // All recommended products for the WhatsApp message
  const allRecommended = result
    ? [result.main, ...result.complementary, result.kit].filter((p): p is Product => !!p)
    : [];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-xl">
      {/* ─── Questions ─── */}
      {!showResult && current && (
        <div className="p-6 md:p-8">
          {/* Progress */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-plum-500">
              <Sparkles size={11} /> Encontre seu ritual
            </p>
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < step ? "w-6 bg-gold-500" : i === step ? "w-8 bg-plum-700" : "w-4 bg-plum-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <h3 className="font-display text-2xl font-semibold leading-tight text-plum-900 md:text-3xl">
            {current.title}
          </h3>
          <p className="mt-1 text-sm text-plum-600">{current.subtitle}</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="group flex items-center gap-3 rounded-2xl border border-plum-100 bg-cream-50/50 px-4 py-3.5 text-left text-sm font-medium text-plum-800 transition hover:border-plum-400 hover:bg-plum-50 hover:shadow-md active:scale-[0.98]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-plum-100 transition group-hover:ring-plum-300">
                  {opt.emoji}
                </span>
                <span className="flex-1 leading-snug">{opt.label}</span>
                <ArrowRight size={14} className="text-plum-300 transition group-hover:translate-x-1 group-hover:text-plum-600" />
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-plum-500 transition hover:text-plum-700"
            >
              <ArrowLeft size={13} /> Voltar
            </button>
          )}
        </div>
      )}

      {/* ─── Result ─── */}
      {showResult && result && (
        <div>
          {/* Header */}
          <div className="bg-plum-900 px-6 py-6 text-cream-50 md:px-8 md:py-8">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-300">Seu ritual combina com</p>
            <h3 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold md:text-4xl">
              <span className="text-4xl">{intentionMeta?.emoji}</span>
              {intentionMeta?.label}
            </h3>
            <p className="mt-2 max-w-lg text-sm text-cream-100/75">
              Com base nas suas respostas, selecionamos os produtos mais indicados para o seu momento.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-4 p-6 md:p-8">
            {/* Main product */}
            {result.main && (
              <ProductResultCard
                product={result.main}
                label="Produto principal"
                addedIds={addedIds}
                onAdd={handleAdd}
              />
            )}

            {/* Complementary */}
            {result.complementary.length > 0 && (
              <div>
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-plum-500">
                  Complementos sugeridos
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.complementary.map((p) => (
                    <ProductResultCard
                      key={p.id}
                      product={p}
                      compact
                      addedIds={addedIds}
                      onAdd={handleAdd}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Kit suggestion */}
            {result.kit && !allRecommended.some((p) => p.id === result.kit!.id && p.id !== result.kit!.id) && (
              <div className="rounded-2xl border border-gold-400/40 bg-gradient-to-r from-gold-300/10 to-plum-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 sm:flex-1">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-2xl">
                      <Gift size={22} className="text-gold-600" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold-700">Ritual completo</p>
                      <p className="font-display text-lg font-semibold text-plum-900">{result.kit.name}</p>
                      <p className="text-xs text-plum-600">{result.kit.short} · <strong>R$ {result.kit.price.toFixed(2).replace(".", ",")}</strong></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(result.kit!)}
                    disabled={addedIds.has(result.kit.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition active:scale-95 ${
                      addedIds.has(result.kit.id)
                        ? "bg-sage-500 text-white"
                        : "bg-plum-900 text-cream-50 hover:bg-plum-950"
                    }`}
                  >
                    {addedIds.has(result.kit.id) ? <><Check size={13} /> Adicionado</> : <><ShoppingBag size={13} /> Adicionar kit</>}
                  </button>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 border-t border-plum-100 pt-5 sm:flex-row">
              <a
                href={whatsappLink(
                  `Olá! Fiz o quiz no site e meu ritual combinou com *${intentionMeta?.label}*.\n\nProdutos sugeridos:\n${allRecommended.map((p) => `• ${p.name}`).join("\n")}\n\nGostaria de ajuda para finalizar meu pedido. 🌿`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-plum-200 bg-white px-5 py-3 text-sm font-bold text-plum-800 transition hover:border-plum-400 hover:bg-plum-50"
              >
                <MessageCircle size={15} /> Quero ajuda no WhatsApp
              </a>
              <button
                onClick={reset}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-plum-200 px-5 py-3 text-sm font-semibold text-plum-500 transition hover:bg-plum-50"
              >
                Refazer quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback — no main product */}
      {showResult && result && !result.main && (
        <div className="p-8 text-center">
          <p className="font-display text-2xl text-plum-800">Nosso catálogo está se renovando</p>
          <p className="mt-2 text-sm text-plum-500">Em breve teremos novas composições para essa intenção.</p>
          <Link to="/produtos" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-plum-700 hover:text-plum-900">
            Ver todos os produtos <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Product card — reusável dentro do resultado
   ═══════════════════════════════════════════════════════ */

function ProductResultCard({
  product,
  label,
  compact = false,
  addedIds,
  onAdd,
}: {
  product: Product;
  label?: string;
  compact?: boolean;
  addedIds: Set<string>;
  onAdd: (p: Product) => void;
}) {
  const added = addedIds.has(product.id);

  return (
    <div className={`flex gap-4 rounded-2xl border border-plum-100 bg-cream-50/50 p-4 transition hover:shadow-md ${compact ? "" : "sm:items-center"}`}>
      {/* Image */}
      <div className={`shrink-0 overflow-hidden rounded-xl ${compact ? "h-16 w-16" : "h-20 w-20 sm:h-24 sm:w-24"}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl" style={{ backgroundColor: `${product.color}15` }}>
            {product.emoji}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        {label && (
          <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold-600">{label}</p>
        )}
        <h4 className={`font-display font-semibold leading-snug text-plum-900 ${compact ? "text-base" : "text-lg md:text-xl"}`}>
          {product.name.replace(/^Incenso\s/, "")}
        </h4>
        <p className="mt-0.5 text-xs italic" style={{ color: product.color }}>{product.short}</p>

        {!compact && product.benefits.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.benefits.slice(0, 3).map((b) => (
              <span key={b} className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[0.65rem] text-plum-700 ring-1 ring-plum-100">
                <Check size={10} className="text-sage-500" /> {b}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-display text-lg font-bold tabular-nums text-plum-900">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <span className="text-[0.65rem] text-plum-500">{product.weight}</span>
        </div>
      </div>

      {/* Add button */}
      <div className="flex shrink-0 flex-col items-end justify-end gap-1.5">
        <button
          onClick={() => onAdd(product)}
          disabled={added}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
            added
              ? "bg-sage-500 text-white"
              : "bg-plum-900 text-cream-50 hover:bg-plum-950"
          }`}
        >
          {added ? <><Check size={12} /> Ok</> : <><ShoppingBag size={12} /> Adicionar</>}
        </button>
        <Link
          to="/produtos"
          className="text-[0.65rem] font-semibold text-plum-500 hover:text-plum-800"
        >
          Ver produto →
        </Link>
      </div>
    </div>
  );
}
