import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isValidEmail } from "../utils/security";

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  telefone?: string;
  cidade?: string;
  criadoEm: string;
};

type AuthCtx = {
  cliente: Cliente | null;
  clientes: Cliente[];
  login: (
    email: string,
    senha: string
  ) => Promise<{ ok: boolean; msg?: string }>;
  register: (c: {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    cidade?: string;
  }) => Promise<{ ok: boolean; msg?: string }>;
  logout: () => void;
  updatePerfil: (
    patch: Partial<Omit<Cliente, "senhaHash">> & {
      senha?: string;
    }
  ) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function mapCustomer(raw: any): Cliente {
  return {
    id: raw.id,
    nome: raw.name,
    email: raw.email,
    senhaHash: "",
    telefone: raw.phone ?? undefined,
    cidade: raw.city ?? undefined,
    criadoEm: raw.createdAt ?? raw.created_at,
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCurrentCustomer = async () => {
    try {
      const response = await fetch("/api/auth/customer-me", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        setCliente(null);
        return;
      }

      const body = await response.json();

      if (body.customer) {
        setCliente(mapCustomer(body.customer));
      } else {
        setCliente(null);
      }
    } catch {
      setCliente(null);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        setClientes([]);
        return;
      }

      const body = await response.json();

      setClientes(
        Array.isArray(body.customers)
          ? body.customers.map(mapCustomer)
          : []
      );
    } catch {
      setClientes([]);
    }
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      await loadCurrentCustomer();

      if (active) {
        await loadCustomers();
        setLoading(false);
      }
    };

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  const register: AuthCtx["register"] = async (data) => {
    if (
      !data.nome.trim() ||
      !data.email.trim() ||
      !data.senha
    ) {
      return {
        ok: false,
        msg: "Preencha nome, e-mail e senha.",
      };
    }

    if (!isValidEmail(data.email)) {
      return {
        ok: false,
        msg: "E-mail inválido.",
      };
    }

    if (data.senha.length < 6) {
      return {
        ok: false,
        msg: "A senha deve ter no mínimo 6 caracteres.",
      };
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.nome.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.senha,
          phone: data.telefone?.trim() || "",
          city: data.cidade?.trim() || "",
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          msg: body.error || "Não foi possível criar a conta.",
        };
      }

      /*
       * O cadastro cria o cliente no Neon.
       * O login será feito separadamente.
       */
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        msg: "Não foi possível conectar ao servidor.",
      };
    }
  };

  const login: AuthCtx["login"] = async (
    email,
    senha
  ) => {
    if (!email.trim() || !senha) {
      return {
        ok: false,
        msg: "Preencha e-mail e senha.",
      };
    }

    try {
      const response = await fetch(
        "/api/auth/customer-login",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: senha,
          }),
        }
      );

      const body = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          msg: body.error || "Não foi possível realizar o login.",
        };
      }

      if (body.customer) {
        setCliente(mapCustomer(body.customer));
      }

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        msg: "Não foi possível conectar ao servidor.",
      };
    }
  };

  const logout = () => {
    void fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    }).finally(() => {
      setCliente(null);
    });
  };

  const updatePerfil: AuthCtx["updatePerfil"] = async (
    patch
  ) => {
    if (!cliente) return;

    const response = await fetch(
      "/api/auth/customer-profile",
      {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: patch.nome ?? cliente.nome,
          phone: patch.telefone ?? cliente.telefone ?? "",
          city: patch.cidade ?? cliente.cidade ?? "",
          password: patch.senha || "",
        }),
      }
    );

    const body = await response.json();

    if (!response.ok) {
      throw new Error(
        body.error || "Não foi possível atualizar o perfil."
      );
    }

    if (body.customer) {
      setCliente(mapCustomer(body.customer));
    }

    await loadCustomers();
  };

  if (loading) {
    return null;
  }

  return (
    <Ctx.Provider
      value={{
        cliente,
        clientes,
        login,
        register,
        logout,
        updatePerfil,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const context = useContext(Ctx);

  if (!context) {
    throw new Error(
      "useAuth must be inside AuthProvider"
    );
  }

  return context;
}