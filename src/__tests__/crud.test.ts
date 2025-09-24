import { describe, it, expect, beforeAll } from 'vitest'
import { supabase } from '@/lib/supabase'

describe('Basic Auth Test', () => {
  it('should register a new user', async () => {
    const testEmail = `test_${Date.now()}@example.com`
    
    // Registrar usuário
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test@123456'
    })

    expect(error).toBeNull()
    expect(data.user).not.toBeNull()
    expect(data.user?.email).toBe(testEmail)

    // Limpar
    await supabase.auth.signOut()
  })
})