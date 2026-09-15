import { createContext, useContext, type ReactNode } from "react";
import { PRODUCTS as SEED, CATEGORIES as SEED_CATS, type Product } from "../data/products";
import { useRemoteState } from "../data/remoteState";

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

export function StoreProvider({ children }: { children: ReactNode }) {
  const remote = useRemoteState("catalog", { products: SEED, categories: SEED_CATS }, { poll: true });
  const products = remote.value.products;
  const categories = remote.value.categories;
  const setProducts = (updater: (previous: Product[]) => Product[]) => remote.setValue((previous) => ({ ...previous, products: updater(previous.products) }));
  const setCategories = (updater: (previous: string[]) => string[]) => remote.setValue((previous) => ({ ...previous, categories: updater(previous.categories) }));

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
    remote.setValue({ products: SEED, categories: SEED_CATS });
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
