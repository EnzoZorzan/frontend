import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/login-premium.css";

export default function RedefinirSenhaPage() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function redefinir(e: React.FormEvent) {
    e.preventDefault();

    if (senha !== confirm) {
      setErro("As senhas não conferem");
      return;
    }

    try {
      await api.post("/auth/redefinir-senha", { token, senha });
      setSucesso(true);
      setTimeout(() => navigate("/"), 2000);
    } catch {
      setErro("Token inválido ou expirado");
    }
  }

  return (
    <div className="premium-wrapper">
      <div className="right-panel">
        <div className="login-card">
          <div className="logo-circle">🔑</div>

          <h2>Redefinir senha</h2>

          {!sucesso ? (
            <form onSubmit={redefinir} className="form">

              <div className="input-group">
                <input
                  type="password"
                  placeholder=" "
                  value={senha}
                  required
                  onChange={(e) => setSenha(e.target.value)}
                />
                <label>Nova senha</label>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder=" "
                  value={confirm}
                  required
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <label>Confirmar senha</label>
              </div>

              {erro && <p className="error">{erro}</p>}

              <button className="btn">Salvar nova senha</button>
            </form>
          ) : (
            <p style={{ marginTop: 20, fontSize: 16 }}>
              ✔ Sua senha foi redefinida! Redirecionando...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
