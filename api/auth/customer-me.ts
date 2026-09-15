import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, fail, getSession } from "../_lib/server.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "GET") {
      return res
        .setHeader("Allow", "GET")
        .status(405)
        .end();
    }

    const session = await getSession(req);

    if (session?.role !== "customer" || !session.customerId) {
      return fail(res, 401, "Cliente não autenticado.");
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
      WHERE id = ${session.customerId}
      LIMIT 1
    `;

    if (!rows.length) {
      return fail(res, 404, "Cliente não encontrado.");
    }

    const customer = rows[0];

    return res.status(200).json({
      authenticated: true,
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
    console.error("customer me API failed", error);

    return fail(
      res,
      500,
      "Não foi possível consultar a sessão do cliente."
    );
  }
}