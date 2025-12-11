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
    options?: string; // JSON string
    ord?: number;
    // campo temporário para edição das options como array
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
    { value: "multipla", label: "Múltipla escolha (várias respostas)" },
    { value: "sim_nao", label: "Sim / Não" },
    { value: "1_a_5", label: "Nota 1 a 5" },
    { value: "likert", label: "Likert 1–5" },
    { value: "opcoes", label: "Lista de opções personalizada" }
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

    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteIndex, setToDeleteIndex] = useState<number | null>(null);

    // carregar questionário
    useEffect(() => {
        if (id) carregar(Number(id));
    }, [id]);

    async function carregar(formId: number) {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8081/api/v1/formularios/${formId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Erro ao carregar questionário");
            const data = await res.json();

            // mapear questoes para o formato editável, desserializar options
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
        } finally {
            setLoading(false);
        }
    }

    // adicionar nova pergunta
    function adicionarQuestao() {
        setForm(prev => {
            const q: QuestaoEdit = {
                descricaoPergunta: "",
                qtype: "texto",
                options: "[]",
                ord: prev.questoes.length + 1,
                _opts: []
            };
            return { ...prev, questoes: [...prev.questoes, q] };
        });
    }

    // editar campo da questão
    function atualizarQuestao(index: number, patch: Partial<QuestaoEdit>) {
        setForm(prev => {
            const copy = [...prev.questoes];
            copy[index] = { ...copy[index], ...patch };
            // keep ord consistent
            return { ...prev, questoes: copy };
        });
    }

    // remover pergunta (com confirmação)
    function pedirRemover(index: number) {
        setToDeleteIndex(index);
        setConfirmOpen(true);
    }

    function confirmarRemover() {
        if (toDeleteIndex === null) return;
        setForm(prev => {
            const copy = prev.questoes.filter((_, i) => i !== toDeleteIndex);
            // reindex ord
            const reord = copy.map((q, i) => ({ ...q, ord: i + 1 }));
            return { ...prev, questoes: reord };
        });
        setConfirmOpen(false);
        setToDeleteIndex(null);
    }

    // duplicar pergunta
    function duplicarQuestao(index: number) {
        setForm(prev => {
            const q = prev.questoes[index];
            const copy = [...prev.questoes];
            const clone = {
                ...q,
                id: undefined,
                descricaoPergunta: q.descricaoPergunta + " (cópia)"
            };
            copy.splice(index + 1, 0, clone);
            return { ...prev, questoes: copy.map((qq, i) => ({ ...qq, ord: i + 1 })) };
        });
    }

    // reorder up/down
    function moverQuestao(index: number, dir: -1 | 1) {
        setForm(prev => {
            const copy = [...prev.questoes];
            const to = index + dir;
            if (to < 0 || to >= copy.length) return prev;
            const temp = copy[to];
            copy[to] = copy[index];
            copy[index] = temp;
            return { ...prev, questoes: copy.map((q, i) => ({ ...q, ord: i + 1 })) };
        });
    }

    // gerenciar options (array) — só para tipos que usam options
    function adicionarOption(qIdx: number, text = "") {
        setForm(prev => {
            const copy = [...prev.questoes];
            const arr = copy[qIdx]._opts ?? [];
            copy[qIdx]._opts = [...arr, text];
            return { ...prev, questoes: copy };
        });
    }

    function atualizarOption(qIdx: number, optIdx: number, text: string) {
        setForm(prev => {
            const copy = [...prev.questoes];
            const arr = copy[qIdx]._opts ?? [];
            arr[optIdx] = text;
            copy[qIdx]._opts = [...arr];
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

    // salvar questionário (create ou update)
    async function salvar() {
        try {
            // validações mínimas
            if (!form.titulo.trim()) {
                toast.showToast("Título é obrigatório", "error");
                return;
            }

            // montar payload transformando _opts para options (string JSON)
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
                throw new Error(txt || "Erro ao salvar questionário");
            }

            toast.showToast(isNew ? "Questionário criado!" : "Questionário salvo!", "success");
            // após salvar, recarregar ou navegar para listagem
            const saved = await res.json();
            navigate("/questionarios");
        } catch (e) {
            console.error(e);
            toast.showToast("Erro ao salvar questionário", "error");
        }
    }

    // cancelar -> voltar
    function voltar() {
        navigate("/questionarios");
    }

    // render do card de uma questão
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
                                // reset options if switching to non-options type
                                atualizarQuestao(idx, {
                                    qtype: newType,
                                    _opts: ["likert"].includes(newType) ? ["1", "2", "3", "4", "5"] : (q._opts ?? [])
                                });
                            }}
                        >
                            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>

                        <div className="action-buttons">
                            <button onClick={() => moverQuestao(idx, -1)} title="Mover para cima">↑</button>
                            <button onClick={() => moverQuestao(idx, 1)} title="Mover para baixo">↓</button>
                            <button onClick={() => duplicarQuestao(idx)} title="Duplicar">⎘</button>
                            <button className="danger" onClick={() => pedirRemover(idx)} title="Remover">✕</button>
                        </div>

                    </div>
                </div>

                <div className="card-body">
                    {q.qtype === "texto" && (
                        <div className="preview small">Resposta curta (texto)</div>
                    )}

                    {q.qtype === "textarea" && (
                        <div className="preview small">Resposta em parágrafo (textarea)</div>
                    )}

                    {q.qtype === "numero" && (
                        <div className="preview small">Resposta numérica</div>
                    )}

                    {q.qtype === "sim_nao" && (
                        <div className="preview small">Sim / Não</div>
                    )}

                    {q.qtype === "1_a_5" && (
                        <div className="preview small">Escala 1 — 5 (nota)</div>
                    )}

                    {(q.qtype === "multipla" || q.qtype === "opcoes" || q.qtype === "likert") && (
                        <div className="options-editor">
                            <label>Opções</label>

                            {(q._opts ?? []).map((opt, oi) => (
                                <div key={oi} className="option-row">
                                    <input
                                        value={opt}
                                        onChange={(e) => atualizarOption(idx, oi, e.target.value)}
                                        placeholder={`Opção ${oi + 1}`}
                                    />
                                    <button onClick={() => removerOption(idx, oi)} title="Remover opção">✕</button>
                                </div>
                            ))}

                            <div className="option-actions">
                                <button onClick={() => adicionarOption(idx, "")}>+ Adicionar opção</button>
                                {q.qtype === "likert" && (q._opts ?? []).length === 0 && (
                                    <button onClick={() => {
                                        // preencher likert padrão
                                        atualizarQuestao(idx, { _opts: ["Discordo", "Parcialmente", "Neutro", "Concordo", "Concordo totalmente"] } as any);
                                    }}>Preencher Likert padrão</button>
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
                    <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Descrição</label>
                    <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
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
