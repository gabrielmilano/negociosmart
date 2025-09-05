/*
  # Schema inicial do FluxoLocal

  1. Tabelas principais
    - `usuarios` - Perfis de usuários com planos e limites
    - `automacoes` - Automações criadas pelos usuários
    - `webhooks` - Webhooks configurados
    - `logs_webhook` - Logs de execução dos webhooks

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para isolamento por usuário
    - Triggers para timestamps automáticos

  3. Funcionalidades
    - Planos com limites configuráveis
    - Métricas e monitoramento
    - Histórico completo de execuções
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nome text NOT NULL,
  avatar_url text,
  plano text NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'pro', 'enterprise')),
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  limites jsonb NOT NULL DEFAULT '{"automacoes": 5, "webhooks": 10, "execucoes_mes": 1000}',
  criado_em timestamptz DEFAULT now(),
  ultimo_acesso timestamptz DEFAULT now()
);

-- Tabela de automações
CREATE TABLE IF NOT EXISTS automacoes (
  id text PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome text NOT NULL,
  categoria text NOT NULL,
  descricao text NOT NULL,
  status text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'erro')),
  webhook text NOT NULL,
  token text NOT NULL,
  configuracao jsonb DEFAULT '{}',
  metricas jsonb DEFAULT '{"execucoesDia": 0, "taxaSucesso": 100, "tempoMedio": "0ms"}',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id text PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome text NOT NULL,
  url text NOT NULL,
  token text NOT NULL,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'erro')),
  configuracao jsonb DEFAULT '{}',
  metricas jsonb DEFAULT '{"totalRequests": 0, "successRate": 100, "avgResponseTime": "0ms"}',
  criado_em timestamptz DEFAULT now()
);

-- Tabela de logs de webhook
CREATE TABLE IF NOT EXISTS logs_webhook (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id text NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  method text NOT NULL,
  status_code integer NOT NULL,
  response_time integer NOT NULL,
  request_data jsonb,
  response_data jsonb,
  ip_address text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE automacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_webhook ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY "Usuários podem ver próprio perfil"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas RLS para automacoes
CREATE POLICY "Usuários podem ver próprias automações"
  ON automacoes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar automações"
  ON automacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar próprias automações"
  ON automacoes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar próprias automações"
  ON automacoes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

-- Políticas RLS para webhooks
CREATE POLICY "Usuários podem ver próprios webhooks"
  ON webhooks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar webhooks"
  ON webhooks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar próprios webhooks"
  ON webhooks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar próprios webhooks"
  ON webhooks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

-- Políticas RLS para logs_webhook
CREATE POLICY "Usuários podem ver próprios logs"
  ON logs_webhook
  FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Sistema pode inserir logs"
  ON logs_webhook
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp em automacoes
DROP TRIGGER IF EXISTS handle_automacoes_updated_at ON automacoes;
CREATE TRIGGER handle_automacoes_updated_at
  BEFORE UPDATE ON automacoes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_automacoes_usuario_id ON automacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_automacoes_status ON automacoes(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_usuario_id ON webhooks(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_webhook_usuario_id ON logs_webhook(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_webhook_timestamp ON logs_webhook(timestamp DESC);