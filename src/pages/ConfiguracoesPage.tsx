import { useTheme } from "../context/ThemeContext";
import "../styles/page.css";
import "../styles/config.css";

export default function ConfiguracoesPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Configurações</h2>
            </div>

            <div className="config-card">
                <h3>Preferências de Tema</h3>

                <div className="theme-selector">
                    <div
                        className={`theme-option ${theme === "light" ? "active" : ""}`}
                        onClick={() => setTheme("light")}
                    >
                        <span className="theme-icon">🌞</span>
                        <span>Claro</span>
                    </div>

                    <div
                        className={`theme-option ${theme === "dark" ? "active" : ""}`}
                        onClick={() => setTheme("dark")}
                    >
                        <span className="theme-icon">🌙</span>
                        <span>Escuro</span>
                    </div>

                    <div
                        className={`theme-option ${theme === "system" ? "active" : ""}`}
                        onClick={() => setTheme("system")}
                    >
                        <span className="theme-icon">💻</span>
                        <span>Sistema</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
