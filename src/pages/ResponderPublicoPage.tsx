import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/responder.css";
import { useToast } from "../context/ToastContext";

type Questao = {
    id: number;
    descricaoPergunta: string;
    qtype: string;          // "texto", "numero", "alternativa", etc.
    options?: string[];     // quando for múltipla escolha
    ord: number;
};

type FormularioDTO = {
    id: number;
    titulo: string;
    descricao: string;
    questoes: Questao[];
};

export default function ResponderPublicoPage() {
    const { token } = useParams();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [formulario, setFormulario] = useState<FormularioDTO | null>(null);
    const [respostas, setRespostas] = useState<Record<string, any>>({});
    const [sucesso, setSucesso] = useState(false);
    {/* BARRA DE PROGRESSO */ }
    const progresso = formulario
        ? (Object.keys(respostas).length / formulario.questoes.length) * 100
        : 0;

    // =========================================================
    // VALIDAR TOKEN + CARREGAR FORMULÁRIO
    // =========================================================
    useEffect(() => {
        async function init() {
            try {
                const res = await fetch(`http://localhost:8081/api/v1/convites/validar/${token}`);
                if (!res.ok) throw new Error("Token inválido");

                const convite = await res.json();
                const form = convite.formulario;

                // ordena pelas ord
                form.questoes.sort((a: any, b: any) => a.ord - b.ord);

                setFormulario(form);
            } catch (e) {
                toast.showToast("Token inválido ou já respondido.", "error");
            }
            setLoading(false);
        }
        init();
    }, [token]);

    // =========================================================
    // SALVAR RESPOSTA
    // =========================================================
    async function enviar() {
        try {
            const body = {
                token,
                respostas
            };

            const res = await fetch("http://localhost:8081/api/v1/respostas-publicas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error();

            setSucesso(true);
        } catch {
            toast.showToast("Erro ao enviar respostas", "error");
        }
    }

    // =========================================================
    // RENDER
    // =========================================================
    if (loading) return <div className="loading-screen">Carregando...</div>;

    if (!formulario)
        return <div className="invalid-token">Link expirado ou inválido.</div>;

    if (sucesso)
        return (
            <div className="thanks-container">
                <h1>Obrigado por responder!</h1>
                <p>Sua opinião é muito importante para nós ❤️</p>
            </div>
        );

    return (
        <div className="responder-container">


            <div className="form-box">

                <h1 className="form-title">{formulario.titulo}</h1>
                <p className="form-desc">{formulario.descricao}</p>

                <div className="questions-area">
                    <div className="progress-bar-wrapper">
                        <div className="progress-bar-fill" style={{ width: `${progresso}%` }} />
                    </div>
                    {formulario.questoes.map((q) => (
                        <div key={q.id} className="question-block">
                            <label className="question-title">{q.descricaoPergunta}</label>

                            {/* TEXTO */}
                            {q.qtype === "texto" && (
                                <input
                                    type="text"
                                    className="input-field"
                                    onChange={(e) =>
                                        setRespostas((prev) => ({ ...prev, [q.id]: e.target.value }))
                                    }
                                />
                            )}

                            {/* PARÁGRAFO */}
                            {q.qtype === "paragrafo" && (
                                <textarea
                                    className="textarea-field"
                                    onChange={(e) =>
                                        setRespostas((prev) => ({ ...prev, [q.id]: e.target.value }))
                                    }
                                />
                            )}

                            {/* NÚMERO */}
                            {q.qtype === "numero" && (
                                <input
                                    type="number"
                                    className="input-field"
                                    onChange={(e) =>
                                        setRespostas((prev) => ({ ...prev, [q.id]: e.target.value }))
                                    }
                                />
                            )}

                            {/* SIM / NÃO */}
                            {q.qtype === "boolean" && (
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`bool-${q.id}`}
                                            value="sim"
                                            onChange={() =>
                                                setRespostas((prev) => ({ ...prev, [q.id]: "sim" }))
                                            }
                                        />{" "}
                                        Sim
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            name={`bool-${q.id}`}
                                            value="nao"
                                            onChange={() =>
                                                setRespostas((prev) => ({ ...prev, [q.id]: "nao" }))
                                            }
                                        />{" "}
                                        Não
                                    </label>
                                </div>
                            )}

                            {/* MULTIPLA ESCOLHA */}
                            {q.qtype === "alternativa" && (
                                <div className="radio-group">
                                    {q.options?.map((op, idx) => (
                                        <label key={idx}>
                                            <input
                                                type="radio"
                                                name={`alt-${q.id}`}
                                                value={op}
                                                onChange={() =>
                                                    setRespostas((prev) => ({ ...prev, [q.id]: op }))
                                                }
                                            />{" "}
                                            {op}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button className="btn-send" onClick={enviar}>
                    Enviar Respostas
                </button>

            </div>
        </div>
    );
}
