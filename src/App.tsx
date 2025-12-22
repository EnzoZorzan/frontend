import { BrowserRouter, Routes, Route } from "react-router-dom";

import UsuariosPage from "./pages/UsuariosPage";
import PerfisPage from "./pages/PerfisPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { RequirePermission } from "./components/RequirePermission";
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
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import MeuPerfilPage from "./pages/MeuPerfilPage";
import ConvitesPage from "./pages/ConvitesPage";
import ResponderPublicoPage from "./pages/ResponderPublicoPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import FuncionariosPage from "./pages/FuncionariosPesquisaPage";



function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>

            {/* ================= ROTAS PÚBLICAS ================= */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
            <Route path="/responder" element={<ResponderPublicoPage />} />

            {/* ================= ROTAS PROTEGIDAS ================= */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="403" element={<ForbiddenPage />} />

              <Route path="mural" element={<MuralPage />} />

              <Route
                path="usuarios"
                element={
                  <RequirePermission permission="USUARIOS_CADASTRO">
                    <UsuariosPage />
                  </RequirePermission>
                }
              />

              <Route
                path="funcionarios"
                element={
                  <RequirePermission permission="FUNCIONARIOS_CADASTRO">
                    <FuncionariosPage />
                  </RequirePermission>
                }
              />

              <Route
                path="empresas"
                element={
                  <RequirePermission permission="EMPRESAS_CADASTRO">
                    <EmpresasPage />
                  </RequirePermission>
                }
              />

              <Route
                path="perfis"
                element={
                  <RequirePermission permission="PERFIS_CADASTRO">
                    <PerfisPage />
                  </RequirePermission>
                }
              />

              <Route
                path="permissoes"
                element={
                  <RequirePermission permission="PERMISSOES_CADASTRO">
                    <PermissoesPage />
                  </RequirePermission>
                }
              />

              <Route
                path="questionarios"
                element={
                  <RequirePermission permission="QUESTIONARIOS_CADASTRO">
                    <QuestionariosPage />
                  </RequirePermission>
                }
              />

              <Route
                path="questionarios/:id"
                element={
                  <RequirePermission permission="QUESTIONARIO_EDITAR">
                    <EditarQuestionarioPage />
                  </RequirePermission>
                }
              />

              <Route
                path="relatorios-gerais"
                element={
                  <RequirePermission permission="RELATORIO_GERAL_VIEW">
                    <RelatoriosGeraisPage />
                  </RequirePermission>
                }
              />

              <Route
                path="relatorios-empresa"
                element={
                  <RequirePermission permission="RELATORIOS_EMPRESAS_VIEW">
                    <RelatoriosEmpresaPage />
                  </RequirePermission>
                }
              />

              <Route path="meu-perfil" element={<MeuPerfilPage />} />
              <Route path="configuracoes" element={<ConfiguracoesPage />} />
              <Route path="401" element={<UnauthorizedPage />} />
              <Route path="403" element={<ForbiddenPage />} />
              <Route path="500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
