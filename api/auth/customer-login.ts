import bcrypt from "bcryptjs";
import type { VercelRequest, VercelResponse } from "@Vercel/node";
import {
  db,
  createSession,
  fail,
  setSession,
  sameOrigin,
} from "../_lib/server.js";

function normalizeEmail(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "POST") {
      return res
        .setHeader("Allow", "POST")
        .status(405)
        .end();
    }

    if (!sameOrigin(req)) {
      return fail(res, 403, "Origem não permitida.");
    }

    const email = normalizeEmail(req.body?.email);
    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      return fail(
        res,
        400,
        "E-mail e senha são obrigatórios."
      );
    }

    const rows = await db()`
      SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        city,
        created_at
      FROM customers
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!rows.length) {
      return fail(
        res,
        401,
        "E-mail ou senha incorretos."
      );
    }

    const customer = rows[0];

    const valid = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!valid) {
      return fail(
        res,
        401,
        "E-mail ou senha incorretos."
      );
    }

    const token = await createSession({
      role: "customer",
      customerId: customer.id,
    });

    setSession(res, token);

    return res.status(200).json({
      ok: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        createdAt: customer.created_at,
      },
    });
  } catch (error) {
    console.error("customer login API failed", error);

    return fail(
      res,
      500,
      "Não foi possível realizar o login."
    );
  }
}