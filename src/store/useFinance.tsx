import { createContext, useContext, type ReactNode } from "react";
import { useRemoteState } from "../data/remoteState";

export type Venda = {
  id: string;
  clienteNome: string;
  clienteEmail?: string;
  produto: string;
  quantidade: number;
  valor: number;
  status: "pendente" | "aprovado" | "enviado" | "concluido" | "cancelado";
  pagamento: "pix" | "boleto" | "dinheiro" | "cartao" | "outro";
  data: string;
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
  data: string;
  fornecedor?: string;
  pagamento: "pix" | "boleto" | "dinheiro" | "cartao" | "outro";
  recorrente?: boolean;
  observacoes?: string;
};

type FinanceState = {
  vendas: Venda[];
  despesas: Despesa[];
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

const Ctx = createContext<FinCtx | null>(null);

const SEED_VENDAS: Venda[] = [];
const SEED_DESPESAS: Despesa[] = [];

function migrateVendas(raw: unknown): Venda[] {
  if (!Array.isArray(raw)) return SEED_VENDAS;

  return raw
    .filter((v) => v && typeof v === "object")
    .map((v: any) => ({
      id: typeof v.id === "string"
        ? v.id
        : "v_" + Math.random().toString(36).slice(2, 8),

      clienteNome:
        typeof v.clienteNome === "string" ? v.clienteNome : "Cliente",

      clienteEmail:
        typeof v.clienteEmail === "string" ? v.clienteEmail : undefined,

      produto:
        typeof v.produto === "string" ? v.produto : "Produto",

      quantidade:
        typeof v.quantidade === "number" && v.quantidade > 0
          ? v.quantidade
          : 1,

      valor:
        typeof v.valor === "number" && !Number.isNaN(v.valor)
          ? v.valor
          : 0,

      status: (
        [
          "pendente",
          "aprovado",
          "enviado",
          "concluido",
          "cancelado",
        ].includes(v.status)
          ? v.status
          : "pendente"
      ) as Venda["status"],

      pagamento: (
        ["pix", "boleto", "dinheiro", "cartao", "outro"].includes(v.pagamento)
          ? v.pagamento
          : "pix"
      ) as Venda["pagamento"],

      data:
        typeof v.data === "string" && !Number.isNaN(Date.parse(v.data))
          ? v.data
          : new Date().toISOString(),

      observacoes:
        typeof v.observacoes === "string"
          ? v.observacoes
          : undefined,
    }));
}

function migrateDespesas(raw: unknown): Despesa[] {
  if (!Array.isArray(raw)) return SEED_DESPESAS;

  return raw
    .filter((d) => d && typeof d === "object")
    .map((d: any) => ({
      id: typeof d.id === "string"
        ? d.id
        : "d_" + Math.random().toString(36).slice(2, 8),

      descricao:
        typeof d.descricao === "string" ? d.descricao : "Despesa",

      categoria: (
        DESPESA_CATEGORIAS.includes(d.categoria)
          ? d.categoria
          : "Outros"
      ) as DespesaCategoria,

      valor:
        typeof d.valor === "number" && !Number.isNaN(d.valor)
          ? d.valor
          : 0,

      data:
        typeof d.data === "string" && !Number.isNaN(Date.parse(d.data))
          ? d.data
          : new Date().toISOString(),

      fornecedor:
        typeof d.fornecedor === "string"
          ? d.fornecedor
          : undefined,

      pagamento: (
        ["pix", "boleto", "dinheiro", "cartao", "outro"].includes(d.pagamento)
          ? d.pagamento
          : "pix"
      ) as Despesa["pagamento"],

      recorrente: !!d.recorrente,

      observacoes:
        typeof d.observacoes === "string"
          ? d.observacoes
          : undefined,
    }));
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const remote = useRemoteState<FinanceState>(
    "finance",
    {
      vendas: SEED_VENDAS,
      despesas: SEED_DESPESAS,
    },
    { poll: true }
  );

  const vendas = migrateVendas(remote.value.vendas);
  const despesas = migrateDespesas(remote.value.despesas);

  const setVendas = (updater: (previous: Venda[]) => Venda[]) => {
    remote.setValue((previous) => ({
      ...previous,
      vendas: updater(migrateVendas(previous.vendas)),
    }));
  };

  const setDespesas = (updater: (previous: Despesa[]) => Despesa[]) => {
    remote.setValue((previous) => ({
      ...previous,
      despesas: updater(migrateDespesas(previous.despesas)),
    }));
  };

  const addVenda: FinCtx["addVenda"] = (v) => {
    setVendas((previous) => [
      {
        ...v,
        id: "v_" + Date.now().toString(36),
      },
      ...previous,
    ]);
  };

  const updateVenda: FinCtx["updateVenda"] = (v) => {
    setVendas((previous) =>
      previous.map((item) =>
        item.id === v.id ? v : item
      )
    );
  };

  const deleteVenda: FinCtx["deleteVenda"] = (id) => {
    setVendas((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const reset = () => {
    remote.setValue((previous) => ({
      ...previous,
      vendas: SEED_VENDAS,
    }));
  };

  const addDespesa: FinCtx["addDespesa"] = (d) => {
    setDespesas((previous) => [
      {
        ...d,
        id: "d_" + Date.now().toString(36),
      },
      ...previous,
    ]);
  };

  const updateDespesa: FinCtx["updateDespesa"] = (d) => {
    setDespesas((previous) =>
      previous.map((item) =>
        item.id === d.id ? d : item
      )
    );
  };

  const deleteDespesa: FinCtx["deleteDespesa"] = (id) => {
    setDespesas((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const resetDespesas = () => {
    remote.setValue((previous) => ({
      ...previous,
      despesas: SEED_DESPESAS,
    }));
  };

  return (
    <Ctx.Provider
      value={{
        vendas,
        addVenda,
        updateVenda,
        deleteVenda,
        reset,
        despesas,
        addDespesa,
        updateDespesa,
        deleteDespesa,
        resetDespesas,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useFinance() {
  const context = useContext(Ctx);

  if (!context) {
    throw new Error("useFinance must be inside provider");
  }

  return context;
}