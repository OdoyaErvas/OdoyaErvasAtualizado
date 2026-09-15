import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRemoteState } from "../data/remoteState";

export type Review = {
  id: string;
  /** Nome real ou abreviado autorizado pelo cliente. */
  name: string;
  city?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  /** ID do produto existente no catálogo. */
  productId: string;
  date: string;
  verified?: boolean;
  /** Fotos reais autorizadas pelo cliente (Data URL ou URL pública). */
  photos?: string[];
  published: boolean;
};

type ReviewCtx = {
  reviews: Review[];
  published: Review[];
  addReview: (review: Omit<Review, "id">) => Review;
  updateReview: (review: Review) => void;
  deleteReview: (id: string) => void;
  publishReview: (id: string, value: boolean) => void;
};

const Ctx = createContext<ReviewCtx | null>(null);

function migrateReviews(raw: unknown): Review[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((review) => review && typeof review === "object")
    .map((review: any) => ({
      id:
        typeof review.id === "string"
          ? review.id
          : `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,

      name:
        typeof review.name === "string"
          ? review.name
          : "Cliente",

      city:
        typeof review.city === "string"
          ? review.city
          : undefined,

      rating:
        [1, 2, 3, 4, 5].includes(review.rating)
          ? review.rating
          : 5,

      comment:
        typeof review.comment === "string"
          ? review.comment
          : "",

      productId:
        typeof review.productId === "string"
          ? review.productId
          : "",

      date:
        typeof review.date === "string"
          ? review.date
          : new Date().toISOString(),

      verified:
        Boolean(review.verified),

      photos:
        Array.isArray(review.photos)
          ? review.photos.filter(
              (photo: unknown) => typeof photo === "string"
            )
          : undefined,

      published:
        Boolean(review.published),
    }));
}

export function ReviewsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const remote = useRemoteState<Review[]>(
    "reviews",
    [],
    { poll: true }
  );

  const reviews = migrateReviews(remote.value);

  const addReview = useCallback(
    (data: Omit<Review, "id">) => {
      const review: Review = {
        ...data,
        id: `rev-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
      };

      remote.setValue((previous) => [
        review,
        ...migrateReviews(previous),
      ]);

      return review;
    },
    [remote]
  );

  const updateReview = useCallback(
    (review: Review) => {
      remote.setValue((previous) =>
        migrateReviews(previous).map((item) =>
          item.id === review.id ? review : item
        )
      );
    },
    [remote]
  );

  const deleteReview = useCallback(
    (id: string) => {
      remote.setValue((previous) =>
        migrateReviews(previous).filter(
          (item) => item.id !== id
        )
      );
    },
    [remote]
  );

  const publishReview = useCallback(
    (id: string, value: boolean) => {
      remote.setValue((previous) =>
        migrateReviews(previous).map((item) =>
          item.id === id
            ? { ...item, published: value }
            : item
        )
      );
    },
    [remote]
  );

  const published = useMemo(
    () => reviews.filter((review) => review.published),
    [reviews]
  );

  const value = useMemo(
    () => ({
      reviews,
      published,
      addReview,
      updateReview,
      deleteReview,
      publishReview,
    }),
    [
      reviews,
      published,
      addReview,
      updateReview,
      deleteReview,
      publishReview,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error(
      "useReviews must be used within ReviewsProvider"
    );
  }

  return ctx;
}

export function reviewStats(reviews: Review[]) {
  const count = reviews.length;

  const average = count
    ? reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      ) / count
    : 0;

  const distribution = [5, 4, 3, 2, 1].map(
    (rating) => ({
      rating,
      count: reviews.filter(
        (review) => review.rating === rating
      ).length,
    })
  );

  return {
    count,
    average,
    distribution,
  };
}