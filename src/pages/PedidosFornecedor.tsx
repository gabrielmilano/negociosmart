import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRequireAuth } from '../hooks/useAuth.new';

interface Pedido {
  id: string;
  produto_id: string;
  quantidade: number;
  status: string;
  created_at: string;
  produto: {
    nome: string;
    quantidade_atual: number;
  };
}

export default function PedidosFornecedor() {
  const { user } = useRequireAuth('fornecedor');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          produto:estoque (
            nome,
            quantidade_atual
          )
        `)
        .eq('fornecedor_id', user.id)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pedidos:', error);
        return;
      }

      setPedidos(data || []);
      setLoading(false);
    };

    fetchPedidos();
  }, [user]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pedidos Pendentes</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade Solicitada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estoque Atual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data do Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {pedido.produto.nome}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {pedido.quantidade}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {pedido.produto.quantidade_atual}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(pedido.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {pedido.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}