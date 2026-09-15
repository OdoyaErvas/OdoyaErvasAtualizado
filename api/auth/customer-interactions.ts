import type { VercelRequest, VercelResponse } from "@Vercel/node";
import {
  db,
  fail,
  getSession,
  sameOrigin,
} from "../_lib/server.js";

function cleanIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    ),
  ];
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

    if (req.method === "GET") {
      const rows = await db()`
        SELECT
          favorites,
          liked,
          updated_at
        FROM customer_interactions
        WHERE customer_id = ${session.customerId}
        LIMIT 1
      `;

      if (!rows.length) {
        return res.status(200).json({
          favorites: [],
          liked: [],
          updatedAt: null,
        });
      }

      return res.status(200).json({
        favorites: Array.isArray(rows[0].favorites)
          ? rows[0].favorites
          : [],
        liked: Array.isArray(rows[0].liked)
          ? rows[0].liked
          : [],
        updatedAt: rows[0].updated_at,
      });
    }

    if (req.method !== "PUT") {
      return res
        .setHeader("Allow", "GET, PUT")
        .status(405)
        .end();
    }

    if (!sameOrigin(req)) {
      return fail(res, 403, "Origem não permitida.");
    }

    const favorites = cleanIds(req.body?.favorites);
    const liked = cleanIds(req.body?.liked);

    await db()`
      INSERT INTO customer_interactions (
        customer_id,
        favorites,
        liked,
        updated_at
      )
      VALUES (
        ${session.customerId},
        ${JSON.stringify(favorites)}::jsonb,
        ${JSON.stringify(liked)}::jsonb,
        now()
      )
      ON CONFLICT (customer_id)
      DO UPDATE SET
        favorites = EXCLUDED.favorites,
        liked = EXCLUDED.liked,
        updated_at = now()
    `;

    return res.status(200).json({
      ok: true,
      favorites,
      liked,
    });
  } catch (error) {
    console.error("customer interactions API failed", error);

    return fail(
      res,
      500,
      "Não foi possível acessar as interações do cliente."
    );
  }
}