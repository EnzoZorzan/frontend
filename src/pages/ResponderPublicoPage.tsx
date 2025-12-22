import { useEffect, useState } from "react";
import "../styles/responder.css";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL;

type Questao = {
    id: number;
    descricaoPergunta: string;
    qtype: string;
    options?: string[];
    ord: number;
};

type FormularioDTO = {
    id: number;
    titulo: string;
    descricao: string;
    questoes: Questao[];
};

export default function ResponderPublicoPage() {
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [formulario, setFormulario] = useState<FormularioDTO | null>(null);

    const [codigoFunc, setCodigoFunc] = useState("");
    const [autorizado, setAutorizado] = useState(false);
    const [validandoCodigo, setValidandoCodigo] = useState(false);

    const [respostas, setRespostas] = useState<Record<string, any>>({});
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    // =========================================================
    // PROGRESSO
    // =========================================================
    const progresso =
        formulario && formulario.questoes.length > 0
            ? Math.round(
                (Object.keys(respostas).length / formulario.questoes.length) * 100
            )
            : 0;

    // =========================================================
    // CARREGAR FORMULÁRIO PÚBLICO
    // =========================================================
    useEffect(() => {
        async function init() {
            try {
                const res = await fetch(
                    `${API_URL}/api/v1/formularios/publico`
                );

                if (!res.ok) throw new Error();

                const form = await res.json();
                form.questoes.sort((a: Questao, b: Questao) => a.ord - b.ord);
                setFormulario(form);
            } catch {
                toast.showToast("Pesquisa indisponível no momento.", "error");
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [toast]);

    // =========================================================
    // VALIDAR CÓDIGO DO FUNCIONÁRIO
    // =========================================================
    async function validarCodigo() {
        if (!codigoFunc.trim()) {
            toast.showToast("Informe seu código de acesso.", "info");
            return;
        }

        if (!formulario) return;

        setValidandoCodigo(true);

        try {
            const res = await fetch(`${API_URL}/api/v1/acesso/validar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formularioId: formulario.id,
                    codigoFunc
                })
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            setAutorizado(true);
            toast.showToast(
                "Acesso liberado! Pode responder a pesquisa.",
                "success"
            );
        } catch (e: any) {
            toast.showToast(
                e.message || "Código inválido ou pesquisa já respondida.",
                "error"
            );
        } finally {
            setValidandoCodigo(false);
        }
    }

    // =========================================================
    // ENVIAR RESPOSTAS
    // =========================================================
    async function enviar() {
        if (!formulario || !autorizado) {
            toast.showToast("Acesso não autorizado.", "error");
            return;
        }

        if (Object.keys(respostas).length < formulario.questoes.length) {
            toast.showToast(
                "Responda todas as perguntas antes de enviar.",
                "info"
            );
            return;
        }

        setEnviando(true);

        try {
            const res = await fetch(
                `${API_URL}/api/v1/respostas/respostas-publicas`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        formularioId: formulario.id,
                        codigoFunc,
                        respostas
                    })
                }
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            setSucesso(true);
        } catch (e: any) {
            toast.showToast(e.message || "Erro ao enviar respostas.", "error");
        } finally {
            setEnviando(false);
        }
    }

    // =========================================================
    // RENDER
    // =========================================================
    if (loading) {
        return <div className="loading-screen">Carregando...</div>;
    }

    if (!formulario) {
        return (
            <div className="invalid-token">
                <h2>Pesquisa indisponível</h2>
                <p>Não há pesquisa ativa no momento.</p>
            </div>
        );
    }

    if (sucesso) {
        return (
            <div className="thanks-container">
                <h1>Obrigado por responder!</h1>
                <p>Sua opinião é muito importante para nós ❤️</p>
            </div>
        );
    }

    return (
        <div className="responder-container">
            <div className="form-box">
                <h1 className="form-title">{formulario.titulo}</h1>
                <p className="form-desc">{formulario.descricao}</p>

                {/* ================= CÓDIGO DO FUNCIONÁRIO ================= */}
                {!autorizado && (
                    <div className="codigo-acesso-box">
                        <label>Código de acesso</label>
                        <input
                            className="input-field"
                            placeholder="Digite seu código"
                            value={codigoFunc}
                            onChange={(e) => setCodigoFunc(e.target.value)}
                        />

                        <button
                            className="btn-send"
                            onClick={validarCodigo}
                            disabled={validandoCodigo}
                        >
                            {validandoCodigo ? "Validando..." : "Acessar Pesquisa"}
                        </button>
                    </div>
                )}

                {/* ================= QUESTIONÁRIO ================= */}
                {autorizado && (
                    <>
                        {/* PROGRESSO */}
                        <div className="progress-bar-wrapper">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progresso}%` }}
                            />
                        </div>

                        {/* QUESTÕES */}
                        <div className="questions-area">
                            {formulario.questoes.map((q) => (
                                <div key={q.id} className="question-block">
                                    <label className="question-title">
                                        {q.descricaoPergunta}
                                    </label>

                                    {/* TEXTO CURTO */}
                                    {q.qtype === "texto" && (
                                        <input
                                            className="input-field"
                                            onChange={(e) =>
                                                setRespostas((prev) => ({
                                                    ...prev,
                                                    [q.id]: e.target.value
                                                }))
                                            }
                                        />
                                    )}

                                    {/* TEXTO LONGO */}
                                    {q.qtype === "paragrafo" && (
                                        <textarea
                                            className="textarea-field"
                                            onChange={(e) =>
                                                setRespostas((prev) => ({
                                                    ...prev,
                                                    [q.id]: e.target.value
                                                }))
                                            }
                                        />
                                    )}

                                    {/* NÚMERO */}
                                    {q.qtype === "numero" && (
                                        <input
                                            type="number"
                                            className="input-field"
                                            onChange={(e) =>
                                                setRespostas((prev) => ({
                                                    ...prev,
                                                    [q.id]: e.target.value
                                                }))
                                            }
                                        />
                                    )}

                                    {/* BOOLEAN */}
                                    {q.qtype === "boolean" && (
                                        <div className="radio-group">
                                            {["sim", "nao"].map((v) => (
                                                <label key={v}>
                                                    <input
                                                        type="radio"
                                                        name={`bool-${q.id}`}
                                                        onChange={() =>
                                                            setRespostas((prev) => ({
                                                                ...prev,
                                                                [q.id]: v
                                                            }))
                                                        }
                                                    />
                                                    {v === "sim" ? "Sim" : "Não"}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {/* ALTERNATIVAS */}
                                    {q.qtype === "alternativa" && (
                                        <div className="radio-group">
                                            {q.options?.map((op, idx) => (
                                                <label key={idx}>
                                                    <input
                                                        type="radio"
                                                        name={`alt-${q.id}`}
                                                        onChange={() =>
                                                            setRespostas((prev) => ({
                                                                ...prev,
                                                                [q.id]: op
                                                            }))
                                                        }
                                                    />
                                                    {op}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* BOTÃO ENVIAR */}
                        <button
                            className="btn-send"
                            onClick={enviar}
                            disabled={enviando}
                        >
                            {enviando ? "Enviando..." : "Enviar Respostas"}
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
