import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { hashPassword, isValidEmail } from "../utils/security";

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string; // SHA-256 hex (ou formato legado "od::" base64 durante migração)
  telefone?: string;
  cidade?: string;
  criadoEm: string;
};

type AuthCtx = {
  cliente: Cliente | null;
  clientes: Cliente[];
  login: (email: string, senha: string) => Promise<{ ok: boolean; msg?: string }>;
  register: (c: { nome: string; email: string; senha: string; telefone?: string; cidade?: string }) => Promise<{ ok: boolean; msg?: string }>;
  logout: () => void;
  updatePerfil: (patch: Partial<Omit<Cliente, "senhaHash">> & { senha?: string }) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const LS_CLIENTES = "odoya_clientes_v2";
const LS_SESSION = "odoya_cliente_session_v2";

function load<T>(k: string, f: T): T {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch { return f; }
}

/** Migração: converte clientes do formato v1 (senha base64 "od::...") para v2 (SHA-256). */
function migrateFromV1(): Cliente[] {
  try {
    const raw = localStorage.getItem("odoya_clientes_v1");
    if (!raw) return [];
    const arr = JSON.parse(raw) as any[];
    return arr.map((c) => ({
      id: c.id,
      nome: c.nome,
      email: (c.email || "").toLowerCase(),
      senhaHash: c.senha || "", // formato legado "od::..."
      telefone: c.telefone,
      cidade: c.cidade,
      criadoEm: c.criadoEm || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/** Verifica se hash é formato legado base64 (inicia com "od::" após decode). */
function isLegacyHash(hash: string): boolean {
  try {
    const decoded = decodeURIComponent(escape(atob(hash)));
    return decoded.startsWith("od::");
  } catch {
    return false;
  }
}

/** Extrai plaintext do hash legado (apenas para migração durante login). */
function legacyPlaintext(hash: string): string {
  try {
    return decodeURIComponent(escape(atob(hash))).replace("od::", "");
  } catch {
    return "";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const v2 = load<Cliente[]>(LS_CLIENTES, []);
    if (v2.length > 0) return v2;
    // tenta migrar v1
    const migrated = migrateFromV1();
    if (migrated.length > 0) {
      localStorage.setItem(LS_CLIENTES, JSON.stringify(migrated));
      try { localStorage.removeItem("odoya_clientes_v1"); } catch {}
    }
    return migrated;
  });
  const [clienteId, setClienteId] = useState<string | null>(() => load<string | null>(LS_SESSION, null));

  useEffect(() => { localStorage.setItem(LS_CLIENTES, JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem(LS_SESSION, JSON.stringify(clienteId)); }, [clienteId]);

  const cliente = clientes.find((c) => c.id === clienteId) ?? null;

  const register: AuthCtx["register"] = async (data) => {
    if (!data.nome.trim() || !data.email.trim() || !data.senha) return { ok: false, msg: "Preencha nome, e-mail e senha." };
    if (!isValidEmail(data.email)) return { ok: false, msg: "E-mail inválido." };
    if (data.senha.length < 6) return { ok: false, msg: "A senha deve ter no mínimo 6 caracteres." };
    const email = data.email.trim().toLowerCase();
    if (clientes.some((c) => c.email === email)) return { ok: false, msg: "Já existe uma conta com este e-mail." };

    const senhaHash = await hashPassword(data.senha);
    const novo: Cliente = {
      id: "c_" + Date.now().toString(36),
      nome: data.nome.trim(),
      email,
      senhaHash,
      telefone: data.telefone?.trim(),
      cidade: data.cidade?.trim(),
      criadoEm: new Date().toISOString(),
    };
    setClientes((p) => [...p, novo]);
    setClienteId(novo.id);
    return { ok: true };
  };

  const login: AuthCtx["login"] = async (email, senha) => {
    if (!email.trim() || !senha) return { ok: false, msg: "Preencha e-mail e senha." };
    const c = clientes.find((x) => x.email === email.trim().toLowerCase());
    if (!c) return { ok: false, msg: "Conta não encontrada." };

    // Migração transparente: se hash legado, compara plaintext e re-hasha
    if (isLegacyHash(c.senhaHash)) {
      const legacy = legacyPlaintext(c.senhaHash);
      if (legacy !== senha) return { ok: false, msg: "Senha incorreta." };
      const novoHash = await hashPassword(senha);
      setClientes((p) => p.map((x) => (x.id === c.id ? { ...x, senhaHash: novoHash } : x)));
      setClienteId(c.id);
      return { ok: true };
    }

    // Formato novo: compara hashes
    const tent = await hashPassword(senha);
    if (tent !== c.senhaHash) return { ok: false, msg: "Senha incorreta." };
    setClienteId(c.id);
    return { ok: true };
  };

  const logout = () => setClienteId(null);

  const updatePerfil: AuthCtx["updatePerfil"] = async (patch) => {
    if (!cliente) return;
    const novo: Partial<Cliente> = { ...patch };
    if (patch.senha) {
      novo.senhaHash = await hashPassword(patch.senha);
      delete (novo as any).senha;
    }
    setClientes((p) => p.map((c) => (c.id === cliente.id ? { ...c, ...novo } : c)));
  };

  return <Ctx.Provider value={{ cliente, clientes, login, register, logout, updatePerfil }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
