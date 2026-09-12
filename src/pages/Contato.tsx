import { useState } from "react";
import { MessageCircle, MapPin, Send, CheckCircle2, Clock, Mail, Truck } from "lucide-react";
import { InstagramIcon as Instagram } from "../components/icons";
import { useReveal } from "../hooks/useReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { whatsappLink } from "../data/site";
import { useSettings } from "../store/useSettings";
import EditorialHeader from "../components/EditorialHeader";
import FreteCalculator from "../components/FreteCalculator";
import { sanitize, isValidEmail } from "../utils/security";

export default function Contato() {
  useReveal();
  usePageMeta({
    title: "Contato",
    description: "Fale com a Odoyá pelo WhatsApp, Instagram ou formulário. Atendimento humano em Barretos – SP.",
  });

  const { storeConfig } = useSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const name = sanitize(form.name, 80);
    const email = sanitize(form.email, 100);
    const subject = sanitize(form.subject, 100);
    const message = sanitize(form.message, 800);

    if (!name || !message) { setError("Preencha nome e mensagem."); return; }
    if (email && !isValidEmail(email)) { setError("E-mail inválido."); return; }

    const lines = [
      `Olá! Meu nome é ${name}.`,
      email ? `E-mail: ${email}` : "",
      subject ? `Assunto: ${subject}` : "",
      "",
      message,
    ].filter(Boolean).join("\n");
    window.open(whatsappLink(lines), "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const phone = storeConfig.whatsappPhone;
  const phoneDisplay = phone.replace(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/, "+$1 ($2) $3-$4");

  return (
    <div className="relative">
      <EditorialHeader
        eyebrow="Contato"
        edition="Odoyá · Fale com a Jéssica"
        title={
          <>
            Vamos<br />
            <span className="italic text-gold-300">conversar?</span>
          </>
        }
        subtitle={<>Escolha o canal que preferir. Somos <strong className="text-cream-50">pequenos</strong>, então respondemos com atenção real — não com robô.</>}
        right={
          <div className="space-y-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold-400">Horário</p>
              <p className="mt-1 whitespace-pre-line text-sm text-cream-100/80">{storeConfig.businessHours}</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gold-400">Envio</p>
              <p className="mt-1 text-sm text-cream-100/80">{storeConfig.shippingDays}</p>
            </div>
          </div>
        }
      />

      {/* Quick channels */}
      <section className="bg-cream-50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href={whatsappLink(storeConfig.welcomeMessage || "Olá!")}
              target="_blank" rel="noopener noreferrer"
              className="reveal group flex items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-plum-100 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white transition group-hover:rotate-6">
                <MessageCircle size={22} />
              </span>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700">Preferido · resposta rápida</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-plum-900">WhatsApp</h3>
                <p className="mt-1 font-mono text-sm text-plum-700">{phoneDisplay}</p>
              </div>
            </a>

            <a
              href={storeConfig.instagram}
              target="_blank" rel="noopener noreferrer"
              className="reveal group flex items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-plum-100 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              style={{ transitionDelay: "60ms" }}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-deep to-gold-500 text-white transition group-hover:rotate-6">
                <Instagram size={22} />
              </span>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-rose-deep">Bastidores e novidades</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-plum-900">Instagram</h3>
                <p className="mt-1 text-sm text-plum-700">{storeConfig.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}</p>
              </div>
            </a>

            <a
              href={`mailto:${storeConfig.email}`}
              className="reveal group flex items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-plum-100 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              style={{ transitionDelay: "120ms" }}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-plum-800 text-cream-50 transition group-hover:rotate-6">
                <Mail size={22} />
              </span>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-plum-600">Para assuntos formais</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-plum-900">E-mail</h3>
                <p className="mt-1 truncate text-sm text-plum-700">{storeConfig.email}</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Formulário + info */}
      <section className="bg-cream-50 pb-16 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1.3fr_1fr] md:px-12">
          <form onSubmit={handleSubmit} className="reveal rounded-3xl bg-white p-6 shadow-xl ring-1 ring-plum-100 md:p-8">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-plum-500">— Escreva pra gente</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-plum-900">Envie uma mensagem</h2>
            <p className="mt-2 text-sm text-plum-700/70">
              Preenche os campos e a gente responde direto no seu WhatsApp — sem cadastro.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-plum-700">Seu nome *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Como podemos te chamar?"
                  className="w-full rounded-xl border border-plum-200 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-plum-700">E-mail (opcional)</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-plum-200 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-plum-700">Assunto</span>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Pedido, dúvida, parceria..."
                  className="w-full rounded-xl border border-plum-200 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-plum-700">Mensagem *</span>
                <textarea
                  required rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Escreva sua mensagem com carinho..."
                  className="w-full resize-none rounded-xl border border-plum-200 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
                />
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-deep">{error}</p>
            )}

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              {sent ? <><CheckCircle2 size={18} /> Redirecionando ao WhatsApp…</> : <><Send size={18} /> Enviar pelo WhatsApp</>}
            </button>
            <p className="mt-3 text-center text-[0.65rem] text-plum-500">
              Nunca compartilhamos seus dados. Toda conversa fica direto entre você e a Jéssica.
            </p>
          </form>

          <aside className="space-y-4">
            <div className="reveal overflow-hidden rounded-3xl bg-plum-900 p-6 text-cream-50 shadow-xl md:p-8">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-400">— Nosso ateliê</p>
              <h3 className="mt-3 font-display text-3xl font-semibold">
                {storeConfig.city} — {storeConfig.state}
              </h3>
              <div className="mt-4 space-y-3 text-sm text-cream-100/80">
                <p className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gold-300" />
                  <span>Enviamos de {storeConfig.city}, {storeConfig.state}<br />CEP {storeConfig.cep} · Brasil 🇧🇷</span>
                </p>
                <p className="flex items-start gap-3">
                  <Clock size={16} className="mt-0.5 shrink-0 text-gold-300" />
                  <span className="whitespace-pre-line">{storeConfig.businessHours}</span>
                </p>
                <p className="flex items-start gap-3">
                  <Truck size={16} className="mt-0.5 shrink-0 text-gold-300" />
                  <span>{storeConfig.shippingDays}</span>
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-cream-100/10 bg-plum-950/50 p-4">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold-400">Fundadora</p>
                <p className="mt-2 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 font-display text-lg font-bold text-plum-950">J</span>
                  <span>
                    <span className="block font-display text-lg font-semibold">{storeConfig.ownerName}</span>
                    <span className="block text-[0.7rem] text-cream-100/60">Atende pessoalmente</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="reveal" style={{ transitionDelay: "80ms" }}>
              <FreteCalculator qtdItens={1} totalPedido={0} />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
