import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import "../styles/page.css";
import "../styles/form.css";

export default function EmpresasPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const toast = useToast();

  // FORM ALINHADO COM A ENTIDADE Java
  const [form, setForm] = useState({
    nome: "",
    emailEmp: "",
    telefoneEmp: "",
    enderecoEmp: "",
    cnpj: ""
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

      const res = await fetch("http://localhost:8081/api/v1/empresas", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao buscar empresas");

      const data = await res.json();
      setLista(data);

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao carregar empresas", "error");
    }
    setLoading(false);
  }

  // ================================
  // NOVA EMPRESA
  // ================================
  function novo() {
    setEditando(null);
    setForm({
      nome: "",
      emailEmp: "",
      telefoneEmp: "",
      enderecoEmp: "",
      cnpj: ""
    });
    setModalOpen(true);
  }

  // ================================
  // EDITAR EMPRESA
  // ================================
  function editar(item: any) {
    setEditando(item);
    setForm({
      nome: item.nome,
      emailEmp: item.emailEmp,
      telefoneEmp: item.telefoneEmp,
      enderecoEmp: item.enderecoEmp,
      cnpj: item.cnpj
    });
    setModalOpen(true);
  }

  // ================================
  // SALVAR (CREATE OR UPDATE)
  // ================================
  async function salvar() {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        nome: form.nome,
        emailEmp: form.emailEmp,
        telefoneEmp: form.telefoneEmp,
        enderecoEmp: form.enderecoEmp,
        cnpj: form.cnpj
      };

      let res;

      if (editando) {
        res = await fetch(`http://localhost:8081/api/v1/empresas/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("http://localhost:8081/api/v1/empresas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar empresa");

      toast.showToast(editando ? "Empresa atualizada!" : "Empresa criada!", "success");

      setModalOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao salvar empresa", "error");
    }
  }

  // ================================
  // EXCLUIR EMPRESA
  // ================================
  function confirmarExcluir(item: any) {
    setToDelete(item);
    setConfirmOpen(true);
  }

  async function excluirConfirmado() {
    if (!toDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8081/api/v1/empresas/${toDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao excluir empresa");

      toast.showToast("Empresa excluída!", "success");

      setConfirmOpen(false);
      carregar();

    } catch (e) {
      console.error(e);
      toast.showToast("Erro ao excluir empresa", "error");
    }
  }

  // ================================
  // RENDER
  // ================================
  return (
    <div className="page-container">

      <div className="page-header">
        <h2>Empresas</h2>
        <button className="new-btn" onClick={novo}>Nova Empresa</button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DataTable
          columns={[
            { header: "Nome", field: "nome" },
            { header: "Email", field: "emailEmp" },
            { header: "Telefone", field: "telefoneEmp" },
            { header: "Endereço", field: "enderecoEmp" },
            { header: "CNPJ", field: "cnpj" }
          ]}
          data={lista}
          onEdit={editar}
          onDelete={confirmarExcluir}
        />
      )}

      {/* MODAL */}
      <Modal
        open={modalOpen}
        title={editando ? "Editar Empresa" : "Nova Empresa"}
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
          <label>E-mail</label>
          <input
            value={form.emailEmp}
            onChange={e => setForm({ ...form, emailEmp: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Telefone</label>
          <input
            value={form.telefoneEmp}
            onChange={e => setForm({ ...form, telefoneEmp: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Endereço</label>
          <input
            value={form.enderecoEmp}
            onChange={e => setForm({ ...form, enderecoEmp: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>CNPJ</label>
          <input
            value={form.cnpj}
            onChange={e => setForm({ ...form, cnpj: e.target.value })}
          />
        </div>
      </Modal>

      {/* CONFIRMAR EXCLUSÃO */}
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir empresa"
        message={`Deseja excluir a empresa "${toDelete?.nome}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={excluirConfirmado}
      />
    </div>
  );
}
