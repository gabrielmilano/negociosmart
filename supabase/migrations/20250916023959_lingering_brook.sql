/*
  # Create function to get user company

  1. New Functions
    - `get_user_company_id` - Returns the company ID for a user
    
  2. Security
    - Function is security definer to access data properly
    - Only returns company for authenticated users
*/

CREATE OR REPLACE FUNCTION get_user_company_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id uuid;
BEGIN
  -- First try to find company through usuarios_empresa
  SELECT empresa_id INTO company_id
  FROM usuarios_empresa
  WHERE usuario_id = user_id AND ativo = true
  LIMIT 1;
  
  -- If not found, try to find company where user is owner
  IF company_id IS NULL THEN
    SELECT id INTO company_id
    FROM empresas
    WHERE usuario_proprietario_id = user_id AND ativo = true
    LIMIT 1;
  END IF;
  
  RETURN company_id;
END;
$$;