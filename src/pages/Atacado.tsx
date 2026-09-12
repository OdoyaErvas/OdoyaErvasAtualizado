import { useState } from "react";
import { Building2, CheckCircle2, ChevronRight, Handshake, Leaf, MessageCircle, PackageCheck, Send, Sparkles, Store, UsersRound } from "lucide-react";
import EditorialHeader from "../components/EditorialHeader";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { useWholesale, type WholesaleSegment } from "../store/useWholesale";
import { sanitize, isValidEmail, isValidPhoneBR } from "../utils/security";
import { whatsappLink } from "../data/site";

const SEGMENTS: { label: WholesaleSegment; icon: any; desc: string }[] = [
  { label: "Loja física", icon: Store, desc: "Empórios, casas esotéricas e lojas de bem-estar." },
  { label: "Loja online", icon: Building2, desc: "E-commerce e curadorias digitais de produtos conscientes." },
  { label: "Terapeuta / clínica", icon: Handshake, desc: "Espaços de atendimento, clínicas integrativas e práticas de cuidado." },
  { label: "Espaço holístico", icon: Sparkles, desc: "Yoga, meditação, retiros e espaços de autocuidado." },
  { label: "Terreiro / casa espiritual", icon: Leaf, desc: "Casas de fé, centros e comunidades espirituais." },
  { label: "Hotel / pousada", icon: PackageCheck, desc: "Experiências de hospitalidade e kits de boas-vindas." },
];

const VOLUME = [
  "Até 20 unidades por mês",
  "20 a 50 unidades por mês",
  "50 a 100 unidades por mês",
  "Mais de 100 unidades por mês",
  "Quero conhecer primeiro",
];

const BENEFITS = [
  ["Margem pensada para parceiros", "Tabela profissional após aprovação", "Reposição por lote e atendimento direto"],
  ["Produto com história", "Rótulos autorais e composições exclusivas", "Material de apoio para a equipe vender melhor"],
  ["Relação de longo prazo", "Canal direto com a produção", "Lançamentos e condições especiais para parceiros"],
];

export default function Atacado() {
  useReveal();
  usePageMeta({
    title: "Atacado & Parcerias",
    description: "Revenda os incensos e produtos artesanais Odoyá em lojas, clínicas, espaços holísticos e negócios parceiros.",
  });

  const { createLead } = useWholesale();
  const [form, setForm] = useState({
    company: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    segment: "Loja física" as WholesaleSegment,
    channels: [] as string[],
    volume: VOLUME[0],
    message: "",
    consent: false,
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleChannel = (value: string) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(value) ? prev.channels.filter((x) => x !== value) : [...prev.channels, value],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const data = {
      company: sanitize(form.company, 100),
      contactName: sanitize(form.contactName, 80),
      email: sanitize(form.email, 100).toLowerCase(),
      phone: form.phone.replace(/\D/g, ""),
      city: sanitize(form.city, 60),
      state: sanitize(form.state, 2).toUpperCase(),
      segment: form.segment,
      channels: form.channels,
      volume: form.volume,
      message: sanitize(form.message, 900),
      consent: form.consent,
    };
    if (!data.company || !data.contactName || !data.email || !data.phone || !data.city || !data.state) {
      setError("Preencha os campos obrigatórios para avançar.");
      return;
    }
    if (!isValidEmail(data.email)) {
      setError("Informe um e-mail corporativo válido.");
      return;
    }
    if (!isValidPhoneBR(data.phone)) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }
    if (!data.consent) {
      setError("Confirme que podemos entrar em contato sobre a parceria.");
      return;
    }

    createLead(data);
    setSubmitted(true);
  };

  return (
    <div className="relative">
      <EditorialHeader
        eyebrow="Atacado & parcerias"
        edition="Odoyá · Rede profissional · B2B"
        bgImage="/images/hero-altar.jpg"
        title={
          <>
            Produtos com<br />
            <span className="italic text-gold-300">alma para</span><br />
            <span className="shimmer-text font-semibold">negócios com propósito.</span>
          </>
        }
        subtitle="Se você atende, revende, acolhe ou cria experiências, a Odoyá pode fazer parte da sua rotina profissional."
        right={
          <div className="space-y-4">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold-400">Para parceiros</p>
            <p className="font-display text-3xl font-semibold text-cream-50">Atacado consciente</p>
            <p className="text-xs leading-relaxed text-cream-100/65">Tabela, reposição, materiais de apoio e canal direto com a produção.</p>
          </div>
        }
      />

      {/* Público */}
      <section className="bg-cream-50 py-20 md:py-28 paper">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-12 max-w-2xl">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-plum-500">— Para quem é</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.95] text-plum-950 md:text-5xl">Uma rede para quem transforma <span className="italic text-plum-600">espaços e pessoas.</span></h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SEGMENTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="reveal group rounded-2xl border border-plum-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-plum-300 hover:shadow-xl" style={{ transitionDelay: `${i * 45}ms` }}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-plum-900 text-gold-300 transition group-hover:rotate-6 group-hover:scale-105"><Icon size={18} /></span>
                  <h3 className="mt-4 font-display text-xl font-bold text-plum-950">{item.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-plum-700/75">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-plum-950 py-24 text-cream-50 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:px-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-gold-400">— Por que ser parceiro</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.95] md:text-5xl">Atacado sem perder <span className="italic text-gold-300">a essência.</span></h2>
            <p className="mt-5 text-sm leading-relaxed text-cream-100/70">Não entregamos apenas uma caixa de produtos. Entregamos contexto, história e um canal direto com quem produz.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {BENEFITS.map(([title, a, b], i) => (
              <div key={title} className="rounded-2xl border border-cream-100/10 bg-cream-100/5 p-5 backdrop-blur">
                <span className="font-display text-4xl text-gold-300">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-cream-100/70">
                  <li className="flex gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0 text-gold-300" />{a}</li>
                  <li className="flex gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0 text-gold-300" />{b}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + processo */}
      <section id="quero-parceria" className="bg-cream-50 py-24 md:py-32 paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:px-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-plum-500">— Comece por aqui</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.95] text-plum-950 md:text-5xl">Vamos desenhar uma parceria <span className="italic text-plum-600">que faça sentido.</span></h2>
            <p className="mt-5 text-sm leading-relaxed text-plum-700/80">Conte um pouco sobre o seu negócio. A resposta é pessoal e chega em até 2 dias úteis pelo canal informado.</p>

            <ol className="mt-8 space-y-5 border-l-2 border-plum-200 pl-5">
              {[
                ["01", "Você preenche", "Entendemos seu público, canal e volume."],
                ["02", "Jéssica analisa", "Montamos uma proposta coerente com seu negócio."],
                ["03", "Primeiro lote", "Você recebe a curadoria, materiais e produtos."],
              ].map(([n, title, text]) => (
                <li key={n} className="relative">
                  <span className="absolute -left-[29px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-plum-900 font-display text-[0.6rem] font-bold text-gold-300 ring-4 ring-cream-50">{n}</span>
                  <p className="font-display text-xl font-bold text-plum-950">{title}</p>
                  <p className="text-xs text-plum-600">{text}</p>
                </li>
              ))}
            </ol>

            <a href="mailto:odoyaervasdearuanda@gmail.com?subject=Parceria%20atacado%20Odoyá" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-plum-700 hover:text-plum-950">
              Prefere falar por e-mail? <ChevronRight size={15} />
            </a>
          </div>

          <div>
            {submitted ? (
              <div className="rounded-3xl border border-sage-400/40 bg-white p-8 text-center shadow-xl">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-400/20 text-sage-700"><CheckCircle2 size={30} /></span>
                <h3 className="mt-5 font-display text-3xl font-bold text-plum-950">Interesse registrado.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-plum-700/75">Sua solicitação chegou na nossa central de parcerias. Para agilizar, você também pode iniciar o contato pelo WhatsApp.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a
                    href={whatsappLink(`Olá! Sou ${form.contactName || "representante"} da empresa ${form.company || ""} e preenchi o formulário de atacado no site. Gostaria de conversar sobre parceria.`)}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  ><MessageCircle size={15} /> Abrir WhatsApp</a>
                  <button onClick={() => setSubmitted(false)} className="rounded-full border border-plum-200 px-5 py-3 text-sm font-semibold text-plum-700 hover:bg-plum-50">Enviar outro contato</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl border border-plum-100 bg-white p-6 shadow-xl md:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-plum-100 pb-5">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-gold-600">Cadastro de parceria</p>
                    <h3 className="mt-1 font-display text-3xl font-bold text-plum-950">Seu negócio</h3>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-plum-900 text-gold-300"><UsersRound size={18} /></span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Empresa / negócio *"><input required value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Nome da empresa" className={inputClass} /></Field>
                  <Field label="Seu nome *"><input required value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Responsável pela compra" className={inputClass} /></Field>
                  <Field label="E-mail corporativo *"><input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="compras@empresa.com" className={inputClass} /></Field>
                  <Field label="WhatsApp *"><input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(17) 99999-9999" className={inputClass} /></Field>
                  <Field label="Cidade *"><input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Sua cidade" className={inputClass} /></Field>
                  <Field label="Estado *"><input required maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} placeholder="SP" className={inputClass} /></Field>
                  <Field label="Segmento *">
                    <select value={form.segment} onChange={(e) => set("segment", e.target.value as WholesaleSegment)} className={inputClass}>
                      {[...SEGMENTS.map((s) => s.label), "Outro"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Volume estimado *">
                    <select value={form.volume} onChange={(e) => set("volume", e.target.value)} className={inputClass}>
                      {VOLUME.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold text-plum-700">Onde pretende usar/revender? (selecione quantos quiser)</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Loja física", "E-commerce", "Espaço de atendimento", "Kits de boas-vindas", "Eventos", "Instagram"].map((c) => (
                      <button key={c} type="button" onClick={() => toggleChannel(c)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${form.channels.includes(c) ? "border-plum-700 bg-plum-900 text-cream-50" : "border-plum-200 bg-cream-50 text-plum-700 hover:border-plum-400"}`}>{c}</button>
                    ))}
                  </div>
                </div>

                <Field label="Conte um pouco sobre a parceria" className="mt-5"><textarea rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Seu público, o que busca, quais produtos fazem sentido..." className={`${inputClass} resize-none`} /></Field>

                <label className="mt-5 flex items-start gap-3 rounded-xl bg-cream-50 p-3 text-xs text-plum-700">
                  <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-plum-900" />
                  <span>Autorizo a Odoyá a entrar em contato sobre esta solicitação de parceria. Meus dados serão usados apenas para esta conversa comercial.</span>
                </label>
                {error && <p className="mt-4 rounded-xl bg-rose-deep/10 px-4 py-3 text-sm text-rose-deep">{error}</p>}
                <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-plum-900 py-4 text-sm font-bold text-cream-50 shadow-lg transition hover:bg-plum-950"><Send size={16} /> Solicitar parceria comercial</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={className}><span className="mb-1.5 block text-xs font-semibold text-plum-700">{label}</span>{children}</label>;
}

const inputClass = "w-full rounded-xl border border-plum-200 bg-cream-50 px-4 py-3 text-sm text-plum-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200";