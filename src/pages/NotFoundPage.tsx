import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import "../styles/status-pages.css";

export default function NotFoundPage() {
  return (
    <div className="status-container">
      <div className="status-card">
        <Compass size={64} className="status-icon" />

        <h1 className="status-code">404</h1>
        <h2 className="status-title">Página não encontrada</h2>

        <p className="status-description">
          A página que você tentou acessar não existe ou foi movida.
          <br />
          Verifique o endereço ou volte para uma área segura.
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
