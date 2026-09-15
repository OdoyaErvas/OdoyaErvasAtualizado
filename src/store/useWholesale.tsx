import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useRemoteState } from "../data/remoteState";

export type WholesaleSegment =
  | "Loja física"
  | "Loja online"
  | "Terapeuta / clínica"
  | "Espaço holístico"
  | "Terreiro / casa espiritual"
  | "Hotel / pousada"
  | "Outro";

export type WholesaleStatus =
  | "novo"
  | "contato"
  | "proposta"
  | "aprovado"
  | "pausado"
  | "recusado";

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
  createLead: (
    lead: Omit<
      WholesaleLead,
      "id" | "createdAt" | "updatedAt" | "status" | "notes"
    >
  ) => WholesaleLead;
  updateLead: (lead: WholesaleLead) => void;
  updateStatus: (
    id: string,
    status: WholesaleStatus
  ) => void;
  deleteLead: (id: string) => void;
  markContacted: (id: string) => void;
  clearAll: () => void;
};

const Ctx = createContext<WholesaleCtx | null>(null);

const SEED: WholesaleLead[] = [];

function migrateLeads(raw: unknown): WholesaleLead[] {
  if (!Array.isArray(raw)) return SEED;

  return raw.filter(
    (lead): lead is WholesaleLead =>
      Boolean(
        lead &&
          typeof lead === "object" &&
          typeof (lead as WholesaleLead).id === "string"
      )
  );
}

export function WholesaleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const remote = useRemoteState<WholesaleLead[]>(
    "wholesale",
    SEED,
    { poll: true }
  );

  const leads = migrateLeads(remote.value);

  const createLead = useCallback(
    (
      data: Omit<
        WholesaleLead,
        "id" | "createdAt" | "updatedAt" | "status" | "notes"
      >
    ) => {
      const now = new Date().toISOString();

      const lead: WholesaleLead = {
        ...data,
        id: `atacado-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
        status: "novo",
        notes: "",
        assignedTo: "Jéssica O.",
      };

      remote.setValue((previous) => [
        lead,
        ...migrateLeads(previous),
      ]);

      return lead;
    },
    [remote]
  );

  const updateLead = useCallback(
    (lead: WholesaleLead) => {
      remote.setValue((previous) =>
        migrateLeads(previous).map((x) =>
          x.id === lead.id
            ? {
                ...lead,
                updatedAt: new Date().toISOString(),
              }
            : x
        )
      );
    },
    [remote]
  );

  const updateStatus = useCallback(
    (id: string, status: WholesaleStatus) => {
      const now = new Date().toISOString();

      remote.setValue((previous) =>
        migrateLeads(previous).map((x) =>
          x.id === id
            ? {
                ...x,
                status,
                updatedAt: now,
              }
            : x
        )
      );
    },
    [remote]
  );

  const deleteLead = useCallback(
    (id: string) => {
      remote.setValue((previous) =>
        migrateLeads(previous).filter(
          (x) => x.id !== id
        )
      );
    },
    [remote]
  );

  const markContacted = useCallback(
    (id: string) => {
      const now = new Date().toISOString();

      remote.setValue((previous) =>
        migrateLeads(previous).map((x) =>
          x.id === id
            ? {
                ...x,
                status:
                  x.status === "novo"
                    ? "contato"
                    : x.status,
                lastContactAt: now,
                updatedAt: now,
              }
            : x
        )
      );
    },
    [remote]
  );

  const clearAll = useCallback(() => {
    remote.setValue([]);
  }, [remote]);

  const value = useMemo(
    () => ({
      leads,
      createLead,
      updateLead,
      updateStatus,
      deleteLead,
      markContacted,
      clearAll,
    }),
    [
      leads,
      createLead,
      updateLead,
      updateStatus,
      deleteLead,
      markContacted,
      clearAll,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useWholesale() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error(
      "useWholesale must be used within WholesaleProvider"
    );
  }

  return ctx;
}

export const WHOLESALE_STATUS: Record<
  WholesaleStatus,
  { label: string; color: string }
> = {
  novo: {
    label: "Novo",
    color: "gold",
  },
  contato: {
    label: "Em contato",
    color: "plum",
  },
  proposta: {
    label: "Proposta",
    color: "info",
  },
  aprovado: {
    label: "Parceiro",
    color: "sage",
  },
  pausado: {
    label: "Pausado",
    color: "neutral",
  },
  recusado: {
    label: "Não avançou",
    color: "rose",
  },
};