import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X, ShoppingBag, Sparkles, ArrowRight, Filter, Grid3x3, LayoutGrid } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { useStore } from "../store/useStore";
import { useCart } from "../store/useCart";
import { useInteractions } from "../store/useInteractions";
import { useAuth } from "../store/useAuth";
import EditorialHeader from "../components/EditorialHeader";
import { whatsappLink } from "../data/site";

type Sort = "destaque" | "novidades" | "vendidos" | "az" | "menor" | "maior";
type ViewMode = "grid" | "compact";

export default function Produtos() {
  useReveal();
  usePageMeta({
    title: "Catálogo",
    description: "Incensos, ervas, defumações, banhos e kits artesanais. Filtre e encontre o aroma para o seu momento.",
  });

  const { products, categories } = useStore();
  const { addItem } = useCart();
  const { cliente } = useAuth();
  const { isFavorito, toggleFavorito } = useInteractions();

  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>(params.get("cat") ?? "Todos");
  const [sort, setSort] = useState<Sort>("destaque");
  const [view, setView] = useState<ViewMode>("grid");
  const [priceMax, setPriceMax] = useState<number>(0);

  useEffect(() => {
    const c = params.get("cat");
    if (c) setCat(c);
  }, [params]);

  const priceRange = useMemo(() => {
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 100) };
  }, [products]);

  useEffect(() => {
    if (priceMax === 0) setPriceMax(priceRange.max);
  }, [priceRange.max, priceMax]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat !== "Todos") list = list.filter((p) => p.category === cat);
    if (priceMax > 0) list = list.filter((p) => p.price <= priceMax);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.short.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "novidades": list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew)); break;
      case "vendidos": list.sort((a, b) => Number(!!b.bestSeller) - Number(!!a.bestSeller)); break;
      case "az": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "menor": list.sort((a, b) => a.price - b.price); break;
      case "maior": list.sort((a, b) => b.price - a.price); break;
      default: list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return list;
  }, [products, cat, query, sort, priceMax]);

  const setCategory = (c: string) => {
    setCat(c);
    if (c === "Todos") setParams({});
    else setParams({ cat: c });
  };

  const clearFilters = () => {
    setQuery("");
    setCat("Todos");
    setPriceMax(priceRange.max);
    setSort("destaque");
    setParams({});
  };

  const hasActiveFilters = query || cat !== "Todos" || priceMax < priceRange.max;

  return (
    <div className="relative">
      <EditorialHeader
        eyebrow="Catálogo"
        edition="Odoyá · Catálogo · Edição 01"
        title={
          <>
            Encontre o<br />
            <span className="italic text-gold-300">aroma que te</span><br />
            <span className="shimmer-text font-semibold">chama.</span>
          </>
        }
        subtitle={
          <>
            {products.length} composições vivas, todas feitas à mão em Barretos. Use a busca, os filtros ou deixe-se levar pelas categorias.
          </>
        }
        right={
          <div className="space-y-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold-400">Filtros ativos</p>
              <p className="mt-1 font-display text-3xl font-semibold text-cream-50">{filtered.length}</p>
              <p className="text-xs text-cream-100/60">produto{filtered.length === 1 ? "" : "s"} encontrado{filtered.length === 1 ? "" : "s"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Incensos Artesanais", "Banhos", "Ervas", "Defumações"].slice(0, 3).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider transition ${
                    cat === c
                      ? "border-gold-400 bg-gold-400/20 text-gold-200"
                      : "border-cream-100/20 text-cream-100/70 hover:border-gold-400/50"
                  }`}
                >
                  {c.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 border-b border-plum-100 bg-cream-50/95 shadow-sm backdrop-blur md:top-20">
        <div className="mx-auto max-w-[1400px] px-6 py-3 md:px-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-plum-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar aroma, benefício..."
                className="w-full rounded-full border border-plum-200 bg-white py-2.5 pl-11 pr-10 text-sm text-plum-800 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-plum-400 hover:bg-plum-50">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-full border border-plum-200 bg-white px-4 py-2.5 text-sm text-plum-800 outline-none transition focus:border-plum-500"
              >
                <option value="destaque">Ordenar: Destaques</option>
                <option value="novidades">Novidades</option>
                <option value="vendidos">Em destaque</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="az">A a Z</option>
              </select>

              {/* View toggle */}
              <div className="hidden items-center gap-0.5 rounded-full border border-plum-200 bg-white p-0.5 md:flex">
                <button
                  onClick={() => setView("grid")}
                  aria-pressed={view === "grid"}
                  className={`rounded-full p-2 transition ${view === "grid" ? "bg-plum-800 text-cream-50" : "text-plum-500 hover:bg-plum-50"}`}
                  title="Visão editorial"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setView("compact")}
                  aria-pressed={view === "compact"}
                  className={`rounded-full p-2 transition ${view === "compact" ? "bg-plum-800 text-cream-50" : "text-plum-500 hover:bg-plum-50"}`}
                  title="Visão compacta"
                >
                  <Grid3x3 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: sidebar + grid */}
      <section className="bg-cream-50 py-10 md:py-14">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 md:grid-cols-[240px_1fr] md:px-12">
          {/* Sidebar filters */}
          <aside className="space-y-8 md:sticky md:top-40 md:h-fit">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-plum-500">
                <Filter size={11} /> Categorias
              </p>
              <ul className="space-y-1">
                {categories.map((c) => {
                  const count = c === "Todos" ? products.length : products.filter((p) => p.category === c).length;
                  const active = cat === c;
                  return (
                    <li key={c}>
                      <button
                        onClick={() => setCategory(c)}
                        className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                          active
                            ? "bg-plum-900 text-cream-50"
                            : "text-plum-700 hover:bg-plum-100/60"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}
                          {c}
                        </span>
                        <span className={`text-xs tabular-nums ${active ? "text-gold-300" : "text-plum-400"}`}>{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-plum-500">Faixa de preço</p>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-plum-100">
                <div className="flex items-center justify-between text-xs text-plum-700">
                  <span>R$ {priceRange.min.toFixed(2)}</span>
                  <span className="font-semibold text-plum-900">até R$ {priceMax.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step="1"
                  value={priceMax}
                  onChange={(e) => setPriceMax(parseFloat(e.target.value))}
                  className="mt-3 h-1 w-full appearance-none rounded-full bg-plum-100 accent-plum-700"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gold-400/30 bg-gradient-to-br from-gold-300/15 to-plum-100/20 p-4">
              <p className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-700">
                <Sparkles size={11} /> Precisa de ajuda?
              </p>
              <p className="mt-2 text-xs leading-relaxed text-plum-800">
                A Jéssica pode te ajudar a escolher a composição ideal.
              </p>
              <a
                href={whatsappLink("Olá! Estou no catálogo e queria uma indicação.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Falar no WhatsApp
              </a>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-plum-200 py-2 text-xs text-plum-700 transition hover:bg-plum-50"
              >
                <X size={12} /> Limpar filtros
              </button>
            )}
          </aside>

          {/* Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="reveal rounded-3xl border border-dashed border-plum-200 bg-white py-24 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-plum-100 text-plum-700">
                  <Search size={22} />
                </div>
                <p className="mt-4 font-display text-3xl font-semibold text-plum-900">Nada encontrado por aqui</p>
                <p className="mt-2 text-sm text-plum-900/60">Tente outra palavra ou remova os filtros ativos.</p>
                <button onClick={clearFilters} className="mt-6 rounded-full bg-plum-800 px-6 py-2.5 text-sm font-semibold text-cream-50 hover:bg-plum-900">
                  Limpar filtros
                </button>
              </div>
            ) : view === "compact" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <article key={p.id} className="reveal group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-plum-100 transition hover:-translate-y-1 hover:shadow-xl">
                    <Link to={`/produtos/${p.id}`} className="relative block aspect-square overflow-hidden bg-plum-50">
                      {p.image ? (
                        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl" style={{ backgroundColor: `${p.color}20` }}>{p.emoji}</div>
                      )}
                      {p.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-plum-900/60 backdrop-blur-sm">
                          <span className="rounded-full bg-cream-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-deep">Esgotado</span>
                        </div>
                      )}
                    </Link>
                    <div className="p-3">
                      <p className="text-[0.6rem] font-bold uppercase tracking-wider text-gold-600">{p.category}</p>
                      <Link to={`/produtos/${p.id}`} className="mt-0.5 block truncate font-display text-base font-semibold text-plum-900 hover:text-plum-600">{p.name.replace(/^Incenso\s/, "")}</Link>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-display text-lg font-bold tabular-nums text-plum-900">R$ {p.price.toFixed(2).replace(".", ",")}</span>
                        <button
                          onClick={() => addItem(p)}
                          disabled={p.stock === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-800 text-cream-50 transition hover:bg-plum-900 disabled:opacity-40"
                          aria-label="Adicionar ao carrinho"
                        >
                          <ShoppingBag size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => {
                  const fav = cliente ? isFavorito(cliente.id, p.id) : false;
                  return (
                    <article
                      key={p.id}
                      className="reveal group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-plum-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                      style={{ transitionDelay: `${(i % 3) * 60}ms` }}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-plum-900">
                        {p.image ? (
                          <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-8xl" style={{ backgroundColor: `${p.color}30` }}>{p.emoji}</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-plum-950/70 via-transparent to-transparent" />

                        {/* Badges */}
                        <div className="absolute left-4 top-4 flex flex-col gap-1">
                          {p.isNew && <span className="rounded-full bg-sage-500 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">Novo</span>}
                          {p.bestSeller && <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-plum-950 shadow">Top</span>}
                          {p.stock > 0 && p.stock <= p.minStock && <span className="rounded-full bg-rose-deep px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow">Últimas</span>}
                        </div>

                        {/* Fav button */}
                        {cliente && (
                          <button
                            onClick={() => toggleFavorito(cliente.id, p.id)}
                            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-plum-800 backdrop-blur transition hover:scale-110"
                            aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? "#7a2436" : "none"} stroke="#7a2436" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        )}

                        {p.stock === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-plum-950/70 backdrop-blur-sm">
                            <span className="rounded-full bg-cream-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-deep">Esgotado</span>
                          </div>
                        )}

                        {/* Overlay text */}
                        <div className="absolute inset-x-0 bottom-0 p-5 text-cream-50">
                          <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold-300">{p.category}</p>
                          <Link to={`/produtos/${p.id}`} className="mt-1.5 block font-display text-2xl font-semibold leading-tight hover:text-gold-200">
                            {p.name.replace(/^Incenso\s/, "")}
                          </Link>
                          <p className="mt-1 font-display text-base italic text-gold-200/90">{p.short}</p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <p className="line-clamp-2 text-sm leading-relaxed text-plum-800/70">{p.description}</p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.benefits.slice(0, 3).map((b) => (
                            <span key={b} className="rounded-full bg-plum-50 px-2.5 py-0.5 text-[0.65rem] text-plum-700">{b}</span>
                          ))}
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                          <div>
                            <p className="text-[0.6rem] uppercase tracking-wider text-plum-500">{p.weight}</p>
                            <p className="font-display text-2xl font-bold tabular-nums text-plum-900">
                              R$ {p.price.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                          <button
                            onClick={() => addItem(p)}
                            disabled={p.stock === 0}
                            className="flex items-center gap-1.5 rounded-full bg-plum-900 px-4 py-2.5 text-xs font-semibold text-cream-50 transition hover:bg-plum-950 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ShoppingBag size={14} /> Adicionar
                          </button>
                        </div>
                        <Link to={`/produtos/${p.id}`} className="mt-3 flex items-center justify-center gap-1 text-[0.7rem] font-semibold text-plum-500 hover:text-plum-900">
                          Ver detalhes <ArrowRight size={11} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-plum-900 py-20 text-cream-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,154,58,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-400">Não encontrou o que procurava?</p>
          <h3 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
            Peça uma <span className="italic text-gold-300">composição sob medida</span>
          </h3>
          <p className="mt-4 text-cream-100/70">
            Kits personalizados, aromas por intenção ou uma dúvida sobre um ingrediente — chama a gente no WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappLink("Olá! Gostaria de uma composição personalizada.")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-gold-300"
            >
              Falar no WhatsApp <ArrowRight size={16} />
            </a>
            <Link to="/pagamento" className="inline-flex items-center gap-2 rounded-full border border-cream-100/30 px-6 py-3 text-sm font-semibold text-cream-50 hover:border-gold-400">
              Ver formas de pagamento
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
