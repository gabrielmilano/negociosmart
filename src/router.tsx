import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Estoque from './pages/Estoque';
import Agendamento from './pages/Agendamento';
import PedidosFornecedor from './pages/PedidosFornecedor';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/estoque',
        element: (
          <ProtectedRoute requiredRole="eletrica">
            <Estoque />
          </ProtectedRoute>
        )
      },
      {
        path: '/eletrica/agendamento',
        element: (
          <ProtectedRoute requiredRole="eletrica">
            <Agendamento />
          </ProtectedRoute>
        )
      },
      {
        path: '/fornecedor/pedidos',
        element: (
          <ProtectedRoute requiredRole="fornecedor">
            <PedidosFornecedor />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);