import "../styles/relatorios.css";

export default function RelatoriosGeraisPage() {
  return (
    <div className="page-container">

      <div className="page-header">
        <h2>Relatórios Gerais</h2>
      </div>

      <div className="report-grid">

        <div className="report-card">
          <h3>Total de Questionários</h3>
          <p className="report-number">128</p>
          <span className="report-desc">Total criados na plataforma</span>
        </div>

        <div className="report-card">
          <h3>Respostas Recebidas</h3>
          <p className="report-number">4.291</p>
          <span className="report-desc">De todos os usuários</span>
        </div>

        <div className="report-card">
          <h3>Empresas Ativas</h3>
          <p className="report-number">18</p>
          <span className="report-desc">Com pesquisas em andamento</span>
        </div>

      </div>

      {/* Gráfico Futuro */}
      <div className="report-panel">
        <h3>Resumo das Atividades</h3>
        <div className="graph-placeholder">
          Gráfico será exibido aqui
        </div>
      </div>

    </div>
  );
}
