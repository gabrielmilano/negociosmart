/*
  # Fix RLS policies for estoque system

  1. Security Updates
    - Fix RLS policies to work with user company relationship
    - Add proper policies for all estoque tables
    - Ensure users can only access their company data
    
  2. Policy Updates
    - Update existing policies to use proper company checks
    - Add missing policies for inventory system
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Usuários veem produtos de suas empresas" ON produtos;
DROP POLICY IF EXISTS "Usuários podem criar produtos em suas empresas" ON produtos;
DROP POLICY IF EXISTS "Usuários podem atualizar produtos de suas empresas" ON produtos;

-- Create new policies for produtos
CREATE POLICY "Users can view products from their companies"
  ON produtos
  FOR SELECT
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can insert products in their companies"
  ON produtos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can update products in their companies"
  ON produtos
  FOR UPDATE
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

-- Fix categorias_produto policies
DROP POLICY IF EXISTS "Usuários veem categorias de suas empresas" ON categorias_produto;
DROP POLICY IF EXISTS "Usuários podem criar categorias em suas empresas" ON categorias_produto;
DROP POLICY IF EXISTS "Usuários podem atualizar categorias de suas empresas" ON categorias_produto;

CREATE POLICY "Users can view categories from their companies"
  ON categorias_produto
  FOR SELECT
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can insert categories in their companies"
  ON categorias_produto
  FOR INSERT
  TO authenticated
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can update categories in their companies"
  ON categorias_produto
  FOR UPDATE
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

-- Fix fornecedores policies
DROP POLICY IF EXISTS "Usuários veem fornecedores de suas empresas" ON fornecedores;
DROP POLICY IF EXISTS "Usuários podem criar fornecedores em suas empresas" ON fornecedores;
DROP POLICY IF EXISTS "Usuários podem atualizar fornecedores de suas empresas" ON fornecedores;

CREATE POLICY "Users can view suppliers from their companies"
  ON fornecedores
  FOR SELECT
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can insert suppliers in their companies"
  ON fornecedores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can update suppliers in their companies"
  ON fornecedores
  FOR UPDATE
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

-- Fix movimentacoes_estoque policies
DROP POLICY IF EXISTS "Usuários veem movimentações de suas empresas" ON movimentacoes_estoque;
DROP POLICY IF EXISTS "Usuários podem criar movimentações em suas empresas" ON movimentacoes_estoque;

CREATE POLICY "Users can view stock movements from their companies"
  ON movimentacoes_estoque
  FOR SELECT
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can insert stock movements in their companies"
  ON movimentacoes_estoque
  FOR INSERT
  TO authenticated
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

-- Fix inventarios policies
DROP POLICY IF EXISTS "Usuários veem inventários de suas empresas" ON inventarios;
DROP POLICY IF EXISTS "Usuários podem criar inventários em suas empresas" ON inventarios;

CREATE POLICY "Users can view inventories from their companies"
  ON inventarios
  FOR SELECT
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can insert inventories in their companies"
  ON inventarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Users can update inventories in their companies"
  ON inventarios
  FOR UPDATE
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id 
      FROM usuarios_empresa 
      WHERE usuario_id = auth.uid() AND ativo = true
      UNION
      SELECT id 
      FROM empresas 
      WHERE usuario_proprietario_id = auth.uid() AND ativo = true
    )
  );

-- Fix inventario_itens policies
DROP POLICY IF EXISTS "Usuários veem itens de inventário de suas empresas" ON inventario_itens;
DROP POLICY IF EXISTS "Usuários podem criar itens de inventário em suas empresas" ON inventario_itens;

CREATE POLICY "Users can view inventory items from their companies"
  ON inventario_itens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inventarios i
      WHERE i.id = inventario_itens.inventario_id
      AND i.empresa_id IN (
        SELECT empresa_id 
        FROM usuarios_empresa 
        WHERE usuario_id = auth.uid() AND ativo = true
        UNION
        SELECT id 
        FROM empresas 
        WHERE usuario_proprietario_id = auth.uid() AND ativo = true
      )
    )
  );

CREATE POLICY "Users can insert inventory items in their companies"
  ON inventario_itens
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventarios i
      WHERE i.id = inventario_itens.inventario_id
      AND i.empresa_id IN (
        SELECT empresa_id 
        FROM usuarios_empresa 
        WHERE usuario_id = auth.uid() AND ativo = true
        UNION
        SELECT id 
        FROM empresas 
        WHERE usuario_proprietario_id = auth.uid() AND ativo = true
      )
    )
  );

CREATE POLICY "Users can update inventory items in their companies"
  ON inventario_itens
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inventarios i
      WHERE i.id = inventario_itens.inventario_id
      AND i.empresa_id IN (
        SELECT empresa_id 
        FROM usuarios_empresa 
        WHERE usuario_id = auth.uid() AND ativo = true
        UNION
        SELECT id 
        FROM empresas 
        WHERE usuario_proprietario_id = auth.uid() AND ativo = true
      )
    )
  );