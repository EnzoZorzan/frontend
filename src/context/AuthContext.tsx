import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import type { Usuario } from "../types/Usuario";

interface AuthContextType {
  usuario: Usuario | null;
  permissoes: string[];
  login: (usuario: Usuario, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {

  const [usuario, setUsuario] = useState<Usuario | null>(
    JSON.parse(localStorage.getItem("usuario") || "null")
  );

  const [permissoes, setPermissoes] = useState<string[]>(
    JSON.parse(localStorage.getItem("permissoes") || "[]")
  );

  function login(user: Usuario, token: string) {
    const payload = parseJwt(token);

    const permissoesToken: string[] = payload?.permissoes || [];

    setUsuario(user);
    setPermissoes(permissoesToken);

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(user));
    localStorage.setItem("permissoes", JSON.stringify(permissoesToken));
  }

  function logout() {
    setUsuario(null);
    setPermissoes([]);
    localStorage.clear();
    window.location.href = "/login";
  }

  function hasPermission(permission: string) {
    return permissoes.includes(permission);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, permissoes, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
