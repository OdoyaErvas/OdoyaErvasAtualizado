import { createContext, useContext, type ReactNode } from "react";
import { PRODUCTS as SEED, CATEGORIES as SEED_CATS, type Product } from "../data/products";
import { useRemoteState } from "../data/remoteState";

type CatalogState = {
  products: Product[];
  categories: string[];
};

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

// Migra produtos antigos, garantindo que os campos atuais existam.
function migrateProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return SEED;

  return raw.map((p) => {
    const seed = SEED.find((s) => s.id === p?.id);

    const merged = {
      price: 18,
      costPrice: 0,
      stock: 20,
      minStock: 5,
      image: "",
      benefits: [] as string[],
      available: true,
      color: "#7f4d9c",
      emoji: "🕯",
      weight: "Pacote com 5 varetas",
      name: "",
      category: "Incensos Artesanais",
      short: "",
      description: "",
      usage: "",
      ...(seed ?? {}),
      ...(p ?? {}),
    } as Product;

    // Reassegura campos que podem ter vindo como undefined ou inválidos.
    if (typeof merged.price !== "number") {
      merged.price = seed?.price ?? 18;
    }

    if (typeof merged.costPrice !== "number") {
      merged.costPrice = seed?.costPrice ?? 0;
    }

    if (typeof merged.stock !== "number") {
      merged.stock = seed?.stock ?? 20;
    }

    if (typeof merged.minStock !== "number") {
      merged.minStock = seed?.minStock ?? 5;
    }

    if (typeof merged.image !== "string") {
      merged.image = seed?.image ?? "";
    }

    if (!Array.isArray(merged.benefits)) {
      merged.benefits = seed?.benefits ?? [];
    }

    if (typeof merged.available !== "boolean") {
      merged.available = true;
    }

    return merged;
  });
}

function migrateCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return SEED_CATS;

  const categories = raw.filter(
    (category): category is string => typeof category === "string"
  );

  return categories.length > 0 ? categories : SEED_CATS;
}

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const remote = useRemoteState<CatalogState>(
    "catalog",
    {
      products: SEED,
      categories: SEED_CATS,
    },
    { poll: true }
  );

  const products = migrateProducts(remote.value.products);
  const categories = migrateCategories(remote.value.categories);

  const setProducts = (
    updater: (previous: Product[]) => Product[]
  ) => {
    remote.setValue((previous) => ({
      ...previous,
      products: migrateProducts(
        updater(migrateProducts(previous.products))
      ),
    }));
  };

  const setCategories = (
    updater: (previous: string[]) => string[]
  ) => {
    remote.setValue((previous) => ({
      ...previous,
      categories: migrateCategories(
        updater(migrateCategories(previous.categories))
      ),
    }));
  };

  const addProduct = (product: Product) => {
    setProducts((previous) => [product, ...previous]);
  };

  const updateProduct = (product: Product) => {
    setProducts((previous) =>
      previous.map((item) =>
        item.id === product.id ? product : item
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const addCategory = (category: string) => {
    const normalized = category.trim();

    if (!normalized) return;

    setCategories((previous) => {
      if (previous.includes(normalized)) {
        return previous;
      }

      return [...previous, normalized];
    });
  };

  const deleteCategory = (category: string) => {
    setCategories((previous) =>
      previous.filter((item) => item !== category)
    );
  };

  const resetAll = () => {
    remote.setValue({
      products: SEED,
      categories: SEED_CATS,
    });
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        resetAll,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be inside StoreProvider");
  }

  return context;
}