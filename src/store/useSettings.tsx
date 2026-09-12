import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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

const LS_PAY = "odoya_payments_v1";
const LS_BANNER = "odoya_banner_v1";
const LS_PIX = "odoya_pix_v1";
const LS_ABOUT = "odoya_about_v1";

const SEED_PAYMENTS: PaymentMethod[] = [
  { id: "pix", name: "PIX", icon: "⚡", description: "Aprovação imediata via chave PIX.", discount: "5% off", featured: true, enabled: true },
  { id: "cartao", name: "Cartão de Crédito", icon: "💳", description: "Visa, Mastercard, Elo, Hipercard.", installments: "Até 3x sem juros", enabled: true },
  { id: "boleto", name: "Boleto Bancário", icon: "🧾", description: "Compensação em 1 a 3 dias úteis.", enabled: true },
  { id: "dinheiro", name: "Dinheiro (retirada)", icon: "💵", description: "Pagamento na retirada no ateliê em Barretos.", enabled: true },
  { id: "transferencia", name: "Transferência Bancária", icon: "🏦", description: "TED/DOC para conta cadastrada.", enabled: false },
];

const SEED_BANNER: SiteBanner = {
  enabled: true,
  text: "🚚 Frete grátis nas compras acima de R$ 199 · Enviamos para todo o Brasil",
};

const LS_CONFIG = "odoya_store_config_v1";
const SEED_CONFIG: StoreConfig = {
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

function load<T>(k: string, f: T): T {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : f;
  } catch {
    return f;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => load(LS_PAY, SEED_PAYMENTS));
  const [banner, setBanner] = useState<SiteBanner>(() => load(LS_BANNER, SEED_BANNER));
  const [pixKey, setPixKey] = useState<string>(() => load(LS_PIX, "odoyaervasdearuanda@gmail.com"));
  const [aboutText, setAboutText] = useState<string>(() =>
    load(
      LS_ABOUT,
      "A Odoyá Ervas de Aruanda é uma incensaria artesanal criada em Barretos-SP por Jéssica Oliveira. Cada incenso, banho e defumação é preparado à mão, com ervas selecionadas, fé e propósito. Enviamos para todo o Brasil."
    )
  );
  const [storeConfig, setStoreConfigState] = useState<StoreConfig>(() => {
    const saved = load<Partial<StoreConfig>>(LS_CONFIG, {});
    // Migração silenciosa da grafia anterior do e-mail da marca.
    if (saved.email === "odayaervasdearuanda@gmail.com") {
      saved.email = "odoyaervasdearuanda@gmail.com";
    }
    return { ...SEED_CONFIG, ...saved };
  });

  useEffect(() => localStorage.setItem(LS_PAY, JSON.stringify(paymentMethods)), [paymentMethods]);
  useEffect(() => localStorage.setItem(LS_BANNER, JSON.stringify(banner)), [banner]);
  useEffect(() => localStorage.setItem(LS_PIX, JSON.stringify(pixKey)), [pixKey]);
  useEffect(() => localStorage.setItem(LS_ABOUT, JSON.stringify(aboutText)), [aboutText]);
  useEffect(() => localStorage.setItem(LS_CONFIG, JSON.stringify(storeConfig)), [storeConfig]);

  const setStoreConfig = (patch: Partial<StoreConfig>) => setStoreConfigState((prev) => ({ ...prev, ...patch }));

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
