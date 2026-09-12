/**
 * Utilitários de segurança para o frontend.
 *
 * AVISO IMPORTANTE
 * ----------------
 * Este projeto roda 100% no navegador sem backend. Portanto:
 *  - Senhas do admin NÃO PODEM ser protegidas de verdade sem um servidor.
 *    O que fazemos aqui é *ofuscação* + *rate limiting* + *boas práticas de UX*
 *    (remover dicas visíveis, travar após tentativas falhas). Em produção,
 *    o login admin DEVE ir para um backend com bcrypt/argon2 + JWT + HTTPS.
 *  - Senhas de clientes são armazenadas com SHA-256 + salt via SubtleCrypto,
 *    que é o melhor possível sem backend, mas ainda inferior ao bcrypt.
 */

const SALT = "odoya-aruanda-2026-fenix";

/** Gera hash SHA-256 (hex) de uma string com salt. */
export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text + SALT);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Hash síncrono de fallback (caso SubtleCrypto indisponível). Menos seguro. */
export function hashFallback(text: string): string {
  const s = text + SALT;
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return hex.padStart(16, "0");
}

export async function hashPassword(text: string): Promise<string> {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      return await sha256(text);
    }
  } catch {}
  return hashFallback(text);
}

/* ------------------------- Rate limiting ------------------------- */

type AttemptRecord = { count: number; firstAt: number; lockedUntil: number };

const attempts = new Map<string, AttemptRecord>();

export function checkRateLimit(
  key: string,
  { maxAttempts = 5, windowMs = 60_000, lockMs = 120_000 } = {}
): { allowed: true } | { allowed: false; retryInSec: number } {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
    return { allowed: true };
  }
  if (rec.lockedUntil > now) {
    return { allowed: false, retryInSec: Math.ceil((rec.lockedUntil - now) / 1000) };
  }
  if (now - rec.firstAt > windowMs) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
    return { allowed: true };
  }
  rec.count += 1;
  if (rec.count > maxAttempts) {
    rec.lockedUntil = now + lockMs;
    return { allowed: false, retryInSec: Math.ceil(lockMs / 1000) };
  }
  return { allowed: true };
}

export function recordFailure(key: string) {
  const rec = attempts.get(key);
  if (rec) rec.count += 1;
}

export function recordSuccess(key: string) {
  attempts.delete(key);
}

/* ------------------------- Sanitização ------------------------- */

/** Remove tags HTML e normaliza espaços. */
export function sanitize(text: string, maxLength = 500): string {
  return text
    .replace(/[<>"'`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Validação simples de e-mail. */
export function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
}

/** Validação simples de telefone BR (10 ou 11 dígitos). */
export function isValidPhoneBR(e: string): boolean {
  const digits = e.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}
