import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Heart, ThumbsUp, User, Mail, Phone, MapPin, LogOut, Save, ShoppingBag, Sparkles } from "lucide-react";
import { useAuth } from "../store/useAuth";
import { useInteractions } from "../store/useInteractions";
import { useStore } from "../store/useStore";
import { useShipping } from "../store/useShipping";
import { useReveal } from "../hooks/useReveal";
import ProductCard from "../components/ProductCard";
import { Truck, Package as PackageIcon } from "lucide-react";

export default function Conta() {
  useReveal();
  const { cliente, logout, updatePerfil } = useAuth();
  const { favoritosDe, gostouDe, toggleFavorito } = useInteractions();
  const { products } = useStore();
  const [tab, setTab] = useState<"fav" | "gostou" | "envios" | "perfil">("fav");
  const { shipments } = useShipping();
  const meusEnvios = shipments.filter(
    (s) =>
      (cliente && s.clienteEmail?.toLowerCase() === cliente.email.toLowerCase()) ||
      (cliente && cliente.telefone && s.clienteTelefone.replace(/\D/g, "") === cliente.telefone.replace(/\D/g, ""))
  );
  const [editing, setEditing] = useState(false);
  const [patch, setPatch] = useState({ nome: "", email: "", telefone: "", cidade: "" });

  if (!cliente) return <Navigate to="/login" replace />;

  const favIds = favoritosDe(cliente.id);
  const gostouIds = gostouDe(cliente.id);
  const favProducts = products.filter((p) => favIds.includes(p.id));
  const gostouProducts = products.filter((p) => gostouIds.includes(p.id));

  const startEdit = () => {
    setPatch({ nome: cliente.nome, email: cliente.email, telefone: cliente.telefone ?? "", cidade: cliente.cidade ?? "" });
    setEditing(true);
  };
  const saveEdit = () => { updatePerfil(patch); setEditing(false); };

  const initials = cliente.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-plum-800 via-plum-700 to-plum-900 pt-28 pb-16">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-plum-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-plum-400 font-serif text-3xl font-semibold text-white shadow-xl ring-4 ring-white/10">
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Sua conta Odoyá</p>
                <h1 className="font-serif text-4xl font-semibold text-cream-50">{cliente.nome}</h1>
                <p className="text-sm text-cream-100/60">{cliente.email}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 rounded-full border border-gold-400/30 px-5 py-2.5 text-sm text-cream-50 transition hover:bg-white/10">
              <LogOut size={16} /> Sair
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-10 flex flex-wrap gap-2">
            <TabBtn active={tab === "fav"} onClick={() => setTab("fav")} icon={<Heart size={16} />}>
              Favoritos <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">{favProducts.length}</span>
            </TabBtn>
            <TabBtn active={tab === "gostou"} onClick={() => setTab("gostou")} icon={<ThumbsUp size={16} />}>
              Gostou <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">{gostouProducts.length}</span>
            </TabBtn>
            <TabBtn active={tab === "envios"} onClick={() => setTab("envios")} icon={<Truck size={16} />}>Envios</TabBtn>
            <TabBtn active={tab === "perfil"} onClick={() => setTab("perfil")} icon={<User size={16} />}>Meu Perfil</TabBtn>
          </div>
        </div>
      </section>

      <section className="bg-cream-50 py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {tab === "fav" && (
            <div className="reveal">
              {favProducts.length === 0 ? (
                <EmptyState icon={<Heart />} title="Nenhum favorito ainda" text="Explore nossos produtos e toque no coração para salvar aqui." cta={<Link to="/produtos" className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum-700 px-6 py-3 text-sm text-cream-50 hover:bg-plum-800"><ShoppingBag size={16} /> Ver produtos</Link>} />
              ) : (
                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {favProducts.map((p) => (
                    <div key={p.id} className="relative">
                      <ProductCard product={p} />
                      <button
                        onClick={() => toggleFavorito(cliente.id, p.id)}
                        className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition hover:scale-110"
                        title="Remover dos favoritos"
                      >
                        <Heart size={18} className="fill-rose-deep text-rose-deep" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "gostou" && (
            <div className="reveal">
              {gostouProducts.length === 0 ? (
                <EmptyState icon={<ThumbsUp />} title="Nenhum produto marcado como 'gostou'" text="Quando você curtir um produto, ele aparecerá aqui." cta={<Link to="/produtos" className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum-700 px-6 py-3 text-sm text-cream-50 hover:bg-plum-800"><Sparkles size={16} /> Explorar</Link>} />
              ) : (
                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {gostouProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          )}

          {tab === "envios" && (
            <div className="reveal mx-auto max-w-3xl">
              {meusEnvios.length === 0 ? (
                <EmptyState
                  icon={<Truck />}
                  title="Nenhum envio por aqui"
                  text="Quando você finalizar um pedido, seus envios aparecem aqui com o código de rastreio."
                  cta={
                    <Link
                      to="/rastreio"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum-700 px-6 py-3 text-sm text-cream-50 hover:bg-plum-800"
                    >
                      <Truck size={16} /> Rastrear por código
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {meusEnvios.map((s) => (
                    <div key={s.id} className="rounded-3xl border border-plum-100 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                            {s.destinoCidade}{s.destinoEstado ? ` - ${s.destinoEstado}` : ""}
                          </p>
                          <h4 className="font-serif text-xl font-semibold text-plum-800">{s.produto}</h4>
                          <p className="mt-1 flex items-center gap-1 font-mono text-xs text-plum-900/60">
                            <PackageIcon size={12} /> {s.trackingCode}
                          </p>
                        </div>
                        <span className="rounded-full bg-plum-100 px-3 py-1.5 text-xs font-semibold text-plum-700">
                          {s.status === "aguardando" && "Aguardando envio"}
                          {s.status === "postado" && "Postado"}
                          {s.status === "em_transito" && "Em trânsito"}
                          {s.status === "entregue" && "Entregue"}
                          {s.status === "problema" && "Ocorrência"}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          to={`/rastreio?code=${encodeURIComponent(s.trackingCode)}`}
                          className="flex items-center gap-1.5 rounded-full bg-plum-700 px-4 py-2 text-xs font-semibold text-cream-50 hover:bg-plum-800"
                        >
                          <Truck size={13} /> Ver detalhes do envio
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "perfil" && (
            <div className="reveal mx-auto max-w-2xl rounded-3xl border border-plum-100 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-semibold text-plum-800">Meu Perfil</h3>
                {!editing && (
                  <button onClick={startEdit} className="rounded-full border border-plum-200 px-4 py-2 text-sm text-plum-700 hover:bg-plum-50">Editar</button>
                )}
              </div>

              {editing ? (
                <div className="mt-6 space-y-4">
                  <PF label="Nome" icon={<User size={14} />} value={patch.nome} onChange={(v) => setPatch({ ...patch, nome: v })} />
                  <PF label="E-mail" icon={<Mail size={14} />} type="email" value={patch.email} onChange={(v) => setPatch({ ...patch, email: v })} />
                  <PF label="Telefone" icon={<Phone size={14} />} value={patch.telefone} onChange={(v) => setPatch({ ...patch, telefone: v })} />
                  <PF label="Cidade" icon={<MapPin size={14} />} value={patch.cidade} onChange={(v) => setPatch({ ...patch, cidade: v })} />
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setEditing(false)} className="rounded-full border border-plum-200 px-5 py-2.5 text-sm text-plum-700 hover:bg-plum-50">Cancelar</button>
                    <button onClick={saveEdit} className="flex items-center gap-2 rounded-full bg-plum-700 px-5 py-2.5 text-sm text-cream-50 hover:bg-plum-800"><Save size={16} /> Salvar</button>
                  </div>
                </div>
              ) : (
                <dl className="mt-6 space-y-4">
                  <InfoRow icon={<User size={16} />} label="Nome" value={cliente.nome} />
                  <InfoRow icon={<Mail size={16} />} label="E-mail" value={cliente.email} />
                  <InfoRow icon={<Phone size={16} />} label="Telefone" value={cliente.telefone || "—"} />
                  <InfoRow icon={<MapPin size={16} />} label="Cidade" value={cliente.cidade || "—"} />
                  <InfoRow icon={<Sparkles size={16} />} label="Cliente desde" value={new Date(cliente.criadoEm).toLocaleDateString("pt-BR")} />
                </dl>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
        active ? "bg-cream-50 text-plum-800 shadow-lg" : "text-cream-50/80 hover:bg-white/10"
      }`}
    >
      {icon} {children}
    </button>
  );
}

function EmptyState({ icon, title, text, cta }: { icon: React.ReactNode; title: string; text: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-plum-200 bg-white py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-plum-100 text-plum-500">{icon}</div>
      <p className="mt-4 font-serif text-2xl text-plum-800">{title}</p>
      <p className="mt-2 text-sm text-plum-900/55">{text}</p>
      {cta}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-cream-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-plum-100 text-plum-700">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-plum-500">{label}</p>
        <p className="text-sm font-medium text-plum-800">{value}</p>
      </div>
    </div>
  );
}

function PF({ label, icon, value, onChange, type = "text" }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-plum-700">{icon} {label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-plum-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-plum-400 focus:ring-2 focus:ring-plum-200" />
    </div>
  );
}
