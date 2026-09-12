import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Product } from "../data/products";

export type CartItem = { product: Product; quantity: number };

type CartCtx = {
  items: CartItem[];
  addItem: (p: Product) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, q: number) => void;
  updateQuantity: (id: string, q: number) => void;
  incQuantity: (id: string) => void;
  decQuantity: (id: string) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;

  // Presente
  giftWrap: boolean;
  setGiftWrap: (v: boolean) => void;
  giftCardMessage: string;
  setGiftCardMessage: (v: string) => void;
};

const LS_KEY = "odoya_cart_v1";
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const r = localStorage.getItem(LS_KEY);
      return r ? JSON.parse(r) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (p: Product) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === p.id);
      if (existing) return prev.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { product: p, quantity: 1 }];
    });

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));

  const setQuantity = (id: string, q: number) =>
    setItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, q) } : i)));

  // alias
  const updateQuantity = setQuantity;

  const incQuantity = (id: string) =>
    setItems((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i)));

  const decQuantity = (id: string) =>
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );

  const [giftWrap, setGiftWrap] = useState(false);
  const [giftCardMessage, setGiftCardMessage] = useState("");

  const clear = () => {
    setItems([]);
    setGiftWrap(false);
    setGiftCardMessage("");
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * i.product.price, 0);

  return (
    <Ctx.Provider
      value={{
        items, addItem, removeItem, setQuantity, updateQuantity, incQuantity, decQuantity, clear, totalItems, totalPrice,
        giftWrap, setGiftWrap, giftCardMessage, setGiftCardMessage,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside provider");
  return c;
}
