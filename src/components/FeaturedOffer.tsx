import { ArrowRight, Calendar, Check, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useOffers } from "../store/useOffers";
import { useStore } from "../store/useStore";
import { useCart } from "../store/useCart";
import { RITUAL_KITS } from "../data/kits";
import type { Product } from "../data/products";

const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function FeaturedOffer() {
  const { activeOffer } = useOffers();
  const { products } = useStore();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!activeOffer) return null;

  let offerProducts: Product[] = [];
  let defaultName = "";
  let defaultDescription = "";
  let defaultImage = "";
  let defaultOriginal = 0;
  let targetUrl = "/produtos";

  if (activeOffer.kind === "product") {
    const product = products.find((item) => item.id === activeOffer.referenceId);
    if (!product || !product.available || product.stock <= 0) return null;
    offerProducts = [product];
    defaultName = product.name;
    defaultDescription = product.description;
    defaultImage = product.image || "";
    defaultOriginal = product.price;
    targetUrl = `/produtos/${product.id}`;
  } else {
    const kit = RITUAL_KITS.find((item) => item.id === activeOffer.referenceId);
    if (!kit) return null;
    offerProducts = kit.productIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => !!product && product.available && product.stock > 0);
    if (!offerProducts.length) return null;
    defaultName = kit.name;
    defaultDescription = kit.description;
    defaultImage = kit.image || offerProducts[0]?.image || "";
    defaultOriginal = offerProducts.reduce((sum, product) => sum + product.price, 0);
  }

  const originalPrice = activeOffer.originalPrice && activeOffer.originalPrice > 0
    ? activeOffer.originalPrice
    : defaultOriginal;
  const hasPromotion = Boolean(
    activeOffer.promotionalPrice &&
    activeOffer.promotionalPrice > 0 &&
    activeOffer.promotionalPrice < originalPrice
  );
  const promotionalPrice = hasPromotion ? activeOffer.promotionalPrice! : originalPrice;
  const savings = hasPromotion ? originalPrice - promotionalPrice : 0;

  const title = activeOffer.title.trim() || defaultName;
  const description = activeOffer.description.trim() || defaultDescription;
  const image = activeOffer.image || defaultImage;
  const isTrueLimitedStock = activeOffer.badge === "Enquanto durar o estoque";

  const handleAdd = () => {
    offerProducts.forEach((product) => addItem(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <section className="bg-cream-100 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-8">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.35em] text-plum-500">Ritual em destaque</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-plum-950 md:text-5xl">
            Uma escolha especial,<br /><span className="italic text-plum-600">sem excesso de ofertas.</span>
          </h2>
        </div>

        <article className="grid overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[320px] overflow-hidden bg-plum-100 md:min-h-[440px]">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center text-7xl">{activeOffer.kind === "kit" ? "🎁" : "🌿"}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-plum-950/55 via-transparent to-transparent" />
            {activeOffer.badge && (
              <span className="absolute left-5 top-5 rounded-full bg-gold-400 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-plum-950 shadow-lg">
                {activeOffer.badge}
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
            <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-gold-600">
              <Sparkles size={13} /> {activeOffer.kind === "kit" ? "Ritual completo" : "Produto selecionado"}
            </p>
            <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-plum-950 md:text-4xl">
              {title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-plum-700/80 md:text-base">
              {description}
            </p>

            {activeOffer.kind === "kit" && (
              <ul className="mt-5 space-y-2 text-xs text-plum-700">
                {offerProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-2">
                    <Check size={12} className="text-sage-600" /> {product.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
              {hasPromotion && (
                <span className="text-sm text-plum-400 line-through">{brl(originalPrice)}</span>
              )}
              <span className="font-display text-4xl font-bold tabular-nums text-plum-950">
                {brl(promotionalPrice)}
              </span>
              {savings > 0 && (
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-sage-400/15 px-2.5 py-1 text-[0.65rem] font-bold text-sage-700">
                  <Tag size={10} /> Economia de {brl(savings)}
                </span>
              )}
            </div>

            {activeOffer.validUntil && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-plum-500">
                <Calendar size={12} /> Condição válida até {new Date(`${activeOffer.validUntil}T12:00:00`).toLocaleDateString("pt-BR")}
              </p>
            )}
            {isTrueLimitedStock && (
              <p className="mt-2 text-xs font-semibold text-gold-700">Disponível somente enquanto houver estoque real dos itens.</p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition active:scale-[0.99] ${added ? "bg-sage-500 text-white" : "bg-plum-900 text-cream-50 hover:bg-plum-950"}`}
              >
                {added ? <><Check size={15} /> Adicionado ao carrinho</> : <><ShoppingBag size={15} /> {activeOffer.cta || "Quero este ritual"}</>}
              </button>
              <Link to={targetUrl} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-plum-200 bg-white px-6 py-3.5 text-sm font-bold text-plum-700 transition hover:border-plum-400 hover:bg-plum-50">
                Ver detalhes <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}