import { neon } from "@neondatabase/serverless";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export type Session = {
  role: "admin" | "customer";
  customerId?: string;
};

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} não está configurada.`);
  }

  return value;
}

export function db() {
  return neon(required("DATABASE_URL"));
}

function sessionKey() {
  return required("SESSION_SECRET");
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(payload: string) {
  return createHmac("sha256", sessionKey())
    .update(payload)
    .digest("base64url");
}

export async function createSession(session: Session) {
  const payload = encode(
    JSON.stringify({
      ...session,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  );

  return `${payload}.${signature(payload)}`;
}

export async function getSession(
  req: VercelRequest
): Promise<Session | null> {
  const token = req.cookies?.odoya_session;

  if (!token) return null;

  try {
    const [payload, receivedSignature] = token.split(".");

    if (!payload || !receivedSignature) return null;

    const expectedSignature = signature(payload);

    if (
      receivedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(
        Buffer.from(receivedSignature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const parsed = JSON.parse(decode(payload)) as Session & {
      expiresAt?: number;
    };

    if (parsed.expiresAt == null || parsed.expiresAt < Date.now()) {
      return null;
    }

    if (parsed.role !== "admin" && parsed.role !== "customer") {
      return null;
    }

    return {
      role: parsed.role,
      customerId:
        typeof parsed.customerId === "string"
          ? parsed.customerId
          : undefined,
    };
  } catch {
    return null;
  }
}

export function setSession(
  res: VercelResponse,
  token: string
) {
  res.setHeader(
    "Set-Cookie",
    `odoya_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
  );
}

export function clearSession(res: VercelResponse) {
  res.setHeader(
    "Set-Cookie",
    "odoya_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );
}

export function sameOrigin(req: VercelRequest) {
  const origin = req.headers.origin;
  const host = req.headers.host;

  return (
    !origin ||
    !host ||
    origin === `https://${host}` ||
    origin === `http://${host}`
  );
}

export function fail(
  res: VercelResponse,
  status: number,
  message: string
) {
  return res.status(status).json({
    error: message,
  });
}
