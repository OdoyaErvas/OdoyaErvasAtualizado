import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ShipmentStatus = "aguardando" | "postado" | "em_transito" | "entregue" | "problema";

export type Shipment = {
  id: string;
  vendaId?: string;
  clienteNome: string;
  clienteTelefone: string; // no formato só dígitos
  clienteEmail?: string;
  produto: string;
  destinoCep?: string;
  destinoCidade?: string;
  destinoEstado?: string;
  transportadora: "correios-pac" | "correios-sedex" | "correios-mini" | "outra";
  trackingCode: string;
  postadoEm?: string;
  atualizadoEm: string;
  status: ShipmentStatus;
  historico: { data: string; texto: string; status: ShipmentStatus }[];
  observacoes?: string;
  clienteNotificado?: boolean;
  ultimaNotificacaoEm?: string;
};

type ShippingCtx = {
  shipments: Shipment[];
  addShipment: (s: Omit<Shipment, "id" | "atualizadoEm" | "historico">) => Shipment;
  updateShipment: (s: Shipment) => void;
  deleteShipment: (id: string) => void;
  advanceStatus: (id: string, next: ShipmentStatus, nota?: string) => void;
  markNotified: (id: string) => void;
  addHistoryEntry: (id: string, texto: string) => void;
  reset: () => void;
};

// Chave versionada: a operação real começa agora, sem envios de exemplo.
const LS_KEY = "odoya_shipments_v2";
const Ctx = createContext<ShippingCtx | null>(null);

function load<T>(k: string, f: T): T {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : f;
  } catch {
    return f;
  }
}

const SEED: Shipment[] = [];

export function ShippingProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(() => load(LS_KEY, SEED));

  useEffect(() => localStorage.setItem(LS_KEY, JSON.stringify(shipments)), [shipments]);

  const addShipment: ShippingCtx["addShipment"] = (s) => {
    const now = new Date().toISOString();
    const novo: Shipment = {
      ...s,
      id: "sh_" + Date.now().toString(36),
      atualizadoEm: now,
      historico: s.trackingCode ? [{ data: now, texto: s.status === "postado" ? "Objeto postado em Barretos - SP" : "Envio registrado", status: s.status }] : [],
    };
    setShipments((prev) => [novo, ...prev]);
    return novo;
  };

  const updateShipment: ShippingCtx["updateShipment"] = (s) => {
    const updated = { ...s, atualizadoEm: new Date().toISOString() };
    setShipments((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
  };

  const deleteShipment: ShippingCtx["deleteShipment"] = (id) => setShipments((prev) => prev.filter((x) => x.id !== id));

  const advanceStatus: ShippingCtx["advanceStatus"] = (id, next, nota) => {
    const now = new Date().toISOString();
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const historico = [
          ...s.historico,
          { data: now, texto: nota || defaultNota(next), status: next },
        ];
        return { ...s, status: next, historico, atualizadoEm: now };
      })
    );
  };

  const addHistoryEntry: ShippingCtx["addHistoryEntry"] = (id, texto) => {
    const now = new Date().toISOString();
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return { ...s, historico: [...s.historico, { data: now, texto, status: s.status }], atualizadoEm: now };
      })
    );
  };

  const markNotified: ShippingCtx["markNotified"] = (id) => {
    const now = new Date().toISOString();
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, clienteNotificado: true, ultimaNotificacaoEm: now } : s)));
  };

  const reset = () => setShipments(SEED);

  return (
    <Ctx.Provider value={{ shipments, addShipment, updateShipment, deleteShipment, advanceStatus, markNotified, addHistoryEntry, reset }}>
      {children}
    </Ctx.Provider>
  );
}

function defaultNota(status: ShipmentStatus): string {
  switch (status) {
    case "aguardando":
      return "Pedido aguardando preparação";
    case "postado":
      return "Objeto postado em Barretos - SP";
    case "em_transito":
      return "Objeto em trânsito para o destinatário";
    case "entregue":
      return "Objeto entregue ao destinatário";
    case "problema":
      return "Ocorrência registrada — em análise";
    default:
      return "Atualização de status";
  }
}

export function useShipping() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useShipping must be inside ShippingProvider");
  return c;
}

export function trackingMessage(shipment: Shipment): string {
  const firstName = shipment.clienteNome.split(" ")[0];
  const carrier = {
    "correios-pac": "PAC",
    "correios-sedex": "SEDEX",
    "correios-mini": "Mini Envios",
    outra: "Transportadora",
  }[shipment.transportadora];

  const statusLabel: Record<ShipmentStatus, string> = {
    aguardando: "aguardando envio",
    postado: "acabou de ser postado",
    em_transito: "está em trânsito",
    entregue: "foi entregue",
    problema: "com uma ocorrência",
  };

  const lines: string[] = [];
  lines.push(`Olá, ${firstName}! Aqui é da *Odoyá Ervas de Aruanda* 🌿`);
  lines.push("");
  lines.push(`Que alegria te avisar: seu pedido *${statusLabel[shipment.status]}*! ✨`);
  lines.push("");
  lines.push(`📦 *Produto:* ${shipment.produto}`);
  lines.push(`🚚 *Envio:* ${carrier} (Correios)`);
  lines.push(`🔎 *Código de rastreio:* ${shipment.trackingCode}`);
  lines.push("");
  lines.push(`Você pode acompanhar em tempo real pelo site dos Correios:`);
  lines.push(`https://www.correios.com.br/rastreamento`);
  lines.push("");
  lines.push(`Ou digite o código lá no site com carinho — vai amar acompanhar cada etapa. 💜`);
  lines.push("");
  lines.push(`Qualquer dúvida, é só me chamar por aqui! Obrigada pela confiança.`);
  lines.push(`*Jéssica* · Odoyá Ervas de Aruanda`);

  return lines.join("\n");
}
