import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

import "../styles/page.css";
import "../styles/form.css";

type EmpresaDTO = {
  id: number;
  nome: string;
};

type FuncionarioDTO = {
  id?: number;
  nomeFunc: string;
  codigoFunc: string;
  empresaFunc: EmpresaDTO;
};

export default function FuncionariosPage() {
  const toast = useToast();

  const [lista, setLista] = useState<FuncionarioDTO[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<FuncionarioDTO | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FuncionarioDTO | null>(null);

  const [form, setForm] = useState({
    nomeFunc: "",
    codigoFunc: "",
    empresaId: 0
  });

  // ======================================================
  // LOAD
  // ======================================================
  useEffect(() => {
    carregar();
    carregarEmpresas();
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8081/api/v1/funcionarios", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setLista(data);
    } catch {
      toast.showToast("Erro ao carregar funcionários", "error");
    }
    setLoading(false);
  }

  async function carregarEmpresas() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8081/api/v1/empresas", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setEmpresas(data);
    } catch {
      toast.showToast("Erro ao carregar empresas", "error");
    }
  }

  // ======================================================
  // AÇÕES
  // ======================================================
  function novo() {
    setEditando(null);
    setForm({
      nomeFunc: "",
      codigoFunc: "",
      empresaId: 0
    });
    setModalOpen(true);
  }

  function editar(item: FuncionarioDTO) {
    setEditando(item);
    setForm({
      nomeFunc: item.nomeFunc,
      codigoFunc: item.codigoFunc,
      empresaId: item.empresaFunc?.id ?? 0
    });
    setModalOpen(true);
  }

  function confirmarExcluir(item: FuncionarioDTO) {
    setToDelete(item);
    setConfirmOpen(true);
  }

  async function excluirConfirmado() {
    if (!toDelete?.id) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8081/api/v1/funcionarios/${toDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error();

      toast.showToast("Funcionário removido!", "success");
      setConfirmOpen(false);
      carregar();
    } catch {
      toast.showToast("Erro ao excluir funcionário", "error");
    }
  }

  async function importarCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:8081/api/v1/funcionarios/importar-csv",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      toast.showToast("Funcionários importados com sucesso!", "success");
      carregar();
    } catch (err: any) {
      toast.showToast(
        err.message || "Erro ao importar CSV",
        "error"
      );
    } finally {
      e.target.value = "";
    }
  }


  async function salvar() {
    if (!form.nomeFunc || !form.codigoFunc || form.empresaId === 0) {
      toast.showToast("Preencha todos os campos obrigatórios", "error");
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      nomeFunc: form.nomeFunc,
      codigoFunc: form.codigoFunc,
      empresaFunc: { id: form.empresaId }
    };

    try {
      let res;

      if (editando?.id) {
        res = await fetch(
          `http://localhost:8081/api/v1/funcionarios/${editando.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }
        );
      } else {
        res = await fetch("http://localhost:8081/api/v1/funcionarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error();

      toast.showToast(
        editando ? "Funcionário atualizado!" : "Funcionário criado!",
        "success"
      );

      setModalOpen(false);
      carregar();
    } catch {
      toast.showToast("Erro ao salvar funcionário", "error");
    }
  }

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Funcionários</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="new-btn" onClick={novo}>
            Novo Funcionário
          </button>

          <label className="import-btn">
            Importar CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={importarCsv}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DataTable
          columns={[
            { header: "Nome", field: "nomeFunc" },
            { header: "Código", field: "codigoFunc" },
            { header: "Empresa", field: "empresaFunc.nome" }
          ]}
          data={lista}
          onEdit={editar}
          onDelete={confirmarExcluir}
        />
      )}

      {/* MODAL */}
      <Modal
        open={modalOpen}
        title={editando ? "Editar Funcionário" : "Novo Funcionário"}
        onClose={() => setModalOpen(false)}
        onSave={salvar}
      >
        <div className="form-group">
          <label>Nome</label>
          <input
            value={form.nomeFunc}
            onChange={(e) =>
              setForm({ ...form, nomeFunc: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Código</label>
          <input
            value={form.codigoFunc}
            onChange={(e) =>
              setForm({ ...form, codigoFunc: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Empresa</label>
          <select
            value={form.empresaId}
            onChange={(e) =>
              setForm({ ...form, empresaId: Number(e.target.value) })
            }
          >
            <option value={0}>Selecione...</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir funcionário"
        message={`Deseja excluir "${toDelete?.nomeFunc}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={excluirConfirmado}
      />
    </div>
  );
}
