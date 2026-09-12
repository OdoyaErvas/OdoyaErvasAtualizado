export type Product = {
  id: string;
  name: string;
  category: string;
  short: string;
  description: string;
  benefits: string[];
  usage: string;
  weight: string;
  price: number;
  /** Custo unitário de produção/aquisição. Usado no cálculo de lucro real no painel. */
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
};

export const CATEGORIES = [
  "Todos",
  "Incensos Artesanais",
  "Ervas",
  "Defumações",
  "Banhos",
  "Kits",
  "Novidades",
];

export const PRODUCTS: Product[] = [
  {
    id: "lavanda-rosas-rubras",
    name: "Incenso Lavanda com Rosas Rubras",
    category: "Incensos Artesanais",
    short: "Amor e Serenidade",
    description:
      "Uma composição artesanal de lavanda e rosas rubras, tradicionalmente escolhida para rituais de afeto, presença e harmonia no ambiente.",
    benefits: ["Tradicionalmente associada ao afeto", "Aroma floral e acolhedor", "Para momentos de intenção", "Perfuma o ambiente"],
    usage: "Acenda a ponta da vareta, aguarde a chama firmar e apague suavemente. Posicione em um incensário adequado em local ventilado.",
    weight: "Pacote com 5 varetas",
    price: 18,
    costPrice: 0,
    stock: 42,
    minStock: 8,
    available: true,
    featured: true,
    bestSeller: true,
    color: "#a274bd",
    emoji: "💜",
    image: "/images/prod-lavanda-rosas.jpg",
  },
  {
    id: "canela-anis",
    name: "Incenso Canela com Anis",
    category: "Incensos Artesanais",
    short: "Prosperidade e Energia",
    description:
      "Canela e anis em uma mistura quente e envolvente, tradicionalmente utilizada em práticas simbólicas ligadas à prosperidade, movimento e novos projetos.",
    benefits: ["Tradicionalmente ligada à prosperidade", "Aroma quente e especiado", "Para rituais de intenção", "Perfuma espaços de trabalho"],
    usage: "Acenda a ponta da vareta, aguarde firmar e apague a chama. Use em um incensário em ambiente arejado.",
    weight: "Pacote com 5 varetas",
    price: 18,
    costPrice: 0,
    stock: 28,
    minStock: 8,
    available: true,
    featured: true,
    bestSeller: true,
    color: "#a67f27",
    emoji: "✨",
    image: "/images/prod-canela-anis.jpg",
  },
  {
    id: "rosas-rubras",
    name: "Incenso Rosas Rubras",
    category: "Incensos Artesanais",
    short: "Amor e Energias Positivas",
    description:
      "Rosas rubras em uma composição artesanal inspirada no simbolismo do amor, da beleza e do cuidado com os vínculos.",
    benefits: ["Simbolismo de amor e afeto", "Aroma floral marcante", "Para ocasiões especiais", "Tradicionalmente usada em rituais de harmonia"],
    usage: "Acenda a ponta da vareta, aguarde firmar e apague a chama. Use em incensário adequado.",
    weight: "Pacote com 5 varetas",
    price: 18,
    costPrice: 0,
    stock: 35,
    minStock: 8,
    available: true,
    featured: true,
    color: "#7a2436",
    emoji: "🌹",
    image: "/images/prod-rosas-rubras.jpg",
  },
  {
    id: "lavanda",
    name: "Incenso Lavanda",
    category: "Incensos Artesanais",
    short: "Paz e Harmonia",
    description:
      "Lavanda em sua forma mais simples: uma fragrância floral e delicada, escolhida para momentos de pausa, leitura, meditação e desaceleração do dia.",
    benefits: ["Aroma floral suave", "Para momentos de pausa", "Tradicional em rituais noturnos", "Perfuma o lar com delicadeza"],
    usage: "Acenda a ponta da vareta, aguarde firmar e apague a chama. Use em local ventilado.",
    weight: "Pacote com 5 varetas",
    price: 18,
    costPrice: 0,
    stock: 50,
    minStock: 10,
    available: true,
    featured: true,
    color: "#7f4d9c",
    emoji: "🪻",
    image: "/images/prod-lavanda.jpg",
  },
  {
    id: "arruda",
    name: "Incenso Arruda",
    category: "Incensos Artesanais",
    short: "Proteção e Limpeza Energética",
    description:
      "A arruda é uma erva presente em tradições populares e espirituais brasileiras, frequentemente utilizada em práticas simbólicas de proteção e renovação do ambiente.",
    benefits: ["Tradicionalmente associada à proteção", "Para práticas de defumação", "Aroma verde e marcante", "Ritual de renovação do ambiente"],
    usage: "Acenda a ponta da vareta, aguarde firmar e apague a chama. Ideal para defumação de ambientes.",
    weight: "Pacote com 5 varetas",
    price: 18,
    costPrice: 0,
    stock: 6,
    minStock: 8,
    available: true,
    isNew: true,
    color: "#566e3d",
    emoji: "🌿",
    image: "/images/prod-arruda.jpg",
  },
  {
    id: "banho-sete-ervas",
    name: "Banho de 7 Ervas Sagradas",
    category: "Banhos",
    short: "Limpeza e Renovação",
    description:
      "Mistura artesanal de sete ervas, inspirada em tradições de banho ritual para momentos de renovação, presença e novos começos.",
    benefits: ["Para banhos rituais", "Mistura de sete ervas", "Momento de renovação", "Preparo artesanal"],
    usage: "Ferva 1L de água, desligue o fogo e adicione as ervas. Tampe por 10 minutos, coe e use após o banho higiênico, do pescoço para baixo.",
    weight: "40g • rende 2 banhos",
    price: 22,
    costPrice: 0,
    stock: 18,
    minStock: 5,
    available: true,
    featured: true,
    color: "#566e3d",
    emoji: "🛁",
    image: "/images/banho-ervas.jpg",
  },
  {
    id: "kit-composicoes",
    name: "Kit Nossas Composições",
    category: "Kits",
    short: "5 aromas, 5 propósitos",
    description:
      "Um kit especial com nossas cinco composições artesanais: Lavanda com Rosas Rubras, Canela com Anis, Rosas Rubras, Lavanda e Arruda. Perfeito para presentear ou explorar todos os aromas.",
    benefits: ["Todas as composições", "Ótimo custo-benefício", "Presente perfeito", "Experiência completa"],
    usage: "Cada pacote acompanha 5 varetas. Utilize conforme a intenção do momento.",
    weight: "5 pacotes • 25 varetas",
    price: 80,
    costPrice: 0,
    stock: 12,
    minStock: 3,
    available: true,
    featured: true,
    isNew: true,
    bestSeller: true,
    color: "#653b80",
    emoji: "🎁",
    image: "/images/hero-altar.jpg",
  },
  {
    id: "defumacao-ervas",
    name: "Defumação de Ervas Sagradas",
    category: "Defumações",
    short: "Proteção do Lar",
    description:
      "Mistura artesanal de ervas secas para uso em defumadores próprios, criada para perfumar e acompanhar práticas tradicionais de defumação de ambientes.",
    benefits: ["Para defumação de ambientes", "Aroma herbal marcante", "Uso em rituais tradicionais", "Preparo artesanal"],
    usage: "Acenda um carvão vegetal no defumador, adicione uma colher da mistura e circule pelos cômodos da casa.",
    weight: "60g",
    price: 28,
    costPrice: 0,
    stock: 22,
    minStock: 5,
    available: true,
    color: "#8a5a2b",
    emoji: "💨",
    image: "/images/sobre-processo.jpg",
  },
  {
    id: "alecrim-ervas",
    name: "Erva Alecrim Seco",
    category: "Ervas",
    short: "Alegria e Vitalidade",
    description:
      "Ramos de alecrim secos naturalmente, selecionados para banhos e defumações. Na tradição, é uma erva associada à presença, vitalidade e prosperidade.",
    benefits: ["Tradicionalmente associada à vitalidade", "Aroma verde e fresco", "Para banhos e defumações", "Preparo natural"],
    usage: "Use em banhos de ervas ou defumações, seguindo sua prática de preferência. Mantenha em local seco.",
    weight: "30g",
    price: 15,
    costPrice: 0,
    stock: 30,
    minStock: 6,
    available: true,
    color: "#5a7a3d",
    emoji: "🌿",
    image: "/images/sobre-processo.jpg",
  },
  {
    id: "banho-alecrim",
    name: "Banho de Alecrim com Alfazema",
    category: "Banhos",
    short: "Alegria e Serenidade",
    description:
      "Combinação de alecrim e alfazema para banhos rituais, inspirada em momentos de alegria, leveza e presença na rotina.",
    benefits: ["Para banhos rituais", "Aroma herbal-floral", "Momento de leveza", "Preparo artesanal"],
    usage: "Ferva 1L de água, adicione as ervas, tampe 10 min, coe e use após o banho higiênico.",
    weight: "40g • rende 2 banhos",
    price: 22,
    costPrice: 0,
    stock: 14,
    minStock: 5,
    available: true,
    color: "#7f4d9c",
    emoji: "🌾",
    image: "/images/banho-ervas.jpg",
  },
];
