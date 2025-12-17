import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Users,
  Building2,
  FileText,
  ChevronDown,
  ChevronRight,
  Settings,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
} from "lucide-react";

import "../styles/sidebar.css";

export default function Sidebar() {
  const { hasPermission } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [cadastrosOpen, setCadastrosOpen] = useState(true);
  const [relatoriosOpen, setRelatoriosOpen] = useState(true);

  /* =========================
     CONFIGURAÇÃO DOS MENUS
     ========================= */

  const cadastrosMenu = [
    {
      label: "Usuários",
      path: "/usuarios",
      permission: "USUARIOS_CADASTRO",
      icon: <Users size={18} />
    },
    {
      label: "Empresas",
      path: "/empresas",
      permission: "EMPRESAS_CADASTRO",
      icon: <Building2 size={18} />
    },
    {
      label: "Perfis",
      path: "/perfis",
      permission: "PERFIS_CADASTRO",
      icon: <Settings size={18} />
    },
    {
      label: "Permissões",
      path: "/permissoes",
      permission: "PERMISSOES_CADASTRO",
      icon: <Settings size={18} />
    },
    {
      label: "Questionários",
      path: "/questionarios",
      permission: "QUESTIONARIOS_CADASTRO",
      icon: <ClipboardList size={18} />
    },
    {
      label: "Convites",
      path: "/convites",
      permission: "CONVITES_CADASTRO",
      icon: <ClipboardList size={18} />
    }
  ];

  const relatoriosMenu = [
    {
      label: "Relatório Geral",
      path: "/relatorios-gerais",
      permission: "RELATORIO_GERAL_VIEW",
      icon: <FileText size={18} />
    },
    {
      label: "Por Empresa",
      path: "/relatorios-empresa",
      permission: "RELATORIOS_EMPRESAS_VIEW",
      icon: <Building2 size={18} />
    }
  ];

  /* =========================
     FILTRO POR PERMISSÃO
     ========================= */

  const filteredCadastros = cadastrosMenu.filter(item =>
    hasPermission(item.permission)
  );

  const filteredRelatorios = relatoriosMenu.filter(item =>
    hasPermission(item.permission)
  );

  // Se não tiver nenhum item visível, nem mostra o grupo
  const showCadastros = filteredCadastros.length > 0;
  const showRelatorios = filteredRelatorios.length > 0;

  /* =========================
     RENDER
     ========================= */

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* LOGO */}
      <Link to="/mural" className="sidebar-logo-area sidebar-logo-link">
        <img src="/img/logo-cuidativa.PNG" className="sidebar-logo" />
        {!collapsed && (
          <span className="sidebar-logo-text">CuidAtiva</span>
        )}
      </Link>

      {/* BOTÃO COLAPSAR */}
      <button
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </button>

      <nav className="sidebar-menu">

        {/* ================= CADASTROS ================= */}
        {showCadastros && (
          <div className="menu-section">
            <button
              className="menu-button"
              onClick={() => setCadastrosOpen(!cadastrosOpen)}
            >
              {collapsed ? (
                <Users size={20} />
              ) : (
                <>
                  <Users size={18} />
                  <span>Cadastros</span>
                  {cadastrosOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </>
              )}
            </button>

            {!collapsed && cadastrosOpen && (
              <ul className="submenu">
                {filteredCadastros.map(item => (
                  <li
                    key={item.path}
                    className={
                      location.pathname === item.path ? "active" : ""
                    }
                  >
                    <Link to={item.path}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ================= RELATÓRIOS ================= */}
        {showRelatorios && (
          <div className="menu-section">
            <button
              className="menu-button"
              onClick={() => setRelatoriosOpen(!relatoriosOpen)}
            >
              {collapsed ? (
                <BarChart3 size={20} />
              ) : (
                <>
                  <BarChart3 size={18} />
                  <span>Relatórios</span>
                  {relatoriosOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </>
              )}
            </button>

            {!collapsed && relatoriosOpen && (
              <ul className="submenu">
                {filteredRelatorios.map(item => (
                  <li
                    key={item.path}
                    className={
                      location.pathname === item.path ? "active" : ""
                    }
                  >
                    <Link to={item.path}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
