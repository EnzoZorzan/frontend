import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { Usuario } from "../types/Usuario";

interface AuthContextType {
  usuario: Usuario | null;
  perfis: number[]; // IDs dos perfis
  login: (usuario: Usuario, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [usuario, setUsuario] = useState<Usuario | null>(
    JSON.parse(localStorage.getItem("usuario") || "null")
  );

  const [perfis, setPerfis] = useState<number[]>(
    JSON.parse(localStorage.getItem("perfis") || "[]")
  );

  // 🔥 Carrega os perfis do usuário ao inicializar
  useEffect(() => {
    if (usuario?.perfil) {
      const perfilId = usuario.perfil.id;
      if (perfilId) {
        setPerfis([perfilId]);
        localStorage.setItem("perfis", JSON.stringify([perfilId]));
      }
    }
  }, [usuario]);

  // LOGIN
  function login(user: Usuario, token: string) {
    setUsuario(user);

    // Extrair ID do perfil (objeto único)
    const perfilId = user.perfil?.id ? [user.perfil.id] : [];
    
    setPerfis(perfilId);

    // Salvar no localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(user));
    localStorage.setItem("perfis", JSON.stringify(perfilId));

    console.log("LOGIN PERFIS:", perfilId); // debug opcional
  }

  // LOGOUT
  function logout() {
    setUsuario(null);
    setPerfis([]);
    localStorage.clear();
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ usuario, perfis, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
