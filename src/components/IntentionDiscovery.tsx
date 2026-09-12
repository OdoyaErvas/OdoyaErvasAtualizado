import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, ArrowRight, HelpCircle } from "lucide-react";
import type { Product } from "../data/products";
import { useCart } from "../store/useCart";

type Intention = {
  id: string;
  label: string;
  emoji: string;
  products: string[];
  color: string;
  desc: string;
};

type Props = {
  intentions: Intention[];
  activeIntention: Intention;
  setActiveIntention: (i: Intention) => void;
  recommended: Product[];
};

export default function IntentionDiscovery({
  intentions,
  activeIntention,
  setActiveIntention,
  recommended,
}: Props) {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAdd = (p: Product) => {
    addItem(p);
    setAddedIds((prev) => new Set(prev).add(p.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }, 1800);
  };

  return (
    <section className="bg-cream-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="mb-10 max-w-2xl md:mb-14">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.35em] text-plum-500">
            Escolha sua intenção
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-plum-900 md:text-4xl lg:text-5xl">
            Qual energia você quer{" "}
            <span className="italic text-plum-600">trazer hoje?</span>
          </h2>
        </div>

        {/* Intention selector — horizontal pills */}
        <div className="mb-10 flex flex-wrap gap-2 md:mb-12" role="tablist" aria-label="Intenções">
          {intentions.map((it) => {
            const active = it.id === activeIntention.id;
            return (
              <button
                key={it.id}
                onClick={() => setActiveIntention(it)}
                role="tab"
                aria-selected={active}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-plum-900 text-cream-50 shadow-lg shadow-plum-900/20"
                    : "border border-plum-200 bg-white text-plum-700 hover:border-plum-400 hover:bg-plum-50"
                }`}
              >
                <span className="text-base">{it.emoji}</span>
                {it.label}
              </button>
            );
          })}
        </div>

        {/* Active intention — description + product grid */}
        <div role="tabpanel" aria-label={activeIntention.label}>
          {/* Intention context */}
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-plum-100 bg-white p-5 shadow-sm md:items-center md:p-6">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-inner"
              style={{ backgroundColor: `${activeIntention.color}18` }}
            >
              {activeIntention.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-2xl font-semibold text-plum-900 md:text-3xl">
                {activeIntention.label}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-plum-700/75">
                {activeIntention.desc}
              </p>
            </div>
          </div>

          {/* Product cards */}
          {recommended.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-plum-200 bg-white py-16 text-center">
              <p className="font-display text-2xl text-plum-800">Em breve</p>
              <p className="mt-1 text-sm text-plum-500">Novas composições para essa intenção estão sendo preparadas.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommended.map((p) => {
                const justAdded = addedIds.has(p.id);
                const outOfStock = !p.available || p.stock === 0;

                return (
                  <article
                    key={p.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum-900/8"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-plum-50">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-5xl"
                          style={{ backgroundColor: `${p.color}15` }}
                        >
                          {p.emoji}
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute left-3 top-3 flex flex-col gap-1">
                        {p.bestSeller && (
                          <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-plum-950 shadow">
                            Em destaque
                          </span>
                        )}
                        {p.isNew && !p.bestSeller && (
                          <span className="rounded-full bg-sage-500 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">
                            Novidade
                          </span>
                        )}
                      </div>
                      {outOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-plum-950/50 backdrop-blur-[2px]">
                          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-deep">Esgotado</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold-600">
                        {p.category}
                      </p>
                      <h4 className="mt-1 font-display text-lg font-semibold leading-snug text-plum-900">
                        {p.name.replace(/^Incenso\s/, "")}
                      </h4>
                      <p className="mt-1 text-xs italic text-plum-600" style={{ color: p.color }}>
                        {p.short}
                      </p>

                      {/* Top benefit */}
                      {p.benefits[0] && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-plum-700/70">
                          <Check size={12} className="shrink-0 text-sage-500" />
                          {p.benefits[0]}
                        </p>
                      )}

                      {/* Price + CTA */}
                      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-wider text-plum-500">{p.weight}</p>
                          <p className="font-display text-xl font-bold tabular-nums text-plum-900">
                            R$ {p.price.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAdd(p)}
                          disabled={outOfStock}
                          aria-label={`Adicionar ${p.name} ao carrinho`}
                          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                            outOfStock
                              ? "cursor-not-allowed bg-plum-100 text-plum-400"
                              : justAdded
                              ? "bg-sage-500 text-white shadow-md"
                              : "bg-plum-900 text-cream-50 shadow-md hover:bg-plum-950"
                          }`}
                        >
                          {outOfStock ? (
                            "Esgotado"
                          ) : justAdded ? (
                            <><Check size={13} /> Adicionado</>
                          ) : (
                            <><ShoppingBag size={13} /> Adicionar ao ritual</>
                          )}
                        </button>
                      </div>

                      {/* Secondary link */}
                      <Link
                        to={`/produtos/${p.id}`}
                        className="mt-2 flex items-center justify-center gap-1 text-[0.7rem] font-semibold text-plum-500 transition hover:text-plum-800"
                      >
                        Ver produto <ArrowRight size={11} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Help CTA — quiz teaser */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-plum-100 bg-gradient-to-r from-plum-50 to-cream-50 px-6 py-5 sm:flex-row md:px-8">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <HelpCircle size={22} className="shrink-0 text-plum-600" />
              <div>
                <p className="font-display text-lg font-semibold text-plum-900">Não sabe qual escolher?</p>
                <p className="text-xs text-plum-600">Responda 2 perguntas e descubra o aroma ideal para você.</p>
              </div>
            </div>
            <Link
              to="/"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById("oraculo-ritual")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="flex shrink-0 items-center gap-2 rounded-full border border-plum-300 bg-white px-5 py-2.5 text-sm font-bold text-plum-800 shadow-sm transition hover:border-plum-500 hover:bg-plum-50"
            >
              Fazer meu ritual personalizado
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
