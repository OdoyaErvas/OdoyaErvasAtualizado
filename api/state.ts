import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, fail, getSession, sameOrigin } from "./_lib/server";

const KEYS = new Set(["catalog", "settings", "offers", "reviews", "finance", "shipments", "activity"]);
const PUBLIC_READ = new Set(["catalog", "settings", "offers", "reviews"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = typeof req.query.key === "string" ? req.query.key : "";
  if (!KEYS.has(key)) return fail(res, 400, "Recurso inválido.");
  try {
    const session = await getSession(req);
    if (req.method === "GET") {
      if (!PUBLIC_READ.has(key) && session?.role !== "admin") return fail(res, 401, "Autenticação administrativa necessária.");
      const rows = await db()`SELECT value, updated_at FROM app_state WHERE state_key = ${key}`;
      if (!rows.length) return res.status(404).json({ value: null });
      return res.status(200).json({ value: rows[0].value, updatedAt: rows[0].updated_at });
    }
    if (req.method !== "PUT") return res.setHeader("Allow", "GET, PUT").status(405).end();
    if (!sameOrigin(req)) return fail(res, 403, "Origem não permitida.");
    if (session?.role !== "admin") return fail(res, 401, "Autenticação administrativa necessária.");
    const value = req.body?.value;
    if (value === undefined || JSON.stringify(value).length > 900_000) return fail(res, 400, "Dados inválidos ou grandes demais.");
    await db()`INSERT INTO app_state (state_key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now()) ON CONFLICT (state_key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("state API failed", error);
    return fail(res, 500, "Não foi possível acessar os dados.");
  }
}
