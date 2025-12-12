import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import "../styles/page.css";
import "../styles/form.css";

type ConviteDTO = {
    id: number;
    email?: string;
    tokenAcesso: string;
    respondido: boolean;
    enviadoEm: string;
    respondidoEm?: string;
    formulario: { id: number; titulo: string };
};

export default function ConvitesPage() {

    const [lista, setLista] = useState<ConviteDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState<ConviteDTO | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<ConviteDTO | null>(null);

    const toast = useToast();

    const [formularios, setFormularios] = useState<any[]>([]);
    const [form, setForm] = useState({
        formularioId: 0,
        email: ""
    });

    // Carregamento inicial
    useEffect(() => {
        carregarConvites();
        carregarFormularios();
    }, []);

    // ============================================================
    // CARREGAR LISTA DE CONVITES
    // ============================================================
    async function carregarConvites() {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8081/api/v1/convites", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            setLista(data);
        } catch {
            toast.showToast("Erro ao carregar convites", "error");
        }
        setLoading(false);
    }

    // ============================================================
    // CARREGAR FORMULÁRIOS
    // ============================================================
    async function carregarFormularios() {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8081/api/v1/formularios", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            setFormularios(data);
        } catch {
            toast.showToast("Erro ao carregar formulários", "error");
        }
    }

    // ============================================================
    // NOVO CONVITE
    // ============================================================
    function novoConvite() {
        setEditando(null);
        setForm({ formularioId: 0, email: "" });
        setModalOpen(true);
    }

    // ============================================================
    // EDITAR CONVITE
    // ============================================================
    function editar(item: ConviteDTO) {
        setEditando(item);
        setForm({
            formularioId: item.formulario?.id ?? 0,
            email: item.email ?? ""
        });
        setModalOpen(true);
    }

    // ============================================================
    // CONFIRMAR EXCLUSÃO
    // ============================================================
    function confirmarExcluir(item: ConviteDTO) {
        setToDelete(item);
        setConfirmOpen(true);
    }

    async function excluirConfirmado() {
        if (!toDelete) return;

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`http://localhost:8081/api/v1/convites/${toDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error();

            toast.showToast("Convite removido!", "success");
            setConfirmOpen(false);
            carregarConvites();

        } catch {
            toast.showToast("Erro ao excluir convite", "error");
        }
    }

    // ============================================================
    // SALVAR CONVITE
    // ============================================================
    async function salvarConvite() {
        if (form.formularioId === 0) {
            toast.showToast("Selecione um formulário", "error");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (form.email.trim() !== "") {
                // convite por e-mail
                await fetch(
                    `http://localhost:8081/api/v1/convites/email/${form.formularioId}?email=${form.email}`,
                    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // convite TOTEM
                await fetch(
                    `http://localhost:8081/api/v1/convites/totem/${form.formularioId}`,
                    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
                );
            }

            toast.showToast("Convite gerado!", "success");
            setModalOpen(false);
            carregarConvites();

        } catch {
            toast.showToast("Erro ao gerar convite", "error");
        }
    }

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="page-container">

            <div className="page-header">
                <h2>Convites de Pesquisa</h2>
                <button className="new-btn" onClick={novoConvite}>
                    Novo Convite
                </button>
            </div>

            {loading ? (
                <div>Carregando...</div>
            ) : (
                <DataTable
                    columns={[
                        { header: "Formulário", field: "formulario.titulo" },
                        { header: "E-mail", field: "email" },
                        { header: "Respondido", field: "respondido" },
                        { header: "Token", field: "tokenAcesso" }
                    ]}
                    data={lista}
                    onEdit={editar}
                    onDelete={confirmarExcluir}
                />
            )}

            <Modal
                open={modalOpen}
                title={editando ? "Editar Convite" : "Gerar Convite"}
                onClose={() => setModalOpen(false)}
                onSave={salvarConvite}
            >
                <div className="form-group">
                    <label>Formulário</label>
                    <select
                        value={form.formularioId}
                        onChange={(e) =>
                            setForm({ ...form, formularioId: Number(e.target.value) })
                        }
                    >
                        <option value={0}>Selecione...</option>
                        {formularios.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.titulo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>E-mail (opcional)</label>
                    <input
                        placeholder="Deixe vazio para TOTEM"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </div>
            </Modal>

            <ConfirmDialog
                open={confirmOpen}
                title="Excluir Convite"
                message={`Deseja excluir o convite para "${toDelete?.email || "TOTEM"}"?`}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={excluirConfirmado}
            />
        </div>
    );
}
