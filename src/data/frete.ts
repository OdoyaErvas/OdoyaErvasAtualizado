// ====================================================================
// Calculadora de frete simplificada (sem API externa)
// Baseada em faixas de CEP por estado/região + peso estimado
// Origem: Barretos – SP (CEP 14780-000)
// ====================================================================

type FreteOption = {
  label: string;
  prazo: string;
  valor: number;
};

// Faixas de preço por região (simulação realista Correios 2026)
const REGIOES: Record<string, { pac: number; sedex: number; prazo_pac: string; prazo_sedex: string }> = {
  SP_INTERIOR: { pac: 14.90, sedex: 22.90, prazo_pac: "3 a 5 dias úteis", prazo_sedex: "1 a 2 dias úteis" },
  SP_CAPITAL:  { pac: 16.90, sedex: 24.90, prazo_pac: "4 a 6 dias úteis", prazo_sedex: "1 a 3 dias úteis" },
  SUDESTE:     { pac: 19.90, sedex: 29.90, prazo_pac: "5 a 8 dias úteis", prazo_sedex: "2 a 4 dias úteis" },
  SUL:         { pac: 22.90, sedex: 34.90, prazo_pac: "6 a 9 dias úteis", prazo_sedex: "3 a 5 dias úteis" },
  CENTRO:      { pac: 24.90, sedex: 38.90, prazo_pac: "6 a 10 dias úteis", prazo_sedex: "3 a 5 dias úteis" },
  NORDESTE:    { pac: 28.90, sedex: 44.90, prazo_pac: "8 a 12 dias úteis", prazo_sedex: "4 a 6 dias úteis" },
  NORTE:       { pac: 32.90, sedex: 49.90, prazo_pac: "10 a 15 dias úteis", prazo_sedex: "5 a 8 dias úteis" },
};

function getRegiaoFromCep(cep: string): string {
  const n = parseInt(cep.replace(/\D/g, "").slice(0, 5), 10);
  // São Paulo Interior (Barretos e região)
  if (n >= 14000 && n <= 19999) return "SP_INTERIOR";
  // São Paulo Capital e Grande SP
  if (n >= 1000 && n <= 9999) return "SP_CAPITAL";
  if (n >= 10000 && n <= 13999) return "SP_CAPITAL";
  // Restante SP
  if (n >= 1000 && n <= 19999) return "SP_INTERIOR";
  // Rio de Janeiro
  if (n >= 20000 && n <= 28999) return "SUDESTE";
  // Espírito Santo
  if (n >= 29000 && n <= 29999) return "SUDESTE";
  // Minas Gerais
  if (n >= 30000 && n <= 39999) return "SUDESTE";
  // Bahia
  if (n >= 40000 && n <= 48999) return "NORDESTE";
  // Sergipe
  if (n >= 49000 && n <= 49999) return "NORDESTE";
  // Pernambuco
  if (n >= 50000 && n <= 56999) return "NORDESTE";
  // Alagoas
  if (n >= 57000 && n <= 57999) return "NORDESTE";
  // Paraíba
  if (n >= 58000 && n <= 58999) return "NORDESTE";
  // Rio Grande do Norte
  if (n >= 59000 && n <= 59999) return "NORDESTE";
  // Ceará
  if (n >= 60000 && n <= 63999) return "NORDESTE";
  // Piauí
  if (n >= 64000 && n <= 64999) return "NORDESTE";
  // Maranhão
  if (n >= 65000 && n <= 65999) return "NORDESTE";
  // Pará
  if (n >= 66000 && n <= 68899) return "NORTE";
  // Amapá
  if (n >= 68900 && n <= 68999) return "NORTE";
  // Amazonas
  if (n >= 69000 && n <= 69299) return "NORTE";
  // Roraima
  if (n >= 69300 && n <= 69399) return "NORTE";
  // Acre
  if (n >= 69900 && n <= 69999) return "NORTE";
  // Rondônia
  if (n >= 76800 && n <= 76999) return "NORTE";
  // Tocantins
  if (n >= 77000 && n <= 77999) return "NORTE";
  // DF e Goiás
  if (n >= 70000 && n <= 76799) return "CENTRO";
  // Mato Grosso
  if (n >= 78000 && n <= 78899) return "CENTRO";
  // Mato Grosso do Sul
  if (n >= 79000 && n <= 79999) return "CENTRO";
  // Paraná
  if (n >= 80000 && n <= 87999) return "SUL";
  // Santa Catarina
  if (n >= 88000 && n <= 89999) return "SUL";
  // Rio Grande do Sul
  if (n >= 90000 && n <= 99999) return "SUL";
  return "NORDESTE"; // fallback
}

// Extra por peso: a cada 500g a mais, +R$3
function extraPeso(totalItems: number): number {
  // Cada item pesa ~80g em média, frete base cobre até 300g
  const pesoTotal = totalItems * 80;
  if (pesoTotal <= 300) return 0;
  const extras = Math.ceil((pesoTotal - 300) / 500);
  return extras * 3;
}

export function calcularFrete(cep: string, qtdItens: number): { ok: boolean; error?: string; options?: FreteOption[] } {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) return { ok: false, error: "CEP inválido. Digite os 8 números." };

  const regiao = getRegiaoFromCep(cleaned);
  const r = REGIOES[regiao];
  if (!r) return { ok: false, error: "Não foi possível calcular. Verifique o CEP." };

  const extra = extraPeso(qtdItens);

  const options: FreteOption[] = [
    { label: "PAC – Econômico", prazo: r.prazo_pac, valor: r.pac + extra },
    { label: "SEDEX – Expresso", prazo: r.prazo_sedex, valor: r.sedex + extra },
  ];

  // Frete grátis acima de R$150
  if (qtdItens >= 1) {
    // Mantemos — frete grátis calculado no checkout
  }

  return { ok: true, options };
}

export const FRETE_GRATIS_ACIMA = 150;
