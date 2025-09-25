import { describe, it, expect } from 'vitest'
import { supabase } from '@/lib/supabase'

describe('Basic Auth Test', () => {
  it('should create a new user', async () => {
    const testEmail = `test_${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test@123456'
    })

    if (error) {
      console.error('Error creating user:', error)
    }

    console.log('User creation result:', data)

    expect(data.user?.email).toBe(testEmail)
  })
})