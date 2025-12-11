import "../styles/relatorios.css";

export default function RelatoriosEmpresaPage() {
  return (
    <div className="page-container">

      <div className="page-header">
        <h2>Relatórios por Empresa</h2>
      </div>

      <div className="report-panel">
        <label className="report-label">Selecione a empresa</label>
        <select className="report-select">
          <option>Empresa Alpha</option>
          <option>Empresa Beta</option>
          <option>Empresa Gamma</option>
        </select>
      </div>

      <div className="report-grid">

        <div className="report-card">
          <h3>Questionários Ativos</h3>
          <p className="report-number">12</p>
          <span className="report-desc">Nesta empresa</span>
        </div>

        <div className="report-card">
          <h3>Participações</h3>
          <p className="report-number">842</p>
          <span className="report-desc">Número total de respostas</span>
        </div>

        <div className="report-card">
          <h3>Engajamento</h3>
          <p className="report-number">78%</p>
          <span className="report-desc">Funcionários que participaram</span>
        </div>

      </div>

      <div className="report-panel">
        <h3>Resumo da Empresa</h3>
        <div className="graph-placeholder">
          Gráfico personalizado da empresa será mostrado aqui
        </div>
      </div>

    </div>
  );
}
