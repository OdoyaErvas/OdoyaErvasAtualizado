import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type WholesaleSegment =
  | "Loja física"
  | "Loja online"
  | "Terapeuta / clínica"
  | "Espaço holístico"
  | "Terreiro / casa espiritual"
  | "Hotel / pousada"
  | "Outro";

export type WholesaleStatus = "novo" | "contato" | "proposta" | "aprovado" | "pausado" | "recusado";

export type WholesaleLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  segment: WholesaleSegment;
  channels: string[];
  volume: string;
  message: string;
  consent: boolean;
  status: WholesaleStatus;
  notes: string;
  lastContactAt?: string;
  assignedTo?: string;
};

type WholesaleCtx = {
  leads: WholesaleLead[];
  createLead: (lead: Omit<WholesaleLead, "id" | "createdAt" | "updatedAt" | "status" | "notes">) => WholesaleLead;
  updateLead: (lead: WholesaleLead) => void;
  updateStatus: (id: string, status: WholesaleStatus) => void;
  deleteLead: (id: string) => void;
  markContacted: (id: string) => void;
  clearAll: () => void;
};

// Chave versionada: a operação real começa agora, sem leads de exemplo.
const KEY = "odoya_wholesale_v2";
const Ctx = createContext<WholesaleCtx | null>(null);

const SEED: WholesaleLead[] = [];

function load(): WholesaleLead[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch {
    return SEED;
  }
}

export function WholesaleProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<WholesaleLead[]>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(leads));
  }, [leads]);

  const createLead = useCallback((data: Omit<WholesaleLead, "id" | "createdAt" | "updatedAt" | "status" | "notes">) => {
    const now = new Date().toISOString();
    const lead: WholesaleLead = {
      ...data,
      id: `atacado-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      status: "novo",
      notes: "",
      assignedTo: "Jéssica O.",
    };
    setLeads((prev) => [lead, ...prev]);
    return lead;
  }, []);

  const updateLead = useCallback((lead: WholesaleLead) => {
    setLeads((prev) => prev.map((x) => x.id === lead.id ? { ...lead, updatedAt: new Date().toISOString() } : x));
  }, []);

  const updateStatus = useCallback((id: string, status: WholesaleStatus) => {
    setLeads((prev) => prev.map((x) => x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x));
  }, []);

  const deleteLead = useCallback((id: string) => setLeads((prev) => prev.filter((x) => x.id !== id)), []);

  const markContacted = useCallback((id: string) => {
    const now = new Date().toISOString();
    setLeads((prev) => prev.map((x) => x.id === id ? { ...x, status: x.status === "novo" ? "contato" : x.status, lastContactAt: now, updatedAt: now } : x));
  }, []);

  const clearAll = useCallback(() => setLeads([]), []);

  const value = useMemo(() => ({ leads, createLead, updateLead, updateStatus, deleteLead, markContacted, clearAll }), [leads, createLead, updateLead, updateStatus, deleteLead, markContacted, clearAll]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWholesale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWholesale must be used within WholesaleProvider");
  return ctx;
}

export const WHOLESALE_STATUS: Record<WholesaleStatus, { label: string; color: string }> = {
  novo: { label: "Novo", color: "gold" },
  contato: { label: "Em contato", color: "plum" },
  proposta: { label: "Proposta", color: "info" },
  aprovado: { label: "Parceiro", color: "sage" },
  pausado: { label: "Pausado", color: "neutral" },
  recusado: { label: "Não avançou", color: "rose" },
};