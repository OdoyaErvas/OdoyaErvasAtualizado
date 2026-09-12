/**
 * Credenciais do painel administrativo.
 *
 * ATENÇÃO: em um projeto frontend-only, NÃO EXISTE proteção real possível
 * sem backend. O que fazemos aqui é manter as credenciais fora das views,
 * aplicar rate limiting e não exibir dicas em tela.
 *
 * Em produção, mover para um endpoint /api/login com:
 *  - bcrypt/argon2 no hash da senha
 *  - JWT + cookie httpOnly + SameSite=Strict
 *  - HTTPS obrigatório, CORS restrito, CSRF token
 *  - Rate limit no servidor + bloqueio por IP
 */

export const ADMIN_EMAIL = "odoyaervasdearuanda@gmail.com";
export const ADMIN_PASS = "odayajeh";
