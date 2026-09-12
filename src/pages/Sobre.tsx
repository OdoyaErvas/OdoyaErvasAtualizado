import { MessageCircle, MapPin, Leaf, Heart, Sparkles, Flower2 } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { SITE, whatsappLink } from "../data/site";
import { attachRipple } from "../utils/ripple";
import HerbsGlossary from "../components/HerbsGlossary";
import { useSettings } from "../store/useSettings";

const TIMELINE = [
  { year: "2023", title: "Primeiras criações no ateliê", text: "Jéssica começa a enrolar varetas em seu espaço de criação, misturando lavanda seca e pétalas de rosa do próprio jardim. As amigas pedem mais." },
  { year: "2024", title: "Nasce a Odoyá", text: "A marca ganha nome, identidade e propósito. O primeiro lote — cinco composições — é vendido em uma feira em Barretos." },
  { year: "2025", title: "Envios para todo o Brasil", text: "O ateliê estrutura sua operação de postagem para atender pedidos em diferentes regiões do país pelos Correios." },
  { year: "Hoje", title: "Feito à mão, todo dia", text: "Cada vareta continua sendo enrolada, finalizada e embalada individualmente. O processo permanece artesanal em cada lote." },
];

const VALUES = [
  { icon: Leaf, title: "Respeito à natureza", text: "Ingredientes colhidos com consciência e secos sem pressa." },
  { icon: Flower2, title: "Produção artesanal", text: "Sem máquinas industriais. Cada composição passa pelas mãos." },
  { icon: Heart, title: "Amor em cada detalhe", text: "Bilhetes escritos à mão, embalagens cuidadosas, atendimento humano." },
  { icon: Sparkles, title: "Fé e espiritualidade", text: "Acreditamos que aromas carregam intenções — e trabalhamos com essa responsabilidade." },
];

export default function Sobre() {
  useReveal();
  const { storeConfig } = useSettings();
  usePageMeta({
    title: "Nossa História",
    description: "Conheça a Jéssica e a trajetória da Odoyá Ervas de Aruanda, de Barretos para o Brasil.",
  });

  return (
    <div className="relative">
      {/* ============================ HERO ABOUT ============================ */}
      <section className="relative overflow-hidden bg-plum-950 text-cream-50 paper">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(197,154,58,0.2),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(127,77,156,0.3),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-12 gap-8 px-6 pb-28 pt-32 md:px-12 md:pt-40 md:pb-36">
          <div className="col-span-12 lg:col-span-7">
            <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-400">
              <span className="h-px w-10 bg-gold-500/60" /> Sobre a Odoyá
            </p>
            <h1 className="mt-8 font-display text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.02em]">
              Uma história<br />
              <span className="italic text-gold-300">feita</span> de ervas,<br />
              tempo e <span className="shimmer-text font-semibold">fé</span>.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-cream-100/75 md:text-lg">
              Tudo começou em um pequeno ateliê em <em className="not-italic text-gold-300">Barretos — SP</em>, com mãos inquietas e um jardim de lavanda. Hoje, a Odoyá chega a lares de todo o Brasil — mas ainda é, essencialmente, aquilo que sempre foi: <strong className="font-semibold text-cream-50">uma pessoa enrolando varetas com intenção</strong>.
            </p>
          </div>
          <div className="relative col-span-12 lg:col-span-5">
            <div className="relative aspect-[4/5] w-full clip-organic overflow-hidden">
              <img src="/images/sobre-processo.jpg" alt="Processo artesanal Odoyá" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-plum-950/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -left-4 -bottom-4 rounded-2xl border border-gold-400/30 bg-plum-900/80 px-5 py-4 backdrop-blur md:-left-10">
              <p className="font-display text-3xl font-semibold text-gold-300">Est. 2024</p>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cream-100/60">Barretos · SP · Brasil</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FOUNDER ============================ */}
      <section className="bg-cream-50 py-28 md:py-36 paper">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 md:px-12 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div className="relative">
            <span className="pointer-events-none absolute -top-10 left-0 font-display text-[8rem] leading-none text-plum-200/60">“</span>
            <img
              src="/images/hero-altar.jpg"
              alt="Jéssica Oliveira e a Odoyá"
              className="relative clip-frame w-full object-cover shadow-2xl"
              style={{ aspectRatio: "4/5" }}
            />
            <div className="mt-6 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-plum-700 font-display text-xl font-semibold text-cream-50">J</span>
              <div>
                <p className="font-display text-2xl font-semibold text-plum-900">Jéssica Oliveira</p>
                <p className="text-xs uppercase tracking-[0.3em] text-plum-500">Fundadora · Artesã</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-plum-500">— Palavra da fundadora</p>
            <blockquote className="mt-6 font-display text-[clamp(1.6rem,3.2vw,2.6rem)] italic leading-snug text-plum-900">
              "Eu não faço incenso para vender. Faço para que alguém, do outro lado do Brasil, respire e sinta que não está sozinho. O resto é consequência."
            </blockquote>
            <p className="mt-8 text-plum-800/75">
              A Odoyá nasceu de uma pergunta simples: <em>como eu quero que minha casa cheire quando eu chegar cansada?</em> A resposta virou receita, a receita virou ofício, o ofício virou marca. Hoje somos pequenos — e fazemos questão de continuar assim. Cada pedido é embalado pela mesma pessoa que enrolou as varetas.
            </p>
            <a
              href={whatsappLink("Olá Jéssica! Li sua história no site e queria conversar. 🌿")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={attachRipple}
              className="ripple mt-10 inline-flex items-center gap-3 rounded-full bg-plum-800 px-6 py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-plum-900"
            >
              <MessageCircle size={16} /> Falar com a Jéssica
            </a>
          </div>
        </div>
      </section>

      {/* ============================ TIMELINE ============================ */}
      <section className="bg-plum-950 py-28 text-cream-50 md:py-36 paper">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-400">— Linha do tempo</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[0.95]">
            De um ateliê <span className="italic text-gold-300">ao Brasil inteiro</span>
          </h2>

          <div className="relative mt-16">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-gold-400/0 via-gold-400/40 to-gold-400/0 md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-12 md:space-y-20">
              {TIMELINE.map((t, i) => (
                <div key={t.year} className={`relative md:grid md:grid-cols-2 md:gap-12 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2 md:[&>*:first-child]:text-left" : ""}`}>
                  <div className={`pl-10 md:pl-0 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <p className="font-display text-5xl font-semibold text-gold-300 md:text-6xl">{t.year}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold md:text-3xl">{t.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-cream-100/70 md:text-base">{t.text}</p>
                  </div>
                  <div className="hidden md:block" />
                  <span className="absolute left-3 top-3 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-gold-400 ring-4 ring-plum-950 md:left-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ VALUES ============================ */}
      <section className="bg-cream-50 py-28 md:py-36 paper">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[0.95] text-plum-900">
              O que nos <span className="italic text-plum-600">guia</span>
            </h2>
            <p className="max-w-sm text-plum-800/70">
              Quatro princípios simples, repetidos em cada vareta que sai do ateliê.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-plum-200 bg-plum-200 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <div key={v.title} className="group relative bg-cream-50 p-8 transition hover:bg-cream-100 md:p-12" style={{ transitionDelay: `${i * 40}ms` }}>
                <div className="flex items-start gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-plum-900 text-gold-300 transition group-hover:rotate-6 group-hover:scale-105">
                    <v.icon size={22} />
                  </span>
                  <div>
                    <p className="font-display text-5xl font-semibold leading-none text-plum-200">0{i + 1}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-plum-900 md:text-3xl">{v.title}</h3>
                    <p className="mt-2 text-plum-800/75">{v.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ HERBÁRIO ============================ */}
      {storeConfig.glossaryEnabled && <HerbsGlossary />}

      {/* ============================ CTA ============================ */}
      <section className="relative overflow-hidden bg-plum-900 text-cream-50 paper">
        <img src="/images/prod-lavanda.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-plum-950/90 via-plum-900/80 to-plum-800/60" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center md:px-12 md:py-32">
          <MapPin className="text-gold-300" size={26} />
          <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1]">
            Feito com as mãos, <span className="italic text-gold-300">em Barretos</span>.<br />Enviado com o coração, para o Brasil.
          </h2>
          <a
            href={whatsappLink("Olá! Vim pela página Sobre e gostaria de conhecer a Odoyá. 🌿")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={attachRipple}
            className="ripple mt-4 inline-flex items-center gap-3 rounded-full bg-cream-50 px-8 py-4 text-base font-semibold text-plum-900 transition hover:bg-gold-300"
          >
            <MessageCircle size={20} /> Falar no WhatsApp · {SITE.whatsappDisplay}
          </a>
        </div>
      </section>
    </div>
  );
}
