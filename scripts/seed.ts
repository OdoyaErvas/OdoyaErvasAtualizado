import { neon } from "@neondatabase/serverless";
import { PRODUCTS, CATEGORIES } from "../src/data/products";
import { SEED_BANNER, SEED_CONFIG, SEED_PAYMENTS } from "../src/store/useSettings";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL não está definida.");

const sql = neon(databaseUrl);
await sql`INSERT INTO app_state (state_key, value) VALUES ('catalog', ${JSON.stringify({ products: PRODUCTS, categories: CATEGORIES })}::jsonb) ON CONFLICT (state_key) DO NOTHING`;
await sql`INSERT INTO app_state (state_key, value) VALUES ('settings', ${JSON.stringify({ paymentMethods: SEED_PAYMENTS, banner: SEED_BANNER, pixKey: "odoyaervasdearuanda@gmail.com", aboutText: "A Odoyá Ervas de Aruanda é uma incensaria artesanal criada em Barretos-SP por Jéssica Oliveira. Cada incenso, banho e defumação é preparado à mão, com ervas selecionadas, fé e propósito. Enviamos para todo o Brasil.", storeConfig: SEED_CONFIG })}::jsonb) ON CONFLICT (state_key) DO NOTHING`;
await sql`INSERT INTO app_state (state_key, value) VALUES ('offers', '[]'::jsonb) ON CONFLICT (state_key) DO NOTHING`;
await sql`INSERT INTO app_state (state_key, value) VALUES ('reviews', '[]'::jsonb) ON CONFLICT (state_key) DO NOTHING`;
await sql`INSERT INTO app_state (state_key, value) VALUES ('wholesale', '[]'::jsonb) ON CONFLICT (state_key) DO NOTHING`;
await sql`INSERT INTO app_state (state_key, value) VALUES ('finance', '{"vendas":[],"despesas":[]}'::jsonb) ON CONFLICT (state_key) DO NOTHING`;
await sql`INSERT INTO app_state (state_key, value) VALUES ('shipments', '[]'::jsonb) ON CONFLICT (state_key) DO NOTHING`;
await sql`INSERT INTO app_state (state_key, value) VALUES ('activity', '[]'::jsonb) ON CONFLICT (state_key) DO NOTHING`;
console.log("Dados iniciais inseridos quando ausentes.");
