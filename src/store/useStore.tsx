import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS as SEED, CATEGORIES as SEED_CATS, type Product } from "../data/products";

type StoreState = {
  products: Product[];
  categories: string[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: string) => void;
  deleteCategory: (c: string) => void;
  resetAll: () => void;
};

const StoreContext = createContext<StoreState | null>(null);

const LS_PRODUCTS = "odoya_products_v1";
const LS_CATS = "odoya_categories_v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Migra produtos antigos do localStorage, garantindo os novos campos
function migrateProducts(raw: any[]): Product[] {
  if (!Array.isArray(raw)) return SEED;
  return raw.map((p) => {
    const seed = SEED.find((s) => s.id === p?.id);
    const merged = {
      price: 18, costPrice: 0, stock: 20, minStock: 5, image: "", benefits: [] as string[],
      available: true, color: "#7f4d9c", emoji: "🕯️", weight: "Pacote com 5 varetas",
      name: "", category: "Incensos Artesanais", short: "", description: "", usage: "",
      ...(seed ?? {}),
      ...(p ?? {}),
    } as Product;
    // Reassegurar campos que podem ter vindo como undefined no spread
    if (typeof merged.price !== "number") merged.price = seed?.price ?? 18;
    if (typeof merged.costPrice !== "number") merged.costPrice = seed?.costPrice ?? 0;
    if (typeof merged.stock !== "number") merged.stock = seed?.stock ?? 20;
    if (typeof merged.minStock !== "number") merged.minStock = seed?.minStock ?? 5;
    if (typeof merged.image !== "string") merged.image = seed?.image ?? "";
    if (!Array.isArray(merged.benefits)) merged.benefits = seed?.benefits ?? [];
    if (typeof merged.available !== "boolean") merged.available = true;
    return merged;
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = load<any[]>(LS_PRODUCTS, SEED);
    return migrateProducts(raw);
  });
  const [categories, setCategories] = useState<string[]>(() => load(LS_CATS, SEED_CATS));

  useEffect(() => {
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(LS_CATS, JSON.stringify(categories));
  }, [categories]);

  const addProduct = (p: Product) => setProducts((prev) => [p, ...prev]);
  const updateProduct = (p: Product) =>
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deleteProduct = (id: string) =>
    setProducts((prev) => prev.filter((x) => x.id !== id));
  const addCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev : [...prev, c]));
  const deleteCategory = (c: string) =>
    setCategories((prev) => prev.filter((x) => x !== c));
  const resetAll = () => {
    setProducts(SEED);
    setCategories(SEED_CATS);
  };

  return (
    <StoreContext.Provider
      value={{ products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, resetAll }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
