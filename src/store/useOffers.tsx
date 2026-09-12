import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type OfferKind = "product" | "kit";
export type OfferBadge = "Oferta da semana" | "Condição especial" | "Enquanto durar o estoque" | "";

export type CommercialOffer = {
  id: string;
  enabled: boolean;
  kind: OfferKind;
  /** ID real do produto ou kit. */
  referenceId: string;
  title: string;
  description: string;
  /** Opcional: se vazio, usa o preço real calculado do item. */
  originalPrice?: number;
  /** Opcional: só existe promoção quando explicitamente preenchido e menor que o original. */
  promotionalPrice?: number;
  validUntil?: string;
  image?: string;
  cta: string;
  badge: OfferBadge;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type OfferCtx = {
  offers: CommercialOffer[];
  activeOffer: CommercialOffer | null;
  addOffer: (offer: Omit<CommercialOffer, "id" | "createdAt" | "updatedAt">) => CommercialOffer;
  updateOffer: (offer: CommercialOffer) => void;
  deleteOffer: (id: string) => void;
  setFeatured: (id: string) => void;
};

// V1 inicia vazio: não exibe promoção sem configuração real.
const KEY = "odoya_offers_v1";
const Ctx = createContext<OfferCtx | null>(null);

function load(): CommercialOffer[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isOfferValid(offer: CommercialOffer) {
  if (!offer.enabled || !offer.featured) return false;
  if (!offer.validUntil) return true;
  const end = new Date(`${offer.validUntil}T23:59:59`).getTime();
  return Number.isFinite(end) && end >= Date.now();
}

export function OffersProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<CommercialOffer[]>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(offers));
  }, [offers]);

  const addOffer = useCallback((data: Omit<CommercialOffer, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const offer: CommercialOffer = {
      ...data,
      id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    setOffers((prev) => [offer, ...prev.map((item) => data.featured ? { ...item, featured: false } : item)]);
    return offer;
  }, []);

  const updateOffer = useCallback((offer: CommercialOffer) => {
    setOffers((prev) => prev.map((item) => {
      if (item.id === offer.id) return { ...offer, updatedAt: new Date().toISOString() };
      return offer.featured ? { ...item, featured: false } : item;
    }));
  }, []);

  const deleteOffer = useCallback((id: string) => setOffers((prev) => prev.filter((offer) => offer.id !== id)), []);

  const setFeatured = useCallback((id: string) => {
    setOffers((prev) => prev.map((offer) => ({ ...offer, featured: offer.id === id, updatedAt: new Date().toISOString() })));
  }, []);

  const activeOffer = useMemo(() => offers.find(isOfferValid) ?? null, [offers]);
  const value = useMemo(() => ({ offers, activeOffer, addOffer, updateOffer, deleteOffer, setFeatured }), [offers, activeOffer, addOffer, updateOffer, deleteOffer, setFeatured]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOffers() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOffers must be used within OffersProvider");
  return ctx;
}