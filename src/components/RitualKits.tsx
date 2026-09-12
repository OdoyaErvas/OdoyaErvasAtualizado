import { useMemo, useState } from "react";
import { ShoppingBag, Check, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useCart } from "../store/useCart";
import { RITUAL_KITS, type RitualKit } from "../data/kits";
import type { Product } from "../data/products";

type ResolvedKit = RitualKit & {
  products: Product[];
  totalIndividual: number;
  promoPrice: number;
  savings: number;
};

function useResolvedKits(onlyFeatured = false): ResolvedKit[] {
  const { products } = useStore();

  return useMemo(() => {
    const source = onlyFeatured ? RITUAL_KITS.filter((k) => k.featured) : RITUAL_KITS;

    return source
      .map((kit) => {
        const resolved = kit.productIds
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is Product => !!p && p.available && p.stock > 0);

        if (resolved.length === 0) return null;

        const totalIndividual = resolved.reduce((s, p) => s + p.price, 0);
        const promoPrice =
          kit.discountPct > 0
            ? Math.round(totalIndividual * (1 - kit.discountPct / 100) * 100) / 100
            : totalIndividual;
        const savings = totalIndividual - promoPrice;

        return { ...kit, products: resolved, totalIndividual, promoPrice, savings };
      })
      .filter((k): k is ResolvedKit => k !== null);
  }, [products, onlyFeatured]);
}

/* ═══════════════════════════════════════════════════════
   Seção da homepage — "Rituais prontos para você"
   ═══════════════════════════════════════════════════════ */

export default function RitualKitsSection() {
  const kits = useResolvedKits(true);
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAddKit = (kit: ResolvedKit) => {
    kit.products.forEach((p) => addItem(p));
    setAddedIds((prev) => new Set(prev).add(kit.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const n = new Set(prev);
        n.delete(kit.id);
        return n;
      });
    }, 2200);
  };

  if (kits.length === 0) return null;

  return (
    <section className="bg-cream-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <div className="max-w-xl">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.35em] text-plum-500">
              Kits & rituais
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-plum-900 md:text-4xl lg:text-5xl">
              Rituais prontos{" "}
              <span className="italic text-plum-600">para você.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-plum-700/75">
              Combinamos os aromas certos para cada intenção. Compre junto, economize e receba tudo pronto para o seu ritual.
            </p>
          </div>
          <Link
            to="/produtos"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-plum-700 transition hover:text-plum-900"
          >
            Ver todos os kits
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Kit cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kits.slice(0, 3).map((kit) => {
            const added = addedIds.has(kit.id);

            return (
              <article
                key={kit.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image header */}
                <div className="relative h-48 overflow-hidden md:h-56">
                  <img
                    src={kit.image || kit.products[0]?.image || ""}
                    alt={kit.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-950/70 via-plum-950/20 to-transparent" />

                  {/* Intention badge */}
                  <div className="absolute left-4 top-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow-lg"
                      style={{ backgroundColor: kit.color }}
                    >
                      <span className="text-sm">{kit.emoji}</span>
                      {kit.intention}
                    </span>
                  </div>

                  {/* Savings badge */}
                  {kit.savings > 0 && (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-plum-950 shadow-lg">
                        <Tag size={10} />
                        Economize R$ {kit.savings.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}

                  {/* Kit name overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-2xl font-semibold text-cream-50 md:text-3xl">
                      {kit.name}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm leading-relaxed text-plum-700/80">
                    {kit.description}
                  </p>

                  {/* Product list */}
                  <div className="mt-4 space-y-2">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-plum-500">
                      Inclui {kit.products.length} {kit.products.length === 1 ? "produto" : "produtos"}
                    </p>
                    {kit.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-xl bg-cream-50 p-2 ring-1 ring-plum-100/60"
                      >
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                            style={{ backgroundColor: `${p.color}15` }}
                          >
                            {p.emoji}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-plum-800">
                            {p.name}
                          </p>
                          <p className="text-[0.65rem] text-plum-500">{p.weight}</p>
                        </div>
                        <p className="text-xs font-semibold tabular-nums text-plum-600">
                          R$ {p.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="mt-auto border-t border-plum-100 pt-4 mt-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        {kit.savings > 0 && (
                          <p className="text-xs text-plum-500 line-through tabular-nums">
                            R$ {kit.totalIndividual.toFixed(2).replace(".", ",")}
                          </p>
                        )}
                        <p className="font-display text-2xl font-bold tabular-nums text-plum-900">
                          R$ {kit.promoPrice.toFixed(2).replace(".", ",")}
                        </p>
                        {kit.savings > 0 && (
                          <p className="text-[0.65rem] font-semibold text-sage-700">
                            {kit.discountPct}% off comprando junto
                          </p>
                        )}
                        {kit.savings === 0 && kit.discountPct === 0 && (
                          <p className="text-[0.65rem] text-plum-500">
                            Preço promocional em breve
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleAddKit(kit)}
                      disabled={added}
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                        added
                          ? "bg-sage-500 text-white shadow-md"
                          : "bg-plum-900 text-cream-50 shadow-lg shadow-plum-900/20 hover:bg-plum-950"
                      }`}
                    >
                      {added ? (
                        <><Check size={15} /> Adicionado ao carrinho</>
                      ) : (
                        <><ShoppingBag size={15} /> Quero este ritual</>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
