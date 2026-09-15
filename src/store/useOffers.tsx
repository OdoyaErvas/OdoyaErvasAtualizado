import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRemoteState } from "../data/remoteState";

export type OfferKind = "product" | "kit";

export type OfferBadge =
  | "Oferta da semana"
  | "Condição especial"
  | "Enquanto durar o estoque"
  | "";

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
  addOffer: (
    offer: Omit<CommercialOffer, "id" | "createdAt" | "updatedAt">
  ) => CommercialOffer;
  updateOffer: (offer: CommercialOffer) => void;
  deleteOffer: (id: string) => void;
  setFeatured: (id: string) => void;
};

const Ctx = createContext<OfferCtx | null>(null);

function migrateOffers(raw: unknown): CommercialOffer[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((offer) => offer && typeof offer === "object")
    .map((offer: any) => ({
      id:
        typeof offer.id === "string"
          ? offer.id
          : `offer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,

      enabled: Boolean(offer.enabled),

      kind:
        offer.kind === "kit"
          ? "kit"
          : "product",

      referenceId:
        typeof offer.referenceId === "string"
          ? offer.referenceId
          : "",

      title:
        typeof offer.title === "string"
          ? offer.title
          : "",

      description:
        typeof offer.description === "string"
          ? offer.description
          : "",

      originalPrice:
        typeof offer.originalPrice === "number"
          ? offer.originalPrice
          : undefined,

      promotionalPrice:
        typeof offer.promotionalPrice === "number"
          ? offer.promotionalPrice
          : undefined,

      validUntil:
        typeof offer.validUntil === "string"
          ? offer.validUntil
          : undefined,

      image:
        typeof offer.image === "string"
          ? offer.image
          : undefined,

      cta:
        typeof offer.cta === "string"
          ? offer.cta
          : "Ver produto",

      badge:
        offer.badge === "Oferta da semana" ||
        offer.badge === "Condição especial" ||
        offer.badge === "Enquanto durar o estoque"
          ? offer.badge
          : "",

      featured: Boolean(offer.featured),

      createdAt:
        typeof offer.createdAt === "string"
          ? offer.createdAt
          : new Date().toISOString(),

      updatedAt:
        typeof offer.updatedAt === "string"
          ? offer.updatedAt
          : new Date().toISOString(),
    }));
}

function isOfferValid(offer: CommercialOffer) {
  if (!offer.enabled || !offer.featured) return false;

  if (!offer.validUntil) return true;

  const end = new Date(
    `${offer.validUntil}T23:59:59`
  ).getTime();

  return Number.isFinite(end) && end >= Date.now();
}

export function OffersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const remote = useRemoteState<CommercialOffer[]>(
    "offers",
    [],
    { poll: true }
  );

  const offers = migrateOffers(remote.value);

  const addOffer = useCallback(
    (
      data: Omit<
        CommercialOffer,
        "id" | "createdAt" | "updatedAt"
      >
    ) => {
      const now = new Date().toISOString();

      const offer: CommercialOffer = {
        ...data,
        id: `offer-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };

      remote.setValue((previous) => {
        const current = migrateOffers(previous);

        return [
          offer,
          ...current.map((item) =>
            data.featured
              ? { ...item, featured: false }
              : item
          ),
        ];
      });

      return offer;
    },
    [remote]
  );

  const updateOffer = useCallback(
    (offer: CommercialOffer) => {
      remote.setValue((previous) => {
        const current = migrateOffers(previous);

        return current.map((item) => {
          if (item.id === offer.id) {
            return {
              ...offer,
              updatedAt: new Date().toISOString(),
            };
          }

          return offer.featured
            ? { ...item, featured: false }
            : item;
        });
      });
    },
    [remote]
  );

  const deleteOffer = useCallback(
    (id: string) => {
      remote.setValue((previous) =>
        migrateOffers(previous).filter(
          (offer) => offer.id !== id
        )
      );
    },
    [remote]
  );

  const setFeatured = useCallback(
    (id: string) => {
      remote.setValue((previous) =>
        migrateOffers(previous).map((offer) => ({
          ...offer,
          featured: offer.id === id,
          updatedAt: new Date().toISOString(),
        }))
      );
    },
    [remote]
  );

  const activeOffer = useMemo(
    () => offers.find(isOfferValid) ?? null,
    [offers]
  );

  const value = useMemo(
    () => ({
      offers,
      activeOffer,
      addOffer,
      updateOffer,
      deleteOffer,
      setFeatured,
    }),
    [
      offers,
      activeOffer,
      addOffer,
      updateOffer,
      deleteOffer,
      setFeatured,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useOffers() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error(
      "useOffers must be used within OffersProvider"
    );
  }

  return ctx;
}