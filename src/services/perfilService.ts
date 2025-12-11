import { api } from "./api";
import type { Perfil } from "../types/Perfil";

export const PerfilService = {
  listar: () => api.get<Perfil[]>("/perfis"),
  buscarPorId: (id: string | number) => api.get<Perfil>(`/perfis/${id}`),
  criar: (perfil: Perfil) => api.post<Perfil>("/perfis", perfil),
  atualizar: (id: string | number, perfil: Perfil) =>
    api.put<Perfil>(`/perfis/${id}`, perfil),
  deletar: (id: string | number) => api.delete(`/perfis/${id}`)
};
