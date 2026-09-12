/**
 * Camada de persistência local para stores até que o backend
 * Supabase esteja disponível. Mantém o contexto organizado.
 */

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  },

  clearPrefix(prefix: string): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) localStorage.removeItem(key);
      }
    } catch {}
  },
};
