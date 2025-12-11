import type { Perfil } from "./Perfil";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil; // único perfil
}
