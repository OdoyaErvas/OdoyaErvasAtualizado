export const SITE = {
  name: "Odoyá",
  full: "Odoyá Ervas de Aruanda",
  tagline: "Incensos Artesanais que Conectam, Equilibram e Elevam",
  motto: "Fé, Natureza e Propósito",
  owner: "Jéssica Oliveira",
  whatsappRaw: "5517981771556",
  whatsappDisplay: "(17) 98177-1556",
  instagram: "https://www.instagram.com/odoyaervasdearuanda/",
  instagramHandle: "@odoyaervasdearuanda",
  city: "Barretos",
  state: "SP",
  location: "Barretos – SP · Enviamos para todo o Brasil 🇧🇷",
  cepOrigem: "14780000",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappRaw}?text=${encodeURIComponent(message)}`;
}

export function productMessage(name: string) {
  return `Olá! Tenho interesse no produto ${name}.`;
}
