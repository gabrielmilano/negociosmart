import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserWithMeta } from '@/types/auth'

export function useUserMeta() {
  const [userWithMeta, setUserWithMeta] = useState<UserWithMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserMeta() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        setUserWithMeta(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('usuarios_empresa')
          .select('empresa_id')
          .eq('usuario_id', session.user.id)
          .eq('ativo', true)
          .single()

        if (error) throw error

        const userWithMeta: UserWithMeta = {
          ...session.user,
          empresa_id: data.empresa_id,
          email: session.user.email || ''
        }

        setUserWithMeta(userWithMeta)
      } catch (error) {
        console.error('Erro ao buscar metadados do usuário:', error)
        setUserWithMeta(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserMeta()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserWithMeta(null)
        setLoading(false)
      } else if (session?.user) {
        await fetchUserMeta()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user: userWithMeta, loading }
}