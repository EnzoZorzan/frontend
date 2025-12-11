import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsuariosPage from "./pages/UsuariosPage";
import PerfisPage from "./pages/PerfisPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PrivateRoute } from "./components/PrivateRoute";
import Layout from "./layout/Layout";
import PermissoesPage from "./pages/PermissoesPage";
import EmpresasPage from "./pages/EmpresasPage";
import QuestionariosPage from "./pages/QuestionariosPage";
import EditarQuestionarioPage from "./pages/EditarQuestionarioPage";
import MuralPage from "./pages/MuralPage";
import RecuperarSenhaPage from "./pages/RecuperarSenhaPage";
import RedefinirSenhaPage from "./pages/RedefinirSenhaPage";
import RelatoriosEmpresaPage from "./pages/RelatoriosEmpresaPage";
import RelatoriosGeraisPage from "./pages/RelatorioGeraisPage";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>

            {/* ROTAS PÚBLICAS */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />

            {/* ROTAS PROTEGIDAS */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="mural" element={<MuralPage />} />
              <Route path="empresas" element={<EmpresasPage />} />
              <Route path="perfis" element={<PerfisPage />} />
              <Route path="permissoes" element={<PermissoesPage />} />
              <Route path="questionarios" element={<QuestionariosPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="questionarios/:id" element={<EditarQuestionarioPage />} />
              <Route path="relatorios-gerais" element={<RelatoriosGeraisPage />} />
              <Route path="relatorios-empresa" element={<RelatoriosEmpresaPage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
