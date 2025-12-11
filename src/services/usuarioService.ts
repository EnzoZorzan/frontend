import { api } from "./api";
import type { Usuario } from "../types/Usuario";

export const UsuarioService = {
  listar: () => api.get<Usuario[]>("/v1/usuarios"),

  buscarPorId: (id: string | number) =>
    api.get<Usuario>(`/v1/usuarios/${id}`),

  criar: (usuario: Usuario) =>
    api.post<Usuario>("/v1/usuarios", usuario),

  atualizar: (id: string | number, usuario: Usuario) =>
    api.put<Usuario>(`/v1/usuarios/${id}`, usuario),

  deletar: (id: string | number) =>
    api.delete(`/v1/usuarios/${id}`),
};
