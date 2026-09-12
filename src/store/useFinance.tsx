import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Venda = {
  id: string;
  clienteNome: string;
  clienteEmail?: string;
  produto: string;
  quantidade: number;
  valor: number;
  status: "pendente" | "aprovado" | "enviado" | "concluido" | "cancelado";
  pagamento: "pix" | "boleto" | "dinheiro" | "cartao" | "outro";
  data: string; // ISO
  observacoes?: string;
};

export type DespesaCategoria =
  | "Insumos e matéria-prima"
  | "Embalagens"
  | "Frete e logística"
  | "Marketing e divulgação"
  | "Equipamentos e ferramentas"
  | "Taxas e impostos"
  | "Assinaturas e serviços"
  | "Outros";

export const DESPESA_CATEGORIAS: DespesaCategoria[] = [
  "Insumos e matéria-prima",
  "Embalagens",
  "Frete e logística",
  "Marketing e divulgação",
  "Equipamentos e ferramentas",
  "Taxas e impostos",
  "Assinaturas e serviços",
  "Outros",
];

export type Despesa = {
  id: string;
  descricao: string;
  categoria: DespesaCategoria;
  valor: number;
  data: string; // ISO
  fornecedor?: string;
  pagamento: "pix" | "boleto" | "dinheiro" | "cartao" | "outro";
  recorrente?: boolean;
  observacoes?: string;
};

type FinCtx = {
  vendas: Venda[];
  addVenda: (v: Omit<Venda, "id">) => void;
  updateVenda: (v: Venda) => void;
  deleteVenda: (id: string) => void;
  reset: () => void;

  despesas: Despesa[];
  addDespesa: (d: Omit<Despesa, "id">) => void;
  updateDespesa: (d: Despesa) => void;
  deleteDespesa: (id: string) => void;
  resetDespesas: () => void;
};

// Chaves versionadas: o projeto agora começa do zero, sem dados fictícios.
const LS_KEY = "odoya_vendas_v2";
const LS_KEY_DESPESAS = "odoya_despesas_v1";
const Ctx = createContext<FinCtx | null>(null);

function load<T>(k: string, f: T): T { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch { return f; } }

// A operação real começa agora — nenhuma venda ou despesa de exemplo.
const SEED_VENDAS: Venda[] = [];
const SEED_DESPESAS: Despesa[] = [];

function migrateVendas(raw: any[]): Venda[] {
  if (!Array.isArray(raw)) return SEED_VENDAS;
  return raw
    .filter((v) => v && typeof v === "object")
    .map((v) => ({
      id: v.id ?? "v_" + Math.random().toString(36).slice(2, 8),
      clienteNome: typeof v.clienteNome === "string" ? v.clienteNome : "Cliente",
      clienteEmail: typeof v.clienteEmail === "string" ? v.clienteEmail : undefined,
      produto: typeof v.produto === "string" ? v.produto : "Produto",
      quantidade: typeof v.quantidade === "number" && v.quantidade > 0 ? v.quantidade : 1,
      valor: typeof v.valor === "number" && !isNaN(v.valor) ? v.valor : 0,
      status: (["pendente", "aprovado", "enviado", "concluido", "cancelado"].includes(v.status) ? v.status : "pendente") as Venda["status"],
      pagamento: (["pix", "boleto", "dinheiro", "cartao", "outro"].includes(v.pagamento) ? v.pagamento : "pix") as Venda["pagamento"],
      data: typeof v.data === "string" && !isNaN(Date.parse(v.data)) ? v.data : new Date().toISOString(),
      observacoes: typeof v.observacoes === "string" ? v.observacoes : undefined,
    }));
}

function migrateDespesas(raw: any[]): Despesa[] {
  if (!Array.isArray(raw)) return SEED_DESPESAS;
  return raw
    .filter((d) => d && typeof d === "object")
    .map((d) => ({
      id: d.id ?? "d_" + Math.random().toString(36).slice(2, 8),
      descricao: typeof d.descricao === "string" ? d.descricao : "Despesa",
      categoria: (DESPESA_CATEGORIAS.includes(d.categoria) ? d.categoria : "Outros") as DespesaCategoria,
      valor: typeof d.valor === "number" && !isNaN(d.valor) ? d.valor : 0,
      data: typeof d.data === "string" && !isNaN(Date.parse(d.data)) ? d.data : new Date().toISOString(),
      fornecedor: typeof d.fornecedor === "string" ? d.fornecedor : undefined,
      pagamento: (["pix", "boleto", "dinheiro", "cartao", "outro"].includes(d.pagamento) ? d.pagamento : "pix") as Despesa["pagamento"],
      recorrente: !!d.recorrente,
      observacoes: typeof d.observacoes === "string" ? d.observacoes : undefined,
    }));
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [vendas, setVendas] = useState<Venda[]>(() => migrateVendas(load<any[]>(LS_KEY, SEED_VENDAS)));
  const [despesas, setDespesas] = useState<Despesa[]>(() => migrateDespesas(load<any[]>(LS_KEY_DESPESAS, SEED_DESPESAS)));

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(vendas)); }, [vendas]);
  useEffect(() => { localStorage.setItem(LS_KEY_DESPESAS, JSON.stringify(despesas)); }, [despesas]);

  const addVenda: FinCtx["addVenda"] = (v) => setVendas((p) => [{ ...v, id: "v_" + Date.now().toString(36) }, ...p]);
  const updateVenda: FinCtx["updateVenda"] = (v) => setVendas((p) => p.map((x) => x.id === v.id ? v : x));
  const deleteVenda: FinCtx["deleteVenda"] = (id) => setVendas((p) => p.filter((x) => x.id !== id));
  const reset = () => setVendas(SEED_VENDAS);

  const addDespesa: FinCtx["addDespesa"] = (d) => setDespesas((p) => [{ ...d, id: "d_" + Date.now().toString(36) }, ...p]);
  const updateDespesa: FinCtx["updateDespesa"] = (d) => setDespesas((p) => p.map((x) => x.id === d.id ? d : x));
  const deleteDespesa: FinCtx["deleteDespesa"] = (id) => setDespesas((p) => p.filter((x) => x.id !== id));
  const resetDespesas = () => setDespesas(SEED_DESPESAS);

  return (
    <Ctx.Provider value={{ vendas, addVenda, updateVenda, deleteVenda, reset, despesas, addDespesa, updateDespesa, deleteDespesa, resetDespesas }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFinance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFinance must be inside provider");
  return c;
}
