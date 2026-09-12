import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin, ArrowRight, Leaf, Sparkles, Moon, Flame } from "lucide-react";
import { useAuth } from "../store/useAuth";

export default function Registro() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirm: "", telefone: "", cidade: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.senha.length < 6) return setErr("A senha deve ter no mínimo 6 caracteres.");
    if (form.senha !== form.confirm) return setErr("As senhas não coincidem.");
    setLoading(true);
    try {
      const r = await register({ nome: form.nome.trim(), email: form.email.trim(), senha: form.senha, telefone: form.telefone, cidade: form.cidade });
      if (r.ok) nav("/conta");
      else setErr(r.msg || "Erro ao criar conta.");
    } catch {
      setErr("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a0d24]">
      <div className="absolute inset-0">
        <img src="/images/banho-ervas.jpg" alt="" className="h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0d24] via-[#2a1340]/85 to-[#0d0618]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(127,77,156,0.28),transparent_60%)]" />
      </div>

      <Leaf className="pointer-events-none absolute right-[8%] top-[14%] h-10 w-10 -scale-x-100 text-sage-400/25 animate-floaty" style={{ animationDuration: "7s" }} />
      <Sparkles className="pointer-events-none absolute right-[24%] top-[70%] h-4 w-4 text-gold-300/50 animate-floaty" style={{ animationDuration: "5s", animationDelay: "1s" }} />
      <Moon className="pointer-events-none absolute left-[6%] top-[22%] h-8 w-8 text-gold-300/30 animate-floaty" style={{ animationDuration: "9s" }} />
      <Flame className="pointer-events-none absolute left-[20%] bottom-[18%] h-6 w-6 text-amber-300/40 animate-floaty" style={{ animationDuration: "6s", animationDelay: "2s" }} />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-0">
        {/* Left form */}
        <form onSubmit={submit} className="order-2 w-full self-center rounded-[2rem] border border-gold-400/20 bg-cream-50/95 p-8 shadow-2xl backdrop-blur-sm md:p-10 lg:order-1">
          <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-gold-500/50" />
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold-600">Novo cadastro</p>
          <h2 className="font-serif text-3xl font-semibold text-plum-800">Faça parte da Odoyá</h2>
          <p className="mt-1.5 text-sm text-plum-900/55">Salve seus favoritos, registre preferências e receba novidades.</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Input icon={<User size={14} />} label="Nome completo" value={form.nome} onChange={(v) => set("nome", v)} full />
            <Input icon={<Mail size={14} />} type="email" label="E-mail" value={form.email} onChange={(v) => set("email", v)} full />
            <Input icon={<Lock size={14} />} type="password" label="Senha (mín. 6)" value={form.senha} onChange={(v) => set("senha", v)} />
            <Input icon={<Lock size={14} />} type="password" label="Confirmar senha" value={form.confirm} onChange={(v) => set("confirm", v)} />
            <Input icon={<Phone size={14} />} label="Telefone (opcional)" value={form.telefone} onChange={(v) => set("telefone", v)} />
            <Input icon={<MapPin size={14} />} label="Cidade (opcional)" value={form.cidade} onChange={(v) => set("cidade", v)} />
          </div>

          {err && <p className="mt-4 rounded-xl bg-rose-deep/10 px-4 py-2.5 text-sm text-rose-deep">{err}</p>}

          <button disabled={loading} className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-plum-700 px-6 py-3.5 font-medium text-cream-50 shadow-lg shadow-plum-900/20 transition hover:bg-plum-800 disabled:opacity-60">
            {loading ? "Criando conta..." : <>Criar minha conta <ArrowRight size={18} className="transition group-hover:translate-x-1" /></>}
          </button>

          <p className="mt-5 text-center text-sm text-plum-900/60">
            Já tem conta? <Link to="/login" className="font-medium text-plum-700 underline-offset-2 hover:underline">Entrar</Link>
          </p>
          <div className="mt-5 border-t border-plum-100 pt-4">
            <Link to="/" className="block text-center text-sm text-plum-500 hover:text-plum-700">← Voltar ao site</Link>
          </div>
        </form>

        {/* Right brand panel */}
        <div className="order-1 flex flex-col justify-center text-cream-50 lg:order-2">
          <Link to="/" className="flex items-center gap-3 lg:flex-row-reverse lg:text-right">
            <img src="/images/logo.png" alt="" className="h-16 w-16 rounded-full ring-2 ring-gold-400/50 shadow-2xl" />
            <div>
              <p className="font-serif text-2xl font-semibold tracking-wide">ODOYÁ</p>
              <p className="text-[0.6rem] tracking-[0.35em] text-gold-300">ERVAS DE ARUANDA</p>
            </div>
          </Link>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.35em] text-gold-300 lg:text-right">Faça parte da história</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] md:text-6xl lg:text-right">
            Um caminho<br />
            <span className="italic text-gold-300">de fé e natureza.</span>
          </h1>
          <p className="mt-6 max-w-md font-serif text-lg italic leading-relaxed text-cream-100/70 lg:ml-auto lg:text-right">
            Junte-se a nós e descubra o propósito de cada aroma, o cuidado de cada defumação e a conexão com o sagrado em cada essência.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-xs lg:justify-end">
            <span className="rounded-full border border-gold-400/30 bg-white/5 px-4 py-2 text-cream-100/80 backdrop-blur">Favoritos salvos</span>
            <span className="rounded-full border border-gold-400/30 bg-white/5 px-4 py-2 text-cream-100/80 backdrop-blur">Novidades em primeira mão</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ icon, label, value, onChange, type = "text", full }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-plum-700">{icon} {label}</label>
      <input
        type={type} required value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-plum-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-plum-400 focus:ring-2 focus:ring-plum-200"
      />
    </div>
  );
}
