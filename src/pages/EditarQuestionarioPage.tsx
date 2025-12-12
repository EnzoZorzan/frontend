// src/pages/questionarios/EditarQuestionarioPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";
import "../styles/page.css";
import "../styles/form.css";
import "../styles/questionario-edit.css";

type QuestaoEdit = {
    id?: number;
    descricaoPergunta: string;
    qtype: string;
    options?: string; 
    ord?: number;
    _opts?: string[];
};

type FormularioEdit = {
    id?: number;
    titulo: string;
    descricao?: string;
    empresa?: { id: number } | null;
    questoes: QuestaoEdit[];
};

const TIPOS = [
    { value: "texto", label: "Texto (curto)" },
    { value: "textarea", label: "Texto (parágrafo)" },
    { value: "numero", label: "Número" },
    { value: "multipla", label: "Múltipla escolha" },
    { value: "sim_nao", label: "Sim / Não" },
    { value: "1_a_5", label: "Nota 1 a 5" },
    { value: "likert", label: "Likert 1–5" },
    { value: "opcoes", label: "Lista personalizada" }
];

export default function EditarQuestionarioPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState<FormularioEdit>({
        titulo: "",
        descricao: "",
        empresa: null,
        questoes: []
    });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteIndex, setToDeleteIndex] = useState<number | null>(null);

    // carregar questionário
    useEffect(() => {
        if (id) carregar(Number(id));
    }, [id]);

    async function carregar(formId: number) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8081/api/v1/formularios/${formId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Erro ao carregar");

            const data = await res.json();

            const questoes: QuestaoEdit[] = (data.questoes || []).map((q: any, idx: number) => {
                let opts: string[] = [];
                try {
                    opts = q.options ? JSON.parse(q.options) : [];
                } catch {
                    opts = [];
                }
                return {
                    id: q.id,
                    descricaoPergunta: q.descricaoPergunta || "",
                    qtype: q.qtype || "texto",
                    options: q.options || "[]",
                    ord: q.ord ?? (idx + 1),
                    _opts: opts
                };
            });

            setForm({
                id: data.id,
                titulo: data.titulo || "",
                descricao: data.descricao || "",
                empresa: data.empresa || null,
                questoes
            });

        } catch (e) {
            console.error(e);
            toast.showToast("Erro ao carregar questionário", "error");
        }
    }

    // adicionar pergunta
    function adicionarQuestao() {
        setForm(prev => ({
            ...prev,
            questoes: [
                ...prev.questoes,
                {
                    descricaoPergunta: "",
                    qtype: "texto",
                    options: "[]",
                    ord: prev.questoes.length + 1,
                    _opts: []
                }
            ]
        }));
    }

    // editar pergunta
    function atualizarQuestao(index: number, patch: Partial<QuestaoEdit>) {
        setForm(prev => {
            const copy = [...prev.questoes];
            copy[index] = { ...copy[index], ...patch };
            return { ...prev, questoes: copy };
        });
    }

    // pedir confirmação para remover
    function pedirRemover(index: number) {
        setToDeleteIndex(index);
        setConfirmOpen(true);
    }

    function confirmarRemover() {
        if (toDeleteIndex === null) return;
        setForm(prev => {
            const copy = prev.questoes.filter((_, i) => i !== toDeleteIndex);
            return { ...prev, questoes: copy.map((q, i) => ({ ...q, ord: i + 1 })) };
        });
        setConfirmOpen(false);
        setToDeleteIndex(null);
    }

    // duplicar
    function duplicarQuestao(index: number) {
        setForm(prev => {
            const q = prev.questoes[index];
            const clone = { ...q, id: undefined, descricaoPergunta: q.descricaoPergunta + " (cópia)" };
            const newList = [...prev.questoes];
            newList.splice(index + 1, 0, clone);
            return { ...prev, questoes: newList.map((qq, i) => ({ ...qq, ord: i + 1 })) };
        });
    }

    // mover
    function moverQuestao(index: number, dir: -1 | 1) {
        setForm(prev => {
            const copy = [...prev.questoes];
            const to = index + dir;
            if (to < 0 || to >= copy.length) return prev;

            [copy[index], copy[to]] = [copy[to], copy[index]];
            return { ...prev, questoes: copy.map((q, i) => ({ ...q, ord: i + 1 })) };
        });
    }

    // opções
    function adicionarOption(qIdx: number) {
        setForm(prev => {
            const copy = [...prev.questoes];
            copy[qIdx]._opts = [...(copy[qIdx]._opts ?? []), ""];
            return { ...prev, questoes: copy };
        });
    }

    function atualizarOption(qIdx: number, optIdx: number, text: string) {
        setForm(prev => {
            const copy = [...prev.questoes];
            const opts = [...(copy[qIdx]._opts ?? [])];
            opts[optIdx] = text;
            copy[qIdx]._opts = opts;
            return { ...prev, questoes: copy };
        });
    }

    function removerOption(qIdx: number, optIdx: number) {
        setForm(prev => {
            const copy = [...prev.questoes];
            copy[qIdx]._opts = (copy[qIdx]._opts ?? []).filter((_, i) => i !== optIdx);
            return { ...prev, questoes: copy };
        });
    }

    // salvar
    async function salvar() {
        try {
            if (!form.titulo.trim()) {
                toast.showToast("Título é obrigatório", "error");
                return;
            }

            const questoesPayload = form.questoes.map((q, idx) => ({
                id: q.id,
                descricaoPergunta: q.descricaoPergunta,
                qtype: q.qtype,
                options: JSON.stringify(q._opts ?? []),
                ord: q.ord ?? idx + 1
            }));

            const payload: any = {
                titulo: form.titulo,
                descricao: form.descricao,
                empresa: form.empresa ? { id: form.empresa.id } : null,
                questoes: questoesPayload
            };

            const token = localStorage.getItem("token");
            const isNew = !form.id;
            const url = isNew
                ? "http://localhost:8081/api/v1/formularios"
                : `http://localhost:8081/api/v1/formularios/${form.id}`;

            const res = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Erro ao salvar");
            }

            toast.showToast(isNew ? "Questionário criado!" : "Questionário salvo!", "success");
            navigate("/questionarios");

        } catch (e) {
            console.error(e);
            toast.showToast("Erro ao salvar questionário", "error");
        }
    }

    // voltar
    function voltar() {
        navigate("/questionarios");
    }

    // render card
    function renderCard(q: QuestaoEdit, idx: number) {
        const usesOptions = ["multipla", "opcoes", "likert"].includes(q.qtype);

        return (
            <div className="questao-card" key={idx}>
                <div className="card-header">
                    <div className="card-title">
                        <strong>{idx + 1}.</strong>
                        <input
                            className="card-question-input"
                            placeholder="Digite a pergunta..."
                            value={q.descricaoPergunta}
                            onChange={(e) => atualizarQuestao(idx, { descricaoPergunta: e.target.value })}
                        />
                    </div>

                    <div className="card-actions">
                        <select
                            value={q.qtype}
                            onChange={(e) => {
                                const newType = e.target.value;
                                atualizarQuestao(idx, {
                                    qtype: newType,
                                    _opts:
                                        newType === "likert"
                                            ? ["1", "2", "3", "4", "5"]
                                            : q._opts ?? []
                                });
                            }}
                        >
                            {TIPOS.map(t => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>

                        <div className="action-buttons">
                            <button onClick={() => moverQuestao(idx, -1)}>↑</button>
                            <button onClick={() => moverQuestao(idx, 1)}>↓</button>
                            <button onClick={() => duplicarQuestao(idx)}>⎘</button>
                            <button className="danger" onClick={() => pedirRemover(idx)}>✕</button>
                        </div>
                    </div>
                </div>

                <div className="card-body">

                    {usesOptions && (
                        <div className="options-editor">
                            <label>Opções</label>

                            {(q._opts ?? []).map((opt, oi) => (
                                <div key={oi} className="option-row">
                                    <input
                                        value={opt}
                                        onChange={(e) => atualizarOption(idx, oi, e.target.value)}
                                        placeholder={`Opção ${oi + 1}`}
                                    />
                                    <button onClick={() => removerOption(idx, oi)}>✕</button>
                                </div>
                            ))}

                            <div className="option-actions">
                                <button onClick={() => adicionarOption(idx)}>+ Adicionar opção</button>

                                {q.qtype === "likert" && (q._opts ?? []).length === 0 && (
                                    <button
                                        onClick={() =>
                                            atualizarQuestao(idx, {
                                                _opts: [
                                                    "Discordo",
                                                    "Parcialmente",
                                                    "Neutro",
                                                    "Concordo",
                                                    "Concordo totalmente"
                                                ]
                                            })
                                        }
                                    >
                                        Preencher Likert padrão
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <h2>{form.id ? "Editar Questionário" : "Novo Questionário"}</h2>
                    <button className="back-btn" onClick={voltar}>Voltar</button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button className="secondary-btn" onClick={adicionarQuestao}>+ Pergunta</button>
                    <button className="primary-btn" onClick={salvar}>Salvar Questionário</button>
                </div>
            </div>

            <div className="form-section">
                <div className="form-group">
                    <label>Título</label>
                    <input
                        value={form.titulo}
                        onChange={e => setForm({ ...form, titulo: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Descrição</label>
                    <textarea
                        value={form.descricao}
                        onChange={e => setForm({ ...form, descricao: e.target.value })}
                    />
                </div>
            </div>

            <div className="questoes-list">
                {form.questoes.length === 0 ? (
                    <div className="empty">Nenhuma pergunta adicionada — clique em "+ Pergunta"</div>
                ) : (
                    form.questoes.map((q, i) => renderCard(q, i))
                )}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Remover pergunta"
                message="Deseja remover esta pergunta?"
                onCancel={() => { setConfirmOpen(false); setToDeleteIndex(null); }}
                onConfirm={confirmarRemover}
            />
        </div>
    );
}
