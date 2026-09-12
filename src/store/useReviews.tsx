import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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

// V2 inicia vazio: nenhuma avaliação fictícia é carregada.
const KEY = "odoya_reviews_v2";
const Ctx = createContext<ReviewCtx | null>(null);

function load(): Review[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(reviews));
  }, [reviews]);

  const addReview = useCallback((data: Omit<Review, "id">) => {
    const review: Review = { ...data, id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    setReviews((prev) => [review, ...prev]);
    return review;
  }, []);

  const updateReview = useCallback((review: Review) => {
    setReviews((prev) => prev.map((item) => item.id === review.id ? review : item));
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const publishReview = useCallback((id: string, value: boolean) => {
    setReviews((prev) => prev.map((item) => item.id === id ? { ...item, published: value } : item));
  }, []);

  const published = useMemo(() => reviews.filter((review) => review.published), [reviews]);
  const value = useMemo(() => ({ reviews, published, addReview, updateReview, deleteReview, publishReview }), [reviews, published, addReview, updateReview, deleteReview, publishReview]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReviews() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
}

export function reviewStats(reviews: Review[]) {
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));
  return { count, average, distribution };
}