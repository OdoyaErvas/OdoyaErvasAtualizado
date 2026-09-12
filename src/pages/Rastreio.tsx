import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search, Package, Truck, CheckCircle2, Clock, AlertTriangle, MapPin,
  MessageCircle, Copy, Check, ArrowRight, Sparkles, Info,
} from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { useShipping, type ShipmentStatus } from "../store/useShipping";
import EditorialHeader from "../components/EditorialHeader";
import { whatsappLink } from "../data/site";

const STATUS_META: Record<ShipmentStatus, { label: string; icon: any; color: string; bg: string; ring: string }> = {
  aguardando: { label: "Aguardando envio", icon: Clock, color: "text-gold-700", bg: "bg-gold-100", ring: "ring-gold-400" },
  postado: { label: "Postado", icon: Package, color: "text-plum-800", bg: "bg-plum-100", ring: "ring-plum-400" },
  em_transito: { label: "Em trânsito", icon: Truck, color: "text-plum-800", bg: "bg-plum-100", ring: "ring-plum-400" },
  entregue: { label: "Entregue", icon: CheckCircle2, color: "text-sage-700", bg: "bg-sage-100", ring: "ring-sage-500" },
  problema: { label: "Ocorrência", icon: AlertTriangle, color: "text-rose-deep", bg: "bg-rose-100", ring: "ring-rose-deep" },
};

const STEPS: ShipmentStatus[] = ["aguardando", "postado", "em_transito", "entregue"];

const FAQ_RASTREIO = [
  { q: "Onde encontro meu código?", a: "Assim que o pedido é despachado, enviamos o código para você no WhatsApp. Ele também aparece na sua conta em 'Meus envios'." },
  { q: "Quanto tempo demora para atualizar?", a: "Os Correios atualizam a cada movimentação — geralmente entre 12h e 24h após cada etapa. Se demorar mais que 3 dias sem novidade, nos avise." },
  { q: "E se meu pedido atrasar?", a: "Fala com a gente no WhatsApp. Rastreamos junto com os Correios e, se necessário, abrimos ocorrência e reenviamos." },
];

export default function Rastreio() {
  useReveal();
  usePageMeta({
    title: "Rastrear Pedido",
    description: "Digite o código de rastreio e acompanhe seu pedido Odoyá em tempo real.",
  });

  const nav = useNavigate();
  const [params] = useSearchParams();
  const { shipments } = useShipping();
  const [code, setCode] = useState(params.get("code") || "");
  const [searched, setSearched] = useState(!!params.get("code"));
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("code")) {
      setCode(params.get("code")!);
      setSearched(true);
    }
  }, [params]);

  const found = useMemo(
    () => (code.trim() ? shipments.find((s) => s.trackingCode.toLowerCase() === code.trim().toLowerCase()) : null),
    [code, shipments]
  );

  const recentTracks = useMemo(() => {
    return [...shipments]
      .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
      .slice(0, 3);
  }, [shipments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSearched(true);
      nav(`/rastreio?code=${encodeURIComponent(code.trim())}`, { replace: true });
      setLoading(false);
    }, 600);
  };

  const copyCode = () => {
    if (!found) return;
    navigator.clipboard?.writeText(found.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStep = found ? STEPS.indexOf(found.status) : -1;

  return (
    <div className="relative">
      <EditorialHeader
        eyebrow="Rastreamento"
        edition="Odoyá · Rastreio · Correios"
        title={
          <>
            Acompanhe<br />
            <span className="italic text-gold-300">cada passo</span><br />
            <span className="shimmer-text font-semibold">do envio.</span>
          </>
        }
        subtitle="Digite o código que enviamos no seu WhatsApp e veja o pedido em movimento. Do ateliê em Barretos até a sua porta."
        right={
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold-400">Compra acompanhada</p>
            <p className="mt-1 font-display text-2xl font-semibold text-cream-50">Código no WhatsApp</p>
            <p className="text-xs text-cream-100/60">Rastreie com segurança a qualquer hora.</p>
          </div>
        }
      />

      {/* Search form */}
      <section className="relative -mt-8 pb-12 md:-mt-12">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <form
            onSubmit={handleSearch}
            className="reveal relative overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-plum-100 md:p-8"
          >
            <label className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-plum-500">
              Digite o código de rastreio
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-plum-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: OD123456789BR"
                  className="w-full rounded-full border border-plum-200 bg-cream-50 py-3.5 pl-12 pr-4 font-mono text-sm tracking-wider text-plum-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button
                type="submit"
                disabled={!code.trim() || loading}
                className="flex items-center justify-center gap-2 rounded-full bg-plum-900 px-8 py-3.5 text-sm font-semibold text-cream-50 transition hover:bg-plum-950 disabled:opacity-50"
              >
                {loading ? <><Sparkles size={16} className="animate-spin" /> Buscando…</> : <><Search size={16} /> Rastrear</>}
              </button>
            </div>

            {/* Códigos recentes de demo */}
            {recentTracks.length > 0 && !searched && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-plum-400">Códigos recentes:</span>
                {recentTracks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setCode(t.trackingCode); }}
                    className="rounded-full border border-plum-200 bg-cream-50 px-3 py-1 font-mono text-[0.65rem] text-plum-700 hover:border-plum-400"
                  >
                    {t.trackingCode}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Result area */}
      <section className="bg-cream-50 pb-16 md:pb-24">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          {searched && !found && (
            <div className="reveal rounded-3xl border-2 border-dashed border-plum-200 bg-white p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-deep/10 text-rose-deep">
                <AlertTriangle size={26} />
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold text-plum-900 md:text-4xl">
                Código não encontrado
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-plum-700/70">
                Verifique se digitou corretamente. Se acabou de comprar, o código pode levar até 24h para aparecer.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => { setSearched(false); setCode(""); nav("/rastreio"); }}
                  className="rounded-full border border-plum-200 px-5 py-2.5 text-sm font-semibold text-plum-700 hover:bg-plum-50"
                >
                  Tentar novo código
                </button>
                <a
                  href={whatsappLink(`Olá! Estou tentando rastrear meu pedido *${code}* mas não encontrei.`)}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <MessageCircle size={14} /> Falar no WhatsApp
                </a>
              </div>
            </div>
          )}

          {found && (
            <div className="reveal space-y-6">
              {/* Card cliente / tracking */}
              <div className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl ring-2 md:p-8 ${STATUS_META[found.status].ring}`}>
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-plum-100/60 blur-3xl" />
                <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-600">Pedido de</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold text-plum-900 md:text-4xl">{found.clienteNome}</h2>
                    <p className="mt-2 text-sm text-plum-700">{found.produto}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                      {(found.destinoCidade || found.destinoEstado) && (
                        <span className="flex items-center gap-1.5 rounded-full bg-plum-100 px-3 py-1 text-plum-700">
                          <MapPin size={11} /> Destino: {found.destinoCidade}{found.destinoEstado ? ` — ${found.destinoEstado}` : ""}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 rounded-full bg-plum-100 px-3 py-1 text-plum-700">
                        <Truck size={11} /> {found.transportadora.replace("correios-", "").toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <code className="rounded-lg border border-plum-200 bg-cream-50 px-3 py-1.5 font-mono text-sm text-plum-800">
                        {found.trackingCode}
                      </code>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1 rounded-full border border-plum-200 px-3 py-1.5 text-xs font-semibold text-plum-700 hover:bg-plum-50"
                      >
                        {copied ? <><Check size={12} className="text-sage-600" /> Copiado</> : <><Copy size={12} /> Copiar</>}
                      </button>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-bold ${STATUS_META[found.status].bg} ${STATUS_META[found.status].color}`}>
                    {(() => { const I = STATUS_META[found.status].icon; return <I size={16} />; })()}
                    {STATUS_META[found.status].label}
                  </span>
                </div>
              </div>

              {/* Progress steps */}
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold text-plum-900">Progresso</h3>
                  <span className="text-xs text-plum-500">
                    {currentStep + 1} de {STEPS.length} etapas
                  </span>
                </div>

                {/* Horizontal timeline */}
                <div className="relative">
                  <div className="absolute left-6 top-6 right-6 h-0.5 bg-plum-100" />
                  <div
                    className="absolute left-6 top-6 h-0.5 bg-gradient-to-r from-plum-700 to-gold-500 transition-all duration-1000"
                    style={{
                      width: currentStep >= 0 ? `calc(${(currentStep / (STEPS.length - 1)) * 100}% - ${(currentStep / (STEPS.length - 1)) * 48}px)` : 0,
                    }}
                  />

                  <div className="grid grid-cols-4 gap-2">
                    {STEPS.map((step, i) => {
                      const meta = STATUS_META[step];
                      const active = i <= currentStep;
                      const current = i === currentStep;
                      const Icon = meta.icon;
                      return (
                        <div key={step} className="flex flex-col items-center gap-3 text-center">
                          <div
                            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                              active
                                ? "border-plum-700 bg-plum-800 text-cream-50 shadow-lg"
                                : "border-plum-200 bg-white text-plum-300"
                            } ${current ? "scale-110 ring-4 ring-gold-300/50" : ""}`}
                          >
                            <Icon size={18} />
                            {current && <span className="absolute -inset-1 animate-ping rounded-full bg-gold-400/30" />}
                          </div>
                          <span className={`text-[0.6rem] font-bold uppercase leading-tight tracking-wider md:text-[0.65rem] ${active ? "text-plum-800" : "text-plum-300"}`}>
                            {meta.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Histórico */}
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-plum-100 md:p-8">
                <h3 className="mb-6 font-display text-xl font-semibold text-plum-900">Histórico de movimentações</h3>
                {found.historico.length === 0 ? (
                  <p className="text-sm text-plum-500">Aguardando primeira movimentação.</p>
                ) : (
                  <ul className="space-y-4 border-l-2 border-plum-100 pl-6">
                    {[...found.historico].reverse().map((h, i) => {
                      const meta = STATUS_META[h.status];
                      const isFirst = i === 0;
                      return (
                        <li key={i} className="relative">
                          <span className={`absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full ${meta.bg} ring-2 ring-cream-50 ${isFirst ? "shadow" : ""}`}>
                            <span className={`h-2 w-2 rounded-full ${isFirst ? "animate-pulse" : ""}`} style={{ backgroundColor: meta.color.replace("text-", "").includes("gold") ? "#a67f27" : meta.color.replace("text-", "").includes("sage") ? "#566e3d" : meta.color.replace("text-", "").includes("rose") ? "#7a2436" : "#4c2a6b" }} />
                          </span>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className={`text-sm font-semibold ${isFirst ? "text-plum-900" : "text-plum-700"}`}>{h.texto}</p>
                            <time className="font-mono text-[0.65rem] text-plum-500">
                              {new Date(h.data).toLocaleString("pt-BR", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </time>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* CTA */}
              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href={whatsappLink(`Olá! Tenho uma dúvida sobre meu pedido (código *${found.trackingCode}*).`)}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <MessageCircle size={16} /> Falar sobre este pedido
                </a>
                <a
                  href="https://rastreamento.correios.com.br/app/index.php"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-plum-200 bg-white px-6 py-4 text-sm font-semibold text-plum-800 transition hover:border-plum-400"
                >
                  Ver detalhes nos Correios <ArrowRight size={14} />
                </a>
              </div>
            </div>
          )}

          {!searched && (
            <div className="reveal rounded-3xl bg-gradient-to-br from-plum-50 to-cream-100 p-10 text-center ring-1 ring-plum-100">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-plum-900 text-gold-300">
                <Truck size={32} />
              </div>
              <h2 className="mt-6 font-display text-3xl font-semibold text-plum-900 md:text-4xl">
                Pronto para rastrear?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-plum-700/70">
                Cole o código no campo acima e acompanhe cada etapa — desde o momento em que embalamos até a chegada na sua porta.
              </p>
              <div className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-3">
                {STEPS.map((s, i) => {
                  const meta = STATUS_META[s];
                  const Icon = meta.icon;
                  return (
                    <div key={s} className="flex flex-col items-center gap-2 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-plum-700 shadow-sm ring-1 ring-plum-100">
                        <Icon size={14} />
                      </div>
                      <span className="text-[0.55rem] font-bold uppercase leading-tight tracking-wider text-plum-600">
                        Passo {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Rastreio */}
      <section className="bg-plum-950 py-20 text-cream-50 md:py-24">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <div className="mb-8 flex items-center gap-3">
            <Info className="text-gold-300" size={20} />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gold-400">— Perguntas sobre rastreio</p>
          </div>
          <div className="space-y-3">
            {FAQ_RASTREIO.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-cream-100/10 bg-plum-900/40 p-4 transition hover:bg-plum-900/60 md:p-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                  <span className="font-display text-lg font-semibold">{f.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-gold-300 transition group-open:rotate-45">
                    <ArrowRight size={13} />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-cream-100/70">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-gold-400/30 bg-plum-900/60 p-6 text-center md:p-8">
            <p className="font-display text-xl font-semibold">Não tem o código?</p>
            <p className="mt-2 text-sm text-cream-100/70">Se você já tem conta, veja todos os seus envios no painel.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                to="/conta"
                className="inline-flex items-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 text-xs font-semibold text-plum-900 hover:bg-gold-300"
              >
                Ver meus envios <ArrowRight size={13} />
              </Link>
              <a
                href={whatsappLink("Olá! Comprei mas não achei meu código de rastreio.")}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cream-100/30 px-5 py-2.5 text-xs font-semibold text-cream-50 hover:border-gold-400"
              >
                <MessageCircle size={13} /> Pedir no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
