import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getSession } from "../_lib/server.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.setHeader("Allow", "GET").status(405).end();
  }

  const session = await getSession(req);

  return res.status(200).json({
    admin: session?.role === "admin",
  });
}
