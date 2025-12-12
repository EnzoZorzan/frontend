// src/layout/Sidebar.tsx
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
  BarChart3
} from "lucide-react";


import "../styles/sidebar.css";

export default function Sidebar() {
  const { perfis } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [cadastrosOpen, setCadastrosOpen] = useState(true);
  const [relatoriosOpen, setRelatoriosOpen] = useState(true);

  // Perfil ID 1 = Admin global
  const isAdmin = perfis.includes(1);

  const hasPermission = (item: { perfis: number[] }) =>
    isAdmin || item.perfis.some(p => perfis.includes(p));

  // === SUBMENU CADASTROS ===
  const cadastrosMenu = [
    { label: "Usuários", path: "/usuarios", perfis: [1, 2], icon: <Users size={18} /> },
    { label: "Empresas", path: "/empresas", perfis: [1], icon: <Building2 size={18} /> },
    { label: "Perfis", path: "/perfis", perfis: [1], icon: <Settings size={18} /> },
    { label: "Permissões", path: "/permissoes", perfis: [1], icon: <Settings size={18} /> },
    { label: "Questionários", path: "/questionarios", perfis: [1, 2], icon: <ClipboardList size={18} /> },
    { label: "Convites", path: "/convites", perfis: [1, 2], icon: <ClipboardList size={18} /> }
  ]

  const filteredCadastros = cadastrosMenu.filter(hasPermission);

  return (



    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <Link to="/mural" className="sidebar-logo-area sidebar-logo-link">
        <img src="/img/logo-cuidativa.PNG" className="sidebar-logo" />
        {!collapsed && <span className="sidebar-logo-text">CuidAtiva</span>}
      </Link>

      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </button>

      <nav className="sidebar-menu">

        {/* === CADASTROS === */}
        <div className="menu-section">
          <button className="menu-button" onClick={() => setCadastrosOpen(!cadastrosOpen)}>
            {collapsed ? (
              <Users size={20} />
            ) : (
              <>
                <Users size={18} />
                <span>Cadastros</span>
                {cadastrosOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </>
            )}
          </button>

          {!collapsed && cadastrosOpen && (
            <ul className="submenu">
              {filteredCadastros.map((item, i) => (
                <li key={i} className={location.pathname === item.path ? "active" : ""}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* === RELATÓRIOS === */}
        <div className="menu-section">
          <button className="menu-button" onClick={() => setRelatoriosOpen(!relatoriosOpen)}>
            {collapsed ? (
              <BarChart3 size={20} />
            ) : (
              <>
                <BarChart3 size={18} />
                <span>Relatórios</span>
                {relatoriosOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </>
            )}
          </button>

          {!collapsed && relatoriosOpen && (
            <ul className="submenu">
              <li className={location.pathname === "/relatorios-gerais" ? "active" : ""}>
                <Link to="/relatorios-gerais">
                  <FileText size={18} />
                  <span>Relatório Geral</span>
                </Link>
              </li>

              <li className={location.pathname === "/relatorios-empresa" ? "active" : ""}>
                <Link to="/relatorios-empresa">
                  <Building2 size={18} />
                  <span>Por Empresa</span>
                </Link>
              </li>
            </ul>
          )}
        </div>


      </nav>

    </aside>
  );
}
