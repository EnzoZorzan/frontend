import "../styles/mural.css";
import { useAuth } from "../context/AuthContext";

export default function Mural() {
    const { usuario } = useAuth();

    return (
        <div className="mural-container">

            <h2 className="mural-title">
                Bem-vindo(a) {usuario?.nome}! 👋
            </h2>

            <p className="mural-subtitle">
                Aqui você verá avisos, relatórios, estatísticas e informações importantes da plataforma.
            </p>

            <div className="mural-cards">

                <div className="mural-card">
                    <h3>Informações</h3>
                    <p>Em breve você encontrará avisos importantes aqui.</p>
                </div>

                <div className="mural-card">
                    <h3>Atividades Recentes</h3>
                    <p>Visualize ações e atualizações recentes do sistema.</p>
                </div>

                <div className="mural-card">
                    <h3>Relatórios</h3>
                    <p>Acompanhe indicadores e dados relevantes.</p>
                </div>

            </div>

        </div>
    );
}
