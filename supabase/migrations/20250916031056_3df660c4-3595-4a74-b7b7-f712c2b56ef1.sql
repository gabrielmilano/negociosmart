-- Ensure proper database structure and fix the company column issue
BEGIN;

-- 1) Update column name from cnpj to cnpj_cpf to match the existing schema
-- 2) Create triggers to ensure default user profile and company are created on signup

-- First, attach trigger to create usuarios profile for new auth users
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
CREATE TRIGGER handle_new_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Second, attach trigger to create default company and membership for new auth users
DROP TRIGGER IF EXISTS create_default_company_for_user_trigger ON auth.users;
CREATE TRIGGER create_default_company_for_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_default_company_for_user();

-- Backfill missing usuarios for existing auth users
INSERT INTO public.usuarios (user_id, email, nome, plano, role, limites)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1)) AS nome,
       'gratuito',
       'editor',
       '{"webhooks": 10, "automacoes": 5, "execucoes_mes": 1000}'::jsonb
FROM auth.users u
LEFT JOIN public.usuarios p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Backfill default companies and memberships for users that don't have one
WITH users_without_company AS (
  SELECT u.id AS user_id,
         COALESCE(u.raw_user_meta_data->>'nome', 'Minha Empresa') AS nome,
         u.email
  FROM auth.users u
  LEFT JOIN public.empresas e
    ON e.usuario_proprietario_id = u.id AND e.ativo = true
  WHERE e.id IS NULL
),
inserted_empresas AS (
  INSERT INTO public.empresas (
    nome, cnpj_cpf, email, telefone, endereco, usuario_proprietario_id, plano, status, configuracoes
  )
  SELECT nome, NULL, email, NULL, NULL, user_id, 'gratuito', 'ativo', '{}'::jsonb
  FROM users_without_company
  RETURNING id, usuario_proprietario_id
)
INSERT INTO public.usuarios_empresa (usuario_id, empresa_id, role, ativo, permissoes)
SELECT ie.usuario_proprietario_id,
       ie.id,
       'proprietario',
       true,
       '{
          "produtos": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
          "categorias": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
          "fornecedores": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
          "movimentacoes": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
          "inventarios": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
          "relatorios": {"visualizar": true}
        }'::jsonb
FROM inserted_empresas ie
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios_empresa ue
  WHERE ue.usuario_id = ie.usuario_proprietario_id AND ue.empresa_id = ie.id
);

COMMIT;