import { createContext, useContext, type ReactNode } from "react";
import { useRemoteState } from "../data/remoteState";

export type PaymentMethod = {
  id: string;
  name: string;
  icon: string; // emoji ou lucide name
  description: string;
  installments?: string;
  discount?: string;
  featured?: boolean;
  enabled: boolean;
};

export type SiteBanner = {
  enabled: boolean;
  text: string;
  cta?: string;
  ctaLink?: string;
};

export type StoreConfig = {
  storeName: string;
  ownerName: string;
  city: string;
  state: string;
  cep: string;
  whatsappPhone: string; // dígitos
  instagram: string;
  email: string;
  businessHours: string; // texto livre
  shippingDays: string; // ex: "Seg a Sex, até 14h"
  freeShippingThreshold: number;
  welcomeMessage: string; // mensagem padrão WhatsApp
  instagramFeed: boolean;
  testimonialsEnabled: boolean;
  monthlyGoal: number; // meta de faturamento mensal em BRL
  glossaryEnabled: boolean;
  ritualOfDayEnabled: boolean;
};

type SettingsData = {
  paymentMethods: PaymentMethod[];
  banner: SiteBanner;
  pixKey: string;
  aboutText: string;
  storeConfig: StoreConfig;
};

type SettingsState = {
  paymentMethods: PaymentMethod[];
  addPayment: (p: Omit<PaymentMethod, "id">) => void;
  updatePayment: (p: PaymentMethod) => void;
  deletePayment: (id: string) => void;
  reorderPayments: (ids: string[]) => void;

  banner: SiteBanner;
  setBanner: (b: SiteBanner) => void;

  pixKey: string;
  setPixKey: (v: string) => void;

  aboutText: string;
  setAboutText: (v: string) => void;

  storeConfig: StoreConfig;
  setStoreConfig: (patch: Partial<StoreConfig>) => void;
};

const Ctx = createContext<SettingsState | null>(null);

export const SEED_PAYMENTS: PaymentMethod[] = [
  {
    id: "pix",
    name: "PIX",
    icon: "⚡",
    description: "Aprovação imediata via chave PIX.",
    discount: "5% off",
    featured: true,
    enabled: true,
  },
  {
    id: "cartao",
    name: "Cartão de Crédito",
    icon: "💳",
    description: "Visa, Mastercard, Elo, Hipercard.",
    installments: "Até 3x sem juros",
    enabled: true,
  },
  {
    id: "boleto",
    name: "Boleto Bancário",
    icon: "🧾",
    description: "Compensação em 1 a 3 dias úteis.",
    enabled: true,
  },
  {
    id: "dinheiro",
    name: "Dinheiro (retirada)",
    icon: "💵",
    description: "Pagamento na retirada no ateliê em Barretos.",
    enabled: true,
  },
  {
    id: "transferencia",
    name: "Transferência Bancária",
    icon: "🏦",
    description: "TED/DOC para conta cadastrada.",
    enabled: false,
  },
];

export const SEED_BANNER: SiteBanner = {
  enabled: true,
  text: "🚚 Frete grátis nas compras acima de R$ 199 · Enviamos para todo o Brasil",
};

export const SEED_CONFIG: StoreConfig = {
  storeName: "Odoyá Ervas de Aruanda",
  ownerName: "Jéssica Oliveira",
  city: "Barretos",
  state: "SP",
  cep: "14780-000",
  whatsappPhone: "5517981771556",
  instagram: "https://www.instagram.com/odoyaervasdearuanda/",
  email: "odoyaervasdearuanda@gmail.com",
  businessHours: "Seg a Sex · 9h às 18h\nSáb · 9h às 13h",
  shippingDays: "Despachamos em até 1 dia útil após confirmação.",
  freeShippingThreshold: 199,
  welcomeMessage:
    "Olá! Que bom ter você por aqui 🌿 Como posso te ajudar a escolher a composição ideal hoje?",
  instagramFeed: true,
  testimonialsEnabled: true,
  monthlyGoal: 8000,
  glossaryEnabled: true,
  ritualOfDayEnabled: true,
};

const SEED_SETTINGS: SettingsData = {
  paymentMethods: SEED_PAYMENTS,
  banner: SEED_BANNER,
  pixKey: "odoyaervasdearuanda@gmail.com",
  aboutText:
    "A Odoyá Ervas de Aruanda é uma incensaria artesanal criada em Barretos-SP por Jéssica Oliveira. Cada incenso, banho e defumação é preparado à mão, com ervas selecionadas, fé e propósito. Enviamos para todo o Brasil.",
  storeConfig: SEED_CONFIG,
};

function migrateSettings(raw: unknown): SettingsData {
  if (!raw || typeof raw !== "object") {
    return SEED_SETTINGS;
  }

  const data = raw as Partial<SettingsData>;

  const paymentMethods = Array.isArray(data.paymentMethods)
    ? data.paymentMethods.filter(
        (payment): payment is PaymentMethod =>
          Boolean(
            payment &&
              typeof payment === "object" &&
              typeof (payment as PaymentMethod).id === "string" &&
              typeof (payment as PaymentMethod).name === "string"
          )
      )
    : SEED_PAYMENTS;

  const banner: SiteBanner = {
    ...SEED_BANNER,
    ...(data.banner && typeof data.banner === "object"
      ? data.banner
      : {}),
  };

  const storeConfig: StoreConfig = {
    ...SEED_CONFIG,
    ...(data.storeConfig && typeof data.storeConfig === "object"
      ? data.storeConfig
      : {}),
  };

  // Migração silenciosa da grafia anterior do e-mail da marca.
  if (storeConfig.email === "odayaervasdearuanda@gmail.com") {
    storeConfig.email = "odoyaervasdearuanda@gmail.com";
  }

  return {
    paymentMethods:
      paymentMethods.length > 0 ? paymentMethods : SEED_PAYMENTS,
    banner,
    pixKey:
      typeof data.pixKey === "string"
        ? data.pixKey
        : SEED_SETTINGS.pixKey,
    aboutText:
      typeof data.aboutText === "string"
        ? data.aboutText
        : SEED_SETTINGS.aboutText,
    storeConfig,
  };
}

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const remote = useRemoteState<SettingsData>(
    "settings",
    SEED_SETTINGS,
    { poll: true }
  );

  const settings = migrateSettings(remote.value);

  const setSettings = (
    update: (previous: SettingsData) => SettingsData
  ) => {
    remote.setValue((previous) =>
      migrateSettings(update(migrateSettings(previous)))
    );
  };

  const setPaymentMethods = (
    update: (previous: PaymentMethod[]) => PaymentMethod[]
  ) => {
    setSettings((previous) => ({
      ...previous,
      paymentMethods: update(previous.paymentMethods),
    }));
  };

  const setBanner = (banner: SiteBanner) => {
    setSettings((previous) => ({
      ...previous,
      banner,
    }));
  };

  const setPixKey = (pixKey: string) => {
    setSettings((previous) => ({
      ...previous,
      pixKey,
    }));
  };

  const setAboutText = (aboutText: string) => {
    setSettings((previous) => ({
      ...previous,
      aboutText,
    }));
  };

  const setStoreConfig = (patch: Partial<StoreConfig>) => {
    setSettings((previous) => ({
      ...previous,
      storeConfig: {
        ...previous.storeConfig,
        ...patch,
      },
    }));
  };

  const addPayment: SettingsState["addPayment"] = (payment) => {
    setPaymentMethods((previous) => [
      ...previous,
      {
        ...payment,
        id: `pay-${Date.now().toString(36)}`,
      },
    ]);
  };

  const updatePayment: SettingsState["updatePayment"] = (payment) => {
    setPaymentMethods((previous) =>
      previous.map((item) =>
        item.id === payment.id ? payment : item
      )
    );
  };

  const deletePayment: SettingsState["deletePayment"] = (id) => {
    setPaymentMethods((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const reorderPayments: SettingsState["reorderPayments"] = (ids) => {
    setPaymentMethods((previous) => {
      const map = new Map(
        previous.map((payment) => [payment.id, payment])
      );

      return ids
        .map((id) => map.get(id))
        .filter((payment): payment is PaymentMethod => Boolean(payment));
    });
  };

  return (
    <Ctx.Provider
      value={{
        paymentMethods: settings.paymentMethods,
        addPayment,
        updatePayment,
        deletePayment,
        reorderPayments,

        banner: settings.banner,
        setBanner,

        pixKey: settings.pixKey,
        setPixKey,

        aboutText: settings.aboutText,
        setAboutText,

        storeConfig: settings.storeConfig,
        setStoreConfig,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const context = useContext(Ctx);

  if (!context) {
    throw new Error("useSettings must be inside SettingsProvider");
  }

  return context;
}