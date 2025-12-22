import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

import "../styles/page.css";
import "../styles/form.css";

export default function QuestionariosPage() {

  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: "",
    descricao: ""
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

      const res = await fetch(`${API_URL}/api/v1/formularios`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao buscar questionários");
      const data = await res.json();

      setLista(data);

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar questionários", "error");
    }
    setLoading(false);
  }

  // ================================
  // NOVO
  // ================================
  function novo() {
    setEditando(null);
    setForm({ titulo: "", descricao: "" });
    setModalOpen(true);
  }

  // ================================
  // EDITAR BÁSICO
  // ================================
  function editar(item: any) {
    setEditando(item);
    setForm({
      titulo: item.titulo,
      descricao: item.descricao || ""
    });
    setModalOpen(true);
  }

  // ================================
  // EDITAR PERGUNTAS
  // ================================
  function editarPerguntas(item: any) {
    navigate(`/questionarios/${item.id}`);
  }

  // ================================
  // SALVAR (CREATE OR UPDATE)
  // ================================
  async function salvar() {
    const newErrors: Record<string, string> = {};

    // === VALIDAÇÃO ===
    if (!form.titulo.trim()) newErrors.titulo = "O título é obrigatório.";
    if (!form.descricao.trim()) newErrors.descricao = "A descrição é obrigatória.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.showToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }

    setErrors({}); // limpa erros

    try {
      const token = localStorage.getItem("token");

      const payload = {
        titulo: form.titulo,
        descricao: form.descricao
      };

      let res;

      if (editando) {
        res = await fetch(`${API_URL}/api/v1/formularios/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/v1/formularios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar questionário");

      toast.showToast(editando ? "Questionário atualizado!" : "Questionário criado!", "success");

      setModalOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao salvar questionário", "error");
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

      const res = await fetch(`${API_URL}/api/v1/formularios/${toDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao excluir questionário");

      toast.showToast("Questionário excluído!", "success");
      setConfirmOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao excluir questionário", "error");
    }
  }

  // ================================
  // RENDER
  // ================================
  return (
    <div className="page-container">

      <div className="page-header">
        <h2>Questionários</h2>
        <button className="new-btn" onClick={novo}>Novo Questionário</button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DataTable
          columns={[
            { header: "Título", field: "titulo" },
            { header: "Perguntas", field: "questoes.length" }
          ]}
          data={lista}
          onEdit={editar}
          onCustomAction={(row: any) => editarPerguntas(row)}
          customActionLabel="Perguntas"
          onDelete={confirmarExcluir}
        />
      )}

      {/* MODAL */}
      <Modal
        open={modalOpen}
        title={editando ? "Editar Questionário" : "Novo Questionário"}
        onClose={() => setModalOpen(false)}
        onSave={salvar}
      >
        <div className="form-group">
          <label>Título</label>
          <input
            className={errors.titulo ? "input-error" : ""}
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
          />
          {errors.titulo && <span className="error-text">{errors.titulo}</span>}
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            className={errors.descricao ? "input-error" : ""}
            value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })}
          ></textarea>
          {errors.descricao && <span className="error-text">{errors.descricao}</span>}
        </div>

      </Modal>

      {/* CONFIRMAR EXCLUSÃO */}
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir questionário"
        message={`Deseja excluir "${toDelete?.titulo}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={excluirConfirmado}
      />

    </div>
  );
}
