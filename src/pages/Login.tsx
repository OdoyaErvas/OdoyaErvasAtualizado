import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Leaf, Moon, Sparkles, Flame } from "lucide-react";
import { useAuth } from "../store/useAuth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await login(email.trim(), senha);
      if (r.ok) nav("/conta");
      else setErr(r.msg || "Erro ao entrar.");
    } catch {
      setErr("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a0d24]">
      {/* Layered ambient background */}
      <div className="absolute inset-0">
        <img src="/images/hero-altar.jpg" alt="" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0d24] via-[#2a1340]/85 to-[#0d0618]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(197,160,89,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(127,77,156,0.28),transparent_60%)]" />
      </div>

      {/* Floating botanical ornaments */}
      <Leaf className="pointer-events-none absolute left-[6%] top-[14%] h-10 w-10 text-sage-400/25 animate-floaty" style={{ animationDuration: "7s" }} />
      <Sparkles className="pointer-events-none absolute left-[22%] top-[64%] h-4 w-4 text-gold-300/50 animate-floaty" style={{ animationDuration: "5s", animationDelay: "1s" }} />
      <Moon className="pointer-events-none absolute right-[8%] top-[20%] h-8 w-8 text-gold-300/30 animate-floaty" style={{ animationDuration: "9s" }} />
      <Flame className="pointer-events-none absolute right-[18%] bottom-[22%] h-6 w-6 text-amber-300/40 animate-floaty" style={{ animationDuration: "6s", animationDelay: "2s" }} />
      <Leaf className="pointer-events-none absolute right-[30%] top-[8%] h-6 w-6 -scale-x-100 text-sage-400/20 animate-floaty" style={{ animationDuration: "8s", animationDelay: "1.5s" }} />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-0">
        {/* Left brand panel */}
        <div className="flex flex-col justify-center text-cream-50">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="" className="h-16 w-16 rounded-full ring-2 ring-gold-400/50 shadow-2xl" />
            <div>
              <p className="font-serif text-2xl font-semibold tracking-wide">ODOYÁ</p>
              <p className="text-[0.6rem] tracking-[0.35em] text-gold-300">ERVAS DE ARUANDA</p>
            </div>
          </Link>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.35em] text-gold-300">Área do cliente</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] md:text-6xl">
            Entre<br />
            <span className="italic text-gold-300">no seu espaço.</span>
          </h1>
          <p className="mt-6 max-w-md font-serif text-lg italic leading-relaxed text-cream-100/70">
            "Cada aroma carrega um propósito, cada defumação é um ato de amor."
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-gold-400/30 bg-white/5 px-4 py-2 text-cream-100/80 backdrop-blur">Feito à mão em Barretos - SP</span>
            <span className="rounded-full border border-gold-400/30 bg-white/5 px-4 py-2 text-cream-100/80 backdrop-blur">Enviamos para todo o Brasil</span>
          </div>

          <Link to="/" className="mt-10 inline-flex items-center gap-2 text-sm text-cream-100/60 transition hover:text-gold-300">
            ← Voltar para o site
          </Link>
        </div>

        {/* Form card */}
        <form onSubmit={submit} className="relative w-full self-center rounded-[2rem] border border-gold-400/20 bg-cream-50/95 p-8 shadow-2xl backdrop-blur-sm md:p-10">
          {/* Decorative corners */}
          <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-gold-500/50" />
          <span className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-gold-500/50" />
          <span className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gold-500/50" />
          <span className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gold-500/50" />

          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold-600">Acesso ao cliente</p>
          <h2 className="font-serif text-3xl font-semibold text-plum-800">Entre na sua conta</h2>
          <p className="mt-1.5 text-sm text-plum-900/55">Acesse favoritos, preferências e novidades exclusivas.</p>

          <div className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-plum-700"><Mail size={14} /> E-mail</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-plum-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-plum-400 focus:ring-2 focus:ring-plum-200"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-plum-700"><Lock size={14} /> Senha</label>
              <input
                type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-plum-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-plum-400 focus:ring-2 focus:ring-plum-200"
              />
            </div>
            {err && <p className="rounded-xl bg-rose-deep/10 px-4 py-2.5 text-sm text-rose-deep">{err}</p>}
            <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-full bg-plum-700 px-6 py-3.5 font-medium text-cream-50 shadow-lg shadow-plum-900/20 transition hover:bg-plum-800 disabled:opacity-60">
              {loading ? "Entrando..." : <>Entrar <ArrowRight size={18} className="transition group-hover:translate-x-1" /></>}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-plum-900/60">
            Ainda não tem conta?{" "}
            <Link to="/registro" className="font-medium text-plum-700 underline-offset-2 hover:underline">Cadastre-se gratuitamente</Link>
          </p>

          <div className="mt-6 border-t border-plum-100 pt-4">
            <Link to="/admin" className="block text-center text-[0.7rem] uppercase tracking-[0.25em] text-plum-500 transition hover:text-plum-700">
              Acesso administrativo
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
