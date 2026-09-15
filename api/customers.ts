import bcrypt from "bcryptjs";
import type { VercelRequest, VercelResponse } from "@Vercel/node";
import {
  db,
  fail,
  getSession,
  sameOrigin,
} from "./_lib/server.js";

function normalizeEmail(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method === "GET") {
      const session = await getSession(req);

      if (session?.role !== "admin") {
        return fail(
          res,
          401,
          "Autenticação administrativa necessária."
        );
      }

      const rows = await db()`
        SELECT
          id,
          name,
          email,
          phone,
          city,
          created_at,
          updated_at
        FROM customers
        ORDER BY created_at DESC
      `;

      return res.status(200).json({
        customers: rows,
      });
    }

    if (req.method !== "POST") {
      return res
        .setHeader("Allow", "GET, POST")
        .status(405)
        .end();
    }

    if (!sameOrigin(req)) {
      return fail(res, 403, "Origem não permitida.");
    }

    const name = cleanText(req.body?.name);
    const email = normalizeEmail(req.body?.email);
    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";
    const phone = cleanText(req.body?.phone);
    const city = cleanText(req.body?.city);

    if (!name || !email || !password) {
      return fail(
        res,
        400,
        "Nome, e-mail e senha são obrigatórios."
      );
    }

    if (password.length < 6) {
      return fail(
        res,
        400,
        "A senha deve ter no mínimo 6 caracteres."
      );
    }

    const existing = await db()`
      SELECT id
      FROM customers
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return fail(
        res,
        409,
        "Já existe uma conta com este e-mail."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const id =
      "c_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8);

    const rows = await db()`
      INSERT INTO customers (
        id,
        name,
        email,
        password_hash,
        phone,
        city
      )
      VALUES (
        ${id},
        ${name},
        ${email},
        ${passwordHash},
        ${phone || null},
        ${city || null}
      )
      RETURNING
        id,
        name,
        email,
        phone,
        city,
        created_at,
        updated_at
    `;

    await db()`
      INSERT INTO customer_interactions (
        customer_id,
        favorites,
        liked
      )
      VALUES (
        ${id},
        '[]'::jsonb,
        '[]'::jsonb
      )
      ON CONFLICT (customer_id) DO NOTHING
    `;

    return res.status(201).json({
      customer: rows[0],
    });
  } catch (error) {
    console.error("customers API failed", error);
    return fail(
      res,
      500,
      "Não foi possível processar o cliente."
    );
  }
}