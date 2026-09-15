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
  { id: "pix", name: "PIX", icon: "⚡", description: "Aprovação imediata via chave PIX.", discount: "5% off", featured: true, enabled: true },
  { id: "cartao", name: "Cartão de Crédito", icon: "💳", description: "Visa, Mastercard, Elo, Hipercard.", installments: "Até 3x sem juros", enabled: true },
  { id: "boleto", name: "Boleto Bancário", icon: "🧾", description: "Compensação em 1 a 3 dias úteis.", enabled: true },
  { id: "dinheiro", name: "Dinheiro (retirada)", icon: "💵", description: "Pagamento na retirada no ateliê em Barretos.", enabled: true },
  { id: "transferencia", name: "Transferência Bancária", icon: "🏦", description: "TED/DOC para conta cadastrada.", enabled: false },
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
  welcomeMessage: "Olá! Que bom ter você por aqui 🌿 Como posso te ajudar a escolher a composição ideal hoje?",
  instagramFeed: true,
  testimonialsEnabled: true,
  monthlyGoal: 8000,
  glossaryEnabled: true,
  ritualOfDayEnabled: true,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const remote = useRemoteState("settings", {
    paymentMethods: SEED_PAYMENTS, banner: SEED_BANNER, pixKey: "odoyaervasdearuanda@gmail.com",
    aboutText: "A Odoyá Ervas de Aruanda é uma incensaria artesanal criada em Barretos-SP por Jéssica Oliveira. Cada incenso, banho e defumação é preparado à mão, com ervas selecionadas, fé e propósito. Enviamos para todo o Brasil.",
    storeConfig: SEED_CONFIG,
  }, { poll: true });
  const { paymentMethods, banner, pixKey, aboutText, storeConfig } = remote.value;
  const setPaymentMethods = (update: (previous: PaymentMethod[]) => PaymentMethod[]) => remote.setValue((previous) => ({ ...previous, paymentMethods: update(previous.paymentMethods) }));
  const setBanner = (banner: SiteBanner) => remote.setValue((previous) => ({ ...previous, banner }));
  const setPixKey = (pixKey: string) => remote.setValue((previous) => ({ ...previous, pixKey }));
  const setAboutText = (aboutText: string) => remote.setValue((previous) => ({ ...previous, aboutText }));
  const setStoreConfig = (patch: Partial<StoreConfig>) => remote.setValue((previous) => ({ ...previous, storeConfig: { ...previous.storeConfig, ...patch } }));

  const addPayment: SettingsState["addPayment"] = (p) => setPaymentMethods((prev) => [...prev, { ...p, id: "pay-" + Date.now().toString(36) }]);
  const updatePayment: SettingsState["updatePayment"] = (p) => setPaymentMethods((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deletePayment: SettingsState["deletePayment"] = (id) => setPaymentMethods((prev) => prev.filter((x) => x.id !== id));
  const reorderPayments: SettingsState["reorderPayments"] = (ids) => {
    setPaymentMethods((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      return ids.map((id) => map.get(id)!).filter(Boolean);
    });
  };

  return (
    <Ctx.Provider
      value={{
        paymentMethods, addPayment, updatePayment, deletePayment, reorderPayments,
        banner, setBanner,
        pixKey, setPixKey,
        aboutText, setAboutText,
        storeConfig, setStoreConfig,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSettings must be inside SettingsProvider");
  return c;
}
