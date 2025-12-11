import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import "../styles/page.css";
import "../styles/form.css";

export default function PerfisPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [permissoes, setPermissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const toast = useToast();

  const [form, setForm] = useState({
    nome: "",
    permissoes: [] as number[]
  });

  // ================================
  // CARREGAR PERFIS + PERMISSÕES
  // ================================
  useEffect(() => {
    carregar();
    carregarPermissoes();
  }, []);

  async function carregar() {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8081/api/v1/perfis", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao buscar perfis");

      const data = await res.json();
      setLista(data);

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar perfis", "error");
    }

    setLoading(false);
  }

  async function carregarPermissoes() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8081/api/v1/permissoes", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao buscar permissões");

      const data = await res.json();
      setPermissoes(data);

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar permissões", "error");
    }
  }

  // ================================
  // NOVO PERFIL
  // ================================
  function novo() {
    setEditando(null);
    setForm({
      nome: "",
      permissoes: []
    });
    setModalOpen(true);
  }

  // ================================
  // EDITAR PERFIL
  // ================================
  function editar(item: any) {
    setEditando(item);

    setForm({
      nome: item.nome,
      permissoes: item.permissoes?.map((p: any) => p.id) || []
    });

    setModalOpen(true);
  }

  // ================================
  // SALVAR
  // ================================
  async function salvar() {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        nome: form.nome,
        permissoes: form.permissoes.map(id => ({ id }))
      };

      let res;

      if (editando) {
        res = await fetch(`http://localhost:8081/api/v1/perfis/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("http://localhost:8081/api/v1/perfis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar perfil");

      toast.showToast(editando ? "Perfil atualizado!" : "Perfil criado!", "success");

      setModalOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao salvar perfil", "error");
    }
  }

  // ================================
  // EXCLUIR
  // ================================
  function confirmarExcluir(item: any) {
    setToDelete(item);
    setConfirmOpen(true);
  }

  async function excluirConfirmado() {
    if (!toDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8081/api/v1/perfis/${toDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao excluir perfil");

      toast.showToast("Perfil excluído!", "success");

      setConfirmOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao excluir perfil", "error");
    }
  }

  // ================================
  // HANDLE CHECKBOX PERMISSÕES
  // ================================
  function togglePermissao(id: number) {
    setForm(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(id)
        ? prev.permissoes.filter(p => p !== id)
        : [...prev.permissoes, id]
    }));
  }

  // ================================
  // RENDER
  // ================================
  return (
    <div className="page-container">

      <div className="page-header">
        <h2>Perfis</h2>
        <button className="new-btn" onClick={novo}>Novo Perfil</button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DataTable
          columns={[
            { header: "Nome", field: "nome" }
          ]}
          data={lista}
          onEdit={editar}
          onDelete={confirmarExcluir}
        />
      )}

      {/* === MODAL === */}
      <Modal
        open={modalOpen}
        title={editando ? "Editar Perfil" : "Novo Perfil"}
        onClose={() => setModalOpen(false)}
        onSave={salvar}
      >
        <div className="form-group">
          <label>Nome</label>
          <input
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Permissões</label>

          <div className="checkbox-list">
            {permissoes.map((p: any) => (
              <label key={p.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.permissoes.includes(p.id)}
                  onChange={() => togglePermissao(p.id)}
                />
                {p.nomeModulo} — <small>{p.descricaoModulo}</small>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir perfil"
        message={`Deseja excluir o perfil "${toDelete?.nome}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={excluirConfirmado}
      />
    </div>
  );

}
