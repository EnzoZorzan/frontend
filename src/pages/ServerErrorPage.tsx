import { Link } from "react-router-dom";
import { ServerCrash } from "lucide-react";
import "../styles/status-pages.css";

export default function ServerErrorPage() {
  return (
    <div className="status-container">
      <div className="status-card">
        <ServerCrash size={64} className="status-icon" />

        <h1 className="status-code">500</h1>
        <h2 className="status-title">Erro interno</h2>

        <p className="status-description">
          Ocorreu um erro inesperado no sistema.
          <br />
          Tente novamente mais tarde ou entre em contato com o suporte.
        </p>

        <div className="status-actions">
          <Link to="/mural" className="status-btn-primary">
            Voltar ao mural
          </Link>
        </div>
      </div>
    </div>
  );
}
