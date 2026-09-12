/**
 * Kits Rituais — camada de dados modular.
 *
 * Cada kit agrupa produtos existentes do catálogo por intenção.
 * Os preços são calculados dinamicamente a partir dos produtos reais,
 * permitindo ajuste futuro no painel sem alterar este arquivo.
 *
 * O campo `discountPct` define o percentual de desconto sobre a soma
 * individual. Se zero, o preço promocional é igual ao total individual
 * (ou seja, sem desconto configurado ainda).
 */

export type RitualKit = {
  id: string;
  name: string;
  intention: string;
  emoji: string;
  color: string;
  description: string;
  /** IDs dos produtos que compõem o kit (devem existir no catálogo). */
  productIds: string[];
  /** Percentual de desconto sobre a soma dos preços individuais (0–100). */
  discountPct: number;
  /** Imagem representativa (usa a do primeiro produto se vazia). */
  image?: string;
  featured?: boolean;
};

export const RITUAL_KITS: RitualKit[] = [
  {
    id: "kit-protecao",
    name: "Kit Proteção",
    intention: "Proteção & Limpeza",
    emoji: "🛡️",
    color: "#566e3d",
    description:
      "Uma curadoria de arruda, defumação e banho de ervas para acompanhar práticas tradicionais de proteção e renovação do ambiente.",
    productIds: ["arruda", "defumacao-ervas", "banho-sete-ervas"],
    discountPct: 10,
    image: "/images/prod-arruda.jpg",
    featured: true,
  },
  {
    id: "kit-amor",
    name: "Kit Amor",
    intention: "Amor & Harmonia",
    emoji: "❤️",
    color: "#7a2436",
    description:
      "Rosas, lavanda e banho ritual em uma seleção inspirada em momentos de afeto, presença e harmonia no ambiente.",
    productIds: ["rosas-rubras", "lavanda-rosas-rubras", "banho-alecrim"],
    discountPct: 10,
    image: "/images/prod-rosas-rubras.jpg",
    featured: true,
  },
  {
    id: "kit-prosperidade",
    name: "Kit Prosperidade",
    intention: "Prosperidade & Abundância",
    emoji: "✨",
    color: "#a67f27",
    description:
      "Canela, alecrim e defumação reunidos para práticas simbólicas ligadas à prosperidade, movimento e novos projetos.",
    productIds: ["canela-anis", "alecrim-ervas", "defumacao-ervas"],
    discountPct: 10,
    image: "/images/prod-canela-anis.jpg",
    featured: true,
  },
  {
    id: "kit-calma",
    name: "Kit Calma",
    intention: "Calma & Serenidade",
    emoji: "🌙",
    color: "#7f4d9c",
    description:
      "Lavanda, rosas e banho de ervas para compor momentos de pausa, presença e uma rotina noturna mais acolhedora.",
    productIds: ["lavanda", "lavanda-rosas-rubras", "banho-alecrim"],
    discountPct: 10,
    image: "/images/prod-lavanda.jpg",
  },
  {
    id: "kit-renovacao",
    name: "Kit Renovação",
    intention: "Renovação & Recomeço",
    emoji: "🌿",
    color: "#653b80",
    description:
      "Banho de sete ervas, arruda e alecrim em uma curadoria para marcar recomeços e rituais de renovação pessoal.",
    productIds: ["banho-sete-ervas", "arruda", "alecrim-ervas"],
    discountPct: 10,
    image: "/images/banho-ervas.jpg",
  },
  {
    id: "kit-presente",
    name: "Kit Presente",
    intention: "Para quem você ama",
    emoji: "🎁",
    color: "#4c2a6b",
    description:
      "O presente artesanal ideal: todas as cinco composições de incenso num kit exclusivo, embalado com carinho e intenção.",
    productIds: ["kit-composicoes"],
    discountPct: 0,
    image: "/images/hero-altar.jpg",
  },
];
