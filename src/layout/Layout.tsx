import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../styles/layout.css";

export default function Layout() {
  return (
    <div className="layout-container">
      <Sidebar />

      <div className="layout-content">
        <Header />

        <main className="layout-main">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
