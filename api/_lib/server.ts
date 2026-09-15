import { neon } from "@neondatabase/serverless";
import { jwtVerify, SignJWT } from "jose";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export type Session = { role: "admin" | "customer"; customerId?: string };

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não está configurada.`);
  return value;
}

export function db() {
  return neon(required("DATABASE_URL"));
}

function sessionKey() {
  return new TextEncoder().encode(required("SESSION_SECRET"));
}

export async function createSession(session: Session) {
  return new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(sessionKey());
}

export async function getSession(req: VercelRequest): Promise<Session | null> {
  const token = req.cookies?.odoya_session;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey());
    if (payload.role !== "admin" && payload.role !== "customer") return null;
    return { role: payload.role, customerId: typeof payload.customerId === "string" ? payload.customerId : undefined };
  } catch { return null; }
}

export function setSession(res: VercelResponse, token: string) {
  res.setHeader("Set-Cookie", `odoya_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
}

export function clearSession(res: VercelResponse) {
  res.setHeader("Set-Cookie", "odoya_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
}

export function sameOrigin(req: VercelRequest) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  return !origin || !host || origin === `https://${host}` || origin === `http://${host}`;
}

export function fail(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}
