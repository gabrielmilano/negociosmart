import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Webhook {
  id: string
  nome: string
  url: string
  token: string
  status: string
  configuracao: any
  metricas: any
  criado_em: string
}

interface WebhooksContextType {
  webhooks: Webhook[]
  loading: boolean
  criarWebhook: (dados: any) => Promise<Webhook>
  atualizarWebhook: (id: string, dados: any) => Promise<void>
  excluirWebhook: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
}

const WebhooksContext = createContext<WebhooksContextType | undefined>(undefined)

export const WebhooksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchWebhooks()
    }
  }, [user])

  const fetchWebhooks = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })

    if (data && !error) {
      setWebhooks(data)
    }
    setLoading(false)
  }

  const criarWebhook = async (dados: any): Promise<Webhook> => {
    if (!user) throw new Error('Usuário não autenticado')

    const novoWebhook = {
      id: `wh_${Date.now()}`,
      usuario_id: user.id,
      nome: dados.nome,
      url: `https://app.fluxolocal.com.br/api/webhook/${Date.now()}`,
      token: `flx_wh_${Math.random().toString(36).substr(2, 32)}`,
      status: 'ativo' as const,
      configuracao: dados.configuracao || {},
      metricas: {
        totalRequests: 0,
        successRate: 100,
        avgResponseTime: '0ms'
      }
    }

    const { data, error } = await supabase
      .from('webhooks')
      .insert(novoWebhook)
      .select()
      .single()

    if (data && !error) {
      setWebhooks(prev => [data, ...prev])
      return data
    }

    throw new Error(error?.message || 'Erro ao criar webhook')
  }

  const atualizarWebhook = async (id: string, dados: any) => {
    if (!user) return

    const { error } = await supabase
      .from('webhooks')
      .update(dados)
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (!error) {
      setWebhooks(prev => 
        prev.map(webhook => 
          webhook.id === id ? { ...webhook, ...dados } : webhook
        )
      )
    }
  }

  const excluirWebhook = async (id: string) => {
    if (!user) return

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (!error) {
      setWebhooks(prev => prev.filter(webhook => webhook.id !== id))
    }
  }

  const toggleStatus = async (id: string) => {
    const webhook = webhooks.find(w => w.id === id)
    if (!webhook) return

    const novoStatus = webhook.status === 'ativo' ? 'inativo' : 'ativo'
    await atualizarWebhook(id, { status: novoStatus })
  }

  return (
    <WebhooksContext.Provider value={{
      webhooks,
      loading,
      criarWebhook,
      atualizarWebhook,
      excluirWebhook,
      toggleStatus
    }}>
      {children}
    </WebhooksContext.Provider>
  )
}

export const useWebhooks = () => {
  const context = useContext(WebhooksContext)
  if (context === undefined) {
    throw new Error('useWebhooks must be used within a WebhooksProvider')
  }
  return context
}