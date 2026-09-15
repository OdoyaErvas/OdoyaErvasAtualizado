import bcrypt from "bcryptjs";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSession, fail, setSession } from "../_lib/server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.setHeader("Allow", "POST").status(405).end();
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) return fail(res, 400, "E-mail e senha são obrigatórios.");
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) return fail(res, 503, "Acesso administrativo ainda não foi configurado.");
  if (email !== adminEmail || !(await bcrypt.compare(password, hash))) return fail(res, 401, "Credenciais inválidas.");
  setSession(res, await createSession({ role: "admin" }));
  return res.status(200).json({ ok: true });
}
