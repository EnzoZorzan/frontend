import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import "../styles/page.css";
import "../styles/form.css";
import "../styles/perfil.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function MeuPerfilPage() {
  const { usuario } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    nome: usuario?.nome || "",
    email: usuario?.email || "",
    senha: "",
    confirmarSenha: ""
  });

  async function salvar() {
    if (form.senha && form.senha !== form.confirmarSenha) {
      toast.showToast("As senhas não coincidem", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload: any = {
        nome: form.nome,
        email: form.email
      };

      if (form.senha.trim() !== "") {
        payload.senha = form.senha;
      }

      const res = await fetch(`${API_URL}/api/v1/usuarios/${usuario?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao atualizar perfil");

      toast.showToast("Perfil atualizado com sucesso!", "success");

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao salvar perfil", "error");
    }
  }

  return (
    <div className="page-container perfil-container">

      <div className="page-header">
        <h2>Meu Perfil</h2>
      </div>

      <div className="perfil-card">
        <div className="form-group">
          <label>Nome</label>
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
          />
        </div>

        <div className="form-group">
          <label>Nova Senha (opcional)</label>
          <input
            type="password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Confirmar Senha</label>
          <input
            type="password"
            value={form.confirmarSenha}
            onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
          />
        </div>

        <button className="save-btn" onClick={salvar}>Salvar Alterações</button>
      </div>
    </div>
  );
}
