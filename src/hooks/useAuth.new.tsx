import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Usuario = Database['public']['Tables']['usuarios']['Row']

interface AuthResponse {
  data: {
    user: User | null
    session: any | null
  }
  error: AuthError | null
}

interface AuthContextType {
  user: User | null
  usuario: Usuario | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (email: string, password: string, nome: string) => Promise<AuthResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUsuario(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        setUsuario(data)
        // Update last access
        await supabase
          .from('usuarios')
          .update({ ultimo_acesso: new Date().toISOString() })
          .eq('user_id', userId)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUsuario(null)
    }
  }

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return response
    } catch (error) {
      console.error('Error during login:', error)
      return {
        data: { user: null, session: null },
        error: error as AuthError
      }
    }
  }

  const register = async (email: string, password: string, nome: string): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome }
        }
      })

      if (response.data.user && !response.error) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert({
            user_id: response.data.user.id,
            email,
            nome,
            plano: 'gratuito',
            role: 'editor',
            limites: {
              automacoes: 5,
              webhooks: 10,
              execucoes_mes: 1000
            }
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Attempt to rollback auth user creation
          await supabase.auth.signOut()
          return {
            data: { user: null, session: null },
            error: new Error('Error creating user profile') as AuthError
          }
        }
      }

      return response
    } catch (error) {
      console.error('Error during registration:', error)
      return {
        data: { user: null, session: null },
        error: error as AuthError
      }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      usuario,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}