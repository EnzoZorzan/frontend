import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/login-premium.css";

export default function RecuperarSenhaPage() {

    const [email, setEmail] = useState("");
    const [enviado, setEnviado] = useState(false);
    const [erro, setErro] = useState("");

    const navigate = useNavigate(); // 👈 necessário

    async function enviar(e: React.FormEvent) {
        e.preventDefault();
        setErro("");

        try {
            await api.post("/auth/recuperar-senha", { email });
            setEnviado(true);

            // 👇 Redireciona após 2 segundos
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch {
            setErro("Email não encontrado");
        }
    }

    return (
        <div className="premium-wrapper single-center">
            <div className="right-panel">
                <div className="login-card">

                    <div className="logo-circle">🔐</div>

                    <h2>Recuperar senha</h2>
                    <br />
                    <p className="subtitle">
                        Digite seu email para enviarmos o link de redefinição
                    </p>
                    <br />

                    {!enviado ? (
                        <form onSubmit={enviar} className="form">

                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Digite seu email"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {erro && <p className="error">{erro}</p>}

                            <button className="btn" type="submit">
                                Enviar link
                            </button>
                        </form>
                    ) : (
                        <p style={{ marginTop: 20, fontSize: 16 }}>
                            ✔ Um link foi enviado para seu email.<br />
                            Redirecionando para o login...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
