import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearSession } from "../_lib/server";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.setHeader("Allow", "POST").status(405).end();
  clearSession(res);
  return res.status(200).json({ ok: true });
}
