/**
 * Interfaces de domínio para integração futura com Supabase.
 *
 * Estas interfaces definem o "contrato" completo do catálogo e da operação,
 * permitindo que stores locais atuais (localStorage) possam ser substituídas por
 * queries Supabase sem alterar os componentes e a lógica dos painéis.
 */

// ─────────────────────────────────────────────────────────────
// Catálogo
// ─────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  order?: number;
  active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: Category;
  short: string;
  description: string;
  benefits: string[];
  usage: string;
  weight: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  available: boolean;
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  color: string;
  emoji: string;
  image?: string;
  images?: string[];
  status?: "active" | "draft" | "archived";
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Kits & Rituais Comerciais
// ─────────────────────────────────────────────────────────────

export interface RitualKit {
  id: string;
  name: string;
  slug: string;
  intention: string;
  emoji: string;
  color: string;
  description: string;
  productIds: string[];
  products?: Product[];
  discountPct: number;
  image?: string;
  featured?: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface DiscountRule {
  id: string;
  code: string;
  kind: "percent" | "fixed" | "free_shipping";
  value: number;
  active: boolean;
  minSubtotal?: number;
  maxUses?: number;
  uses?: number;
  validFrom?: string;
  validTo?: string;
}

// ─────────────────────────────────────────────────────────────
// Usuários & Relacionamento
// ─────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  notes?: string;
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Vendas, Envios e Pedidos
// ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | "rascunho"
  | "pendente"
  | "aprovado"
  | "enviado"
  | "concluido"
  | "cancelado";

export type PaymentMethodKind =
  | "pix"
  | "boleto"
  | "dinheiro"
  | "cartao"
  | "transferencia"
  | "outro";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  couponId?: string;
  shippingCost?: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethodKind;
  observacoes?: string;
  giftWrapped?: boolean;
  giftCardMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  destinationCep?: string;
  destinationCity?: string;
  destinationState?: string;
  courier: "correios-pac" | "correios-sedex" | "correios-mini" | "outra";
  trackingCode: string;
  status: "aguardando" | "postado" | "em_transito" | "entregue" | "problema";
  history: { data: string; texto: string; status: Shipment["status"] }[];
  postedAt?: string;
  updatedAt: string;
  customerNotified?: boolean;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// Financeiro
// ─────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | "Insumos e matéria-prima"
  | "Embalagens"
  | "Frete e logística"
  | "Marketing e divulgação"
  | "Equipamentos e ferramentas"
  | "Taxas e impostos"
  | "Assinaturas e serviços"
  | "Outros";

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  supplier?: string;
  paymentMethod: PaymentMethodKind;
  recurring?: boolean;
  notes?: string;
  orderId?: string;
}

// ─────────────────────────────────────────────────────────────
// Avaliações e Prova Social
// ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  customerId?: string;
  name: string;
  city?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string;
  verified?: boolean;
  published: boolean;
  photos?: string[];
}

// ─────────────────────────────────────────────────────────────
// Inventário e Configuração
// ─────────────────────────────────────────────────────────────

export interface InventoryLog {
  id: string;
  productId: string;
  quantityChange: number;
  reason: string;
  createdAt?: string;
}

export interface Banner {
  id: string;
  enabled: boolean;
  text: string;
  ctaLabel?: string;
  ctaLink?: string;
  order?: number;
  createdAt?: string;
}

export interface SiteSettings {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  whatsappPhone: string;
  instagram: string;
  city: string;
  state: string;
  cep: string;
  businessHours: string;
  shippingDays: string;
  freeShippingThreshold: number;
  welcomeMessage: string;
  instagramFeedEnabled: boolean;
  testimonialsEnabled: boolean;
  monthlyGoal: number;
  glossaryEnabled: boolean;
  ritualOfDayEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  installments?: string;
  discount?: string;
  featured?: boolean;
  enabled: boolean;
  order?: number;
}

export interface StoreConfig {
  site: SiteSettings;
  payments: PaymentMethod[];
}
