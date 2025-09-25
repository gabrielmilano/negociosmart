import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"; // CORRIGIDO: Linha de importação incompleta
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts e Hooks
import { AuthProvider } from "./hooks/useAuth";
import { AutomacoesProvider } from "./contexts/AutomacoesContext";
import { WebhooksProvider } from "./contexts/WebhooksContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { PedidosProvider } from "./contexts/PedidosContext";

// Componentes e Páginas
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Automations from "./pages/Automations";
import Webhooks from "./pages/Webhooks";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import NewAutomation from "./pages/NewAutomation";
import Estoque from "./pages/Estoque";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { SaidaRapida } from "./components/Estoque/SaidaRapida";
import { PainelPedidos } from "./components/Estoque/PainelPedidos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationsProvider> {/* Fechei o NotificationsProvider aqui */}
        <AutomacoesProvider>
          <WebhooksProvider>
            <PedidosProvider> {/* Adicionei o PedidosProvider para consistência */}
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Rotas Protegidas */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/automations" element={
                      <ProtectedRoute>
                        <Layout>
                          <Automations />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/automations/new" element={
                      <ProtectedRoute>
                        <Layout>
                          <NewAutomation />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/webhooks" element={
                      <ProtectedRoute>
                        <Layout>
                          <Webhooks />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/logs" element={
                      <ProtectedRoute>
                        <Layout>
                          <Logs />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/estoque" element={
                      <ProtectedRoute>
                        <Layout>
                          <Estoque />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/estoque/saida_rapida" element={
                      <ProtectedRoute>
                        <Layout>
                          <SaidaRapida />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/estoque/pedidos" element={
                      <ProtectedRoute>
                        <Layout>
                          <PainelPedidos />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/automations/inventory" element={
                      <ProtectedRoute>
                        <Layout>
                          <Estoque />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Rota Catch-All */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </PedidosProvider> {/* Fechamento PedidosProvider */}
          </WebhooksProvider>
        </AutomacoesProvider>
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;