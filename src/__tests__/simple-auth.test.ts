import { describe, it, expect } from 'vitest'
import { supabase } from '@/lib/supabase'

describe('Simple Auth Tests', () => {
  it('should login with existing user', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'gabrielrho@outlook.com',
      password: 'Negociosmart@123'
    })

    console.log('SignIn result:', { data, error })
    
    expect(error).toBeNull()
    expect(data.user).not.toBeNull()
    expect(data.session).not.toBeNull()

    const userId = data.user?.id
    expect(userId).not.toBeNull()

    // Buscar empresa do usuário
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select()
      .eq('usuario_proprietario_id', userId)
      .single()

    console.log('Company query result:', { empresa, empresaError })
    
    expect(empresaError).toBeNull()
    expect(empresa).not.toBeNull()
    expect(empresa.id).not.toBeNull()
  })
})