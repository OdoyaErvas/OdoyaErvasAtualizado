import { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, MessageCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { useStore } from "../store/useStore";
import { useCart } from "../store/useCart";
import EditorialHeader from "../components/EditorialHeader";
import { whatsappLink } from "../data/site";

const AMBIENTE_IMGS = [
  { src: "/images/hero-altar.jpg", title: "Altar de trabalho", caption: "Onde os aromas nascem" },
  { src: "/images/sobre-processo.jpg", title: "Processo artesanal", caption: "Cada vareta enrolada à mão" },
  { src: "/images/prod-lavanda-rosas.jpg", title: "Kit completo", caption: "Cinco composições, cinco propósitos" },
  { src: "/images/banho-ervas.jpg", title: "Banho de ervas", caption: "Ritual de renovação" },
];

export default function Galeria() {
  useReveal();
  usePageMeta({
    title: "Galeria",
    description: "Rótulos, embalagens e ambientes. Um olhar sobre a beleza artesanal da Odoyá.",
  });

  const { products } = useStore();
  const { addItem } = useCart();
  const [active, setActive] = useState<number | null>(null);
  const [filter, setFilter] = useState<"todos" | "produtos" | "ambiente">("todos");

  const items = useMemo(() => {
    const prodItems = products
      .filter((p) => p.image)
      .map((p) => ({
        type: "produto" as const,
        src: p.image!,
        title: p.name,
        caption: p.short,
        product: p,
      }));
    const ambItems = AMBIENTE_IMGS.map((a) => ({
      type: "ambiente" as const,
      src: a.src,
      title: a.title,
      caption: a.caption,
      product: null,
    }));
    if (filter === "produtos") return prodItems;
    if (filter === "ambiente") return ambItems;
    return [...prodItems, ...ambItems];
  }, [products, filter]);

  const close = () => setActive(null);
  const prev = () => setActive((i) => (i === null ? i : (i - 1 + items.length) % items.length));
  const next = () => setActive((i) => (i === null ? i : (i + 1) % items.length));

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  // Masonry-like: cada item ganha um span aleatório baseado no index
  const spans = [
    "md:row-span-2",
    "",
    "md:col-span-2",
    "",
    "",
    "md:row-span-2 md:col-span-2",
    "",
    "",
  ];

  return (
    <div className="relative">
      <EditorialHeader
        eyebrow="Galeria"
        edition="Odoyá · Galeria · Visual Diary"
        title={
          <>
            O que a<br />
            <span className="italic text-gold-300">lente vê</span><br />
            <span className="shimmer-text font-semibold">no ateliê.</span>
          </>
        }
        subtitle="Cada rótulo, cada dobra da embalagem, cada faísca no incensário. Uma coleção viva do que fazemos, embalada em imagens."
        right={
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold-400">No arquivo</p>
            <p className="mt-1 font-display text-4xl font-semibold text-cream-50 tabular-nums">{items.length}</p>
            <p className="text-xs text-cream-100/60">imagens neste momento</p>
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="sticky top-16 z-20 border-b border-plum-100 bg-cream-50/95 backdrop-blur md:top-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 md:px-12">
          <div className="flex gap-1">
            {[
              { k: "todos", l: "Tudo" },
              { k: "produtos", l: "Produtos" },
              { k: "ambiente", l: "Ateliê" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setFilter(t.k as any)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  filter === t.k
                    ? "bg-plum-900 text-cream-50"
                    : "text-plum-700 hover:bg-plum-100/60"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
          <p className="hidden text-xs text-plum-500 md:block">
            Use ← → para navegar · <kbd className="rounded border border-plum-200 bg-white px-1.5 py-0.5 text-[0.6rem]">Esc</kbd> para fechar
          </p>
        </div>
      </div>

      {/* Mosaic grid */}
      <section className="bg-cream-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-plum-200 bg-white py-24 text-center">
              <p className="font-display text-3xl text-plum-900">Sem imagens neste filtro</p>
            </div>
          ) : (
            <div className="grid auto-rows-[240px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {items.map((it, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`reveal group relative overflow-hidden rounded-2xl bg-plum-100 shadow-sm ring-1 ring-plum-100 transition-all duration-500 hover:z-10 hover:shadow-2xl hover:ring-plum-400 focus:outline-none focus:ring-2 focus:ring-gold-500 ${spans[i % spans.length]}`}
                  style={{ transitionDelay: `${(i % 6) * 40}ms` }}
                  aria-label={`Ampliar ${it.title}`}
                >
                  <img
                    src={it.src}
                    alt={it.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum-950/85 via-plum-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold-300">
                      {it.type === "produto" ? "Produto" : "Ateliê"}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-cream-50 leading-tight">
                      {it.title}
                    </h3>
                    <p className="font-display text-sm italic text-gold-200/80">{it.caption}</p>
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-cream-50/95 p-2 text-plum-900 opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100">
                    <ZoomIn size={14} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-plum-950 py-20 text-cream-50 paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-400">— Bastidores diários</p>
          <h3 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
            Quer ver <span className="italic text-gold-300">tudo em movimento?</span>
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-cream-100/70">
            Nossos vídeos e stories no Instagram mostram o dia a dia do ateliê — bem no meio da bagunça bonita.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/odoyaervasdearuanda/"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-gold-300"
            >
              Seguir @odoyaervasdearuanda <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-plum-950/95 backdrop-blur-md p-4 md:p-8"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 backdrop-blur transition hover:bg-cream-50/20 md:right-6 md:top-6"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          {/* Prev / Next */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 backdrop-blur transition hover:bg-cream-50/20 md:left-6"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 backdrop-blur transition hover:bg-cream-50/20 md:right-6"
            aria-label="Próxima"
          >
            <ChevronRight size={22} />
          </button>

          {/* Content */}
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
              <div className="relative overflow-hidden rounded-2xl bg-plum-900 shadow-2xl">
                <img
                  src={items[active].src}
                  alt={items[active].title}
                  className="max-h-[80vh] w-full object-contain"
                />
              </div>
              <aside className="text-cream-50">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-300">
                  {items[active].type === "produto" ? "Produto" : "Ateliê"}
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">
                  {items[active].title}
                </h2>
                <p className="mt-2 font-display text-lg italic text-gold-200/85">{items[active].caption}</p>

                {items[active].product && (
                  <div className="mt-6 rounded-2xl border border-cream-100/10 bg-plum-900/60 p-5 backdrop-blur">
                    <p className="text-[0.6rem] uppercase tracking-wider text-gold-400">A partir de</p>
                    <p className="font-display text-3xl font-bold tabular-nums text-cream-50">
                      R$ {items[active].product!.price.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="mt-1 text-xs text-cream-100/60">{items[active].product!.weight}</p>

                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        onClick={() => { addItem(items[active]!.product!); close(); }}
                        className="flex items-center justify-center gap-2 rounded-full bg-cream-50 py-2.5 text-sm font-semibold text-plum-900 transition hover:bg-gold-300"
                      >
                        <ShoppingBag size={14} /> Adicionar ao carrinho
                      </button>
                      <a
                        href={whatsappLink(`Olá! Vi ${items[active]!.product!.name} na galeria e queria saber mais.`)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-full border border-cream-100/30 py-2.5 text-sm font-semibold text-cream-50 hover:border-gold-400"
                      >
                        <MessageCircle size={14} /> Perguntar no WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                <p className="mt-6 text-xs text-cream-100/40">
                  Imagem {active + 1} de {items.length}
                </p>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
