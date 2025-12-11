import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticlesBackground from "../components/ParticlesBackground";
import "../styles/login-premium.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [darkMode, setDarkMode] = useState(systemPrefersDark);


  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, senha });
      login(res.data.usuario, res.data.token);
      navigate("/usuarios");
    } catch {
      setErro("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`premium-wrapper ${darkMode ? "dark" : ""}`}>
      <ParticlesBackground />

      {/* Botão tema */}
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      <div className="left-panel">
        <h1>Sistema de Pesquisas Corporativas</h1>
        <p>
          Crie questionários, gerencie usuários, acompanhe resultados e tome
          decisões inteligentes.
        </p>

        <div className="hero-shapes">
          <div className="shape s1"></div>
          <div className="shape s2"></div>
          <div className="shape s3"></div>
        </div>
      </div>

      <div className="right-panel">
        <div className="login-card">

          <div className="logo-circle">📊</div>

          <h2 className="login-title">Acessar</h2>
          <br></br>
          <p className="subtitle">Entre com suas credenciais</p>
          <br></br>
          <form onSubmit={fazerLogin} className="form">

            <div className="input-group">
              <input
                type="email"
                value={email}
                required
                placeholder="Digite seu email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                value={senha}
                required
                placeholder="Digite sua senha"
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro ? <p className="error">{erro}</p> : <div className="error-space" />}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? <span className="loader"></span> : "Entrar"}
            </button>
          </form>
          <br></br>

          <button className="forgot" onClick={() => navigate("/recuperar-senha")}>
            Esqueceu a senha?
          </button>
        </div>
      </div>
    </div>
  );
}
