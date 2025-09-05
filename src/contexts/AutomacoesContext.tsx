import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Automacao {
  id: string
  nome: string
  categoria: string
  descricao: string
  status: 'ativa' | 'pausada' | 'erro'
  webhook: string
  token: string
  configuracao: any
  metricas: any
  criado_em: string
  atualizado_em: string
}

interface AutomacoesContextType {
  automacoes: Automacao[]
  loading: boolean
  criarAutomacao: (dados: any) => Promise<Automacao>
  atualizarAutomacao: (id: string, dados: any) => Promise<void>
  excluirAutomacao: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
}

const AutomacoesContext = createContext<AutomacoesContextType | undefined>(undefined)

export const AutomacoesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [automacoes, setAutomacoes] = useState<Automacao[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAutomacoes()
    }
  }, [user])

  const fetchAutomacoes = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('automacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })

    if (data && !error) {
      setAutomacoes(data)
    }
    setLoading(false)
  }

  const criarAutomacao = async (dados: any): Promise<Automacao> => {
    if (!user) throw new Error('Usuário não autenticado')

    const novaAutomacao = {
      id: `auto_${Date.now()}`,
      usuario_id: user.id,
      nome: dados.nome,
      categoria: dados.categoria,
      descricao: dados.descricao,
      status: 'ativa' as const,
      webhook: `https://app.fluxolocal.com.br/api/webhook/${Date.now()}`,
      token: `flx_live_${Math.random().toString(36).substr(2, 32)}`,
      configuracao: dados.configuracao || {},
      metricas: {
        execucoesDia: 0,
        taxaSucesso: 100,
        tempoMedio: '0ms'
      }
    }

    const { data, error } = await supabase
      .from('automacoes')
      .insert(novaAutomacao)
      .select()
      .single()

    if (data && !error) {
      setAutomacoes(prev => [data, ...prev])
      return data
    }

    throw new Error(error?.message || 'Erro ao criar automação')
  }

  const atualizarAutomacao = async (id: string, dados: any) => {
    if (!user) return

    const { error } = await supabase
      .from('automacoes')
      .update({ ...dados, atualizado_em: new Date().toISOString() })
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (!error) {
      setAutomacoes(prev => 
        prev.map(auto => 
          auto.id === id ? { ...auto, ...dados } : auto
        )
      )
    }
  }

  const excluirAutomacao = async (id: string) => {
    if (!user) return

    const { error } = await supabase
      .from('automacoes')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (!error) {
      setAutomacoes(prev => prev.filter(auto => auto.id !== id))
    }
  }

  const toggleStatus = async (id: string) => {
    const automacao = automacoes.find(a => a.id === id)
    if (!automacao) return

    const novoStatus = automacao.status === 'ativa' ? 'pausada' : 'ativa'
    await atualizarAutomacao(id, { status: novoStatus })
  }

  return (
    <AutomacoesContext.Provider value={{
      automacoes,
      loading,
      criarAutomacao,
      atualizarAutomacao,
      excluirAutomacao,
      toggleStatus
    }}>
      {children}
    </AutomacoesContext.Provider>
  )
}

export const useAutomacoes = () => {
  const context = useContext(AutomacoesContext)
  if (context === undefined) {
    throw new Error('useAutomacoes must be used within an AutomacoesProvider')
  }
  return context
}