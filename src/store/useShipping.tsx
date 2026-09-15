import { createContext, useContext, type ReactNode } from "react";
import { useRemoteState } from "../data/remoteState";

export type ShipmentStatus =
  | "aguardando"
  | "postado"
  | "em_transito"
  | "entregue"
  | "problema";

export type Shipment = {
  id: string;
  vendaId?: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;
  produto: string;
  destinoCep?: string;
  destinoCidade?: string;
  destinoEstado?: string;
  transportadora:
    | "correios-pac"
    | "correios-sedex"
    | "correios-mini"
    | "outra";
  trackingCode: string;
  postadoEm?: string;
  atualizadoEm: string;
  status: ShipmentStatus;
  historico: {
    data: string;
    texto: string;
    status: ShipmentStatus;
  }[];
  observacoes?: string;
  clienteNotificado?: boolean;
  ultimaNotificacaoEm?: string;
};

type ShippingCtx = {
  shipments: Shipment[];
  addShipment: (
    s: Omit<Shipment, "id" | "atualizadoEm" | "historico">
  ) => Shipment;
  updateShipment: (s: Shipment) => void;
  deleteShipment: (id: string) => void;
  advanceStatus: (
    id: string,
    next: ShipmentStatus,
    nota?: string
  ) => void;
  markNotified: (id: string) => void;
  addHistoryEntry: (id: string, texto: string) => void;
  reset: () => void;
};

const Ctx = createContext<ShippingCtx | null>(null);

const SEED: Shipment[] = [];

function migrateShipments(raw: unknown): Shipment[] {
  if (!Array.isArray(raw)) return SEED;

  return raw
    .filter(
      (shipment) =>
        shipment && typeof shipment === "object"
    )
    .map((shipment: any) => ({
      id:
        typeof shipment.id === "string"
          ? shipment.id
          : "sh_" + Date.now().toString(36),

      vendaId:
        typeof shipment.vendaId === "string"
          ? shipment.vendaId
          : undefined,

      clienteNome:
        typeof shipment.clienteNome === "string"
          ? shipment.clienteNome
          : "Cliente",

      clienteTelefone:
        typeof shipment.clienteTelefone === "string"
          ? shipment.clienteTelefone
          : "",

      clienteEmail:
        typeof shipment.clienteEmail === "string"
          ? shipment.clienteEmail
          : undefined,

      produto:
        typeof shipment.produto === "string"
          ? shipment.produto
          : "Produto",

      destinoCep:
        typeof shipment.destinoCep === "string"
          ? shipment.destinoCep
          : undefined,

      destinoCidade:
        typeof shipment.destinoCidade === "string"
          ? shipment.destinoCidade
          : undefined,

      destinoEstado:
        typeof shipment.destinoEstado === "string"
          ? shipment.destinoEstado
          : undefined,

      transportadora:
        [
          "correios-pac",
          "correios-sedex",
          "correios-mini",
          "outra",
        ].includes(shipment.transportadora)
          ? shipment.transportadora
          : "outra",

      trackingCode:
        typeof shipment.trackingCode === "string"
          ? shipment.trackingCode
          : "",

      postadoEm:
        typeof shipment.postadoEm === "string"
          ? shipment.postadoEm
          : undefined,

      atualizadoEm:
        typeof shipment.atualizadoEm === "string"
          ? shipment.atualizadoEm
          : new Date().toISOString(),

      status:
        [
          "aguardando",
          "postado",
          "em_transito",
          "entregue",
          "problema",
        ].includes(shipment.status)
          ? shipment.status
          : "aguardando",

      historico: Array.isArray(shipment.historico)
        ? shipment.historico
            .filter(
              (entry: any) =>
                entry &&
                typeof entry === "object"
            )
            .map((entry: any) => ({
              data:
                typeof entry.data === "string"
                  ? entry.data
                  : new Date().toISOString(),

              texto:
                typeof entry.texto === "string"
                  ? entry.texto
                  : "",

              status:
                [
                  "aguardando",
                  "postado",
                  "em_transito",
                  "entregue",
                  "problema",
                ].includes(entry.status)
                  ? entry.status
                  : "aguardando",
            }))
        : [],

      observacoes:
        typeof shipment.observacoes === "string"
          ? shipment.observacoes
          : undefined,

      clienteNotificado:
        Boolean(shipment.clienteNotificado),

      ultimaNotificacaoEm:
        typeof shipment.ultimaNotificacaoEm === "string"
          ? shipment.ultimaNotificacaoEm
          : undefined,
    }));
}

export function ShippingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const remote = useRemoteState<Shipment[]>(
    "shipments",
    SEED,
    { poll: true }
  );

  const shipments = migrateShipments(remote.value);

  const addShipment: ShippingCtx["addShipment"] = (s) => {
    const now = new Date().toISOString();

    const novo: Shipment = {
      ...s,
      id: "sh_" + Date.now().toString(36),
      atualizadoEm: now,
      historico: s.trackingCode
        ? [
            {
              data: now,
              texto:
                s.status === "postado"
                  ? "Objeto postado em Barretos - SP"
                  : "Envio registrado",
              status: s.status,
            },
          ]
        : [],
    };

    remote.setValue((previous) => [
      novo,
      ...migrateShipments(previous),
    ]);

    return novo;
  };

  const updateShipment: ShippingCtx["updateShipment"] = (
    s
  ) => {
    const updated = {
      ...s,
      atualizadoEm: new Date().toISOString(),
    };

    remote.setValue((previous) =>
      migrateShipments(previous).map((x) =>
        x.id === s.id ? updated : x
      )
    );
  };

  const deleteShipment: ShippingCtx["deleteShipment"] = (
    id
  ) => {
    remote.setValue((previous) =>
      migrateShipments(previous).filter(
        (x) => x.id !== id
      )
    );
  };

  const advanceStatus: ShippingCtx["advanceStatus"] = (
    id,
    next,
    nota
  ) => {
    const now = new Date().toISOString();

    remote.setValue((previous) =>
      migrateShipments(previous).map((s) => {
        if (s.id !== id) return s;

        const historico = [
          ...s.historico,
          {
            data: now,
            texto: nota || defaultNota(next),
            status: next,
          },
        ];

        return {
          ...s,
          status: next,
          historico,
          atualizadoEm: now,
        };
      })
    );
  };

  const addHistoryEntry: ShippingCtx["addHistoryEntry"] = (
    id,
    texto
  ) => {
    const now = new Date().toISOString();

    remote.setValue((previous) =>
      migrateShipments(previous).map((s) => {
        if (s.id !== id) return s;

        return {
          ...s,
          historico: [
            ...s.historico,
            {
              data: now,
              texto,
              status: s.status,
            },
          ],
          atualizadoEm: now,
        };
      })
    );
  };

  const markNotified: ShippingCtx["markNotified"] = (
    id
  ) => {
    const now = new Date().toISOString();

    remote.setValue((previous) =>
      migrateShipments(previous).map((s) =>
        s.id === id
          ? {
              ...s,
              clienteNotificado: true,
              ultimaNotificacaoEm: now,
            }
          : s
      )
    );
  };

  const reset = () => {
    remote.setValue(SEED);
  };

  return (
    <Ctx.Provider
      value={{
        shipments,
        addShipment,
        updateShipment,
        deleteShipment,
        advanceStatus,
        markNotified,
        addHistoryEntry,
        reset,
      }}
    >
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

  if (!c) {
    throw new Error(
      "useShipping must be inside ShippingProvider"
    );
  }

  return c;
}

export function trackingMessage(
  shipment: Shipment
): string {
  const firstName =
    shipment.clienteNome.split(" ")[0];

  const carrier = {
    "correios-pac": "PAC",
    "correios-sedex": "SEDEX",
    "correios-mini": "Mini Envios",
    outra: "Transportadora",
  }[shipment.transportadora];

  const statusLabel: Record<
    ShipmentStatus,
    string
  > = {
    aguardando: "aguardando envio",
    postado: "acabou de ser postado",
    em_transito: "está em trânsito",
    entregue: "foi entregue",
    problema: "com uma ocorrência",
  };

  const lines: string[] = [];

  lines.push(
    `Olá, ${firstName}! Aqui é da *Odoyá Ervas de Aruanda* 🌿`
  );

  lines.push("");

  lines.push(
    `Que alegria te avisar: seu pedido *${statusLabel[shipment.status]}*! ✨`
  );

  lines.push("");

  lines.push(
    `📦 *Produto:* ${shipment.produto}`
  );

  lines.push(
    `🚚 *Envio:* ${carrier} (Correios)`
  );

  lines.push(
    `🔎 *Código de rastreio:* ${shipment.trackingCode}`
  );

  lines.push("");

  lines.push(
    "Você pode acompanhar em tempo real pelo site dos Correios:"
  );

  lines.push(
    "https://www.correios.com.br/rastreamento"
  );

  lines.push("");

  lines.push(
    "Ou digite o código lá no site com carinho — vai amar acompanhar cada etapa. 💜"
  );

  lines.push("");

  lines.push(
    "Qualquer dúvida, é só me chamar por aqui! Obrigada pela confiança."
  );

  lines.push(
    "*Jéssica* · Odoyá Ervas de Aruanda"
  );

  return lines.join("\n");
}