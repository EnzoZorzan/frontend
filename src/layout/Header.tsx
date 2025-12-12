import { useAuth } from "../context/AuthContext";
import { User, Settings, LogOut } from "lucide-react";
import "../styles/header.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { usuario, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const avatarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const avatarEl = avatarRef.current;
      const dropdownEl = dropdownRef.current;

      if (
        avatarEl &&
        !avatarEl.contains(event.target as Node) &&
        dropdownEl &&
        !dropdownEl.contains(event.target as Node)
      ) {
        setOpenMenu(false); // Fecha o menu
      }
    }

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  function goTo(path: string) {
    setOpenMenu(false);
    navigate(path);
  }

  function handleLogout() {
    setOpenMenu(false);
    logout();
  }

  return (
    <header className="header">

      <div className="header-left">
        <h1 className="header-title">Dashboard</h1>
      </div>

      <div className="header-right">

        <div
          className="header-avatar"
          ref={avatarRef}              // 👈 ref aplicada
          onClick={() => setOpenMenu(!openMenu)}
        >
          <User size={22} />
          <span>{usuario?.nome}</span>
        </div>

        {openMenu && (
          <div className="header-dropdown" ref={dropdownRef}>  {/* 👈 ref aplicada */}
            <button onClick={() => goTo("/meu-perfil")}>
              <User size={18} /> Meu Perfil
            </button>

            <button onClick={() => goTo("/configuracoes")}>
              <Settings size={18} /> Configurações
            </button>

            <button onClick={handleLogout}>
              <LogOut size={18} /> Sair
            </button>
          </div>
        )}

      </div>

    </header>
  );
}

