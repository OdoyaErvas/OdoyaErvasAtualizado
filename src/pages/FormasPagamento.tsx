import { useState } from "react";
import { Copy, Check, ShieldCheck, MessageCircle, ArrowRight, Zap, Sparkles, HelpCircle, Plus } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSettings } from "../store/useSettings";
import EditorialHeader from "../components/EditorialHeader";
import { whatsappLink } from "../data/site";

const STEPS = [
  {
    n: "01",
    title: "Você escolhe",
    text: "Adiciona os produtos no carrinho ou fala direto pelo WhatsApp. Pode pedir uma indicação — a Jéssica ajuda a montar.",
    icon: Sparkles,
  },
  {
    n: "02",
    title: "Nós combinamos",
    text: "Confirmamos disponibilidade, frete até o seu CEP e a melhor forma de pagamento. Tudo por mensagem, sem cadastro complicado.",
    icon: MessageCircle,
  },
  {
    n: "03",
    title: "Você confirma o pagamento",
    text: "Você envia o comprovante e confirmamos o recebimento pelo WhatsApp. Depois, o pedido segue para preparação e postagem conforme o prazo informado.",
    icon: ShieldCheck,
  },
  {
    n: "04",
    title: "Chega no seu ateliê",
    text: "Enviamos o código de rastreio pelo WhatsApp e você acompanha aqui mesmo no site. Simples assim.",
    icon: Zap,
  },
];

const FAQ = [
  {
    q: "O pagamento é feito pelo site?",
    a: "Não. Todo pagamento é combinado no WhatsApp — de forma humana, com a Jéssica. Você escolhe a melhor forma para você (PIX, cartão, boleto ou retirada) e enviamos a chave / link correspondente.",
  },
  {
    q: "Posso parcelar no cartão?",
    a: "As condições de cartão e parcelamento disponíveis são confirmadas no atendimento, conforme a forma de pagamento ativa no momento do pedido.",
  },
  {
    q: "O PIX tem desconto?",
    a: "Quando houver uma condição especial para PIX, ela será informada e confirmada no atendimento antes do fechamento do pedido.",
  },
  {
    q: "Vocês emitem nota fiscal?",
    a: "Consulte a disponibilidade de documentação fiscal diretamente no atendimento antes de finalizar o pedido.",
  },
  {
    q: "E se eu quiser retirar em Barretos?",
    a: "Retirada por combinação prévia no ateliê. Nesse caso, o pagamento pode ser em dinheiro ou PIX na entrega.",
  },
];

export default function FormasPagamento() {
  useReveal();
  usePageMeta({
    title: "Formas de Pagamento",
    description: "Conheça as formas de pagamento ativas e confirme as condições do seu pedido diretamente pelo WhatsApp.",
  });

  const { paymentMethods, pixKey } = useSettings();
  const enabled = paymentMethods.filter((p) => p.enabled);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);


  const copyPix = async () => {
    try {
      await navigator.clipboard?.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };


  return (
    <div className="relative">
      <EditorialHeader
        eyebrow="Pagamento"
        edition="Odoyá · Como pagar · Guia"
        title={
          <>
            Do carrinho<br />
            <span className="italic text-gold-300">à sua casa,</span><br />
            <span className="shimmer-text font-semibold">sem susto.</span>
          </>
        }
        subtitle="Todas as formas que aceitamos, explicadas com clareza. Sem taxas escondidas, sem cadastro chato — só um bom papo pelo WhatsApp."
        right={
          <div className="space-y-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold-400">Aceitamos</p>
              <p className="mt-1 font-display text-4xl font-semibold text-cream-50 tabular-nums">
                {enabled.length}
              </p>
              <p className="text-xs text-cream-100/60">formas de pagamento ativas</p>
            </div>
            <a
              href={whatsappLink("Olá! Queria tirar uma dúvida sobre pagamento.")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold text-gold-300 transition hover:bg-white/5"
            >
              <MessageCircle size={13} /> Tirar dúvida agora
            </a>
          </div>
        }
      />

      {/* PIX destaque */}
      {pixKey && enabled.some((p) => p.id === "pix" || p.name.toLowerCase().includes("pix")) && (
        <section className="bg-cream-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6 md:px-12">
            <div className="reveal relative overflow-hidden rounded-3xl bg-plum-900 p-8 text-cream-50 shadow-2xl md:p-12">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl" />
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-sage-500/20 blur-3xl" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-plum-950/50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-300">
                    <Zap size={11} /> Pagamento via PIX
                  </span>
                  <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
                    Pague no <span className="italic text-gold-300">PIX</span> com condição confirmada
                  </h2>
                  <p className="mt-3 max-w-lg text-cream-100/75">
                    A confirmação do PIX e qualquer condição especial são combinadas no atendimento. Copie a chave abaixo ou peça orientações pelo WhatsApp.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1 rounded-2xl border border-cream-100/15 bg-plum-950/60 p-4 backdrop-blur">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold-400">Chave PIX</p>
                      <p className="mt-1 truncate font-mono text-sm text-cream-50">{pixKey}</p>
                    </div>
                    <button
                      onClick={copyPix}
                      className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                        copied
                          ? "bg-sage-500 text-white"
                          : "bg-cream-50 text-plum-900 hover:bg-gold-300"
                      }`}
                    >
                      {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar chave</>}
                    </button>
                  </div>

                </div>

                {/* Ilustração de QR — o código real é enviado no atendimento */}
                <div className="hidden shrink-0 rounded-3xl bg-cream-50 p-6 shadow-xl md:block">
                  <div className="grid h-40 w-40 grid-cols-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => {
                      // "pattern" pseudo-QR: canto localizadores + ruído reprodutível
                      const isCorner =
                        (i < 8 && (i % 8 < 3)) ||
                        (i >= 40 && i < 48 && i % 8 < 3) ||
                        (i < 24 && i % 8 >= 5);
                      const isFilled = isCorner || (i * 37 + 13) % 3 === 0;
                      return (
                        <span key={i} className={`aspect-square ${isFilled ? "bg-plum-950" : "bg-transparent"}`} />
                      );
                    })}
                  </div>
                  <p className="mt-3 text-center text-[0.6rem] font-bold uppercase tracking-[0.3em] text-plum-500">
                    QR Code confirmado no atendimento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid de formas de pagamento */}
      <section className="bg-cream-50 pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-plum-500">— Todas as opções</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-plum-900 md:text-5xl">
                Escolha como <span className="italic text-plum-600">preferir pagar</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm text-plum-700/70">
              Cada método tem suas vantagens. Explicamos abaixo — e você decide na hora do atendimento.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enabled.map((m) => (
              <article
                key={m.id}
                className={`reveal group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-2xl ${
                  m.featured ? "ring-gold-400" : "ring-plum-100"
                }`}
              >
                {m.featured && (
                  <span className="absolute -right-8 top-6 rotate-45 bg-gold-500 px-10 py-1 text-[0.55rem] font-bold uppercase tracking-widest text-plum-950 shadow">
                    Recomendado
                  </span>
                )}
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plum-900 text-3xl">
                  {m.icon}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-plum-900">{m.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-plum-700/75">{m.description}</p>

                <ul className="mt-4 space-y-1.5 text-xs">
                  {m.installments && (
                    <li className="flex items-center gap-2 text-plum-700">
                      <span className="h-1 w-1 rounded-full bg-plum-400" /> {m.installments}
                    </li>
                  )}
                  {m.discount && (
                    <li className="flex items-center gap-2 text-sage-700">
                      <span className="h-1 w-1 rounded-full bg-sage-500" /> {m.discount}
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-plum-700">
                    <span className="h-1 w-1 rounded-full bg-plum-400" /> Combinado pelo WhatsApp
                  </li>
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Passo a passo */}
      <section className="bg-plum-900 py-24 text-cream-50 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-16 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-400">— Como funciona</p>
              <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
                Do pedido<br />
                <span className="italic text-gold-300">à entrega</span> em 4 passos
              </h2>
            </div>
          </div>

          <div className="relative">
            {/* Linha central */}
            <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-gold-400/40 via-gold-400/60 to-gold-400/40 md:left-1/2 md:-translate-x-1/2" />

            <div className="space-y-10 md:space-y-16">
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  className={`reveal relative pl-16 md:grid md:grid-cols-2 md:gap-12 md:pl-0 ${
                    i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className={`${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <p className="font-display text-6xl font-semibold text-gold-300 md:text-7xl">{s.n}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold md:text-3xl">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-cream-100/70 md:text-base">{s.text}</p>
                  </div>
                  <div className="hidden md:block" />
                  <span className="absolute left-6 top-2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-gold-400 ring-4 ring-plum-900 md:left-1/2">
                    <s.icon size={9} className="text-plum-950" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream-50 py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <div className="mb-10 flex items-center gap-3">
            <HelpCircle className="text-plum-600" size={22} />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-plum-500">— Perguntas frequentes</p>
          </div>
          <h2 className="font-display text-4xl font-semibold text-plum-900 md:text-5xl">
            Ainda com <span className="italic text-plum-600">alguma dúvida?</span>
          </h2>

          <div className="mt-10 space-y-3">
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className={`reveal overflow-hidden rounded-2xl bg-white ring-1 transition ${
                    open ? "ring-plum-400 shadow-lg" : "ring-plum-100"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-display text-lg font-semibold text-plum-900">{f.q}</span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum-100 text-plum-700 transition ${open ? "rotate-45 bg-plum-700 text-cream-50" : ""}`}>
                      <Plus size={14} />
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden px-5 transition-all duration-300 ${
                      open ? "max-h-96 pb-5" : "max-h-0"
                    }`}
                  >
                    <p className="text-sm leading-relaxed text-plum-700/85">{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-plum-950 py-24 text-cream-50">
        <img src="/images/hero-altar.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-plum-950 via-plum-900/85 to-plum-800/60" />
        <div className="relative mx-auto max-w-4xl px-6 text-center md:px-12">
          <ShieldCheck className="mx-auto text-gold-300" size={28} />
          <h3 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Compra acompanhada,<br />
            <span className="italic text-gold-300">atendimento humano</span>
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-cream-100/75">
            Aqui você fala direto com a Jéssica. Sem robôs, sem chatbot — só uma pessoa que quer que sua compra seja perfeita.
          </p>
          <a
            href={whatsappLink("Olá! Quero fechar um pedido. Como faço para pagar?")}
            target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-cream-50 px-8 py-4 text-base font-semibold text-plum-950 transition hover:bg-gold-300"
          >
            <MessageCircle size={18} /> Começar pelo WhatsApp <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}
