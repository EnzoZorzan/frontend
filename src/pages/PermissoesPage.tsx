import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import "../styles/page.css";
import "../styles/form.css";

export default function PermissoesPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const toast = useToast();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nomeModulo: "",
    descricaoModulo: ""
  });

  // ================================
  // CARREGAR LISTA
  // ================================
  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8081/api/v1/permissoes", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao buscar permissões");

      const data = await res.json();
      setLista(data);

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar permissões", "error");
    }
    setLoading(false);
  }

  // ================================
  // NOVA PERMISSÃO
  // ================================
  function novo() {
    setEditando(null);
    setForm({
      nomeModulo: "",
      descricaoModulo: ""
    });
    setModalOpen(true);
  }

  // ================================
  // EDITAR PERMISSÃO
  // ================================
  function editar(item: any) {
    setEditando(item);
    setForm({
      nomeModulo: item.nomeModulo,
      descricaoModulo: item.descricaoModulo
    });
    setModalOpen(true);
  }

  // ================================
  // SALVAR (CREATE OU UPDATE)
  // ================================
  async function salvar() {
    const newErrors: Record<string, string> = {};

    // === VALIDAÇÕES ===
    if (!form.nomeModulo.trim()) newErrors.nomeModulo = "O nome da permissão é obrigatório.";
    if (!form.descricaoModulo.trim()) newErrors.descricaoModulo = "A descrição é obrigatória.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.showToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }

    setErrors({}); // limpa os erros antes de salvar

    try {
      const token = localStorage.getItem("token");

      const payload = {
        nomeModulo: form.nomeModulo,
        descricaoModulo: form.descricaoModulo
      };

      let res;

      if (editando) {
        res = await fetch(`http://localhost:8081/api/v1/permissoes/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("http://localhost:8081/api/v1/permissoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar permissão");

      toast.showToast(editando ? "Permissão atualizada!" : "Permissão criada!", "success");
      setModalOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao salvar permissão", "error");
    }
  }


  // ================================
  // EXCLUIR PERMISSÃO
  // ================================
  function confirmarExcluir(item: any) {
    setToDelete(item);
    setConfirmOpen(true);
  }

  async function excluirConfirmado() {
    if (!toDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8081/api/v1/permissoes/${toDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao excluir permissão");

      toast.showToast("Permissão excluída!", "success");

      setConfirmOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao excluir permissão", "error");
    }
  }

  // ================================
  // RENDER
  // ================================
  return (
    <div className="page-container">

      <div className="page-header">
        <h2>Permissões</h2>
        <button className="new-btn" onClick={novo}>Nova Permissão</button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DataTable
          columns={[
            { header: "ID", field: "id" },
            { header: "Nome", field: "nomeModulo" },
            { header: "Descrição", field: "descricaoModulo" }
          ]}
          data={lista}
          onEdit={editar}
          onDelete={confirmarExcluir}
        />
      )}

      <Modal
        open={modalOpen}
        title={editando ? "Editar Permissão" : "Nova Permissão"}
        onClose={() => setModalOpen(false)}
        onSave={salvar}
      >
        <div className="form-group">
          <label>Nome da Permissão</label>
          <input
            className={errors.nomeModulo ? "input-error" : ""}
            value={form.nomeModulo}
            onChange={e => setForm({ ...form, nomeModulo: e.target.value })}
          />
          {errors.nomeModulo && <span className="error-text">{errors.nomeModulo}</span>}
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            className={errors.descricaoModulo ? "input-error" : ""}
            value={form.descricaoModulo}
            onChange={e => setForm({ ...form, descricaoModulo: e.target.value })}
          />
          {errors.descricaoModulo && <span className="error-text">{errors.descricaoModulo}</span>}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir permissão"
        message={`Deseja excluir a permissão "${toDelete?.nomeModulo}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={excluirConfirmado}
      />
    </div>
  );
}
