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
  empresa: { id: number; nome: string };
};

export default function UsuariosPage() {
  const [lista, setLista] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioDTO | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UsuarioDTO | null>(null);

  const toast = useToast();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [empresas, setEmpresas] = useState<any[]>([]);

  const [perfis, setPerfis] = useState<any[]>([]);

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
    carregarPerfis();
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

  async function carregarPerfis() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/v1/perfis", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao buscar perfis");

      const data = await res.json();
      setPerfis(data);
    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar perfis", "error");
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
    setForm({ nome: "", email: "", senha: "", perfilId: 0, empresaId: 0 });
    setModalOpen(true);
  }

  function editar(item: UsuarioDTO) {
    setEditando(item);
    setForm({
      nome: item.nome,
      email: item.email,
      senha: "",
      perfilId: item.perfil?.id ?? 0,
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
    const newErrors: Record<string, string> = {};

    // === VALIDAÇÕES ===
    if (!form.nome.trim()) newErrors.nome = "O nome é obrigatório.";
    if (!form.email.trim()) newErrors.email = "O e-mail é obrigatório.";

    // Senha obrigatória somente ao criar usuário
    if (!editando && !form.senha.trim()) newErrors.senha = "A senha é obrigatória.";

    if (!form.perfilId) newErrors.perfilId = "Selecione um perfil.";
    if (!form.empresaId) newErrors.empresaId = "Selecione uma empresa.";

    // Se houver erros → exibe e bloqueia o envio
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.showToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }

    setErrors({}); // limpa erros antes de salvar

    try {
      const token = localStorage.getItem("token");
      const payload: any = {
        nome: form.nome,
        email: form.email,
        perfil: form.perfilId > 0 ? { id: form.perfilId } : null,
        empresa: form.empresaId > 0 ? { id: form.empresaId } : null
      };

      if (form.senha) payload.senha = form.senha;

      let res;
      if (editando?.id) {
        res = await fetch(`http://localhost:8081/api/v1/usuarios/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("http://localhost:8081/api/v1/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error(await res.text());

      toast.showToast(editando ? "Usuário atualizado!" : "Usuário criado!", "success");
      setModalOpen(false);
      carregar();

    } catch (e: any) {
      console.error(e);
      toast.showToast(e.message || "Erro ao salvar usuário", "error");
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
            { header: "Empresa", field: "empresa.nome" }, // nested
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
          <input
            className={errors.nome ? "input-error" : ""}
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
          />
          {errors.nome && <span className="error-text">{errors.nome}</span>}
        </div>


        <div className="form-group">
          <label>Email</label>
          <input
            className={errors.email ? "input-error" : ""}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>


        <div className="form-group">
          <label>Senha {editando ? "(somente se for alterar)" : ""}</label>
          <input
            type="password"
            className={errors.senha ? "input-error" : ""}
            value={form.senha}
            onChange={e => setForm({ ...form, senha: e.target.value })}
          />
          {errors.senha && <span className="error-text">{errors.senha}</span>}
        </div>


        <div className="form-group">
          <label>Perfil</label>
          <select
            className={errors.perfilId ? "input-error" : ""}
            value={form.perfilId}
            onChange={e => setForm({ ...form, perfilId: Number(e.target.value) })}
          >
            <option value={0}>Selecione...</option>
            {perfis.map(perf => (
              <option key={perf.id} value={perf.id}>{perf.nome}</option>
            ))}
          </select>
          {errors.empresaId && <span className="error-text">{errors.perfilId}</span>}
        </div>
        <div className="form-group">
          <label>Empresa</label>
          <select
            className={errors.empresaId ? "input-error" : ""}
            value={form.empresaId}
            onChange={e => setForm({ ...form, empresaId: Number(e.target.value) })}
          >
            <option value={0}>Selecione...</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
          {errors.empresaId && <span className="error-text">{errors.empresaId}</span>}
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
