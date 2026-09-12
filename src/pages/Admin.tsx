import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock, Plus, Pencil, Trash2, Save, X, RotateCcw,
  Package, Users as UsersIcon, Wallet, TrendingUp,
  ChevronRight, Mail, Phone, MapPin, Heart, ThumbsUp,
  CheckCircle2, Clock, Truck, XCircle, Calendar,
  Search, Copy, Package2, AlertTriangle, PlusCircle, MinusCircle,
  MessageCircle, Eye, EyeOff, Leaf, Sparkles, Moon,
  ArrowLeft, ArrowRight, Download, RefreshCw, ShieldCheck,
  ArrowUp, ArrowDown, Send, ShoppingBag, Zap,
  DollarSign, Star as StarIcon, Target, Upload, CheckSquare, Square,
  History as HistoryIcon,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useAuth } from "../store/useAuth";
import { useInteractions } from "../store/useInteractions";
import { useActivity, timeAgo, activityMeta } from "../store/useActivityLog";
import { useFinance, type Venda, type Despesa, type DespesaCategoria, DESPESA_CATEGORIAS } from "../store/useFinance";
import { useShipping, trackingMessage, type Shipment, type ShipmentStatus } from "../store/useShipping";
import { useSettings, type PaymentMethod } from "../store/useSettings";
import { useWholesale } from "../store/useWholesale";
import { useOffers } from "../store/useOffers";
import type { Product } from "../data/products";
import ImageUploader from "../components/ImageUploader";
import DonutChart from "../components/DonutChart";
import AdminShell from "../components/admin/AdminShell";
import AdminStat from "../components/admin/AdminStat";
import AdminCard from "../components/admin/AdminCard";
import AdminBadge from "../components/admin/AdminBadge";
import BarChartPro from "../components/admin/BarChartPro";
import Heatmap from "../components/admin/Heatmap";
import { useToast } from "../components/admin/Toast";
import WholesaleTab from "../components/admin/WholesaleTab";
import OffersTab from "../components/admin/OffersTab";

import { ADMIN_EMAIL, ADMIN_PASS } from "../config/admin";
import { checkRateLimit, recordSuccess, sanitize } from "../utils/security";

const ADMIN_KEY = "odoya_admin_auth_v2";
const RATE_KEY = "admin_login";

type Tab = "dash" | "prod" | "cat" | "users" | "fin" | "ship" | "pay" | "cfg" | "b2b" | "offers";

const EMPTY_PROD: Product = {
  id: "", name: "", category: "Incensos Artesanais", short: "", description: "",
  benefits: [], usage: "", weight: "Pacote com 5 varetas", available: true,
  price: 18, costPrice: 0, stock: 20, minStock: 5,
  color: "#7f4d9c", emoji: "🕯️", image: "",
};

const EMPTY_VENDA: Omit<Venda, "id"> = {
  clienteNome: "", clienteEmail: "", produto: "", quantidade: 1, valor: 0,
  status: "pendente", pagamento: "pix", data: new Date().toISOString(), observacoes: "",
};

const EMPTY_DESPESA: Omit<Despesa, "id"> = {
  descricao: "", categoria: "Insumos e matéria-prima", valor: 0,
  data: new Date().toISOString(), fornecedor: "", pagamento: "pix", recorrente: false, observacoes: "",
};

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const inputCls = "w-full rounded-xl border border-plum-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-plum-400 focus:ring-2 focus:ring-plum-200";
const PAY_LABELS: Record<string, string> = { pix: "PIX", boleto: "Boleto", dinheiro: "Dinheiro", cartao: "Cartão", outro: "Outro" };
const PAY_COLORS: Record<string, string> = { pix: "#653b80", boleto: "#a67f27", dinheiro: "#566e3d", cartao: "#7a2436", outro: "#7f4d9c" };

export default function Admin() {
  const store = useStore();
  const auth = useAuth();
  const inter = useInteractions();
  const fin = useFinance();
  const shipping = useShipping();
  const settings = useSettings();
  const wholesale = useWholesale();
  const offers = useOffers();

  const activity = useActivity();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_KEY) === "1");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  // Timer decrescente ao vivo quando o login está bloqueado
  useEffect(() => {
    if (!lockUntil) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setLockUntil(null);
        setLoginErr("");
      } else {
        setLoginErr(`Bloqueio temporário. Tente novamente em ${left}s.`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  const [tab, setTab] = useState<Tab>("dash");
  const toast = useToast();

  const [editing, setEditing] = useState<Product | null>(null);
  const [benefitsText, setBenefitsText] = useState("");
  const [newCat, setNewCat] = useState("");

  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [newVenda, setNewVenda] = useState<Omit<Venda, "id"> | null>(null);

  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [newDespesa, setNewDespesa] = useState<Omit<Despesa, "id"> | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out" | "ok">("all");
  const [prodSearch, setProdSearch] = useState("");
  const [finSearch, setFinSearch] = useState("");
  const [finStatusFilter, setFinStatusFilter] = useState<Venda["status"] | "todos">("todos");
  const [finPeriod, setFinPeriod] = useState<"7d" | "30d" | "90d" | "todos">("todos");
  const [finView, setFinView] = useState<"vendas" | "despesas">("vendas");
  const [despesaSearch, setDespesaSearch] = useState("");
  const [despesaCategoriaFilter, setDespesaCategoriaFilter] = useState<DespesaCategoria | "todas">("todas");

  const startNewProd = () => { setEditing({ ...EMPTY_PROD }); setBenefitsText(""); };
  const startEditProd = (p: Product) => { setEditing({ ...p }); setBenefitsText(p.benefits.join(", ")); };
  const saveProd = () => {
    if (!editing) return;
    const benefits = benefitsText.split(",").map((b) => b.trim()).filter(Boolean);
    const prepared: Product = { ...editing, benefits, id: editing.id || slug(editing.name) || `prod-${Date.now()}`, available: editing.stock > 0 ? editing.available : false };
    const isNew = !store.products.some((p) => p.id === prepared.id);
    isNew ? store.addProduct(prepared) : store.updateProduct(prepared);
    toast.success(isNew ? "Produto criado" : "Produto atualizado", prepared.name);
    setEditing(null);
  };

  const quickStock = (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    store.updateProduct({ ...p, stock: newStock, available: newStock > 0 });
  };
  const toggleAvailable = (p: Product) => {
    store.updateProduct({ ...p, available: !p.available });
    toast.info(!p.available ? "Produto disponível novamente" : "Produto marcado como esgotado", p.name);
  };
  const duplicateProd = (p: Product) => {
    const copy: Product = { ...p, id: `${p.id}-copy-${Date.now().toString(36).slice(-4)}`, name: `${p.name} (cópia)`, stock: 0, available: false };
    store.addProduct(copy);
    toast.success("Produto duplicado", "Edite os detalhes antes de ativar.");
  };

  const filteredProducts = store.products.filter((p) => {
    if (prodSearch && !p.name.toLowerCase().includes(prodSearch.toLowerCase())) return false;
    if (stockFilter === "low") return p.stock > 0 && p.stock <= p.minStock;
    if (stockFilter === "out") return p.stock === 0;
    if (stockFilter === "ok") return p.stock > p.minStock;
    return true;
  });

  const lowStockCount = store.products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outStockCount = store.products.filter((p) => p.stock === 0).length;
  const totalStockValue = store.products.reduce((s, p) => s + p.stock * p.price, 0);

  const saveVenda = () => {
    if (!editingVenda) return;
    fin.updateVenda(editingVenda);
    toast.success("Venda atualizada", `${editingVenda.clienteNome} · ${brl(editingVenda.valor)}`);
    setEditingVenda(null);
  };
  const addVenda = () => {
    if (!newVenda || !newVenda.clienteNome || !newVenda.produto || newVenda.valor <= 0) return;
    fin.addVenda(newVenda);
    toast.success("Venda registrada", `${newVenda.clienteNome} · ${brl(newVenda.valor)}`);
    setNewVenda(null);
  };

  const saveDespesa = () => {
    if (!editingDespesa) return;
    fin.updateDespesa(editingDespesa);
    toast.success("Despesa atualizada", `${editingDespesa.descricao} · ${brl(editingDespesa.valor)}`);
    setEditingDespesa(null);
  };
  const addDespesa = () => {
    if (!newDespesa || !newDespesa.descricao || newDespesa.valor <= 0) return;
    fin.addDespesa(newDespesa);
    toast.success("Despesa registrada", `${newDespesa.descricao} · ${brl(newDespesa.valor)}`);
    setNewDespesa(null);
  };

  const metrics = useMemo(() => {
    let list = fin.vendas;
    const now = new Date();
    if (finPeriod === "7d") list = list.filter((v) => new Date(v.data) > new Date(now.getTime() - 7 * 86400000));
    if (finPeriod === "30d") list = list.filter((v) => new Date(v.data) > new Date(now.getTime() - 30 * 86400000));
    if (finPeriod === "90d") list = list.filter((v) => new Date(v.data) > new Date(now.getTime() - 90 * 86400000));

    if (finStatusFilter !== "todos") list = list.filter((v) => v.status === finStatusFilter);
    if (finSearch.trim()) {
      const q = finSearch.toLowerCase();
      list = list.filter((v) => v.clienteNome.toLowerCase().includes(q) || v.produto.toLowerCase().includes(q) || (v.clienteEmail?.toLowerCase() || "").includes(q));
    }

    const total = list.reduce((s, v) => s + v.valor, 0);
    const concluidas = list.filter((v) => v.status === "concluido" || v.status === "enviado" || v.status === "aprovado");
    const receitaConcluida = concluidas.reduce((s, v) => s + v.valor, 0);
    const pendentes = list.filter((v) => v.status === "pendente");
    const ticket = concluidas.length ? receitaConcluida / concluidas.length : 0;

    const months: { key: string; label: string; value: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      const vs = list.filter((v) => v.data.slice(0, 7) === key && v.status !== "cancelado");
      months.push({ label, key, value: vs.reduce((s, v) => s + v.valor, 0), count: vs.length });
    }
    const maxMonth = Math.max(1, ...months.map((m) => m.value));

    const pay: Record<string, number> = {};
    list.forEach((v) => { pay[v.pagamento] = (pay[v.pagamento] || 0) + v.valor; });

    const prodMap: Record<string, { count: number; value: number }> = {};
    list.filter((v) => v.status !== "cancelado").forEach((v) => {
      if (!prodMap[v.produto]) prodMap[v.produto] = { count: 0, value: 0 };
      prodMap[v.produto].count++;
      prodMap[v.produto].value += v.valor;
    });
    const topProd = Object.entries(prodMap).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

    const statusCounts: Record<string, number> = {};
    list.forEach((v) => { statusCounts[v.status] = (statusCounts[v.status] || 0) + 1; });

    return { total, receitaConcluida, ticket, pendentes: pendentes.length, months, maxMonth, pay, topProd, statusCounts, list };
  }, [fin.vendas, finPeriod, finStatusFilter, finSearch]);

  // Lista de despesas filtrada (compartilha o período com a aba financeira)
  const despesasFiltradas = useMemo(() => {
    let list = fin.despesas;
    const now = new Date();
    if (finPeriod === "7d") list = list.filter((d) => new Date(d.data) > new Date(now.getTime() - 7 * 86400000));
    if (finPeriod === "30d") list = list.filter((d) => new Date(d.data) > new Date(now.getTime() - 30 * 86400000));
    if (finPeriod === "90d") list = list.filter((d) => new Date(d.data) > new Date(now.getTime() - 90 * 86400000));
    if (despesaCategoriaFilter !== "todas") list = list.filter((d) => d.categoria === despesaCategoriaFilter);
    if (despesaSearch.trim()) {
      const q = despesaSearch.toLowerCase();
      list = list.filter((d) => d.descricao.toLowerCase().includes(q) || (d.fornecedor?.toLowerCase() || "").includes(q) || d.categoria.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [fin.despesas, finPeriod, despesaCategoriaFilter, despesaSearch]);

  // Visão consolidada de lucro real: receita realizada (no período) − despesas (no período)
  const profitOverview = useMemo(() => {
    const now = new Date();
    let vendasPeriodo = fin.vendas;
    let despesasPeriodo = fin.despesas;
    if (finPeriod === "7d") {
      vendasPeriodo = vendasPeriodo.filter((v) => new Date(v.data) > new Date(now.getTime() - 7 * 86400000));
      despesasPeriodo = despesasPeriodo.filter((d) => new Date(d.data) > new Date(now.getTime() - 7 * 86400000));
    }
    if (finPeriod === "30d") {
      vendasPeriodo = vendasPeriodo.filter((v) => new Date(v.data) > new Date(now.getTime() - 30 * 86400000));
      despesasPeriodo = despesasPeriodo.filter((d) => new Date(d.data) > new Date(now.getTime() - 30 * 86400000));
    }
    if (finPeriod === "90d") {
      vendasPeriodo = vendasPeriodo.filter((v) => new Date(v.data) > new Date(now.getTime() - 90 * 86400000));
      despesasPeriodo = despesasPeriodo.filter((d) => new Date(d.data) > new Date(now.getTime() - 90 * 86400000));
    }

    const vendasRealizadas = vendasPeriodo
      .filter((v) => v.status === "concluido" || v.status === "enviado" || v.status === "aprovado");
    const receitaBruta = vendasRealizadas.reduce((s, v) => s + v.valor, 0);
    // Custo da mercadoria vendida: usa o custo unitário cadastrado no produto × quantidade da venda.
    const custoProdutosVendidos = vendasRealizadas.reduce((s, v) => {
      const produto = store.products.find((p) => p.name === v.produto);
      return s + (produto?.costPrice ?? 0) * (v.quantidade ?? 1);
    }, 0);
    const despesasOperacionais = despesasPeriodo.reduce((s, d) => s + d.valor, 0);
    const despesasTotal = despesasOperacionais + custoProdutosVendidos;
    const lucroBruto = receitaBruta - custoProdutosVendidos;
    const lucroLiquido = receitaBruta - despesasTotal;
    const margem = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

    const porCategoria: Record<string, number> = {};
    despesasPeriodo.forEach((d) => { porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.valor; });

    const produtosSemCusto = new Set(vendasRealizadas
      .filter((v) => {
        const produto = store.products.find((p) => p.name === v.produto);
        return !produto || !produto.costPrice;
      })
      .map((v) => v.produto));

    return { receitaBruta, custoProdutosVendidos, despesasOperacionais, despesasTotal, lucroBruto, lucroLiquido, margem, porCategoria, despesasCount: despesasPeriodo.length, produtosSemCusto: Array.from(produtosSemCusto) };
  }, [fin.vendas, fin.despesas, finPeriod, store.products]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = checkRateLimit(RATE_KEY, { maxAttempts: 5, windowMs: 60_000, lockMs: 120_000 });
    if (!rate.allowed) {
      setLockUntil(Date.now() + rate.retryInSec * 1000);
      setAttemptsLeft(0);
      return;
    }
    const safeEmail = sanitize(email).toLowerCase();
    const safePass = pass.trim();
    if (safeEmail === ADMIN_EMAIL.toLowerCase() && safePass === ADMIN_PASS) {
      sessionStorage.setItem(ADMIN_KEY, "1");
      recordSuccess(RATE_KEY);
      activity.log("login", "Acesso ao painel", `IP local · ${new Date().toLocaleString("pt-BR")}`);
      toast.success("Acesso liberado", "Painel administrativo carregado.");
      setAuthed(true);
      setLoginErr("");
      setLockUntil(null);
      setAttemptsLeft(null);
      setEmail("");
      setPass("");
    } else {
      // Tenta adivinhar quantas tentativas restam pela contagem do rate limiter
      const probe = checkRateLimit(RATE_KEY, { maxAttempts: 5, windowMs: 60_000, lockMs: 120_000 });
      const left = probe.allowed ? 5 - 1 : 0;
      setAttemptsLeft(Math.max(0, left));
      setLoginErr(
        left > 0
          ? `E-mail ou senha incorretos. ${left} tentativa${left === 1 ? "" : "s"} restante${left === 1 ? "" : "s"}.`
          : "Muitas tentativas. Aguarde o bloqueio expirar."
      );
    }
  };
  const logout = () => {
    activity.log("logout", "Saída do painel");
    sessionStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-stretch overflow-hidden bg-[#1a0e2b]">
        {/* Painel esquerdo editorial */}
        <div className="relative hidden w-1/2 overflow-hidden lg:block">
          <img src="/images/hero-altar.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0e2b]/95 via-[#2a1740]/75 to-[#1a0e2b]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(197,160,89,0.22),transparent_55%)]" />

          <Leaf className="pointer-events-none absolute left-[10%] top-[20%] h-14 w-14 text-sage-400/30 animate-floaty" style={{ animationDuration: "7s" }} />
          <Sparkles className="pointer-events-none absolute right-[14%] top-[30%] h-6 w-6 text-gold-300/60 animate-floaty" style={{ animationDuration: "5s", animationDelay: "1s" }} />
          <Moon className="pointer-events-none absolute right-[22%] bottom-[20%] h-10 w-10 text-gold-300/40 animate-floaty" style={{ animationDuration: "9s" }} />

          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <Link to="/" className="flex items-center gap-3 text-cream-50">
              <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
                <span className="font-display text-2xl font-bold text-plum-950">O</span>
              </span>
              <div>
                <p className="font-display text-xl font-bold leading-none tracking-tight">Odoyá</p>
                <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold-300">Ervas de Aruanda</p>
              </div>
            </Link>

            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.35em] text-gold-300">Acesso restrito</p>
              <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] text-cream-50 xl:text-6xl">
                Acesse a<br /><span className="italic text-gold-300">central Odoyá.</span>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-cream-100/70">
                Seu ateliê em números. Cada venda, cada envio, cada interação com seus clientes — tudo em um só lugar, atualizado em tempo real.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-cream-100/10 pt-6">
                <div>
                  <p className="font-display text-2xl font-bold text-cream-50 tabular-nums">{store.products.length}</p>
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-cream-100/50">Produtos</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-cream-50 tabular-nums">{auth.clientes.length}</p>
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-cream-100/50">Clientes</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-cream-50 tabular-nums">{fin.vendas.length}</p>
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-cream-100/50">Vendas</p>
                </div>
              </div>
            </div>

            <p className="text-[0.65rem] text-cream-100/40">
              © {new Date().getFullYear()} Odoyá Ervas de Aruanda · Barretos, SP
            </p>
          </div>
        </div>

        {/* Painel direito — formulário */}
        <div className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.08),transparent_60%)]" />

          <div className="relative z-10 mx-auto w-full max-w-md">
            {/* Header mobile */}
            <Link to="/" className="mb-8 flex items-center gap-3 text-cream-50 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
                <span className="font-display text-xl font-bold text-plum-950">O</span>
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-none">Odoyá</p>
                <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-gold-300">Ervas de Aruanda</p>
              </div>
            </Link>

            <p className="text-[0.7rem] font-bold uppercase tracking-[0.35em] text-gold-300">Entrar no painel</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-cream-50 md:text-4xl">
              Acesse sua<br /><span className="italic text-gold-300">central de gestão.</span>
            </h2>
            <p className="mt-2 text-sm text-cream-100/60">Suas credenciais são pessoais e intransferíveis.</p>

            <form onSubmit={login} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream-100/70">
                  <Mail size={12} /> E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-cream-100/15 bg-cream-100/5 px-4 py-3 text-sm text-cream-50 outline-none transition placeholder:text-cream-100/40 focus:border-gold-400/60 focus:bg-cream-100/10"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream-100/70">
                  <Lock size={12} /> Senha
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-cream-100/15 bg-cream-100/5 px-4 py-3 pr-11 text-sm text-cream-50 outline-none transition placeholder:text-cream-100/40 focus:border-gold-400/60 focus:bg-cream-100/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-100/50 hover:text-gold-300"
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginErr && (
                <div className="rounded-xl border border-rose-deep/40 bg-rose-deep/15 px-4 py-3 text-sm text-rose-200">
                  <p className="font-semibold">{loginErr}</p>
                  {remaining > 0 && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-rose-deep/30">
                      <div
                        className="h-full rounded-full bg-rose-200 transition-[width] duration-1000 ease-linear"
                        style={{ width: `${Math.max(0, 100 - (remaining / 120) * 100)}%` }}
                      />
                    </div>
                  )}
                  {attemptsLeft !== null && attemptsLeft > 0 && (
                    <p className="mt-1 text-[0.7rem] text-rose-200/70">
                      {attemptsLeft} tentativa{attemptsLeft === 1 ? "" : "s"} restante{attemptsLeft === 1 ? "" : "s"} antes de bloqueio.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={remaining > 0 || !email.trim() || !pass}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3.5 text-sm font-bold text-plum-950 shadow-xl shadow-gold-500/20 transition-all hover:shadow-gold-500/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {remaining > 0 ? (
                  <>Bloqueado · {remaining}s</>
                ) : (
                  <>
                    Entrar no painel
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-cream-100/10 bg-cream-100/5 p-3 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-gold-300">
                <ShieldCheck size={11} /> Ambiente protegido
              </p>
              <p className="mt-1 text-[0.65rem] leading-relaxed text-cream-100/50">
                Rate limit ativo · 5 tentativas por minuto · bloqueio de 2 minutos.
              </p>
            </div>

            <Link to="/" className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-cream-100/60 transition hover:text-gold-300">
              <ArrowLeft size={12} /> Voltar ao site público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedUser = auth.clientes.find((c) => c.id === selectedUserId) ?? null;

  // Contador de alertas (envios aguardando, produtos em estoque baixo, vendas pendentes)
  const pendingShipments = shipping.shipments.filter((s) => s.status === "aguardando" || s.status === "postado").length;
  const lowStockAlerts = lowStockCount + outStockCount;
  const pendingSales = fin.vendas.filter((v) => v.status === "pendente").length;
  const newWholesale = wholesale.leads.filter((lead) => lead.status === "novo").length;
  const totalAlerts = pendingShipments + lowStockAlerts + pendingSales + newWholesale;

  const badges = {
    fin: fin.vendas.length,
    users: auth.clientes.length,
    prod: store.products.length,
    ship: shipping.shipments.length,
    pay: settings.paymentMethods.filter((p) => p.enabled).length,
    b2b: newWholesale,
    offers: offers.offers.filter((offer) => offer.enabled).length,
  };

  return (
    <AdminShell active={tab} onChange={setTab} onLogout={logout} badges={badges} alerts={totalAlerts}>
      {tab === "dash" && <DashboardTab metrics={metrics} fin={fin} auth={auth} inter={inter} store={store} lowStockCount={lowStockCount} outStockCount={outStockCount} pendingShipments={pendingShipments} pendingSales={pendingSales} totalAlerts={totalAlerts} profitOverview={profitOverview} />}
      {tab === "fin" && (
        <FinanceTab
          metrics={metrics}
          fin={fin}
          finPeriod={finPeriod}
          setFinPeriod={setFinPeriod}
          finStatusFilter={finStatusFilter}
          setFinStatusFilter={setFinStatusFilter}
          finSearch={finSearch}
          setFinSearch={setFinSearch}
          setEditingVenda={setEditingVenda}
          setNewVenda={setNewVenda}
          toast={toast}
          finView={finView}
          setFinView={setFinView}
          despesasFiltradas={despesasFiltradas}
          despesaSearch={despesaSearch}
          setDespesaSearch={setDespesaSearch}
          despesaCategoriaFilter={despesaCategoriaFilter}
          setDespesaCategoriaFilter={setDespesaCategoriaFilter}
          setEditingDespesa={setEditingDespesa}
          setNewDespesa={setNewDespesa}
          profitOverview={profitOverview}
        />
      )}
      {tab === "users" && <UsersTab auth={auth} inter={inter} store={store} selectedUser={selectedUser} setSelectedUserId={setSelectedUserId} />}
      {tab === "b2b" && <WholesaleTab />}
      {tab === "offers" && <OffersTab />}
      {tab === "prod" && <ProductsTab store={store} inter={inter} filteredProducts={filteredProducts} stockFilter={stockFilter} setStockFilter={setStockFilter} prodSearch={prodSearch} setProdSearch={setProdSearch} lowStockCount={lowStockCount} outStockCount={outStockCount} totalStockValue={totalStockValue} startNewProd={startNewProd} startEditProd={startEditProd} quickStock={quickStock} toggleAvailable={toggleAvailable} duplicateProd={duplicateProd} toast={toast} />}
      {tab === "cat" && <CategoriesTab store={store} newCat={newCat} setNewCat={setNewCat} toast={toast} />}
      {tab === "ship" && <ShippingTab shipping={shipping} />}
      {tab === "pay" && <PaymentsTab settings={settings} />}
      {tab === "cfg" && <ConfigTab settings={settings} />}

      {/* Product Modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title={store.products.some((p) => p.id === editing.id) ? "Editar produto" : "Novo produto"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" full><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
            <Field label="Categoria">
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                {store.categories.filter((c) => c !== "Todos").map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Frase curta"><input value={editing.short} onChange={(e) => setEditing({ ...editing, short: e.target.value })} className={inputCls} /></Field>
            <Field label="Descrição" full><textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field>
            <Field label="Benefícios (vírgula)" full><input value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} className={inputCls} /></Field>
            <Field label="Modo de uso" full><textarea rows={2} value={editing.usage} onChange={(e) => setEditing({ ...editing, usage: e.target.value })} className={inputCls} /></Field>
            <Field label="Peso"><input value={editing.weight} onChange={(e) => setEditing({ ...editing, weight: e.target.value })} className={inputCls} /></Field>
            <Field label="Preço (R$)"><input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className={inputCls} /></Field>
            <Field label="Custo unitário (R$)">
              <input type="number" min="0" step="0.01" value={editing.costPrice} onChange={(e) => setEditing({ ...editing, costPrice: Math.max(0, parseFloat(e.target.value) || 0) })} className={inputCls} />
              <p className="mt-1 text-[0.65rem] text-plum-500">Usado para calcular lucro bruto e líquido.</p>
            </Field>
            <Field label="Estoque atual">
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={editing.stock} onChange={(e) => { const s = Math.max(0, parseInt(e.target.value) || 0); setEditing({ ...editing, stock: s, available: s > 0 ? editing.available : false }); }} className={inputCls} />
                <button type="button" onClick={() => setEditing({ ...editing, stock: 0, available: false })} className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-deep hover:bg-rose-100">Esgotar</button>
              </div>
            </Field>
            <Field label="Estoque mínimo (alerta)"><input type="number" min="0" value={editing.minStock} onChange={(e) => setEditing({ ...editing, minStock: Math.max(0, parseInt(e.target.value) || 0) })} className={inputCls} /></Field>
            <Field label="Emoji (fallback)"><input value={editing.emoji} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} className={inputCls} /></Field>
            <Field label="Cor do tema"><input type="color" value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="h-11 w-full rounded-xl border border-plum-200" /></Field>
            <Field label="Foto do produto" full>
              <ImageUploader
                value={editing.image || ""}
                onChange={(v) => setEditing({ ...editing, image: v })}
                emojiFallback={editing.emoji}
                color={editing.color}
              />
            </Field>
            <div className="flex flex-col justify-center gap-2 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-plum-700"><input type="checkbox" checked={editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} /> Disponível para venda</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-plum-700"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Destaque na home</label>
                <label className="flex items-center gap-2 text-sm text-plum-700"><input type="checkbox" checked={!!editing.isNew} onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })} /> Marcar como novidade</label>
                <label className="flex items-center gap-2 text-sm text-plum-700"><input type="checkbox" checked={!!editing.bestSeller} onChange={(e) => setEditing({ ...editing, bestSeller: e.target.checked })} /> Selo de destaque comercial</label>
              </div>
            </div>
          </div>
          <ModalFooter onCancel={() => setEditing(null)} onSave={saveProd} disabled={!editing.name.trim()} />
        </Modal>
      )}

      {/* Venda Modal */}
      {(newVenda || editingVenda) && (
        <Modal onClose={() => { setNewVenda(null); setEditingVenda(null); }} title={editingVenda ? "Editar venda" : "Nova venda"}>
          <VendaForm
            value={editingVenda ? { clienteNome: editingVenda.clienteNome, clienteEmail: editingVenda.clienteEmail ?? "", produto: editingVenda.produto, quantidade: editingVenda.quantidade, valor: editingVenda.valor, status: editingVenda.status, pagamento: editingVenda.pagamento, data: editingVenda.data, observacoes: editingVenda.observacoes ?? "" } : newVenda!}
            onChange={(v) => editingVenda ? setEditingVenda({ ...editingVenda, ...v }) : setNewVenda(v)}
            produtos={store.products.map((p) => p.name)}
          />
          <ModalFooter
            onCancel={() => { setNewVenda(null); setEditingVenda(null); }}
            onSave={editingVenda ? saveVenda : addVenda}
            disabled={!((editingVenda ?? newVenda)?.clienteNome && (editingVenda ?? newVenda)?.produto)}
          />
        </Modal>
      )}

      {/* Despesa Modal */}
      {(newDespesa || editingDespesa) && (
        <Modal onClose={() => { setNewDespesa(null); setEditingDespesa(null); }} title={editingDespesa ? "Editar despesa" : "Nova despesa"} subtitle="Registre compras, insumos e custos para calcular o lucro real.">
          <DespesaForm
            value={editingDespesa ? { descricao: editingDespesa.descricao, categoria: editingDespesa.categoria, valor: editingDespesa.valor, data: editingDespesa.data, fornecedor: editingDespesa.fornecedor ?? "", pagamento: editingDespesa.pagamento, recorrente: !!editingDespesa.recorrente, observacoes: editingDespesa.observacoes ?? "" } : newDespesa!}
            onChange={(d) => editingDespesa ? setEditingDespesa({ ...editingDespesa, ...d }) : setNewDespesa(d)}
          />
          <ModalFooter
            onCancel={() => { setNewDespesa(null); setEditingDespesa(null); }}
            onSave={editingDespesa ? saveDespesa : addDespesa}
            disabled={!((editingDespesa ?? newDespesa)?.descricao && (editingDespesa ?? newDespesa)!.valor > 0)}
          />
        </Modal>
      )}
    </AdminShell>
  );
}

function DashboardTab({ metrics, fin, auth, inter, store, lowStockCount = 0, outStockCount = 0, pendingShipments = 0, pendingSales = 0, totalAlerts = 0, profitOverview }: any) {
  const { storeConfig } = useSettings();
  const { items: activityItems } = useActivity();
  const monthlyGoal = storeConfig.monthlyGoal || 0;
  // Receita aprovada só do mês corrente
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return fin.vendas
      .filter((v: Venda) => v.data.slice(0, 7) === key && (v.status === "concluido" || v.status === "enviado" || v.status === "aprovado"))
      .reduce((s: number, v: Venda) => s + v.valor, 0);
  }, [fin.vendas]);
  const monthlyProgress = monthlyGoal > 0 ? Math.min(100, (monthlyRevenue / monthlyGoal) * 100) : 0;
  const monthlyRemaining = Math.max(0, monthlyGoal - monthlyRevenue);
  const daysLeft = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
  }, []);
  const dailyNeeded = daysLeft > 0 ? monthlyRemaining / daysLeft : 0;

  const topRated = [...store.products].sort((a: Product, b: Product) => (inter.countGostou(b.id) + inter.countFavoritos(b.id)) - (inter.countGostou(a.id) + inter.countFavoritos(a.id))).slice(0, 5);
  const revenueSeries = metrics.months.map((m: any) => m.value);
  const ticketSeries = metrics.months.map((m: any) => (m.count ? m.value / m.count : 0));
  const vendasSeries = metrics.months.map((m: any) => m.count);
  const clientesSeries = metrics.months.map((_: any, i: number) => Math.min(auth.clientes.length, Math.round((auth.clientes.length / 6) * (i + 1))));

  // Variação vs mês anterior
  const delta = (series: number[]) => {
    if (series.length < 2) return undefined;
    const prev = series[series.length - 2] || 0;
    const curr = series[series.length - 1] || 0;
    if (prev === 0 && curr === 0) return undefined;
    if (prev === 0) return 100;
    return ((curr - prev) / prev) * 100;
  };

  // Heatmap data: vendas dos últimos ~84 dias
  const heatmapData = useMemo(() => {
    const byDay = new Map<string, number>();
    fin.vendas.forEach((v: Venda) => {
      const d = v.data.slice(0, 10);
      byDay.set(d, (byDay.get(d) || 0) + v.valor);
    });
    return Array.from(byDay.entries()).map(([date, value]) => ({ date, value }));
  }, [fin.vendas]);

  // Conversão (clientes/vendas) como KPI de engajamento
  const conversionRate = fin.vendas.length > 0 ? (metrics.statusCounts["concluido"] || 0) / fin.vendas.length * 100 : 0;
  const totalProdutos = store.products.length;
  const valorEmEstoque = store.products.reduce((s: number, p: Product) => s + p.stock * p.price, 0);

  const donutSlices = [
    { label: "Pendente", value: metrics.statusCounts["pendente"] || 0, color: "#c39a3a" },
    { label: "Aprovado", value: metrics.statusCounts["aprovado"] || 0, color: "#7f4d9c" },
    { label: "Enviado", value: metrics.statusCounts["enviado"] || 0, color: "#6e8a4f" },
    { label: "Concluído", value: metrics.statusCounts["concluido"] || 0, color: "#4c2a6b" },
    { label: "Cancelado", value: metrics.statusCounts["cancelado"] || 0, color: "#7a2436" },
  ].filter((s) => s.value > 0);
  const totalVendas = donutSlices.reduce((s, x) => s + x.value, 0);

  const barData = metrics.months.map((m: any) => ({ label: m.label, value: m.value }));
  const highlightIdx = barData.length - 1;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-plum-400">Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-plum-950 md:text-4xl">
            Olá, Jéssica. <span className="text-plum-500">Aqui está o seu dia.</span>
          </h1>
          <p className="mt-1 text-sm text-plum-600">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminBadge variant="success" dot>Dados em tempo real</AdminBadge>
          <AdminBadge variant="warning" dot>{totalAlerts} itens para revisar</AdminBadge>
        </div>
      </header>

      {/* Alertas críticos */}
      {totalAlerts > 0 && (
        <AdminCard variant="ink" padding="md" eyebrow="Central de ação" title="Atenção necessária" subtitle="Pendências que exigem sua intervenção nas próximas horas.">
          <div className="grid gap-3 md:grid-cols-3">
            {pendingSales > 0 && (
              <AlertTile icon={<Wallet size={16} />} label="Vendas pendentes" value={pendingSales} hint="Aguardando aprovação" tone="gold" />
            )}
            {pendingShipments > 0 && (
              <AlertTile icon={<Truck size={16} />} label="Envios em trânsito" value={pendingShipments} hint="Acompanhar no rastreio" tone="plum" />
            )}
            {(lowStockCount + outStockCount) > 0 && (
              <AlertTile icon={<Package size={16} />} label="Estoque crítico" value={lowStockCount + outStockCount} hint={`${outStockCount} esgotado · ${lowStockCount} baixo`} tone="rose" />
            )}
          </div>
        </AdminCard>
      )}

      {/* KPIs principais */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Receita aprovada"
          value={brl(metrics.receitaConcluida)}
          icon={<DollarSign size={16} />}
          delta={delta(revenueSeries)}
          spark={revenueSeries}
          accent="plum"
          hint="Somente vendas concluídas, enviadas ou aprovadas."
        />
        <AdminStat
          label="Ticket médio"
          value={brl(metrics.ticket)}
          icon={<TrendingUp size={16} />}
          delta={delta(ticketSeries)}
          spark={ticketSeries}
          accent="gold"
          hint="Receita média por venda no período."
        />
        <AdminStat
          label="Vendas"
          value={String(fin.vendas.length)}
          icon={<ShoppingBag size={16} />}
          delta={delta(vendasSeries)}
          spark={vendasSeries}
          accent="sage"
          hint="Total acumulado no período selecionado."
        />
        <AdminStat
          label="Clientes ativos"
          value={String(auth.clientes.length)}
          icon={<UsersIcon size={16} />}
          delta={delta(clientesSeries)}
          spark={clientesSeries}
          accent="ink"
          hint={`${conversionRate.toFixed(0)}% de taxa de conclusão.`}
        />
      </div>

      {/* Lucro real: receita − despesas */}
      <AdminCard
        eyebrow="Resultado financeiro"
        title="Lucro real do período"
        subtitle="Receita realizada menos tudo o que foi comprado e gasto no negócio."
        action={<AdminBadge variant={profitOverview.lucroLiquido >= 0 ? "success" : "danger"}>{profitOverview.margem.toFixed(1)}% de margem</AdminBadge>}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-plum-100 bg-cream-50/60 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-plum-500">Receita realizada</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-plum-950">{brl(profitOverview.receitaBruta)}</p>
            <p className="mt-1 text-[0.7rem] text-plum-500">Vendas aprovadas, enviadas ou concluídas</p>
          </div>
          <div className="rounded-xl border border-gold-300/40 bg-gold-300/10 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gold-700">Custo dos produtos vendidos</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-gold-700">− {brl(profitOverview.custoProdutosVendidos)}</p>
            <p className="mt-1 text-[0.7rem] text-gold-700/70">Baseado no custo unitário cadastrado</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-rose-deep">Despesas operacionais</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-rose-deep">− {brl(profitOverview.despesasOperacionais)}</p>
            <p className="mt-1 text-[0.7rem] text-rose-deep/70">{profitOverview.despesasCount} compra(s) e gasto(s) no período</p>
          </div>
          <div className={`rounded-xl border p-4 ${profitOverview.lucroLiquido >= 0 ? "border-sage-400/40 bg-sage-400/10" : "border-rose-300 bg-rose-50"}`}>
            <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${profitOverview.lucroLiquido >= 0 ? "text-sage-700" : "text-rose-deep"}`}>Lucro líquido</p>
            <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${profitOverview.lucroLiquido >= 0 ? "text-sage-700" : "text-rose-deep"}`}>{brl(profitOverview.lucroLiquido)}</p>
            <p className="mt-1 text-[0.7rem] text-plum-500">Margem de {profitOverview.margem.toFixed(1)}% sobre a receita</p>
          </div>
        </div>
        {profitOverview.produtosSemCusto.length > 0 && (
          <div className="mt-4 rounded-xl border border-gold-300/40 bg-gold-300/10 p-3 text-xs text-plum-800">
            <p className="flex items-center gap-1.5 font-bold text-gold-700"><AlertTriangle size={12} /> Custo unitário pendente</p>
            <p className="mt-1 text-plum-700/80">Cadastre o custo de produção destes produtos para obter um lucro exato: <strong>{profitOverview.produtosSemCusto.join(", ")}</strong>.</p>
          </div>
        )}
        {Object.keys(profitOverview.porCategoria).length > 0 && (
          <div className="mt-4 border-t border-plum-100 pt-4">
            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-plum-500">Despesas por categoria</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profitOverview.porCategoria).sort((a: any, b: any) => b[1] - a[1]).map(([cat, val]: any) => (
                <span key={cat} className="rounded-full bg-plum-50 px-3 py-1 text-xs font-medium text-plum-700">{cat}: <strong>{brl(val)}</strong></span>
              ))}
            </div>
          </div>
        )}
      </AdminCard>

      {/* Meta mensal + Atividade recente */}
      <div className="grid gap-4 xl:grid-cols-3">
        <AdminCard
          className="xl:col-span-2"
          eyebrow="Objetivo do mês"
          title={`Meta de ${brl(monthlyGoal)}`}
          subtitle={`${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} · ${daysLeft} dia${daysLeft === 1 ? "" : "s"} restante${daysLeft === 1 ? "" : "s"}`}
          action={
            monthlyProgress >= 100
              ? <AdminBadge variant="success" icon={<CheckCircle2 size={10} />}>Meta batida 🎉</AdminBadge>
              : <AdminBadge variant={monthlyProgress >= 60 ? "gold" : "warning"}>{monthlyProgress.toFixed(0)}% concluído</AdminBadge>
          }
        >
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-display text-4xl font-bold tabular-nums text-plum-950 md:text-5xl">{brl(monthlyRevenue)}</p>
              <p className="mt-1 text-xs text-plum-500">
                {monthlyRemaining > 0 ? (
                  <>Faltam <strong className="text-plum-900">{brl(monthlyRemaining)}</strong> · ~{brl(dailyNeeded)}/dia</>
                ) : (
                  <span className="font-bold text-sage-700">Superou em {brl(monthlyRevenue - monthlyGoal)} ✦</span>
                )}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-3xl font-bold tabular-nums text-gold-600">{monthlyProgress.toFixed(0)}<span className="text-xl">%</span></p>
              <p className="text-[0.65rem] uppercase tracking-wider text-plum-500">progresso</p>
            </div>
          </div>

          {/* Barra de progresso dupla (atingido + projeção) */}
          <div className="mt-5">
            <div className="relative h-3 overflow-hidden rounded-full bg-plum-50">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                  monthlyProgress >= 100
                    ? "bg-gradient-to-r from-sage-500 to-sage-400"
                    : "bg-gradient-to-r from-plum-700 via-gold-500 to-gold-400"
                }`}
                style={{ width: `${monthlyProgress}%` }}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.15)_6px,rgba(255,255,255,0.15)_12px)]" style={{ width: `${monthlyProgress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[0.65rem] font-semibold uppercase tracking-wider text-plum-500">
              <span>R$ 0</span>
              <span className="flex items-center gap-1"><Target size={10} /> Meta {brl(monthlyGoal)}</span>
            </div>
          </div>

          {/* Mini projeção de 7 dias */}
          <div className="mt-5 grid grid-cols-7 gap-1.5 border-t border-plum-100 pt-4">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const key = d.toISOString().slice(0, 10);
              const dayVal = fin.vendas
                .filter((v: Venda) => v.data.slice(0, 10) === key && (v.status === "concluido" || v.status === "enviado" || v.status === "aprovado"))
                .reduce((s: number, v: Venda) => s + v.valor, 0);
              const pct = monthlyGoal > 0 ? Math.min(100, (dayVal / (monthlyGoal / 30)) * 100) : 0;
              const isToday = i === 6;
              return (
                <div key={i} className="text-center">
                  <div className={`relative mx-auto h-14 w-full overflow-hidden rounded-md ${isToday ? "ring-2 ring-gold-400/60" : ""}`} style={{ background: "rgba(127,77,156,0.08)" }}>
                    <div
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-700 to-gold-400 transition-all duration-500"
                      style={{ height: `${pct}%` }}
                    />
                    {dayVal > 0 && (
                      <span className="absolute inset-x-0 top-0.5 text-[0.55rem] font-bold tabular-nums text-plum-900">
                        {dayVal >= 1000 ? `${(dayVal/1000).toFixed(1)}k` : dayVal.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-[0.55rem] font-bold uppercase tracking-wider ${isToday ? "text-gold-700" : "text-plum-500"}`}>
                    {d.toLocaleDateString("pt-BR", { weekday: "narrow" })}
                  </p>
                </div>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard eyebrow="Pulso" title="Atividade recente" subtitle="Últimas ações registradas">
          {activityItems.length === 0 ? (
            <div className="py-8 text-center">
              <HistoryIcon size={22} className="mx-auto text-plum-300" />
              <p className="mt-2 text-sm text-plum-500">Nenhuma ação ainda.</p>
              <p className="text-[0.7rem] text-plum-400">Ações ficam registradas aqui automaticamente.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {activityItems.slice(0, 6).map((a) => {
                const m = activityMeta(a.kind);
                return (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-plum-50 text-sm">{m.glyph}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-tight text-plum-900">{a.title}</p>
                      {a.detail && <p className="truncate text-[0.7rem] text-plum-500">{a.detail}</p>}
                      <p className="mt-0.5 text-[0.6rem] text-plum-400">{timeAgo(a.ts)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>
      </div>

      {/* Gráficos principais */}
      <div className="grid gap-4 xl:grid-cols-3">
        <AdminCard
          className="xl:col-span-2"
          eyebrow="Performance"
          title="Receita dos últimos 6 meses"
          subtitle="Exclui cancelados · valores em BRL"
          action={<AdminBadge variant="info" icon={<Calendar size={10} />}>Últimos 6 meses</AdminBadge>}
        >
          <BarChartPro data={barData} height={260} highlightIndex={highlightIdx} />
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-plum-100 pt-4 text-xs">
            <div>
              <p className="text-plum-500">Maior mês</p>
              <p className="mt-0.5 font-display text-base font-bold text-plum-950">{brl(metrics.maxMonth)}</p>
            </div>
            <div>
              <p className="text-plum-500">Média mensal</p>
              <p className="mt-0.5 font-display text-base font-bold text-plum-950">{brl(metrics.receitaConcluida / Math.max(1, metrics.months.filter((m: any) => m.value > 0).length))}</p>
            </div>
            <div>
              <p className="text-plum-500">Total do período</p>
              <p className="mt-0.5 font-display text-base font-bold text-plum-950">{brl(metrics.receitaConcluida)}</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard eyebrow="Mix" title="Por forma de pagamento" subtitle="Participação nas vendas">
          <div className="space-y-3">
            {Object.entries(metrics.pay).length === 0 && (
              <p className="py-8 text-center text-sm text-plum-500">Sem dados no período.</p>
            )}
            {Object.entries(metrics.pay).sort((a: any, b: any) => b[1] - a[1]).map(([k, v]: any) => {
              const pct = metrics.total ? (v / metrics.total) * 100 : 0;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-plum-800">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PAY_COLORS[k] }} />
                      {PAY_LABELS[k] || k}
                    </span>
                    <span className="tabular-nums font-bold text-plum-950">{brl(v)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-plum-50">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: PAY_COLORS[k] }} />
                    </div>
                    <span className="w-10 text-right text-[0.65rem] font-bold tabular-nums text-plum-500">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      </div>

      {/* Heatmap + Ranking */}
      <div className="grid gap-4 xl:grid-cols-3">
        <AdminCard className="xl:col-span-2" eyebrow="Atividade" title="Mapa de calor — vendas diárias" subtitle="Últimas 12 semanas · intensidade = receita no dia">
          {heatmapData.length === 0 ? (
            <p className="py-8 text-center text-sm text-plum-500">Registre vendas para visualizar o padrão.</p>
          ) : (
            <Heatmap data={heatmapData} cols={12} />
          )}
        </AdminCard>

        <AdminCard eyebrow="Catálogo" title="Saúde do estoque" subtitle={`${totalProdutos} produtos · ${brl(valorEmEstoque)} em estoque`}>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Ativos" value={totalProdutos - outStockCount} accent="sage" />
            <MiniStat label="Esgotados" value={outStockCount} accent="rose" />
            <MiniStat label="Estoque baixo" value={lowStockCount} accent="gold" />
            <MiniStat label="Em dia" value={totalProdutos - outStockCount - lowStockCount} accent="plum" />
          </div>
          <div className="mt-4 rounded-xl border border-gold-300/30 bg-gold-300/10 p-3 text-xs text-plum-800">
            <p className="flex items-center gap-1.5 font-bold text-gold-700"><Zap size={12} /> Dica de gestão</p>
            <p className="mt-1 text-plum-700/80">Reabasteça produtos com estoque baixo antes que esgotem para evitar perda de vendas.</p>
          </div>
        </AdminCard>
      </div>

      {/* Top produtos + Ranking */}
      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard eyebrow="Ranking" title="Mais vendidos" subtitle="Top 5 por quantidade no período">
          {metrics.topProd.length === 0 ? (
            <p className="py-8 text-center text-sm text-plum-500">Sem vendas registradas ainda.</p>
          ) : (
            <ol className="space-y-2">
              {metrics.topProd.map(([name, d]: any, i: number) => (
                <li key={name} className="flex items-center gap-3 rounded-xl border border-plum-50 bg-cream-50/50 px-3 py-2.5">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${i === 0 ? "bg-gold-400 text-plum-950" : i === 1 ? "bg-plum-100 text-plum-700" : "bg-plum-50 text-plum-500"}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-plum-900">{name}</p>
                    <p className="text-[0.7rem] text-plum-500">{d.count} venda{d.count === 1 ? "" : "s"}</p>
                  </div>
                  <p className="font-display text-sm font-bold tabular-nums text-plum-950">{brl(d.value)}</p>
                </li>
              ))}
            </ol>
          )}
        </AdminCard>

        <AdminCard eyebrow="Engajamento" title="Mais curtidos e favoritados" subtitle="Baseado nas interações dos clientes">
          {topRated.length === 0 ? (
            <p className="py-8 text-center text-sm text-plum-500">Sem interações registradas.</p>
          ) : (
            <ol className="space-y-2">
              {topRated.map((p: Product, i: number) => {
                const fav = inter.countFavoritos(p.id);
                const like = inter.countGostou(p.id);
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl border border-plum-50 bg-cream-50/50 px-3 py-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${i === 0 ? "bg-gold-400 text-plum-950" : "bg-plum-50 text-plum-500"}`}>
                      {i + 1}
                    </span>
                    {p.image ? (
                      <img src={p.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-plum-50 text-base">{p.emoji}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-plum-900">{p.name.replace(/^Incenso\s/, "")}</p>
                      <p className="text-[0.7rem] text-plum-500">{p.category}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[0.7rem] font-bold">
                      <span className="flex items-center gap-1 text-rose-deep"><Heart size={11} className="fill-rose-deep" />{fav}</span>
                      <span className="flex items-center gap-1 text-gold-700"><StarIcon size={11} className="fill-gold-500" />{like}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </AdminCard>
      </div>

      {/* Donut Status */}
      <AdminCard eyebrow="Fluxo" title="Status das vendas" subtitle="Distribuição por etapa" action={<AdminBadge variant="info">{totalVendas} total</AdminBadge>}>
        {totalVendas === 0 ? (
          <p className="py-10 text-center text-sm text-plum-500">Nenhuma venda registrada ainda.</p>
        ) : (
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
            <DonutChart slices={donutSlices} size={200} thickness={28} centerValue={String(totalVendas)} centerLabel="vendas" />
            <ul className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              {donutSlices.map((s) => {
                const pct = totalVendas ? (s.value / totalVendas) * 100 : 0;
                return (
                  <li key={s.label} className="flex items-center gap-3 rounded-xl border border-plum-50 bg-cream-50/50 px-3 py-2.5">
                    <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 text-sm font-semibold text-plum-800">{s.label}</span>
                    <span className="tabular-nums text-xs text-plum-500">{pct.toFixed(0)}%</span>
                    <span className="tabular-nums font-display text-sm font-bold text-plum-950">{s.value}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function AlertTile({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: number; hint: string; tone: "gold" | "plum" | "rose" }) {
  const tones = {
    gold: "bg-gold-400/15 text-gold-200 ring-gold-400/40",
    plum: "bg-plum-700/30 text-plum-100 ring-plum-500/30",
    rose: "bg-rose-deep/20 text-rose-100 ring-rose-deep/40",
  } as const;
  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 ring-1 ring-inset ${tones[tone]}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">{icon}</span>
      <div className="min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider opacity-80">{label}</p>
        <p className="font-display text-2xl font-bold leading-none tabular-nums">{value}</p>
        <p className="mt-1 text-[0.7rem] opacity-70">{hint}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent: "plum" | "gold" | "sage" | "rose" }) {
  const colors = {
    plum: "text-plum-700 bg-plum-50",
    gold: "text-gold-700 bg-gold-300/20",
    sage: "text-sage-700 bg-sage-400/20",
    rose: "text-rose-deep bg-rose-deep/10",
  } as const;
  return (
    <div className={`rounded-xl p-3 ${colors[accent]}`}>
      <p className="text-[0.6rem] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold leading-none tabular-nums">{value}</p>
    </div>
  );
}

function FinanceTab({
  metrics, fin, finPeriod, setFinPeriod, finStatusFilter, setFinStatusFilter, finSearch, setFinSearch,
  setEditingVenda, setNewVenda, toast, finView, setFinView,
  despesasFiltradas, despesaSearch, setDespesaSearch, despesaCategoriaFilter, setDespesaCategoriaFilter,
  setEditingDespesa, setNewDespesa, profitOverview,
}: any) {
  const exportCSV = () => {
    const header = "Data,Cliente,Email,Produto,Valor,Pagamento,Status,Observacoes\n";
    const rows = metrics.list.map((v: Venda) => `${new Date(v.data).toLocaleDateString("pt-BR")},${v.clienteNome},${v.clienteEmail || ""},${v.produto},${v.valor.toFixed(2)},${PAY_LABELS[v.pagamento]},${v.status},${v.observacoes || ""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendas-odoya-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDespesasCSV = () => {
    const header = "Data,Descricao,Categoria,Fornecedor,Valor,Pagamento,Recorrente,Observacoes\n";
    const rows = despesasFiltradas.map((d: Despesa) => `${new Date(d.data).toLocaleDateString("pt-BR")},${d.descricao},${d.categoria},${d.fornecedor || ""},${d.valor.toFixed(2)},${PAY_LABELS[d.pagamento]},${d.recorrente ? "Sim" : "Não"},${d.observacoes || ""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `despesas-odoya-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendenteValor = fin.vendas.filter((v: Venda) => v.status === "pendente").reduce((s: number, v: Venda) => s + v.valor, 0);
  const canceladoValor = fin.vendas.filter((v: Venda) => v.status === "cancelado").reduce((s: number, v: Venda) => s + v.valor, 0);
  const barDataFin = metrics.months.map((m: any) => ({ label: m.label, value: m.value }));
  const totalDespesasFiltradas = despesasFiltradas.reduce((s: number, d: Despesa) => s + d.valor, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-plum-400">Financeiro</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-plum-950 md:text-4xl">Controle de caixa</h1>
          <p className="mt-1 text-sm text-plum-600">Receita, despesas e lucro real do seu negócio, em um só lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {finView === "vendas" ? (
            <>
              <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border border-plum-200 bg-white px-4 py-2 text-sm font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50"><Download size={14} /> Exportar vendas</button>
              <button onClick={() => setNewVenda({ ...EMPTY_VENDA })} className="flex items-center gap-2 rounded-lg bg-plum-900 px-4 py-2 text-sm font-semibold text-cream-50 shadow-md transition hover:bg-plum-950"><Plus size={14} /> Nova venda</button>
            </>
          ) : (
            <>
              <button onClick={exportDespesasCSV} className="flex items-center gap-2 rounded-lg border border-plum-200 bg-white px-4 py-2 text-sm font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50"><Download size={14} /> Exportar despesas</button>
              <button onClick={() => setNewDespesa({ ...EMPTY_DESPESA })} className="flex items-center gap-2 rounded-lg bg-plum-900 px-4 py-2 text-sm font-semibold text-cream-50 shadow-md transition hover:bg-plum-950"><Plus size={14} /> Nova despesa</button>
            </>
          )}
        </div>
      </header>

      {/* Resultado consolidado: receita - despesas = lucro */}
      <AdminCard
        eyebrow="Resultado do período"
        title="Lucro real"
        subtitle="Receita realizada menos tudo o que você comprou e gastou."
        action={<AdminBadge variant={profitOverview.lucroLiquido >= 0 ? "success" : "danger"}>{profitOverview.margem.toFixed(1)}% de margem</AdminBadge>}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-plum-100 bg-cream-50/60 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-plum-500">Receita realizada</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-plum-950">{brl(profitOverview.receitaBruta)}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-rose-deep">Despesas e compras</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-rose-deep">− {brl(profitOverview.despesasTotal)}</p>
          </div>
          <div className={`rounded-xl border p-4 ${profitOverview.lucroLiquido >= 0 ? "border-sage-400/40 bg-sage-400/10" : "border-rose-300 bg-rose-50"}`}>
            <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${profitOverview.lucroLiquido >= 0 ? "text-sage-700" : "text-rose-deep"}`}>Lucro líquido</p>
            <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${profitOverview.lucroLiquido >= 0 ? "text-sage-700" : "text-rose-deep"}`}>{brl(profitOverview.lucroLiquido)}</p>
          </div>
        </div>
      </AdminCard>

      {/* Alternância Vendas / Despesas */}
      <div className="flex gap-1 rounded-xl border border-plum-100 bg-white p-1 shadow-sm sm:inline-flex">
        <button
          onClick={() => setFinView("vendas")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-initial ${finView === "vendas" ? "bg-plum-900 text-cream-50 shadow" : "text-plum-600 hover:bg-plum-50"}`}
        >
          <DollarSign size={14} /> Vendas
        </button>
        <button
          onClick={() => setFinView("despesas")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-initial ${finView === "despesas" ? "bg-plum-900 text-cream-50 shadow" : "text-plum-600 hover:bg-plum-50"}`}
        >
          <ShoppingBag size={14} /> Despesas & compras
        </button>
      </div>

      {finView === "vendas" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStat
              label="Receita aprovada"
              value={brl(metrics.receitaConcluida)}
              icon={<DollarSign size={16} />}
              accent="plum"
              spark={metrics.months.map((m: any) => m.value)}
              hint="Concluídas + enviadas + aprovadas"
            />
            <AdminStat
              label="Pendente"
              value={brl(pendenteValor)}
              icon={<Clock size={16} />}
              accent="gold"
              hint={`${metrics.statusCounts["pendente"] || 0} venda(s) aguardando`}
            />
            <AdminStat
              label="Cancelado"
              value={brl(canceladoValor)}
              icon={<XCircle size={16} />}
              accent="rose"
              hint={`${metrics.statusCounts["cancelado"] || 0} venda(s) cancelada(s)`}
            />
            <AdminStat
              label="Ticket médio"
              value={brl(metrics.ticket)}
              icon={<TrendingUp size={16} />}
              accent="sage"
              hint="Valor médio por venda aprovada"
            />
          </div>

          {/* Gráfico de receita */}
          <AdminCard eyebrow="Receita mensal" title="Evolução no período" action={<AdminBadge variant="info">{metrics.months.length} meses</AdminBadge>}>
            <BarChartPro data={barDataFin} height={220} highlightIndex={barDataFin.length - 1} />
          </AdminCard>

          {/* Filtros */}
          <AdminCard padding="sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum-400" />
                <input value={finSearch} onChange={(e) => setFinSearch(e.target.value)} placeholder="Buscar cliente, produto ou e-mail..." className="w-full rounded-xl border border-plum-200 bg-cream-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-plum-400" />
              </div>
              <select value={finStatusFilter} onChange={(e) => setFinStatusFilter(e.target.value as Venda["status"] | "todos")} className="rounded-xl border border-plum-200 bg-cream-50 px-3 py-2 text-sm text-plum-800 outline-none focus:border-plum-400">
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovado">Aprovado</option>
                <option value="enviado">Enviado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <select value={finPeriod} onChange={(e) => setFinPeriod(e.target.value as any)} className="rounded-xl border border-plum-200 bg-cream-50 px-3 py-2 text-sm text-plum-800 outline-none focus:border-plum-400">
                <option value="todos">Todo período</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
          </AdminCard>

          <p className="text-sm font-medium text-plum-500">{metrics.list.length} venda(s) encontrada(s)</p>

          {/* Lista mobile */}
          <div className="grid gap-3 sm:hidden">
            {metrics.list.length === 0 && <p className="rounded-2xl border border-dashed border-plum-200 bg-white py-10 text-center text-sm text-plum-900/50">Nenhuma venda registrada ainda. Cadastre sua primeira venda real.</p>}
            {metrics.list.map((v: Venda) => (
              <div key={v.id} className="rounded-2xl border border-plum-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-plum-800">{v.clienteNome}</p>
                    <p className="text-xs text-plum-900/50">{v.produto}</p>
                    {v.clienteEmail && <p className="text-[0.65rem] text-plum-900/40">{v.clienteEmail}</p>}
                  </div>
                  <p className="font-serif text-base font-semibold text-plum-800">{brl(v.valor)}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={v.status} />
                  <span className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium" style={{ backgroundColor: `${PAY_COLORS[v.pagamento]}22`, color: PAY_COLORS[v.pagamento] }}>{PAY_LABELS[v.pagamento]}</span>
                  <span className="text-[0.65rem] text-plum-900/40">{new Date(v.data).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => setEditingVenda({ ...v })} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50"><Pencil size={15} /></button>
                  <button onClick={() => fin.deleteVenda(v.id)} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela desktop */}
          <div className="hidden overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-plum-50 text-left text-xs uppercase tracking-wider text-plum-600">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.list.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-plum-900/50">Nenhuma venda registrada ainda. Cadastre sua primeira venda real.</td></tr>}
                  {metrics.list.map((v: Venda) => (
                    <tr key={v.id} className="border-t border-plum-50 hover:bg-plum-50/40">
                      <td className="px-4 py-3"><p className="font-medium text-plum-800">{v.clienteNome}</p>{v.clienteEmail && <p className="text-xs text-plum-900/50">{v.clienteEmail}</p>}</td>
                      <td className="px-4 py-3 text-plum-900/70">{v.produto}</td>
                      <td className="px-4 py-3 font-semibold text-plum-800">{brl(v.valor)}</td>
                      <td className="px-4 py-3"><span className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: `${PAY_COLORS[v.pagamento]}22`, color: PAY_COLORS[v.pagamento] }}>{PAY_LABELS[v.pagamento]}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3 text-xs text-plum-900/60">{new Date(v.data).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => setEditingVenda({ ...v })} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50"><Pencil size={15} /></button><button onClick={() => fin.deleteVenda(v.id)} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10"><Trash2 size={15} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AdminStat label="Total de despesas" value={brl(totalDespesasFiltradas)} icon={<DollarSign size={16} />} accent="rose" hint={`${despesasFiltradas.length} lançamento(s) no filtro`} />
            <AdminStat label="Categoria mais alta" value={Object.entries(profitOverview.porCategoria).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "—"} icon={<Package size={16} />} accent="gold" hint={Object.entries(profitOverview.porCategoria).length ? brl(Object.entries(profitOverview.porCategoria).sort((a: any, b: any) => b[1] - a[1])[0][1] as number) : "Sem dados"} />
            <AdminStat label="Recorrentes" value={String(fin.despesas.filter((d: Despesa) => d.recorrente).length)} icon={<RefreshCw size={16} />} accent="plum" hint="Assinaturas e custos fixos" />
          </div>

          {/* Filtros */}
          <AdminCard padding="sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum-400" />
                <input value={despesaSearch} onChange={(e) => setDespesaSearch(e.target.value)} placeholder="Buscar descrição, fornecedor ou categoria..." className="w-full rounded-xl border border-plum-200 bg-cream-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-plum-400" />
              </div>
              <select value={despesaCategoriaFilter} onChange={(e) => setDespesaCategoriaFilter(e.target.value as any)} className="rounded-xl border border-plum-200 bg-cream-50 px-3 py-2 text-sm text-plum-800 outline-none focus:border-plum-400">
                <option value="todas">Todas as categorias</option>
                {DESPESA_CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={finPeriod} onChange={(e) => setFinPeriod(e.target.value as any)} className="rounded-xl border border-plum-200 bg-cream-50 px-3 py-2 text-sm text-plum-800 outline-none focus:border-plum-400">
                <option value="todos">Todo período</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
          </AdminCard>

          <p className="text-sm font-medium text-plum-500">{despesasFiltradas.length} despesa(s) encontrada(s)</p>

          {/* Lista mobile */}
          <div className="grid gap-3 sm:hidden">
            {despesasFiltradas.length === 0 && <p className="rounded-2xl border border-dashed border-plum-200 bg-white py-10 text-center text-sm text-plum-900/50">Nenhuma despesa registrada. Adicione suas compras e custos reais.</p>}
            {despesasFiltradas.map((d: Despesa) => (
              <div key={d.id} className="rounded-2xl border border-plum-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-plum-800">{d.descricao}</p>
                    <p className="text-xs text-plum-900/50">{d.categoria}{d.fornecedor ? ` · ${d.fornecedor}` : ""}</p>
                  </div>
                  <p className="font-serif text-base font-semibold text-rose-deep">{brl(d.valor)}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {d.recorrente && <AdminBadge variant="gold" dot>Recorrente</AdminBadge>}
                  <span className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium" style={{ backgroundColor: `${PAY_COLORS[d.pagamento]}22`, color: PAY_COLORS[d.pagamento] }}>{PAY_LABELS[d.pagamento]}</span>
                  <span className="text-[0.65rem] text-plum-900/40">{new Date(d.data).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => setEditingDespesa({ ...d })} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50"><Pencil size={15} /></button>
                  <button onClick={() => { fin.deleteDespesa(d.id); toast.error("Despesa excluída", d.descricao); }} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela desktop */}
          <div className="hidden overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-plum-50 text-left text-xs uppercase tracking-wider text-plum-600">
                  <tr>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Fornecedor</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasFiltradas.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-plum-900/50">Nenhuma despesa registrada. Adicione suas compras e custos reais.</td></tr>}
                  {despesasFiltradas.map((d: Despesa) => (
                    <tr key={d.id} className="border-t border-plum-50 hover:bg-plum-50/40">
                      <td className="px-4 py-3"><p className="font-medium text-plum-800">{d.descricao}</p>{d.recorrente && <AdminBadge variant="gold" dot>Recorrente</AdminBadge>}</td>
                      <td className="px-4 py-3 text-plum-900/70">{d.categoria}</td>
                      <td className="px-4 py-3 text-plum-900/70">{d.fornecedor || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-rose-deep">{brl(d.valor)}</td>
                      <td className="px-4 py-3"><span className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: `${PAY_COLORS[d.pagamento]}22`, color: PAY_COLORS[d.pagamento] }}>{PAY_LABELS[d.pagamento]}</span></td>
                      <td className="px-4 py-3 text-xs text-plum-900/60">{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => setEditingDespesa({ ...d })} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50"><Pencil size={15} /></button><button onClick={() => { fin.deleteDespesa(d.id); toast.error("Despesa excluída", d.descricao); }} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10"><Trash2 size={15} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UsersTab({ auth, inter, store, selectedUser, setSelectedUserId }: any) {
  if (selectedUser) {
    return <UserDetail cliente={selectedUser} onBack={() => setSelectedUserId(null)} products={store.products} inter={inter} />;
  }
  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-serif text-3xl font-semibold text-plum-800">Clientes</h2>
        <p className="text-sm text-plum-900/55">Visualize interações e aborde pelo WhatsApp.</p>
      </header>
      {auth.clientes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-plum-200 bg-white py-20 text-center">
          <UsersIcon className="mx-auto text-plum-300" size={40} />
          <p className="mt-4 font-serif text-2xl text-plum-800">Nenhum cliente cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {auth.clientes.map((c: any) => {
            const favCount = inter.favoritosDe(c.id).length;
            const likeCount = inter.gostouDe(c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedUserId(c.id)}
                className="group rounded-2xl border border-plum-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-plum-400 font-serif text-base font-semibold text-white">
                    {c.nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base font-semibold text-plum-800">{c.nome}</p>
                    <p className="truncate text-xs text-plum-900/55">{c.email}</p>
                  </div>
                  <ChevronRight size={16} className="text-plum-300 transition group-hover:translate-x-1 group-hover:text-plum-600" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <span className="flex items-center justify-center gap-1 rounded-full bg-rose-deep/10 py-1 text-xs text-rose-deep"><Heart size={11} className="fill-rose-deep" /> {favCount}</span>
                  <span className="flex items-center justify-center gap-1 rounded-full bg-gold-500/15 py-1 text-xs text-gold-600"><ThumbsUp size={11} className="fill-gold-500" /> {likeCount}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductsTab({ store, inter, filteredProducts, stockFilter, setStockFilter, prodSearch, setProdSearch, lowStockCount, outStockCount, totalStockValue, startNewProd, startEditProd, quickStock, toggleAvailable, duplicateProd, toast }: any) {
  const activity = useActivity();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAllVisible = () => {
    const allSelected = filteredProducts.every((p: Product) => selected.has(p.id));
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredProducts.map((p: Product) => p.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const bulkEnable = () => {
    if (selected.size === 0) return;
    selected.forEach((id) => {
      const p = store.products.find((x: Product) => x.id === id);
      if (p && !p.available) store.updateProduct({ ...p, available: true });
    });
    toast.success(`${selected.size} produto(s) ativados`);
    activity.log("product.updated", `Ativação em lote de ${selected.size} produtos`);
    clearSelection();
  };
  const bulkDisable = () => {
    if (selected.size === 0) return;
    selected.forEach((id) => {
      const p = store.products.find((x: Product) => x.id === id);
      if (p && p.available) store.updateProduct({ ...p, available: false });
    });
    toast.warning(`${selected.size} produto(s) desativados`);
    activity.log("product.updated", `Desativação em lote de ${selected.size} produtos`);
    clearSelection();
  };
  const bulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Excluir ${selected.size} produto(s) selecionado(s)?`)) return;
    selected.forEach((id) => store.deleteProduct(id));
    toast.error(`${selected.size} produto(s) excluídos`);
    activity.log("product.deleted", `Exclusão em lote de ${selected.size} produtos`);
    clearSelection();
  };

  const exportJSON = () => {
    const data = JSON.stringify(store.products, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `odoya-produtos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Catálogo exportado", `${store.products.length} produtos em JSON.`);
  };
  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data)) throw new Error("Formato inválido");
        if (!confirm(`Importar ${data.length} produto(s)? Isso substitui o catálogo atual.`)) return;
        data.forEach((p: Product) => {
          if (p.id && p.name) store.updateProduct(p);
          else store.addProduct({ ...p, id: `prod-${Date.now()}-${Math.random().toString(36).slice(2,6)}` });
        });
        toast.success(`${data.length} produto(s) importados`);
        activity.log("product.updated", `Importação JSON com ${data.length} produtos`);
      } catch (e: any) {
        toast.error("Falha na importação", e?.message || "JSON inválido");
      }
    };
    reader.readAsText(file);
  };

  const allSelected = filteredProducts.length > 0 && filteredProducts.every((p: Product) => selected.has(p.id));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-plum-400">Catálogo</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-plum-950 md:text-4xl">Produtos</h1>
          <p className="mt-1 text-sm text-plum-600">Adicione, edite e monitore o estoque em tempo real.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); e.target.value = ""; }}
          />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-plum-200 bg-white px-3.5 py-2 text-sm font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50" title="Importar JSON">
            <Upload size={14} /> Importar
          </button>
          <button onClick={exportJSON} className="flex items-center gap-2 rounded-lg border border-plum-200 bg-white px-3.5 py-2 text-sm font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50" title="Exportar catálogo como JSON">
            <Download size={14} /> Exportar
          </button>
          <button onClick={() => { if (confirm("Restaurar catálogo padrão? Isso substitui seus produtos atuais.")) { store.resetAll(); toast.info("Catálogo restaurado", "Produtos de exemplo recarregados."); } }} className="flex items-center gap-2 rounded-lg border border-plum-200 bg-white px-3.5 py-2 text-sm font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50"><RotateCcw size={14} /> Restaurar</button>
          <button onClick={startNewProd} className="flex items-center gap-2 rounded-lg bg-plum-900 px-4 py-2 text-sm font-semibold text-cream-50 shadow-md transition hover:bg-plum-950"><Plus size={14} /> Novo produto</button>
        </div>
      </header>

      {/* Barra de ações em lote — aparece quando há seleção */}
      {selected.size > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-gold-400/40 bg-plum-950/95 px-4 py-3 text-cream-50 shadow-xl backdrop-blur">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 font-display text-sm font-bold text-plum-950">{selected.size}</span>
          <p className="text-sm font-semibold">produto(s) selecionado(s)</p>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <button onClick={bulkEnable} className="flex items-center gap-1.5 rounded-lg bg-sage-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-sage-600">
              <Eye size={13} /> Ativar
            </button>
            <button onClick={bulkDisable} className="flex items-center gap-1.5 rounded-lg bg-plum-700 px-3 py-1.5 text-xs font-bold text-cream-50 shadow hover:bg-plum-800">
              <EyeOff size={13} /> Desativar
            </button>
            <button onClick={bulkDelete} className="flex items-center gap-1.5 rounded-lg bg-rose-deep px-3 py-1.5 text-xs font-bold text-white shadow hover:brightness-110">
              <Trash2 size={13} /> Excluir
            </button>
            <button onClick={clearSelection} className="rounded-lg border border-cream-100/20 px-3 py-1.5 text-xs font-semibold text-cream-50 hover:bg-cream-100/10">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AdminStat label="Catálogo ativo" value={store.products.length} icon={<Package2 size={16} />} accent="plum" hint="Total de produtos cadastrados" />
        <AdminStat label="Estoque baixo" value={lowStockCount} icon={<AlertTriangle size={16} />} accent="gold" hint="Abaixo do mínimo configurado" />
        <AdminStat label="Esgotados" value={outStockCount} icon={<XCircle size={16} />} accent="rose" hint="Sem unidades disponíveis" />
        <AdminStat label="Valor em estoque" value={brl(totalStockValue)} icon={<DollarSign size={16} />} accent="sage" hint="Soma (preço × unidades)" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-plum-100 bg-white p-3 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum-400" />
          <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} placeholder="Buscar produto..." className="w-full rounded-xl border border-plum-200 bg-cream-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-plum-400" />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "ok", "low", "out"] as const).map((f) => {
            const labels: any = { all: "Todos", ok: "Em dia", low: "Baixo", out: "Esgotado" };
            const counts: any = { all: store.products.length, ok: store.products.filter((p: Product) => p.stock > p.minStock).length, low: lowStockCount, out: outStockCount };
            return (
              <button key={f} onClick={() => setStockFilter(f)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${stockFilter === f ? "bg-plum-700 text-cream-50" : "bg-plum-50 text-plum-700 hover:bg-plum-100"}`}>
                {labels[f]} <span className="opacity-70">{counts[f]}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={selectAllVisible}
          className="flex items-center gap-1.5 rounded-lg border border-plum-200 bg-white px-3 py-2 text-xs font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50"
          title="Selecionar todos visíveis"
        >
          {allSelected ? <CheckSquare size={13} className="text-sage-600" /> : <Square size={13} />}
          {allSelected ? "Desmarcar" : "Selecionar todos"}
        </button>
      </div>

      <div className="grid gap-3">
        {filteredProducts.length === 0 && <p className="rounded-2xl border border-dashed border-plum-200 bg-white py-10 text-center text-sm text-plum-900/50">Nenhum produto encontrado.</p>}
        {filteredProducts.map((p: Product) => {
          const isLow = p.stock > 0 && p.stock <= p.minStock;
          const isOut = p.stock === 0;
          return (
            <div key={p.id} className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${isOut ? "border-rose-200" : isLow ? "border-amber-200" : "border-plum-100"}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => toggleSelect(p.id)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${selected.has(p.id) ? "border-plum-700 bg-plum-700 text-cream-50" : "border-plum-300 bg-white text-transparent hover:border-plum-500"}`}
                  aria-label={selected.has(p.id) ? "Desmarcar" : "Selecionar"}
                >
                  <CheckSquare size={14} className={selected.has(p.id) ? "" : "opacity-0"} />
                </button>
                <div className="flex items-center gap-3 sm:flex-1">
                  {p.image ? <img src={p.image} alt={p.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" /> : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl" style={{ backgroundColor: `${p.color}22` }}>{p.emoji}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-plum-800">{p.name}</p>
                      {p.featured && <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-gold-600">Destaque</span>}
                      {p.bestSeller && <span className="rounded-full bg-plum-100 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-plum-700">Top</span>}
                      {p.isNew && <span className="rounded-full bg-sage-400/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-sage-600">Novo</span>}
                    </div>
                    <p className="text-xs text-plum-900/55">{p.category} · {p.weight} · <strong className="text-plum-700">{brl(p.price)}</strong></p>
                    <div className="mt-1 flex gap-1.5">
                      <span className="flex items-center gap-1 rounded-full bg-rose-deep/10 px-2 py-0.5 text-[0.65rem] text-rose-deep"><Heart size={10} className="fill-rose-deep" /> {inter.countFavoritos(p.id)}</span>
                      <span className="flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[0.65rem] text-gold-600"><ThumbsUp size={10} className="fill-gold-500" /> {inter.countGostou(p.id)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-1">
                    <button onClick={() => quickStock(p, -1)} disabled={p.stock === 0} className="rounded-lg border border-plum-200 p-1.5 text-plum-600 hover:bg-plum-50 disabled:opacity-40"><MinusCircle size={16} /></button>
                    <div className="min-w-[64px] rounded-lg bg-cream-50 px-2 py-1.5 text-center">
                      <p className={`font-serif text-lg font-semibold leading-none ${isOut ? "text-rose-deep" : isLow ? "text-amber-700" : "text-plum-800"}`}>{p.stock}</p>
                      <p className="text-[0.55rem] text-plum-900/50">mín {p.minStock}</p>
                    </div>
                    <button onClick={() => quickStock(p, 1)} className="rounded-lg border border-plum-200 p-1.5 text-plum-600 hover:bg-plum-50"><PlusCircle size={16} /></button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => toggleAvailable(p)} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50" title="Disponível/Esgotado">{p.available ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                    <button onClick={() => quickStock(p, 10)} className="rounded-lg p-2 text-sage-600 hover:bg-sage-400/10" title="Repor +10"><Package2 size={18} /></button>
                    <button onClick={() => duplicateProd(p)} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50" title="Duplicar"><Copy size={18} /></button>
                    <button onClick={() => startEditProd(p)} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50" title="Editar"><Pencil size={18} /></button>
                    <button onClick={() => { if (confirm(`Excluir "${p.name}"?`)) { store.deleteProduct(p.id); toast.error("Produto excluído", p.name); } }} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10" title="Excluir"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-plum-50 pt-3 text-xs sm:justify-between">
                <div className="flex gap-2">
                  {isOut ? <span className="flex items-center gap-1 rounded-full bg-rose-deep/10 px-2 py-0.5 font-semibold text-rose-deep"><XCircle size={10} /> Esgotado</span> : isLow ? <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-700"><AlertTriangle size={10} /> Estoque baixo</span> : <span className="flex items-center gap-1 rounded-full bg-sage-400/20 px-2 py-0.5 font-semibold text-sage-600"><CheckCircle2 size={10} /> Em dia</span>}
                </div>
                <span className="text-plum-500">Valor total em estoque: <strong className="text-plum-800">{brl(p.stock * p.price)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoriesTab({ store, newCat, setNewCat, toast }: any) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-plum-400">Catálogo</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-plum-950 md:text-4xl">Categorias</h1>
        <p className="mt-1 text-sm text-plum-600">Organize como os produtos aparecem na vitrine.</p>
      </header>

      <AdminCard eyebrow="Categorias ativas" title={`${store.categories.filter((c: string) => c !== "Todos").length} categoria(s)`} subtitle="Clique no × para remover. Atenção: produtos ficarão sem categoria.">
        <div className="flex flex-wrap gap-2">
          {store.categories.filter((c: string) => c !== "Todos").map((c: string) => (
            <span key={c} className="group flex items-center gap-2 rounded-full border border-plum-100 bg-cream-50/70 px-3 py-1.5 text-sm font-medium text-plum-800">
              {c}
              <button
                onClick={() => {
                  if (confirm(`Remover categoria "${c}"?`)) {
                    store.deleteCategory(c);
                    toast.warning("Categoria removida", c);
                  }
                }}
                className="text-plum-400 transition hover:text-rose-deep"
                aria-label={`Remover ${c}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {store.categories.filter((c: string) => c !== "Todos").length === 0 && (
            <p className="py-6 text-center text-sm text-plum-500">Nenhuma categoria cadastrada.</p>
          )}
        </div>

        <div className="mt-5 border-t border-plum-100 pt-5">
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wider text-plum-500">Adicionar nova</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCat.trim()) {
                  store.addCategory(newCat.trim());
                  toast.success("Categoria criada", newCat.trim());
                  setNewCat("");
                }
              }}
              placeholder="Ex.: Kit Presente"
              className="flex-1 rounded-xl border border-plum-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-plum-400 focus:ring-2 focus:ring-plum-200"
            />
            <button
              onClick={() => {
                if (newCat.trim()) {
                  store.addCategory(newCat.trim());
                  toast.success("Categoria criada", newCat.trim());
                  setNewCat("");
                }
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-plum-900 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-md transition hover:bg-plum-950"
            >
              <Plus size={15} /> Criar
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

function MiniKPI({ icon, label, value, variant = "plum" }: { icon: React.ReactNode; label: string; value: string | number; variant?: "plum" | "amber" | "rose" | "sage" }) {
  const variants: Record<string, string> = { plum: "border-plum-100 text-plum-700", amber: "border-amber-200 bg-amber-50/60 text-amber-700", rose: "border-rose-200 bg-rose-50/60 text-rose-deep", sage: "border-sage-400/30 bg-sage-400/10 text-sage-600" };
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${variants[variant]}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">{icon} {label}</div>
      <p className="mt-2 font-serif text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Venda["status"] }) {
  const map: Record<Venda["status"], { label: string; cls: string; icon: React.ReactNode }> = {
    pendente: { label: "Pendente", cls: "bg-gold-300/20 text-gold-600", icon: <Clock size={12} /> },
    aprovado: { label: "Aprovado", cls: "bg-plum-100 text-plum-700", icon: <CheckCircle2 size={12} /> },
    enviado: { label: "Enviado", cls: "bg-sage-400/20 text-sage-600", icon: <Truck size={12} /> },
    concluido: { label: "Concluído", cls: "bg-plum-100 text-plum-700", icon: <CheckCircle2 size={12} /> },
    cancelado: { label: "Cancelado", cls: "bg-rose-deep/10 text-rose-deep", icon: <XCircle size={12} /> },
  };
  const m = map[status];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${m.cls}`}>{m.icon} {m.label}</span>;
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}><label className="mb-1.5 block text-sm font-medium text-plum-700">{label}</label>{children}</div>;
}

function Modal({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-plum-950/70 p-3 backdrop-blur-md sm:p-4" onClick={onClose}>
      <div
        className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-2xl sm:my-8 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-plum-100 bg-cream-50/70 px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-plum-950 sm:text-2xl">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-plum-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-plum-500 transition hover:bg-plum-100 hover:text-plum-800"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onSave, disabled, primaryLabel = "Salvar" }: { onCancel: () => void; onSave: () => void; disabled?: boolean; primaryLabel?: string }) {
  return (
    <div className="-mx-5 -mb-5 mt-6 flex flex-col-reverse gap-2 border-t border-plum-100 bg-cream-50/50 px-5 py-4 sm:-mx-7 sm:-mb-6 sm:flex-row sm:justify-end sm:px-7">
      <button onClick={onCancel} className="rounded-lg border border-plum-200 bg-white px-5 py-2.5 text-sm font-semibold text-plum-700 transition hover:border-plum-300 hover:bg-plum-50">
        Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="flex items-center justify-center gap-2 rounded-lg bg-plum-900 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-md transition hover:bg-plum-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Save size={14} /> {primaryLabel}
      </button>
    </div>
  );
}

type VendaDraft = { clienteNome: string; clienteEmail?: string; produto: string; quantidade: number; valor: number; status: Venda["status"]; pagamento: Venda["pagamento"]; data: string; observacoes?: string };

function VendaForm({ value, onChange, produtos }: { value: VendaDraft; onChange: (v: VendaDraft) => void; produtos: string[] }) {
  const set = <K extends keyof VendaDraft>(k: K, v: VendaDraft[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome do cliente" full><input value={value.clienteNome} onChange={(e) => set("clienteNome", e.target.value)} className={inputCls} /></Field>
      <Field label="E-mail (opcional)" full><input value={value.clienteEmail || ""} onChange={(e) => set("clienteEmail", e.target.value)} className={inputCls} /></Field>
      <Field label="Produto">
        <input list="prod-list" value={value.produto} onChange={(e) => set("produto", e.target.value)} className={inputCls} />
        <datalist id="prod-list">{produtos.map((p) => <option key={p} value={p} />)}</datalist>
      </Field>
      <Field label="Quantidade"><input type="number" min="1" value={value.quantidade} onChange={(e) => set("quantidade", Math.max(1, parseInt(e.target.value) || 1))} className={inputCls} /></Field>
      <Field label="Valor (R$)"><input type="number" step="0.01" value={value.valor} onChange={(e) => set("valor", parseFloat(e.target.value) || 0)} className={inputCls} /></Field>
      <Field label="Pagamento">
        <select value={value.pagamento} onChange={(e) => set("pagamento", e.target.value as Venda["pagamento"])} className={inputCls}>
          <option value="pix">PIX</option><option value="boleto">Boleto</option><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="outro">Outro</option>
        </select>
      </Field>
      <Field label="Status">
        <select value={value.status} onChange={(e) => set("status", e.target.value as Venda["status"])} className={inputCls}>
          <option value="pendente">Pendente</option><option value="aprovado">Aprovado</option><option value="enviado">Enviado</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option>
        </select>
      </Field>
      <Field label="Data"><input type="date" value={value.data.slice(0, 10)} onChange={(e) => set("data", new Date(e.target.value).toISOString())} className={inputCls} /></Field>
      <Field label="Observações"><input value={value.observacoes || ""} onChange={(e) => set("observacoes", e.target.value)} className={inputCls} /></Field>
    </div>
  );
}

type DespesaDraft = { descricao: string; categoria: DespesaCategoria; valor: number; data: string; fornecedor?: string; pagamento: Despesa["pagamento"]; recorrente?: boolean; observacoes?: string };

function DespesaForm({ value, onChange }: { value: DespesaDraft; onChange: (d: DespesaDraft) => void }) {
  const set = <K extends keyof DespesaDraft>(k: K, v: DespesaDraft[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Descrição" full><input value={value.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Ex: Compra de essências e varetas" className={inputCls} /></Field>
      <Field label="Categoria">
        <select value={value.categoria} onChange={(e) => set("categoria", e.target.value as DespesaCategoria)} className={inputCls}>
          {DESPESA_CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Valor (R$)"><input type="number" step="0.01" value={value.valor} onChange={(e) => set("valor", parseFloat(e.target.value) || 0)} className={inputCls} /></Field>
      <Field label="Fornecedor (opcional)"><input value={value.fornecedor || ""} onChange={(e) => set("fornecedor", e.target.value)} placeholder="Nome do fornecedor" className={inputCls} /></Field>
      <Field label="Pagamento">
        <select value={value.pagamento} onChange={(e) => set("pagamento", e.target.value as Despesa["pagamento"])} className={inputCls}>
          <option value="pix">PIX</option><option value="boleto">Boleto</option><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="outro">Outro</option>
        </select>
      </Field>
      <Field label="Data"><input type="date" value={value.data.slice(0, 10)} onChange={(e) => set("data", new Date(e.target.value).toISOString())} className={inputCls} /></Field>
      <div className="flex items-center gap-2 sm:col-span-2">
        <input id="despesa-recorrente" type="checkbox" checked={!!value.recorrente} onChange={(e) => set("recorrente", e.target.checked)} className="h-4 w-4 rounded border-plum-300 text-plum-700 focus:ring-plum-400" />
        <label htmlFor="despesa-recorrente" className="text-sm font-medium text-plum-700">Despesa recorrente (assinatura, aluguel, mensalidade...)</label>
      </div>
      <Field label="Observações" full><input value={value.observacoes || ""} onChange={(e) => set("observacoes", e.target.value)} className={inputCls} /></Field>
    </div>
  );
}

function buildApproachMessage(cliente: { nome: string }, fav: Product[], like: Product[]): string {
  const firstName = cliente.nome.split(" ")[0];
  const favNames = fav.map((p) => p.name.replace(/^Incenso\s/, "")).filter(Boolean);
  const likeNames = like.map((p) => p.name.replace(/^Incenso\s/, "")).filter(Boolean);
  const all = Array.from(new Set([...favNames, ...likeNames]));
  const lines: string[] = [`Olá, ${firstName}! Aqui é da *Odoyá Ervas de Aruanda*. 🌿`, ""];
  if (fav.length > 0) lines.push(`Percebi que você salvou nos favoritos: *${favNames.join(", ")}*. Que seleção bonita — cada um deles traz uma energia especial.`);
  if (like.length > 0) lines.push(fav.length > 0 ? `Também vi que você curtiu *${likeNames.join(", ")}*. ✨` : `Notei que você curtiu *${likeNames.join(", ")}* no nosso site. ✨`);
  lines.push("", "Posso te ajudar a escolher a composição ideal para o seu momento? Temos algumas sugestões e condições especiais reservadas para quem acompanha nosso trabalho de perto.");
  lines.push("", "Se preferir, posso montar um *kit personalizado* com os aromas que mais combinam com você — ou indicar um banho de ervas que harmonize com esse momento.");
  lines.push("", "Fico no aguardo com muito carinho. 🌙", "*Jéssica* · Odoyá Ervas de Aruanda");
  if (all.length === 0) return [`Olá, ${firstName}! Aqui é da *Odoyá Ervas de Aruanda*. 🌿`, "", "É um prazer ter você conosco! Se quiser, posso te apresentar nossos incensos artesanais, banhos de ervas e defumações — cada um feito à mão com intenção e cuidado.", "", "Qual energia você gostaria de trazer para o seu dia hoje? Posso te indicar a composição ideal.", "", "Com carinho,", "*Jéssica* · Odoyá Ervas de Aruanda"].join("\n");
  return lines.join("\n");
}

function openWhatsApp(phone: string, msg: string) {
  const url = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function UserDetail({ cliente, onBack, products, inter }: { cliente: { id: string; nome: string; email: string; telefone?: string; cidade?: string; criadoEm: string }; onBack: () => void; products: Product[]; inter: ReturnType<typeof useInteractions> }) {
  const favIds = inter.favoritosDe(cliente.id);
  const likeIds = inter.gostouDe(cliente.id);
  const favProducts = products.filter((p) => favIds.includes(p.id));
  const likeProducts = products.filter((p) => likeIds.includes(p.id));
  const initials = cliente.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const message = buildApproachMessage(cliente, favProducts, likeProducts);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  useEffect(() => { setEditedMessage(message); }, [message]);
  const hasInteractions = favProducts.length > 0 || likeProducts.length > 0;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-plum-600 hover:text-plum-800"><ArrowLeft size={16} /> Voltar para lista</button>
      <div className="rounded-3xl border border-plum-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-plum-400 font-serif text-3xl font-semibold text-white">{initials}</span>
          <div className="flex-1">
            <h3 className="font-serif text-2xl font-semibold text-plum-800 sm:text-3xl">{cliente.nome}</h3>
            <div className="mt-2 grid gap-1 text-sm text-plum-900/65 sm:grid-cols-2">
              <p className="flex items-center gap-2"><Mail size={14} /> {cliente.email}</p>
              {cliente.telefone && <p className="flex items-center gap-2"><Phone size={14} /> {cliente.telefone}</p>}
              {cliente.cidade && <p className="flex items-center gap-2"><MapPin size={14} /> {cliente.cidade}</p>}
              <p className="flex items-center gap-2"><Calendar size={14} /> Desde {new Date(cliente.criadoEm).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-rose-deep/10 px-3 py-1.5 text-sm text-rose-deep"><Heart size={14} className="fill-rose-deep" /> {favIds.length} fav.</span>
            <span className="flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1.5 text-sm text-gold-600"><ThumbsUp size={14} className="fill-gold-500" /> {likeIds.length} gost.</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gold-400/30 bg-gradient-to-br from-gold-300/15 to-plum-100/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-serif text-base font-semibold text-plum-800"><MessageCircle size={18} className="text-emerald-600" /> Abordar via WhatsApp</p>
              <p className="mt-1 max-w-xl text-xs text-plum-900/65">{hasInteractions ? "Mensagem profissional personalizada com base nas interações deste cliente." : "Mensagem de boas-vindas — o cliente ainda não interagiu."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setEditedMessage(message); setPreviewOpen(true); }} className="flex items-center gap-1.5 rounded-full border border-plum-200 bg-white px-4 py-2 text-xs font-medium text-plum-700 hover:bg-plum-50"><Eye size={14} /> Revisar</button>
              <button onClick={() => openWhatsApp("17981771556", message)} className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-emerald-700"><MessageCircle size={14} /> Enviar</button>
            </div>
          </div>
        </div>
      </div>

      <UserProductList title="Favoritados" items={favProducts} tag="favorito" cliente={cliente} interType="fav" />
      <UserProductList title="Curtidos" items={likeProducts} tag="gostou" cliente={cliente} interType="like" />

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-plum-900/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="my-4 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:my-8 sm:p-7">
            <div className="flex items-center justify-between">
              <div><h3 className="font-serif text-xl font-semibold text-plum-800 sm:text-2xl">Revisar mensagem</h3><p className="text-xs text-plum-900/55">Edite antes de enviar para {cliente.nome.split(" ")[0]}.</p></div>
              <button onClick={() => setPreviewOpen(false)} className="rounded-full p-2 text-plum-500 hover:bg-plum-50"><X /></button>
            </div>
            <textarea value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)} rows={12} className="mt-4 w-full rounded-xl border border-plum-200 bg-cream-50 p-4 font-sans text-sm leading-relaxed text-plum-800 outline-none focus:border-plum-400 focus:ring-2 focus:ring-plum-200" />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setEditedMessage(message)} className="flex items-center justify-center gap-1.5 rounded-full border border-plum-200 px-4 py-2 text-sm text-plum-700 hover:bg-plum-50"><RotateCcw size={14} /> Restaurar</button>
              <button onClick={() => { navigator.clipboard?.writeText(editedMessage); }} className="flex items-center justify-center gap-1.5 rounded-full border border-plum-200 px-4 py-2 text-sm text-plum-700 hover:bg-plum-50"><Copy size={14} /> Copiar</button>
              <button onClick={() => setPreviewOpen(false)} className="rounded-full border border-plum-200 px-5 py-2 text-sm text-plum-700 hover:bg-plum-50">Cancelar</button>
              <button onClick={() => { openWhatsApp("17981771556", editedMessage); setPreviewOpen(false); }} className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-sm text-white hover:bg-emerald-700"><MessageCircle size={14} /> Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserProductList({ title, items, tag, cliente, interType }: { title: string; items: Product[]; tag: "favorito" | "gostou"; cliente: { nome: string }; interType: "fav" | "like" }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 font-serif text-xl font-semibold text-plum-800">{tag === "favorito" ? <Heart size={18} className="fill-rose-deep text-rose-deep" /> : <ThumbsUp size={18} className="fill-gold-500 text-gold-600" />} {title} ({items.length})</h4>
        {items.length > 0 && (
          <button onClick={() => openWhatsApp("17981771556", buildApproachMessage(cliente, interType === "fav" ? items : [], interType === "like" ? items : []))} className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"><MessageCircle size={13} /> Abordar</button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-plum-200 bg-white py-8 text-center text-sm text-plum-900/50">Este cliente ainda não tem {title.toLowerCase()}.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => <MiniProduct key={p.id} p={p} tag={tag} />)}
        </div>
      )}
    </div>
  );
}

function MiniProduct({ p, tag }: { p: Product; tag: "favorito" | "gostou" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-plum-100 bg-white p-3 shadow-sm">
      {p.image ? <img src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${p.color}22` }}>{p.emoji}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-plum-800">{p.name}</p>
        <p className="text-xs text-plum-900/50">{p.category}</p>
      </div>
      {tag === "favorito" ? <Heart size={16} className="shrink-0 fill-rose-deep text-rose-deep" /> : <ThumbsUp size={16} className="shrink-0 fill-gold-500 text-gold-600" />}
    </div>
  );
}

// ============ ENVIOS / RASTREIO ============

const STATUS_META: Record<ShipmentStatus, { label: string; icon: any; color: string; bg: string }> = {
  aguardando: { label: "Aguardando envio", icon: Clock, color: "text-gold-600", bg: "bg-gold-300/20" },
  postado: { label: "Postado", icon: Package, color: "text-plum-700", bg: "bg-plum-100" },
  em_transito: { label: "Em trânsito", icon: Truck, color: "text-plum-700", bg: "bg-plum-100" },
  entregue: { label: "Entregue", icon: CheckCircle2, color: "text-sage-600", bg: "bg-sage-400/20" },
  problema: { label: "Ocorrência", icon: AlertTriangle, color: "text-rose-deep", bg: "bg-rose-deep/10" },
};

function ShippingTab({ shipping }: { shipping: ReturnType<typeof useShipping> }) {
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ShipmentStatus | "todos">("todos");

  const filtered = shipping.shipments.filter((s) => {
    if (filterStatus !== "todos" && s.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.clienteNome.toLowerCase().includes(q) ||
        s.produto.toLowerCase().includes(q) ||
        s.trackingCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    aguardando: shipping.shipments.filter((s) => s.status === "aguardando").length,
    postado: shipping.shipments.filter((s) => s.status === "postado").length,
    em_transito: shipping.shipments.filter((s) => s.status === "em_transito").length,
    entregue: shipping.shipments.filter((s) => s.status === "entregue").length,
    problema: shipping.shipments.filter((s) => s.status === "problema").length,
  };

  const notifyCliente = (s: Shipment) => {
    const msg = trackingMessage(s);
    const phone = s.clienteTelefone.replace(/\D/g, "");
    const url = `https://wa.me/${phone.startsWith("55") ? phone : "55" + phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    shipping.markNotified(s.id);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-plum-800">Envios & Rastreio</h2>
          <p className="text-sm text-plum-900/55">Cadastre envios, atualize status e notifique o cliente pelo WhatsApp.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-full bg-plum-700 px-5 py-2.5 text-sm text-cream-50 hover:bg-plum-800">
          <Plus size={16} /> Novo envio
        </button>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MiniKPI icon={<Clock size={16} />} label="Aguardando" value={counts.aguardando} />
        <MiniKPI icon={<Package size={16} />} label="Postados" value={counts.postado} />
        <MiniKPI icon={<Truck size={16} />} label="Em trânsito" value={counts.em_transito} />
        <MiniKPI icon={<CheckCircle2 size={16} />} label="Entregues" value={counts.entregue} variant="sage" />
        <MiniKPI icon={<AlertTriangle size={16} />} label="Ocorrência" value={counts.problema} variant="rose" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-2xl border border-plum-100 bg-white p-3 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-plum-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por cliente, produto ou código..." className="w-full rounded-xl border border-plum-200 bg-cream-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-plum-400" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="rounded-xl border border-plum-200 bg-cream-50 px-3 py-2 text-sm text-plum-800 outline-none focus:border-plum-400">
          <option value="todos">Todos os status</option>
          <option value="aguardando">Aguardando</option>
          <option value="postado">Postado</option>
          <option value="em_transito">Em trânsito</option>
          <option value="entregue">Entregue</option>
          <option value="problema">Ocorrência</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-plum-200 bg-white py-10 text-center text-sm text-plum-900/50">Nenhum envio encontrado.</p>
        )}
        {filtered.map((s) => {
          const meta = STATUS_META[s.status];
          const StatusIcon = meta.icon;
          return (
            <div key={s.id} className="rounded-2xl border border-plum-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-plum-800">{s.clienteNome}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${meta.bg} ${meta.color}`}>
                      <StatusIcon size={11} /> {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-plum-900/55">{s.produto}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[0.7rem] text-plum-900/60">
                    <span className="flex items-center gap-1 rounded-full bg-plum-50 px-2 py-0.5"><Truck size={11} /> {s.transportadora.replace("correios-", "").toUpperCase()}</span>
                    <span className="flex items-center gap-1 rounded-full bg-plum-50 px-2 py-0.5 font-mono">{s.trackingCode}</span>
                    {s.destinoCidade && <span className="flex items-center gap-1 rounded-full bg-plum-50 px-2 py-0.5"><MapPin size={11} /> {s.destinoCidade}{s.destinoEstado ? ` - ${s.destinoEstado}` : ""}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <button onClick={() => notifyCliente(s)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow transition ${s.clienteNotificado ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`} title="Enviar código de rastreio">
                    <MessageCircle size={13} /> {s.clienteNotificado ? "Reenviar" : "Notificar cliente"}
                  </button>
                  <button onClick={() => setEditing(s)} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50" title="Editar"><Pencil size={16} /></button>
                  <button onClick={() => { if (confirm("Excluir este envio?")) shipping.deleteShipment(s.id); }} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10" title="Excluir"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Actions row */}
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-plum-50 pt-3">
                {(["aguardando", "postado", "em_transito", "entregue", "problema"] as ShipmentStatus[]).map((st) => {
                  const active = s.status === st;
                  const m = STATUS_META[st];
                  return (
                    <button
                      key={st}
                      onClick={() => shipping.advanceStatus(s.id, st)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold transition ${active ? `${m.bg} ${m.color} shadow-inner` : "border border-plum-100 bg-white text-plum-500 hover:bg-plum-50"}`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Histórico */}
              {s.historico.length > 0 && (
                <details className="mt-2 text-xs text-plum-900/60">
                  <summary className="cursor-pointer select-none py-1 font-medium text-plum-700">Ver histórico ({s.historico.length})</summary>
                  <ul className="mt-2 space-y-1 border-l-2 border-plum-100 pl-3">
                    {[...s.historico].reverse().map((h, i) => (
                      <li key={i}>
                        <p className="font-medium text-plum-800">{h.texto}</p>
                        <p className="text-[0.65rem] text-plum-900/45">{new Date(h.data).toLocaleString("pt-BR")}</p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
      </div>

      {(editing || creating) && (
        <ShipmentModal
          shipment={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(data) => {
            if (editing) shipping.updateShipment({ ...editing, ...data });
            else {
              shipping.addShipment(data as any);
            }
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ShipmentModal({ shipment, onClose, onSave }: { shipment: Shipment | null; onClose: () => void; onSave: (data: Partial<Shipment>) => void }) {
  const [form, setForm] = useState({
    clienteNome: shipment?.clienteNome || "",
    clienteTelefone: shipment?.clienteTelefone || "",
    clienteEmail: shipment?.clienteEmail || "",
    produto: shipment?.produto || "",
    destinoCep: shipment?.destinoCep || "",
    destinoCidade: shipment?.destinoCidade || "",
    destinoEstado: shipment?.destinoEstado || "",
    transportadora: shipment?.transportadora || ("correios-pac" as Shipment["transportadora"]),
    trackingCode: shipment?.trackingCode || generateTrackingCode(),
    status: shipment?.status || ("aguardando" as ShipmentStatus),
    observacoes: shipment?.observacoes || "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Modal title={shipment ? "Editar envio" : "Novo envio"} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do cliente" full>
          <input value={form.clienteNome} onChange={(e) => set("clienteNome", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Telefone (WhatsApp)">
          <input value={form.clienteTelefone} onChange={(e) => set("clienteTelefone", e.target.value)} placeholder="(17) 98765-4321" className={inputCls} />
        </Field>
        <Field label="E-mail (opcional)">
          <input value={form.clienteEmail} onChange={(e) => set("clienteEmail", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Produto" full>
          <input value={form.produto} onChange={(e) => set("produto", e.target.value)} className={inputCls} />
        </Field>
        <Field label="CEP destino">
          <input value={form.destinoCep} onChange={(e) => set("destinoCep", e.target.value)} placeholder="00000-000" className={inputCls} />
        </Field>
        <Field label="Cidade">
          <input value={form.destinoCidade} onChange={(e) => set("destinoCidade", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Estado (UF)">
          <input value={form.destinoEstado} onChange={(e) => set("destinoEstado", e.target.value)} maxLength={2} className={inputCls} />
        </Field>
        <Field label="Transportadora">
          <select value={form.transportadora} onChange={(e) => set("transportadora", e.target.value as Shipment["transportadora"])} className={inputCls}>
            <option value="correios-pac">Correios - PAC</option>
            <option value="correios-sedex">Correios - SEDEX</option>
            <option value="correios-mini">Correios - Mini Envios</option>
            <option value="outra">Outra</option>
          </select>
        </Field>
        <Field label="Código de rastreio" full>
          <div className="flex gap-2">
            <input value={form.trackingCode} onChange={(e) => set("trackingCode", e.target.value)} className={inputCls} />
            <button type="button" onClick={() => set("trackingCode", generateTrackingCode())} className="shrink-0 rounded-xl border border-plum-200 bg-plum-50 px-3 py-2 text-xs font-medium text-plum-700 hover:bg-plum-100" title="Gerar novo código">
              <RefreshCw size={14} />
            </button>
          </div>
          <p className="mt-1 text-[0.65rem] text-plum-900/50">Você também pode colar o código real dos Correios (ex: BR123456789BR)</p>
        </Field>
        <Field label="Status inicial" full>
          <select value={form.status} onChange={(e) => set("status", e.target.value as ShipmentStatus)} className={inputCls}>
            <option value="aguardando">Aguardando envio</option>
            <option value="postado">Postado</option>
            <option value="em_transito">Em trânsito</option>
            <option value="entregue">Entregue</option>
            <option value="problema">Ocorrência</option>
          </select>
        </Field>
        <Field label="Observações" full>
          <textarea rows={2} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} className={inputCls} />
        </Field>
      </div>
      <ModalFooter onCancel={onClose} onSave={() => onSave(form)} disabled={!form.clienteNome || !form.clienteTelefone || !form.produto || !form.trackingCode} />
    </Modal>
  );
}

function generateTrackingCode() {
  const num = String(Math.floor(100000000 + Math.random() * 900000000));
  return `OD${num}BR`;
}

// ============ PAGAMENTOS ============

function PaymentsTab({ settings }: { settings: ReturnType<typeof useSettings> }) {
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [creating, setCreating] = useState(false);

  const moveUp = (id: string) => {
    const idx = settings.paymentMethods.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    const ids = settings.paymentMethods.map((p) => p.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    settings.reorderPayments(ids);
  };
  const moveDown = (id: string) => {
    const idx = settings.paymentMethods.findIndex((p) => p.id === id);
    if (idx === -1 || idx === settings.paymentMethods.length - 1) return;
    const ids = settings.paymentMethods.map((p) => p.id);
    [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
    settings.reorderPayments(ids);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-plum-800">Formas de Pagamento</h2>
          <p className="text-sm text-plum-900/55">Ative, edite e ordene os métodos exibidos no site.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-full bg-plum-700 px-5 py-2.5 text-sm text-cream-50 hover:bg-plum-800">
          <Plus size={16} /> Nova forma
        </button>
      </header>

      {/* Chave PIX */}
      <div className="rounded-2xl border border-plum-100 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-semibold text-plum-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-700 text-cream-50">⚡</span> Chave PIX (exibida no carrinho e na página de pagamento)
        </label>
        <input
          value={settings.pixKey}
          onChange={(e) => settings.setPixKey(e.target.value)}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className={`${inputCls} mt-3`}
        />
      </div>

      {/* Banner topo */}
      <div className="rounded-2xl border border-plum-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-plum-800">
            <Sparkles size={16} className="text-gold-600" /> Banner do topo (site inteiro)
          </label>
          <label className="flex items-center gap-2 text-xs text-plum-700">
            <input type="checkbox" checked={settings.banner.enabled} onChange={(e) => settings.setBanner({ ...settings.banner, enabled: e.target.checked })} />
            Ativo
          </label>
        </div>
        <input
          value={settings.banner.text}
          onChange={(e) => settings.setBanner({ ...settings.banner, text: e.target.value })}
          placeholder="Texto do banner (ex: Frete grátis acima de R$ 199)"
          className={`${inputCls} mt-3`}
        />
      </div>

      {/* Lista de métodos */}
      <div className="grid gap-3">
        {settings.paymentMethods.map((m, i) => (
          <div key={m.id} className={`rounded-2xl border p-4 shadow-sm transition ${m.enabled ? "border-plum-100 bg-white" : "border-plum-100 bg-cream-50 opacity-70"}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 sm:flex-1">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream-50 text-3xl">{m.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-serif text-lg font-semibold text-plum-800">{m.name}</p>
                    {m.featured && <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-gold-700">Destaque</span>}
                    {!m.enabled && <span className="rounded-full bg-plum-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-plum-500">Desativado</span>}
                  </div>
                  <p className="text-xs text-plum-900/60">{m.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[0.65rem]">
                    {m.installments && <span className="rounded-full bg-plum-100 px-2 py-0.5 text-plum-700">{m.installments}</span>}
                    {m.discount && <span className="rounded-full bg-sage-400/20 px-2 py-0.5 text-sage-600">{m.discount}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1">
                <button onClick={() => moveUp(m.id)} disabled={i === 0} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50 disabled:opacity-30" title="Subir"><ArrowUp size={16} /></button>
                <button onClick={() => moveDown(m.id)} disabled={i === settings.paymentMethods.length - 1} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50 disabled:opacity-30" title="Descer"><ArrowDown size={16} /></button>
                <button onClick={() => settings.updatePayment({ ...m, enabled: !m.enabled })} className={`rounded-lg p-2 hover:bg-plum-50 ${m.enabled ? "text-sage-600" : "text-plum-400"}`} title={m.enabled ? "Desativar" : "Ativar"}>
                  {m.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => setEditing(m)} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50" title="Editar"><Pencil size={16} /></button>
                <button onClick={() => { if (confirm(`Excluir "${m.name}"?`)) settings.deletePayment(m.id); }} className="rounded-lg p-2 text-rose-deep hover:bg-rose-deep/10" title="Excluir"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <PaymentModal
          method={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(data) => {
            if (editing) settings.updatePayment({ ...editing, ...data });
            else settings.addPayment(data);
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({ method, onClose, onSave }: { method: PaymentMethod | null; onClose: () => void; onSave: (data: Omit<PaymentMethod, "id">) => void }) {
  const [form, setForm] = useState({
    name: method?.name || "",
    icon: method?.icon || "💳",
    description: method?.description || "",
    installments: method?.installments || "",
    discount: method?.discount || "",
    featured: method?.featured || false,
    enabled: method?.enabled ?? true,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  const ICON_OPTIONS = ["⚡", "💳", "🧾", "💵", "🏦", "💰", "📱", "🪙", "💎", "🎁"];

  return (
    <Modal title={method ? "Editar forma de pagamento" : "Nova forma de pagamento"} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" full>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: PIX" className={inputCls} />
        </Field>
        <Field label="Ícone (emoji)" full>
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => set("icon", ic)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition ${form.icon === ic ? "border-plum-600 bg-plum-100 shadow-inner" : "border-plum-100 bg-white hover:border-plum-300"}`}
              >
                {ic}
              </button>
            ))}
            <input value={form.icon} onChange={(e) => set("icon", e.target.value)} className="w-14 rounded-xl border border-plum-200 bg-cream-50 px-2 py-2 text-center text-xl" maxLength={2} />
          </div>
        </Field>
        <Field label="Descrição" full>
          <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ex: Aprovação imediata via chave PIX" className={inputCls} />
        </Field>
        <Field label="Parcelamento (opcional)">
          <input value={form.installments} onChange={(e) => set("installments", e.target.value)} placeholder="Ex: Até 3x sem juros" className={inputCls} />
        </Field>
        <Field label="Desconto (opcional)">
          <input value={form.discount} onChange={(e) => set("discount", e.target.value)} placeholder="Ex: 5% off" className={inputCls} />
        </Field>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-plum-700">
            <input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} />
            Exibir esta forma no site
          </label>
          <label className="flex items-center gap-2 text-sm text-plum-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Marcar como recomendado (aparece com destaque dourado)
          </label>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={() => onSave(form)} disabled={!form.name.trim()} />
    </Modal>
  );
}

// ============ CONFIGURAÇÕES DA LOJA ============

function ConfigTab({ settings }: { settings: ReturnType<typeof useSettings> }) {
  const { log } = useActivity();
  const toast = useToast();

  // Snapshot inicial para dirty tracking
  const [baseline] = useState(() => JSON.stringify(settings.storeConfig));
  const [draft, setDraft] = useState(() => settings.storeConfig);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(draft) !== baseline;
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings.storeConfig);

  // Reflete mudanças externas (ex: restaurar padrões)
  useEffect(() => {
    if (!hasChanges) setDraft(settings.storeConfig);
  }, [settings.storeConfig, hasChanges]);

  const upd = (patch: Partial<typeof draft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    setSaving(true);
    // Pequeno delay para sensação de persistência
    setTimeout(() => {
      settings.setStoreConfig(draft);
      setLastSavedAt(Date.now());
      setSaving(false);
      log("settings.updated", "Configurações da loja salvas", "Identidade, canais, operação e recursos.");
      toast.success("Configurações salvas", "As mudanças já estão refletidas no site.");
    }, 400);
  };

  const handleDiscard = () => {
    setDraft(settings.storeConfig);
    toast.info("Alterações descartadas");
  };

  const handleReset = () => {
    if (!confirm("Restaurar todas as configurações para os valores padrão? Suas alterações serão perdidas.")) return;
    const defaults = {
      storeName: "Odoyá Ervas de Aruanda",
      ownerName: "Jéssica Oliveira",
      city: "Barretos", state: "SP", cep: "14780-000",
      whatsappPhone: "5517981771556",
      instagram: "https://www.instagram.com/odoyaervasdearuanda/",
      email: "odoyaervasdearuanda@gmail.com",
      businessHours: "Seg a Sex · 9h às 18h\nSáb · 9h às 13h",
      shippingDays: "Despachamos em até 1 dia útil após confirmação.",
      freeShippingThreshold: 199,
      welcomeMessage: "Olá! Que bom ter você por aqui 🌿 Como posso te ajudar a escolher a composição ideal hoje?",
      instagramFeed: true,
      testimonialsEnabled: true,
      monthlyGoal: 8000,
      glossaryEnabled: true,
      ritualOfDayEnabled: true,
    };
    setDraft(defaults as typeof draft);
    settings.setStoreConfig(defaults as typeof draft);
    log("settings.updated", "Configurações restauradas para padrão");
    toast.warning("Padrões restaurados");
  };

  const cfg = draft;

  return (
    <div className="space-y-6 pb-28">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-plum-400">Preferências</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-plum-950 md:text-4xl">Configurações da loja</h1>
          <p className="mt-1 text-sm text-plum-600">
            Tudo que aparece no site em um só lugar.
            {lastSavedAt && (
              <span className="ml-2 inline-flex items-center gap-1 text-[0.7rem] text-sage-700">
                <CheckCircle2 size={11} /> Salvo {timeAgo(lastSavedAt)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-300/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-gold-700 ring-1 ring-inset ring-gold-400/50">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
              Alterações não salvas
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-plum-200 bg-white px-4 py-2 text-sm font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50"
          >
            <RotateCcw size={14} /> Restaurar padrões
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 rounded-lg bg-plum-900 px-5 py-2 text-sm font-bold text-cream-50 shadow-md transition hover:bg-plum-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-cream-50/30 border-t-cream-50" /> Salvando…</> : <><Save size={14} /> Salvar alterações</>}
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        {/* Formulário */}
        <div className="space-y-5">
          <Card title="Identidade" icon={<ShieldCheck size={18} />} subtitle="Como sua loja aparece para o cliente">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome da loja"><input value={cfg.storeName} onChange={(e) => upd({ storeName: e.target.value })} className={inputCls} /></Field>
              <Field label="Responsável"><input value={cfg.ownerName} onChange={(e) => upd({ ownerName: e.target.value })} className={inputCls} /></Field>
              <Field label="Cidade"><input value={cfg.city} onChange={(e) => upd({ city: e.target.value })} className={inputCls} /></Field>
              <Field label="Estado (UF)"><input value={cfg.state} onChange={(e) => upd({ state: e.target.value })} maxLength={2} className={inputCls} /></Field>
              <Field label="CEP"><input value={cfg.cep} onChange={(e) => upd({ cep: e.target.value })} placeholder="14780-000" className={inputCls} /></Field>
              <Field label="E-mail de contato"><input value={cfg.email} onChange={(e) => upd({ email: e.target.value })} className={inputCls} /></Field>
            </div>
          </Card>

          <Card title="Contato & canais" icon={<MessageCircle size={18} />} subtitle="Usados em botões e rodapé">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="WhatsApp (com DDI, só números)"><input value={cfg.whatsappPhone} onChange={(e) => upd({ whatsappPhone: e.target.value.replace(/\D/g, "") })} placeholder="5517981771556" className={inputCls} /></Field>
              <Field label="Instagram (URL completa)"><input value={cfg.instagram} onChange={(e) => upd({ instagram: e.target.value })} className={inputCls} /></Field>
            </div>
          </Card>

          <Card title="Operação" icon={<Clock size={18} />} subtitle="Horários e regras de envio">
            <Field label="Horário de atendimento"><textarea rows={2} value={cfg.businessHours} onChange={(e) => upd({ businessHours: e.target.value })} className={inputCls} /></Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Prazo de despacho"><input value={cfg.shippingDays} onChange={(e) => upd({ shippingDays: e.target.value })} className={inputCls} /></Field>
              <Field label="Frete grátis a partir de R$">
                <input type="number" min={0} step="0.01" value={cfg.freeShippingThreshold} onChange={(e) => upd({ freeShippingThreshold: parseFloat(e.target.value) || 0 })} className={inputCls} />
              </Field>
            </div>
          </Card>

          <Card title="Mensagem padrão do WhatsApp" icon={<Send size={18} />} subtitle="Enviada quando o cliente abre o chat pela primeira vez">
            <textarea rows={3} value={cfg.welcomeMessage} onChange={(e) => upd({ welcomeMessage: e.target.value })} className={inputCls} />
          </Card>

          <Card title="Recursos exibidos no site" icon={<Sparkles size={18} />} subtitle="Ligue ou desligue blocos da home">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Feed do Instagram" checked={cfg.instagramFeed} onChange={(v) => upd({ instagramFeed: v })} />
              <Toggle label="Seção de depoimentos" checked={cfg.testimonialsEnabled} onChange={(v) => upd({ testimonialsEnabled: v })} />
              <Toggle label="Glossário de ervas" checked={cfg.glossaryEnabled} onChange={(v) => upd({ glossaryEnabled: v })} />
              <Toggle label="Ritual do dia (lua)" checked={cfg.ritualOfDayEnabled} onChange={(v) => upd({ ritualOfDayEnabled: v })} />
            </div>
          </Card>

          <Card title="Meta de faturamento mensal" icon={<Target size={18} />} subtitle="Acompanhe no dashboard como anda o mês">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meta mensal (R$)">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={cfg.monthlyGoal}
                  onChange={(e) => upd({ monthlyGoal: parseFloat(e.target.value) || 0 })}
                  className={inputCls}
                />
              </Field>
              <div className="rounded-xl border border-dashed border-plum-200 bg-cream-50/50 p-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-wider text-plum-500">Sobre a meta</p>
                <p className="mt-1 text-xs text-plum-700/80">
                  Aparece como uma barra de progresso no Dashboard, comparando receita aprovada do mês com este valor.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pré-visualização */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-plum-100 bg-cream-50 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-rose-deep/60" />
              <span className="h-2 w-2 rounded-full bg-gold-500/60" />
              <span className="h-2 w-2 rounded-full bg-sage-500/60" />
              <span className="ml-2 text-[0.65rem] font-semibold uppercase tracking-wider text-plum-500">Pré-visualização · odoya.com.br</span>
            </div>
            <div className="bg-plum-900 px-4 py-2 text-center text-[0.7rem] font-medium text-cream-50">
              🚚 Frete grátis acima de R$ {cfg.freeShippingThreshold.toFixed(2).replace(".", ",")} · {cfg.city}/{cfg.state}
            </div>
            <div className="bg-cream-50 p-5">
              <p className="font-display text-2xl font-semibold text-plum-900">{cfg.storeName}</p>
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-gold-600">{cfg.city} · {cfg.state}</p>
              <div className="mt-3 space-y-1 text-[0.7rem] text-plum-800/70">
                <p className="flex items-center gap-2"><MessageCircle size={11} className="text-sage-500" /> +{cfg.whatsappPhone.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, "($1) $2 $3-$4")}</p>
                <p className="flex items-center gap-2"><Clock size={11} className="text-gold-600" /> {cfg.businessHours.split("\n")[0]}</p>
                <p className="flex items-center gap-2"><Truck size={11} className="text-plum-600" /> {cfg.shippingDays}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-plum-100 bg-white p-5 shadow-sm">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-plum-500">Mensagem de boas-vindas</p>
            <div className="mt-3 rounded-xl rounded-bl-sm bg-sage-400/15 p-3 text-sm text-plum-900">
              {cfg.welcomeMessage || <span className="text-plum-400 italic">sem mensagem</span>}
            </div>
            <p className="mt-2 text-[0.65rem] text-plum-500">Aparece no primeiro contato via WhatsApp.</p>
          </div>

          <div className="rounded-2xl border border-gold-300/30 bg-gradient-to-br from-gold-300/15 to-plum-100/10 p-5 shadow-sm">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-gold-700">Status de salvamento</p>
            <div className="mt-2 flex items-center gap-2">
              {dirty ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gold-500" />
                  <span className="text-sm font-semibold text-plum-900">Alterações pendentes</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} className="text-sage-600" />
                  <span className="text-sm font-semibold text-plum-900">
                    {lastSavedAt ? `Salvo ${timeAgo(lastSavedAt)}` : "Sem alterações"}
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-plum-700/75">
              Clique em <strong>Salvar alterações</strong> no topo da página (ou use a barra flutuante abaixo) para aplicar no site.
            </p>
          </div>
        </aside>
      </div>

      {/* Barra flutuante de salvar — aparece só quando há alterações não salvas */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ${
          hasChanges ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"
        }`}
      >
        <div className="mx-auto mb-4 max-w-4xl rounded-2xl border border-gold-400/40 bg-plum-950/95 px-5 py-3.5 text-cream-50 shadow-2xl backdrop-blur-md md:px-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/20 text-gold-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
              </span>
              <div>
                <p className="font-display text-sm font-bold">Alterações não salvas</p>
                <p className="text-[0.7rem] text-cream-100/60">Revise os campos e confirme para publicar no site.</p>
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                onClick={handleDiscard}
                className="flex-1 rounded-lg border border-cream-100/20 bg-transparent px-4 py-2 text-sm font-semibold text-cream-50 transition hover:bg-cream-100/10 sm:flex-initial"
              >
                Descartar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-2 text-sm font-bold text-plum-950 shadow-lg shadow-gold-500/30 transition hover:bg-gold-300 disabled:opacity-60 sm:flex-initial"
              >
                {saving ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-plum-950/30 border-t-plum-950" /> Salvando…</> : <><Save size={14} /> Salvar alterações</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, subtitle, children }: { title: string; icon: React.ReactNode; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-plum-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum-900 text-gold-300">{icon}</span>
        <div>
          <h3 className="font-display text-xl font-semibold text-plum-900">{title}</h3>
          {subtitle && <p className="text-[0.7rem] text-plum-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${checked ? "border-plum-500 bg-plum-50 text-plum-900" : "border-plum-100 bg-white text-plum-600 hover:bg-plum-50/50"}`}
      aria-pressed={checked}
    >
      <span className="font-medium">{label}</span>
      <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? "bg-plum-700" : "bg-plum-200"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </span>
    </button>
  );
}
