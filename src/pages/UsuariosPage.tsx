// src/pages/usuarios/UsuariosPage.tsx
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import "../styles/page.css";
import "../styles/form.css";

type UsuarioDTO = {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  perfil?: { id: number; nome: string };
  empresa: { id: number; nome: string};
};

export default function UsuariosPage() {
  const [lista, setLista] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioDTO | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UsuarioDTO | null>(null);

  const toast = useToast();

  const [empresas, setEmpresas] = useState<any[]>([]);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    perfilId: 1,
    empresaId: 0
  });

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/v1/empresas", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao buscar empresas");

      const data = await res.json();
      setEmpresas(data);
    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar empresas", "error");
    }
  }

  async function carregar() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/v1/usuarios", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      const data: UsuarioDTO[] = await res.json();
      setLista(data);
    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  }

  function novo() {
    setEditando(null);
    setForm({ nome: "", email: "", senha: "", perfilId: 1, empresaId: 0 });
    setModalOpen(true);
  }

  function editar(item: UsuarioDTO) {
    setEditando(item);
    setForm({
      nome: item.nome,
      email: item.email,
      senha: "",
      perfilId: item.perfil?.id ?? 1,
      empresaId: item.empresa?.id ?? 0
    });
    setModalOpen(true);
  }

  function confirmarExcluir(item: UsuarioDTO) {
    setToDelete(item);
    setConfirmOpen(true);
  }

  async function excluirConfirmado() {
    if (!toDelete?.id) return;
    setConfirmOpen(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/api/v1/usuarios/${toDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.showToast("Usuário excluído", "success");
      carregar();
    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao excluir usuário", "error");
    }
  }

  async function salvar() {
    try {
      const token = localStorage.getItem("token");
      const payload: any = {
        nome: form.nome,
        email: form.email,
        perfil: { id: form.perfilId },
        empresa: form.empresaId > 0 ? { id: form.empresaId } : null
      };

      if (form.senha) payload.senha = form.senha;

      let res;
      if (editando?.id) {
        res = await fetch(`http://localhost:8081/api/v1/usuarios/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("http://localhost:8081/api/v1/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro no servidor");
      }

      toast.showToast(editando ? "Usuário atualizado" : "Usuário criado", "success");
      setModalOpen(false);
      carregar();
    } catch (e: any) {
      console.error(e);
      toast.showToast(`Erro: ${e.message || "ao salvar"}`, "error");
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Usuários</h2>
        <button className="new-btn" onClick={novo}>Novo Usuário</button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DataTable
          columns={[
            { header: "Nome", field: "nome" },
            { header: "Email", field: "email" },
            { header: "Perfil", field: "perfil.nome" } // nested
          ]}
          data={lista}
          onEdit={editar}
          onDelete={confirmarExcluir}
        />
      )}

      <Modal
        open={modalOpen}
        title={editando ? "Editar Usuário" : "Novo Usuário"}
        onClose={() => setModalOpen(false)}
        onSave={salvar}
      >
        <div className="form-group">
          <label>Nome</label>
          <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Senha {editando ? "(somente se for alterar)" : ""}</label>
          <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Perfil</label>
          <select value={form.perfilId} onChange={e => setForm({ ...form, perfilId: Number(e.target.value) })}>
            <option value={1}>Administrador</option>
            <option value={2}>Gerente</option>
            <option value={3}>Supervisor</option>
          </select>
        </div>
        <div className="form-group">
          <label>Empresa</label>
          <select
            value={form.empresaId}
            onChange={e => setForm({ ...form, empresaId: Number(e.target.value) })}
          >
            <option value={0}>Selecione...</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.nome}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir usuário"
        message={`Deseja excluir ${toDelete?.nome}? Essa ação é irreversível.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={excluirConfirmado}
      />
    </div>
  );
}
