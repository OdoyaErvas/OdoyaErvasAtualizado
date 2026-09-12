import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight,
  Flame, Heart, Info, MapPin, MessageCircle, Minus, Package, Plus,
  ShieldCheck, ShoppingBag, Star, Truck,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useCart } from "../store/useCart";
import { useSettings } from "../store/useSettings";
import { useAuth } from "../store/useAuth";
import { useInteractions } from "../store/useInteractions";
import { useReviews, reviewStats } from "../store/useReviews";
import { usePageMeta } from "../hooks/usePageMeta";
import { whatsappLink, productMessage } from "../data/site";
import FreteCalculator from "../components/FreteCalculator";
import PaymentMethodsBlock from "../components/PaymentMethodsBlock";
import type { Product } from "../data/products";

type GalleryItem = { src: string; alt: string; label: string };

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function productGallery(product: Product): GalleryItem[] {
  // A primeira imagem é sempre a foto real do produto. As demais contextualizam
  // o ateliê e o processo, sem afirmar que são novas fotos do mesmo item.
  const raw: GalleryItem[] = [
    { src: product.image || "", alt: product.name, label: "Produto" },
    { src: "/images/hero-altar.jpg", alt: "Ritual com incensos no ateliê Odoyá", label: "No ateliê" },
    { src: "/images/sobre-processo.jpg", alt: "Processo artesanal da Odoyá", label: "Processo artesanal" },
  ].filter((image) => Boolean(image.src));

  const seen = new Set<string>();
  return raw.filter((image) => {
    if (seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

export default function ProdutoDetalhe() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const { products } = useStore();
  const { addItem } = useCart();
  const { storeConfig } = useSettings();
  const { cliente } = useAuth();
  const { isFavorito, toggleFavorito } = useInteractions();
  const { published } = useReviews();

  const product = products.find((item) => item.id === slug) ?? null;
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const gallery = useMemo(() => (product ? productGallery(product) : []), [product]);
  const outOfStock = !product?.available || (product?.stock ?? 0) <= 0;
  const maxQuantity = Math.max(1, product?.stock ?? 1);
  const total = (product?.price ?? 0) * quantity;
  const productReviews = useMemo(
    () => published.filter((review) => review.productId === product?.id),
    [published, product?.id]
  );
  const productReviewStats = useMemo(() => reviewStats(productReviews), [productReviews]);

  usePageMeta({
    title: product ? product.name : "Produto não encontrado",
    description: product
      ? `${product.short}. ${product.description.slice(0, 130)} Conheça peso, modo de uso, disponibilidade e compre pelo carrinho Odoyá.`
      : "O produto procurado não foi encontrado no catálogo Odoyá.",
  });

  // Structured data Product e Open Graph dinâmicos quando os dados reais existem.
  useEffect(() => {
    if (!product) return;

    const scriptId = "odoya-product-jsonld";
    document.getElementById(scriptId)?.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    const structuredData: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: gallery.map((item) => new URL(item.src, window.location.origin).href),
      description: product.description,
      sku: product.id,
      category: product.category,
      brand: { "@type": "Brand", name: "Odoyá Ervas de Aruanda" },
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: product.price.toFixed(2),
        availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        url: window.location.href,
      },
    };
    if (productReviewStats.count > 0) {
      structuredData.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: productReviewStats.average.toFixed(1),
        reviewCount: productReviewStats.count,
        bestRating: "5",
        worstRating: "1",
      };
    }
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    const previousOg = ogImage?.content ?? "";
    if (ogImage && product.image) ogImage.content = product.image;

    return () => {
      script.remove();
      if (ogImage) ogImage.content = previousOg;
    };
  }, [product, gallery, outOfStock, location.pathname, productReviewStats]);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [slug]);

  const related = useMemo(() => {
    if (!product) return [];
    const byCategory = products.filter((item) => item.id !== product.id && item.category === product.category && item.available && item.stock > 0);
    const featuredFallback = products.filter((item) => item.id !== product.id && item.featured && item.available && item.stock > 0);
    return [...byCategory, ...featuredFallback.filter((item) => !byCategory.some((categoryItem) => categoryItem.id === item.id))].slice(0, 3);
  }, [product, products]);

  const handleAdd = () => {
    if (!product || outOfStock) return;
    Array.from({ length: quantity }).forEach(() => addItem(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (!product) {
    return (
      <main className="bg-cream-50 py-24">
        <div className="mx-auto max-w-xl px-6 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-plum-100 text-plum-700"><Package size={26} /></span>
          <h1 className="mt-5 font-display text-4xl font-bold text-plum-950">Produto não encontrado</h1>
          <p className="mt-3 text-sm text-plum-600">Esse produto pode ter sido removido ou o link não está mais disponível.</p>
          <Link to="/produtos" className="mt-7 inline-flex items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-cream-50 hover:bg-plum-950"><ArrowLeft size={15} /> Voltar ao catálogo</Link>
        </div>
      </main>
    );
  }

  const stockLabel = outOfStock
    ? "Temporariamente indisponível"
    : product.stock <= product.minStock
      ? `${product.stock} unidade${product.stock === 1 ? "" : "s"} disponível${product.stock === 1 ? "" : "is"}`
      : `${product.stock} unidades disponíveis`;

  return (
    <main className="bg-cream-50 pb-28 md:pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-plum-100 bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-xs text-plum-500 md:px-12">
          <Link to="/" className="hover:text-plum-800">Início</Link>
          <ChevronRight size={12} />
          <Link to="/produtos" className="hover:text-plum-800">Produtos</Link>
          <ChevronRight size={12} />
          <span className="truncate font-semibold text-plum-800">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-12 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Galeria */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-3xl bg-plum-100 shadow-xl ring-1 ring-plum-100">
              {gallery[activeImage]?.src ? (
                <img src={gallery[activeImage].src} alt={gallery[activeImage].alt} className="aspect-[4/5] w-full object-cover md:aspect-[5/6]" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-8xl" style={{ backgroundColor: `${product.color}20` }}>{product.emoji}</div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-plum-950/70 to-transparent px-5 pb-5 pt-14 text-xs font-semibold text-cream-50">
                <span>{gallery[activeImage]?.label ?? "Produto"}</span>
                <span>{activeImage + 1} / {gallery.length}</span>
              </div>
              {product.isNew && <span className="absolute left-4 top-4 rounded-full bg-sage-500 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white">Novidade</span>}
              {product.bestSeller && <span className="absolute right-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-plum-950">Em destaque</span>}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button key={`${image.src}-${index}`} onClick={() => setActiveImage(index)} aria-label={`Ver ${image.label}`} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition ${activeImage === index ? "ring-plum-800" : "ring-transparent hover:ring-plum-300"}`}>
                  <img src={image.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.65rem] text-plum-500">As imagens complementares mostram o ateliê e o processo artesanal Odoyá.</p>
          </div>

          {/* Informações e compra */}
          <div className="flex min-w-0 flex-col lg:pt-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-gold-600">{product.category}</p>
              {cliente && (
                <button onClick={() => toggleFavorito(cliente.id, product.id)} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${isFavorito(cliente.id, product.id) ? "border-rose-deep/40 bg-rose-deep/10 text-rose-deep" : "border-plum-200 text-plum-600 hover:bg-plum-50"}`}>
                  <Heart size={14} className={isFavorito(cliente.id, product.id) ? "fill-rose-deep" : ""} />
                  {isFavorito(cliente.id, product.id) ? "Favoritado" : "Favoritar"}
                </button>
              )}
            </div>

            <h1 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tight text-plum-950 md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-lg italic text-plum-600">Intenção: {product.short}</p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-plum-700/80 md:text-base">{product.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.benefits.map((benefit) => <span key={benefit} className="flex items-center gap-1.5 rounded-full bg-plum-50 px-3 py-1 text-xs font-medium text-plum-700"><Check size={11} className="text-sage-600" /> {benefit}</span>)}
            </div>

            <div className="mt-7 grid gap-4 rounded-2xl border border-plum-100 bg-white p-5 sm:grid-cols-2">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-plum-500">Peso / conteúdo</p>
                <p className="mt-1 font-semibold text-plum-900">{product.weight}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-plum-500">Disponibilidade</p>
                <p className={`mt-1 flex items-center gap-1.5 font-semibold ${outOfStock ? "text-rose-deep" : product.stock <= product.minStock ? "text-gold-700" : "text-sage-700"}`}>
                  <span className={`h-2 w-2 rounded-full ${outOfStock ? "bg-rose-deep" : product.stock <= product.minStock ? "bg-gold-500" : "bg-sage-500"}`} /> {stockLabel}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-plum-100 bg-cream-50/70 p-5">
              <p className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-plum-500"><ShoppingBag size={13} /> Levar para meu ritual</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-3xl font-bold tabular-nums text-plum-950">{formatCurrency(total)}</p>
                  <p className="text-[0.7rem] text-plum-500">{quantity > 1 ? `${quantity} unidades` : "Preço por unidade"}</p>
                </div>
                <div className="flex items-center rounded-full border border-plum-200 bg-white p-1">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="rounded-full p-2 text-plum-700 disabled:opacity-30 hover:bg-plum-50" aria-label="Diminuir quantidade"><Minus size={15} /></button>
                  <span className="min-w-8 text-center text-sm font-bold text-plum-900">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))} disabled={outOfStock || quantity >= maxQuantity} className="rounded-full p-2 text-plum-700 disabled:opacity-30 hover:bg-plum-50" aria-label="Aumentar quantidade"><Plus size={15} /></button>
                </div>
              </div>
              <button onClick={handleAdd} disabled={outOfStock} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition active:scale-[0.99] ${outOfStock ? "cursor-not-allowed bg-plum-100 text-plum-400" : added ? "bg-sage-500 text-white" : "bg-plum-900 text-cream-50 shadow-lg shadow-plum-900/20 hover:bg-plum-950"}`}>
                {outOfStock ? "Produto indisponível" : added ? <><CheckCircle2 size={16} /> Adicionado ao carrinho</> : <><ShoppingBag size={16} /> Adicionar ao carrinho</>}
              </button>
              <a href={whatsappLink(productMessage(product.name))} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-plum-600 hover:text-plum-900"><MessageCircle size={14} /> Prefere conversar antes de comprar?</a>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="border-y border-plum-100 bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2 md:px-12">
          <article className="rounded-2xl border border-plum-100 bg-cream-50/60 p-6">
            <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-plum-500"><Flame size={13} className="text-gold-600" /> Modo de uso</p>
            <p className="mt-4 text-sm leading-relaxed text-plum-700/80">{product.usage}</p>
            <p className="mt-4 flex items-start gap-2 text-[0.7rem] leading-relaxed text-plum-500"><Info size={13} className="mt-0.5 shrink-0 text-gold-600" /> Utilize sempre em incensário seguro, em local ventilado e longe de materiais inflamáveis.</p>
          </article>
          <article className="rounded-2xl border border-plum-100 bg-cream-50/60 p-6">
            <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-plum-500"><Truck size={13} className="text-gold-600" /> Envio e atendimento</p>
            <p className="mt-4 text-sm leading-relaxed text-plum-700/80">Produzido em {storeConfig.city} - {storeConfig.state}. {storeConfig.shippingDays}</p>
            <p className="mt-3 flex items-center gap-2 text-[0.7rem] text-plum-600"><MapPin size={13} /> Frete grátis acima de {formatCurrency(storeConfig.freeShippingThreshold)}.</p>
          </article>
        </div>
      </section>

      {/* Freight & payments */}
      <section className="bg-cream-50 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-12">
          <FreteCalculator qtdItens={quantity} totalPedido={total} />
          <div className="rounded-2xl border border-plum-100 bg-white p-6 shadow-sm">
            <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-plum-500"><ShieldCheck size={13} className="text-gold-600" /> Formas de pagamento</p>
            <p className="mt-3 text-sm text-plum-700/75">Escolha a melhor forma no fechamento pelo WhatsApp. Todas as condições configuradas aparecem abaixo.</p>
            <div className="mt-5"><PaymentMethodsBlock /></div>
          </div>
        </div>
      </section>

      {/* Reviews: somente dados reais publicados */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-wider text-plum-500">Prova social real</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-plum-950">Avaliações deste produto</h2>
            </div>
            {productReviewStats.count > 0 && (
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-plum-950">{productReviewStats.average.toFixed(1)}</p>
                <p className="text-xs text-plum-500">{productReviewStats.count} avaliação{productReviewStats.count === 1 ? "" : "ões"}</p>
              </div>
            )}
          </div>
          {productReviewStats.count === 0 ? (
            <div className="mt-6 rounded-3xl border border-plum-100 bg-cream-50/50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-plum-100 text-plum-700"><Star size={20} /></div>
              <p className="mx-auto mt-4 max-w-xl text-sm text-plum-600">Ainda não há avaliações publicadas para {product.name}. Se você já recebeu este produto, envie sua experiência pelo WhatsApp.</p>
              <a href={whatsappLink(`Olá! Quero enviar uma avaliação real sobre o produto *${product.name}*. Posso enviar meu comentário e uma foto por aqui?`)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-xs font-bold text-cream-50 hover:bg-plum-950"><MessageCircle size={14} /> Enviar avaliação</a>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {productReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-plum-100 bg-cream-50/50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="font-display text-lg font-semibold text-plum-950">{review.name}</p>{review.city && <p className="text-[0.7rem] text-plum-500">{review.city}</p>}</div>
                    {review.verified && <span className="flex items-center gap-1 rounded-full bg-sage-400/15 px-2 py-1 text-[0.6rem] font-bold uppercase text-sage-700"><CheckCircle2 size={10} /> Verificado</span>}
                  </div>
                  <div className="mt-3 flex gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={13} className={index < review.rating ? "fill-gold-500 text-gold-500" : "text-plum-200"} />)}</div>
                  <p className="mt-3 text-sm leading-relaxed text-plum-700/80">“{review.comment}”</p>
                  <time className="mt-3 block text-[0.7rem] text-plum-500">{new Date(review.date).toLocaleDateString("pt-BR")}</time>
                  {review.photos && review.photos.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto">{review.photos.map((photo, index) => <img key={index} src={photo} alt={`Foto da avaliação de ${review.name}`} className="h-20 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />)}</div>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related products */}
      <section className="bg-cream-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-plum-500">Para complementar</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-plum-950">Você também pode gostar</h2>
            </div>
            <Link to="/produtos" className="flex items-center gap-2 text-sm font-semibold text-plum-700 hover:text-plum-950">Ver catálogo <ArrowRight size={14} /></Link>
          </div>
          {related.length === 0 ? (
            <p className="mt-8 text-sm text-plum-500">Em breve mais sugestões para o seu ritual.</p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <Link to={`/produtos/${item.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-plum-50">
                      {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl">{item.emoji}</div>}
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-[0.6rem] font-bold uppercase tracking-wider text-gold-600">{item.category}</p>
                    <Link to={`/produtos/${item.id}`} className="mt-1 block font-display text-xl font-semibold text-plum-900 hover:text-plum-600">{item.name.replace(/^Incenso\s/, "")}</Link>
                    <p className="mt-1 text-xs text-plum-600">{item.short}</p>
                    <div className="mt-3 flex items-center justify-between"><span className="font-display text-lg font-bold text-plum-950">{formatCurrency(item.price)}</span><button onClick={() => addItem(item)} className="rounded-full bg-plum-900 p-2 text-cream-50 hover:bg-plum-950" aria-label={`Adicionar ${item.name}`}><Plus size={13} /></button></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-plum-950 py-14 text-cream-50 md:py-20">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-gold-400">Dúvidas sobre este produto</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Perguntas frequentes</h2>
          <div className="mt-8 space-y-3">
            <ProductFaq question="Como usar este produto?" answer={product.usage} />
            <ProductFaq question="Este produto tem finalidade terapêutica ou medicinal?" answer="Não. Os produtos Odoyá são itens artesanais de perfumação e prática ritual. As referências às tradições e intenções são culturais e espirituais, e não substituem orientação profissional de saúde." />
            <ProductFaq question="Quando meu pedido é enviado?" answer={storeConfig.shippingDays} />
            <ProductFaq question="Quais formas de pagamento estão disponíveis?" answer="As formas de pagamento ativas são exibidas acima. O fechamento é feito diretamente pelo WhatsApp para confirmar estoque, frete e condição escolhida." />
            <ProductFaq question="Posso pedir ajuda para escolher?" answer="Sim. Use o botão de WhatsApp e a Jéssica orienta a melhor combinação para sua intenção e ambiente." />
          </div>
        </div>
      </section>

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-plum-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(42,23,64,0.12)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1"><p className="text-[0.6rem] uppercase tracking-wider text-plum-500">{quantity > 1 ? `${quantity} unidades` : product.weight}</p><p className="font-display text-xl font-bold text-plum-950">{formatCurrency(total)}</p></div>
          <button onClick={handleAdd} disabled={outOfStock} className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold ${outOfStock ? "bg-plum-100 text-plum-400" : added ? "bg-sage-500 text-white" : "bg-plum-900 text-cream-50"}`}>
            {added ? <><CheckCircle2 size={14} /> Adicionado</> : <><ShoppingBag size={14} /> Adicionar ao carrinho</>}
          </button>
        </div>
      </div>
    </main>
  );
}

function ProductFaq({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-cream-100/10 bg-cream-100/5">
      <button onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-cream-50">
        {question}<ChevronRight size={15} className={`shrink-0 text-gold-300 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <p className="border-t border-cream-100/10 px-4 py-3 text-sm leading-relaxed text-cream-100/70">{answer}</p>}
    </div>
  );
}