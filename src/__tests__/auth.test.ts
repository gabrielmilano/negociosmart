import { describe, it, expect } from 'vitest'
import { supabase } from '@/lib/supabase'

describe('Auth Tests', () => {
  it('should login with existing user', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'Password@123'
    })

    console.log('Login result:', { data, error })
    
    if (error?.message === 'Invalid login credentials') {
      // Se as credenciais estiverem erradas, vamos criar um novo usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'Password@123'
      })

      console.log('SignUp result:', { data: signUpData, error: signUpError })
      
      if (signUpError && signUpError.message !== 'User already registered') {
        throw signUpError
      }
    }

    // Tentar login novamente após possível criação
    const { data: finalData, error: finalError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'Password@123'
    })

    expect(finalError).toBeNull()
    expect(finalData.user).not.toBeNull()
    expect(finalData.session).not.toBeNull()
  })
})