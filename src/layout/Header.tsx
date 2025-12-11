import { useAuth } from "../context/AuthContext";
import { User, Settings, LogOut } from "lucide-react";
import "../styles/header.css";
import { useState } from "react";

export default function Header() {
  const { usuario, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="header">

      <div className="header-left">
        <h1 className="header-title">Dashboard</h1>
      </div>

      <div className="header-right">

        <div
          className="header-avatar"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <User size={22} />
          <span>{usuario?.nome}</span>
        </div>

        {openMenu && (
          <div className="header-dropdown">
            <button><User size={18} /> Meu Perfil</button>
            <button><Settings size={18} /> Configurações</button>
            <button onClick={logout}><LogOut size={18} /> Sair</button>
          </div>
        )}

      </div>

    </header>
  );
}
