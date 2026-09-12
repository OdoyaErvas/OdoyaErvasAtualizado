import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, MessageCircle, MapPin, Sparkles, Heart, ShieldCheck, Leaf } from "lucide-react";
import IntentionDiscovery from "../components/IntentionDiscovery";
import RitualKitsSection from "../components/RitualKits";
import FeaturedOffer from "../components/FeaturedOffer";
import MoonWidget from "../components/MoonWidget";
import AuraQuiz from "../components/AuraQuiz";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import RitualOfDay from "../components/RitualOfDay";
import Newsletter from "../components/Newsletter";
import { useSettings } from "../store/useSettings";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { useMouseParallax } from "../hooks/useMouseParallax";
import { useStore } from "../store/useStore";
import { SITE, whatsappLink } from "../data/site";
import { InstagramIcon } from "../components/icons";
import { attachRipple } from "../utils/ripple";

const INTENTIONS = [
  { id: "amor", label: "Amor & Afeto", emoji: "❤️", products: ["rosas-rubras", "lavanda-rosas-rubras"], color: "#7a2436", desc: "Uma seleção inspirada em rituais de afeto, presença e harmonia no ambiente." },
  { id: "protecao", label: "Proteção", emoji: "🛡️", products: ["arruda"], color: "#566e3d", desc: "Composições tradicionalmente escolhidas em práticas simbólicas de proteção e renovação do espaço." },
  { id: "prosperidade", label: "Prosperidade", emoji: "✨", products: ["canela-anis"], color: "#a67f27", desc: "Aromas tradicionalmente associados a práticas de prosperidade, movimento e novos projetos." },
  { id: "calma", label: "Calma & Pausa", emoji: "🌙", products: ["lavanda"], color: "#7f4d9c", desc: "Fragrâncias para momentos de pausa, leitura, meditação e uma rotina noturna mais acolhedora." },
  { id: "renovacao", label: "Renovação", emoji: "🌿", products: ["kit-composicoes", "banho-sete-ervas"], color: "#653b80", desc: "Produtos para marcar recomeços e práticas de renovação com intenção e presença." },
];

const COMMITMENTS = [
  { eyebrow: "Feito à mão", title: "Produção artesanal", text: "Cada lote é preparado em pequena escala, com atenção a cada etapa." },
  { eyebrow: "Ingredientes", title: "Seleção cuidadosa", text: "Ervas, resinas e especiarias escolhidas conforme cada composição." },
  { eyebrow: "Intenção", title: "Tradição & propósito", text: "Aromas inspirados em práticas de espiritualidade e bem-estar cotidiano." },
  { eyebrow: "Entrega", title: "Envio nacional", text: "Postagem a partir de Barretos - SP para endereços em todo o Brasil." },
];

export default function Home() {
  useReveal();
  const { storeConfig } = useSettings();
  usePageMeta({
    title: "Incensaria Artesanal · Barretos",
    description: "Incensos, ervas e defumações artesanais feitos à mão em Barretos – SP. Frete grátis acima de R$ 199.",
  });

  const { products } = useStore();
  const hero = useMouseParallax<HTMLDivElement>();
  const [activeIntention, setActiveIntention] = useState(INTENTIONS[0]);

  const recommended = useMemo(() => {
    return activeIntention.products
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as typeof products;
  }, [activeIntention, products]);

  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="relative">
      {/* ============================ HERO ============================ */}
      <section ref={hero.ref} className="relative overflow-hidden bg-plum-950 text-cream-50">
        {/* Background image — full bleed, premium treatment */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-altar.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
            style={{
              transform: `scale(1.08) translate(${hero.pos.x * 4}px, ${hero.pos.y * 3}px)`,
              transition: "transform 400ms ease-out",
            }}
          />
          {/* Layered overlays for readability + depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-plum-950/95 via-plum-950/80 to-plum-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-transparent to-plum-950/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_30%,rgba(10,5,18,0.6)_100%)]" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-center px-6 pb-20 pt-24 md:min-h-[85vh] md:px-12 md:pb-28 md:pt-32 lg:pb-32">
          {/* Eyebrow */}
          <p className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.4em] text-gold-400" role="doc-subtitle">
            <span className="inline-block h-px w-8 bg-gold-500/60" />
            Incensaria Artesanal · Barretos — SP
          </p>

          {/* Title — commercial, clear, benefit-driven */}
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,6.5vw,4.8rem)] font-semibold leading-[1.05] tracking-tight md:mt-8">
            Escolha a energia que você quer{" "}
            <span className="italic text-gold-300">levar para sua casa.</span>
          </h1>

          {/* Subtitle — concise product description */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-100/80 md:mt-6 md:text-lg">
            Incensos, banhos, ervas e defumações preparados à mão, com ingredientes selecionados, intenção e cuidado.
          </p>

          {/* CTAs — conversion-oriented */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10">
            <Link
              to="/produtos"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gold-400 px-7 py-4 text-sm font-bold uppercase tracking-wider text-plum-950 shadow-lg shadow-gold-500/25 transition-all hover:bg-gold-300 hover:shadow-gold-500/40"
            >
              Encontrar meu aroma
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/produtos"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-cream-100/30 bg-cream-100/5 px-7 py-4 text-sm font-bold uppercase tracking-wider text-cream-50 backdrop-blur-sm transition-all hover:border-gold-400/60 hover:bg-cream-100/10"
            >
              Ver produtos
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust badges — social proof strip */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-cream-100/70 md:mt-14">
            <span className="flex items-center gap-1.5">🚚 Frete grátis acima de R${storeConfig.freeShippingThreshold.toFixed(0)}</span>
            <span className="hidden h-3 w-px bg-cream-100/20 sm:block" />
            <span className="flex items-center gap-1.5">💜 Feito à mão</span>
            <span className="hidden h-3 w-px bg-cream-100/20 sm:block" />
            <span className="flex items-center gap-1.5">📦 Enviamos para todo o Brasil</span>
            <span className="hidden h-3 w-px bg-cream-100/20 sm:block" />
            <span className="flex items-center gap-1.5">💬 Atendimento humano</span>
          </div>
        </div>

        {/* Bottom edge — elegant curve transition into next section */}
        <div className="absolute inset-x-0 bottom-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block w-full" aria-hidden>
            <path fill="#fbf8f2" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ============================ ESCOLHA SUA INTENÇÃO ============================ */}
      <IntentionDiscovery
        intentions={INTENTIONS}
        activeIntention={activeIntention}
        setActiveIntention={setActiveIntention}
        recommended={recommended}
      />

      {/* ============================ ORÁCULOS E RITUAIS ============================ */}
      <section id="oraculo-ritual" className="bg-cream-100 py-24 md:py-32 paper">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-plum-500">— Sincronicidade</p>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[0.95] text-plum-900">
              Conecte-se com o <span className="italic text-plum-600">seu momento</span>
            </h2>
            <div className="mx-auto mt-4 max-w-xl text-sm text-plum-800/70">
              Dois caminhos para encontrar sua essência hoje. Use o oráculo emocional para decifrar suas necessidades ou consulte a fase da lua para escolher seu ritual.
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AuraQuiz />
            <MoonWidget />
          </div>
        </div>
      </section>

      {/* ============================ CAROUSEL ============================ */}
      <section className="bg-cream-50 py-24 md:py-32 paper">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-plum-500">— Catálogo vivo</p>
              <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[0.95] text-plum-900">
                Composições <span className="italic text-plum-600">em destaque</span>
              </h2>
            </div>
            <Link to="/produtos" className="group inline-flex items-center gap-2 text-sm font-semibold text-plum-700 hover:text-plum-900">
              Ver tudo
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="snap-x-row mt-12 flex gap-6 overflow-x-auto pb-6">
            {featured.map((p, i) => {
              const big = i === 0;
              return (
                <article
                  key={p.id}
                  className={`group relative shrink-0 overflow-hidden rounded-3xl bg-plum-900 text-cream-50 shadow-xl transition ${big ? "w-[88vw] md:w-[520px]" : "w-[78vw] md:w-[340px]"}`}
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className={`relative ${big ? "h-[360px] md:h-[440px]" : "h-[320px]"} overflow-hidden`}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[8rem]" style={{ backgroundColor: p.color }}>
                        {p.emoji}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-plum-950/30 to-transparent" />
                    {p.bestSeller && (
                      <span className="absolute left-4 top-4 rounded-full bg-gold-500 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-plum-900">Em destaque</span>
                    )}
                    {p.isNew && !p.bestSeller && (
                      <span className="absolute left-4 top-4 rounded-full bg-sage-400 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-plum-900">Novidade</span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold-300">{p.category}</p>
                    <Link to={`/produtos/${p.id}`} className={`mt-2 block font-display font-semibold leading-tight transition hover:text-gold-200 ${big ? "text-4xl md:text-5xl" : "text-3xl"}`}>
                      {p.name.replace(/^Incenso\s/, "")}
                    </Link>
                    <p className="mt-1 font-display text-lg italic text-gold-200/90">{p.short}</p>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <span className="font-display text-2xl font-bold">R$ {p.price.toFixed(2).replace(".", ",")}</span>
                      <Link
                        to={`/produtos/${p.id}`}
                        className="ripple flex items-center gap-2 rounded-full bg-cream-50 px-4 py-2 text-xs font-semibold text-plum-900 transition hover:bg-gold-300"
                      >
                        Ver produto <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ RITUAL EM DESTAQUE ============================ */}
      <FeaturedOffer />

      {/* ============================ RITUAIS PRONTOS ============================ */}
      <RitualKitsSection />

      {/* ============================ PROCESS ZIGZAG ============================ */}
      <section className="bg-cream-100 py-28 md:py-36 paper">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[0.95] text-plum-900">
              Da terra<br /><span className="italic text-plum-600">às suas mãos</span>
            </h2>
            <p className="max-w-sm text-plum-800/70">
              Quatro etapas. Nenhum atalho industrial. Apenas ervas, tempo e intenção.
            </p>
          </div>

          <div className="space-y-16 md:space-y-28">
            {[
              { n: "01", title: "Colheita & seleção", text: "Ervas secas ao sol, escolhidas uma a uma pela procedência e pelo aroma.", img: "/images/sobre-processo.jpg" },
              { n: "02", title: "Mistura artesanal", text: "As composições são misturadas à mão, em lotes pequenos, respeitando cada proporção.", img: "/images/hero-altar.jpg" },
              { n: "03", title: "Enrolagem & descanso", text: "Cada vareta é enrolada individualmente e passa pelo tempo de descanso necessário para ganhar corpo e fragrância.", img: "/images/prod-lavanda.jpg" },
               { n: "04", title: "Embalagem & envio", text: "Cada pedido recebe proteção cuidadosa, selo artesanal e uma mensagem escrita à mão antes de seguir de Barretos para você.", img: "/images/prod-lavanda-rosas.jpg" },
            ].map((s, i) => (
              <div key={s.n} className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative">
                  <span className="pointer-events-none absolute -top-8 left-0 font-display text-[8rem] font-semibold leading-none text-plum-200/60 md:-top-12 md:text-[12rem]">
                    {s.n}
                  </span>
                  <img src={s.img} alt={s.title} loading="lazy" className="clip-frame relative w-full object-cover shadow-2xl ring-1 ring-plum-900/10" style={{ aspectRatio: "4/3" }} />
                </div>
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-600">Etapa {s.n}</p>
                  <h3 className="mt-4 font-display text-4xl font-semibold text-plum-900 md:text-5xl">{s.title}</h3>
                  <p className="mt-4 max-w-md text-plum-800/75">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ COMPROMISSOS DA MARCA ============================ */}
      <section className="bg-plum-950 py-20 text-cream-50 paper md:py-24">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-2xl border border-cream-100/10 bg-cream-100/10 px-6 md:grid-cols-4 md:px-12">
          {COMMITMENTS.map((item) => (
            <article key={item.title} className="bg-plum-950 px-5 py-7 md:px-7">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-gold-400">{item.eyebrow}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-cream-50">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/65">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ============================ RITUAL DO DIA (lua) ============================ */}
      {storeConfig.ritualOfDayEnabled && <RitualOfDay />}

      {/* ============================ DEPOIMENTOS (carrossel) ============================ */}
      {storeConfig.testimonialsEnabled && <TestimonialsCarousel />}

      {/* ============================ NEWSLETTER ============================ */}
      <Newsletter />

      {/* ============================ CTA ============================ */}
      <section className="relative overflow-hidden bg-plum-900 text-cream-50 paper">
        <img src="/images/sobre-processo.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-plum-950 via-plum-900/80 to-plum-800/60" />
        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center md:px-12 md:py-36">
          <Sparkles className="mx-auto text-gold-300" size={28} />
          <h2 className="mt-6 font-display text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[0.95]">
            Pronta para <span className="italic text-gold-300">respirar</span> diferente?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-cream-100/75">
            Comece pelo WhatsApp. Contamos sobre cada composição, tiramos dúvidas e mandamos o pedido no mesmo dia útil.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={whatsappLink("Olá! Quero conhecer as composições da Odoyá. 🌿")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={attachRipple}
              className="ripple inline-flex items-center gap-3 rounded-full bg-cream-50 px-8 py-4 text-base font-semibold text-plum-900 transition hover:bg-gold-300"
            >
              <MessageCircle size={20} /> Começar no WhatsApp
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-cream-100/30 px-8 py-4 text-base font-semibold text-cream-50 transition hover:border-gold-400 hover:text-gold-300"
            >
              <InstagramIcon size={20} /> Seguir no Instagram
            </a>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.3em] text-cream-100/50">
            <span className="flex items-center gap-2"><MapPin size={14} className="text-gold-400" /> Barretos — SP</span>
            <span className="flex items-center gap-2"><Leaf size={14} className="text-sage-400" /> Ingredientes selecionados</span>
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-gold-400" /> Atendimento direto</span>
            <span className="flex items-center gap-2"><Heart size={14} className="text-rose-deep" /> Feito com amor</span>
          </div>
        </div>
      </section>
    </div>
  );
}

