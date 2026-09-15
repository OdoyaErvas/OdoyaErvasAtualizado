import bcrypt from "bcryptjs";
import type { VercelRequest, VercelResponse } from "@Vercel/node";
import {
  db,
  fail,
  getSession,
  sameOrigin,
} from "../_lib/server.js";

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
    const session = await getSession(req);

    if (session?.role !== "customer" || !session.customerId) {
      return fail(res, 401, "Cliente não autenticado.");
    }

    if (req.method !== "PUT") {
      return res
        .setHeader("Allow", "PUT")
        .status(405)
        .end();
    }

    if (!sameOrigin(req)) {
      return fail(res, 403, "Origem não permitida.");
    }

    const name = cleanText(req.body?.name);
    const phone = cleanText(req.body?.phone);
    const city = cleanText(req.body?.city);
    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!name) {
      return fail(res, 400, "O nome é obrigatório.");
    }

    if (password && password.length < 6) {
      return fail(
        res,
        400,
        "A senha deve ter no mínimo 6 caracteres."
      );
    }

    let rows;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);

      rows = await db()`
        UPDATE customers
        SET
          name = ${name},
          phone = ${phone || null},
          city = ${city || null},
          password_hash = ${passwordHash},
          updated_at = now()
        WHERE id = ${session.customerId}
        RETURNING
          id,
          name,
          email,
          phone,
          city,
          created_at,
          updated_at
      `;
    } else {
      rows = await db()`
        UPDATE customers
        SET
          name = ${name},
          phone = ${phone || null},
          city = ${city || null},
          updated_at = now()
        WHERE id = ${session.customerId}
        RETURNING
          id,
          name,
          email,
          phone,
          city,
          created_at,
          updated_at
      `;
    }

    if (!rows.length) {
      return fail(res, 404, "Cliente não encontrado.");
    }

    const customer = rows[0];

    return res.status(200).json({
      ok: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
      },
    });
  } catch (error) {
    console.error("customer profile API failed", error);

    return fail(
      res,
      500,
      "Não foi possível atualizar o perfil."
    );
  }
}