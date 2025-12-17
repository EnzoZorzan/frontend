import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import "../styles/status-pages.css";

export default function ForbiddenPage() {
  return (
    <div className="status-container">
      <div className="status-card">
        <Lock size={64} className="status-icon" />

        <h1 className="status-code">403</h1>
        <h2 className="status-title">Acesso negado</h2>

        <p className="status-description">
          Você não possui permissão para acessar esta funcionalidade.
          <br />
          Caso acredite que isso seja um erro, entre em contato com o
          administrador.
        </p>

        <div className="status-actions">
          <Link to="/mural" className="status-btn-primary">
            Voltar ao mural
          </Link>

          <Link to="/meu-perfil" className="status-btn-secondary">
            Meu perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
