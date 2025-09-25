import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/componen          </TooltipProvider>
        </WebhooksProvider>
      </AutomacoesProvider>
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>);/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AutomacoesProvider } from "./contexts/AutomacoesContext";
import { WebhooksProvider } from "./contexts/WebhooksContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationsProvider>
        <AutomacoesProvider>
          <WebhooksProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
                 <Route path="/automations/inventory" element={
                   <ProtectedRoute>
                     <Layout>
                       <Estoque />
                     </Layout>
                   </ProtectedRoute>
                 } />
                 {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WebhooksProvider>
      </AutomacoesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
