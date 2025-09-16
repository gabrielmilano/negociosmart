/*
  # Create demo data for testing

  1. Demo Data
    - Create demo company
    - Create demo user relationship
    - Create demo categories
    - Create demo suppliers
    - Create demo products
    
  2. Purpose
    - Allow users to test the system immediately
    - Provide realistic sample data
*/

-- Create demo company if it doesn't exist
INSERT INTO empresas (
  id,
  usuario_proprietario_id,
  nome,
  tipo_negocio,
  cnpj_cpf,
  endereco,
  configuracoes,
  plano,
  limites,
  ativo
) VALUES (
  'demo-company-123',
  (SELECT id FROM auth.users LIMIT 1), -- Will be updated by trigger
  'Empresa Demo',
  'Comércio',
  '12.345.678/0001-90',
  '{"rua": "Rua Demo, 123", "cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}',
  '{"moeda": "BRL", "alertas": {"estoque_minimo": true, "ruptura_estoque": true, "produto_vencendo": true}}',
  'gratuito',
  '{"produtos": 1000, "usuarios": 10, "movimentacoes_mes": 10000}',
  true
) ON CONFLICT (id) DO NOTHING;

-- Create demo categories
INSERT INTO categorias_produto (id, empresa_id, nome, descricao, cor, icone) VALUES
  ('cat-eletronicos', 'demo-company-123', 'Eletrônicos', 'Produtos eletrônicos e tecnologia', '#3B82F6', '📱'),
  ('cat-casa', 'demo-company-123', 'Casa e Jardim', 'Produtos para casa e jardim', '#10B981', '🏠'),
  ('cat-automotivo', 'demo-company-123', 'Automotivo', 'Peças e acessórios automotivos', '#EF4444', '🚗'),
  ('cat-ferramentas', 'demo-company-123', 'Ferramentas', 'Ferramentas e equipamentos', '#F59E0B', '🔧'),
  ('cat-esporte', 'demo-company-123', 'Esporte', 'Artigos esportivos', '#8B5CF6', '⚽')
ON CONFLICT (id) DO NOTHING;

-- Create demo suppliers
INSERT INTO fornecedores (id, empresa_id, nome, cnpj_cpf, contato, observacoes) VALUES
  ('forn-tech', 'demo-company-123', 'Tech Distribuidora', '11.222.333/0001-44', 
   '{"telefone": "(11) 1234-5678", "email": "vendas@techdist.com", "pessoa_contato": "João Silva", "endereco": "Av. Tecnologia, 456"}',
   'Fornecedor principal de eletrônicos'),
  ('forn-casa', 'demo-company-123', 'Casa & Cia', '22.333.444/0001-55',
   '{"telefone": "(11) 2345-6789", "email": "pedidos@casacia.com", "pessoa_contato": "Maria Santos", "endereco": "Rua das Casas, 789"}',
   'Especializada em produtos para casa'),
  ('forn-auto', 'demo-company-123', 'Auto Peças Brasil', '33.444.555/0001-66',
   '{"telefone": "(11) 3456-7890", "email": "comercial@autopecas.com", "pessoa_contato": "Carlos Oliveira", "endereco": "Rod. Auto, km 10"}',
   'Peças automotivas originais e paralelas')
ON CONFLICT (id) DO NOTHING;

-- Create demo products
INSERT INTO produtos (
  id, empresa_id, codigo_interno, codigo_barras, nome, descricao, categoria_id, fornecedor_id,
  preco_custo, preco_venda, margem_lucro, estoque_atual, estoque_minimo, estoque_maximo,
  unidade_medida, localizacao, peso, dimensoes, ativo
) VALUES
  ('prod-smartphone', 'demo-company-123', 'SMART001', '7891234567890', 'Smartphone Galaxy A54', 
   'Smartphone Samsung Galaxy A54 128GB', 'cat-eletronicos', 'forn-tech',
   800.00, 1200.00, 50.00, 15, 5, 50, 'UN',
   '{"setor": "A", "prateleira": "01", "posicao": "03"}', 0.180,
   '{"altura": 15.8, "largura": 7.6, "profundidade": 0.8}', true),
   
  ('prod-filtro', 'demo-company-123', 'FILT001', '7892345678901', 'Filtro de Óleo Motor', 
   'Filtro de óleo para motores 1.0 a 2.0', 'cat-automotivo', 'forn-auto',
   25.00, 45.00, 80.00, 8, 10, 100, 'UN',
   '{"setor": "B", "prateleira": "02", "posicao": "01"}', 0.250,
   '{"altura": 10.0, "largura": 8.0, "profundidade": 8.0}', true),
   
  ('prod-furadeira', 'demo-company-123', 'FUR001', '7893456789012', 'Furadeira de Impacto 500W', 
   'Furadeira de impacto profissional 500W com maleta', 'cat-ferramentas', 'forn-tech',
   120.00, 220.00, 83.33, 3, 5, 20, 'UN',
   '{"setor": "C", "prateleira": "01", "posicao": "02"}', 1.500,
   '{"altura": 25.0, "largura": 20.0, "profundidade": 8.0}', true),
   
  ('prod-vaso', 'demo-company-123', 'VASO001', '7894567890123', 'Vaso Decorativo Cerâmica', 
   'Vaso decorativo de cerâmica 30cm', 'cat-casa', 'forn-casa',
   15.00, 35.00, 133.33, 12, 3, 30, 'UN',
   '{"setor": "D", "prateleira": "03", "posicao": "01"}', 0.800,
   '{"altura": 30.0, "largura": 15.0, "profundidade": 15.0}', true),
   
  ('prod-bola', 'demo-company-123', 'BOLA001', '7895678901234', 'Bola de Futebol Oficial', 
   'Bola de futebol oficial FIFA tamanho 5', 'cat-esporte', 'forn-casa',
   35.00, 80.00, 128.57, 2, 5, 25, 'UN',
   '{"setor": "E", "prateleira": "01", "posicao": "01"}', 0.420,
   '{"altura": 22.0, "largura": 22.0, "profundidade": 22.0}', true)
ON CONFLICT (id) DO NOTHING;