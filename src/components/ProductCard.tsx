import { useMemo, useState } from "react";
import { Heart, ThumbsUp, ShoppingBag, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../data/products";
import { useAuth } from "../store/useAuth";
import { useInteractions } from "../store/useInteractions";
import { useCart } from "../store/useCart";

export default function ProductCard({ product, hideInteractions = false }: { product: Product; hideInteractions?: boolean }) {
  const { cliente } = useAuth();
  const { isFavorito, isGostou, toggleFavorito, toggleGostou, countFavoritos, countGostou } = useInteractions();
  const { addItem } = useCart();
  const nav = useNavigate();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = !product.available || product.stock === 0;

  // Partículas determinísticas de aroma (uma vez por card)
  const aromaParticles = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const seed = (product.id.charCodeAt(i % product.id.length) + i * 37) % 100;
        return {
          left: 20 + (seed % 60),
          delay: (seed % 20) / 10,
          drift: ((seed % 20) - 10) / 2,
          duration: 2 + (seed % 20) / 10,
        };
      }),
    [product.id]
  );

  const handleAdd = () => {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const fav = isFavorito(cliente?.id ?? null, product.id);
  const liked = isGostou(cliente?.id ?? null, product.id);
  const favCount = countFavoritos(product.id);
  const likeCount = countGostou(product.id);

  const requireLogin = (fn: () => void) => () => {
    if (!cliente) { nav("/login"); return; }
    fn();
  };

  return (
    <article className="product-cursor-area group flex flex-col overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-plum-900/10">
      <div
        className="relative flex h-60 items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${product.color}22, ${product.color}0a 60%, #fbf8f2)` }}
      >
        <Link
          to={`/produtos/${product.id}`}
          className="absolute inset-0 z-[1]"
          aria-label={`Ver detalhes de ${product.name}`}
        />
        {/* Partículas de aroma — só aparecem no hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {aromaParticles.map((p, i) => (
            <span
              key={i}
              className="aroma-particle"
              style={{
                left: `${p.left}%`,
                bottom: "20%",
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                // @ts-ignore custom property
                "--drift": `${p.drift}px`,
              }}
            />
          ))}
        </div>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span
              className="flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-inner transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundColor: `${product.color}22` }}
            >
              {product.emoji}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-gold-500 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white shadow">Novidade</span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-plum-700 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white shadow">Em destaque</span>
          )}
        </div>
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
          {!product.available || product.stock === 0 ? (
            <span className="rounded-full bg-rose-deep px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white shadow">Esgotado</span>
          ) : product.stock <= product.minStock ? (
            <span className="rounded-full bg-amber-600 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white shadow">Últimas unidades</span>
          ) : null}
        </div>

        {/* Interaction buttons */}
        {!hideInteractions && (
          <div className="absolute bottom-3 right-3 z-10 flex gap-2 opacity-80 transition group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); requireLogin(() => toggleFavorito(cliente!.id, product.id))(); }}
              title={fav ? "Remover dos favoritos" : "Favoritar"}
              className={`flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs shadow-md transition hover:scale-105 ${fav ? "text-rose-deep" : "text-plum-600"}`}
            >
              <Heart size={14} className={fav ? "fill-rose-deep" : ""} />
              {favCount > 0 && <span>{favCount}</span>}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); requireLogin(() => toggleGostou(cliente!.id, product.id))(); }}
              title={liked ? "Remover curtida" : "Gostei"}
              className={`flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs shadow-md transition hover:scale-105 ${liked ? "text-gold-600" : "text-plum-600"}`}
            >
              <ThumbsUp size={14} className={liked ? "fill-gold-500" : ""} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-gold-600">{product.category}</span>
        <Link to={`/produtos/${product.id}`} className="mt-1 font-serif text-xl font-semibold leading-snug text-plum-800 transition hover:text-plum-600">{product.name}</Link>
        <p className="mt-1 font-serif text-base italic" style={{ color: product.color }}>{product.short}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-plum-900/60">{product.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.benefits.slice(0, 2).map((b) => (
            <span key={b} className="rounded-full bg-plum-50 px-2.5 py-1 text-[0.7rem] text-plum-600">{b}</span>
          ))}
        </div>

        <p className="mt-4 text-xs text-plum-900/50">{product.weight}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wider text-plum-500">A partir de</p>
            <p className="font-serif text-2xl font-semibold text-plum-800 leading-none">
              {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
              outOfStock
                ? "cursor-not-allowed bg-plum-100 text-plum-400"
                : justAdded
                ? "bg-sage-500 text-white shadow-lg shadow-sage-900/20"
                : "bg-plum-700 text-cream-50 hover:bg-plum-800 hover:shadow-lg hover:shadow-plum-900/20"
            }`}
          >
            {outOfStock ? "Esgotado" : justAdded ? <><Check size={14} /> Adicionado</> : <><ShoppingBag size={14} /> Adicionar</>}
          </button>
        </div>
      </div>
    </article>
  );
}
