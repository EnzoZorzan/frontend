import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import "../styles/status-pages.css";

export default function UnauthorizedPage() {
  return (
    <div className="status-container">
      <div className="status-card">
        <ShieldAlert size={64} className="status-icon" />

        <h1 className="status-code">401</h1>
        <h2 className="status-title">Sessão expirada</h2>

        <p className="status-description">
          Você precisa estar autenticado para acessar esta funcionalidade.
          <br />
          Faça login novamente para continuar.
        </p>

        <div className="status-actions">
          <Link to="/login" className="status-btn-primary">
            Ir para login
          </Link>
        </div>
      </div>
    </div>
  );
}
