import { describe, it, expect, beforeAll } from 'vitest'
import { supabase } from '@/lib/supabase'

describe('Estoque Tests', () => {
  let userId: string | null = null
  let empresaId: string | null = null
  let categoriaId: string | null = null
  
  beforeAll(async () => {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'gabrielrho@outlook.com',
      password: 'Negociosmart@123'
    })

    console.log('SignIn result:', { data: signInData, error: signInError })
    
    if (signInError) {
      throw new Error(`Failed to sign in: ${signInError.message}`)
    }
    
    userId = signInData.user?.id
    
    if (!userId) {
      throw new Error('No user ID after sign in')
    }
    
    userId = signUpData.user?.id || null
    
    if (!userId) {
      throw new Error('No user ID after sign up')
    }

    // Aguardar criação da empresa
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Buscar empresa do usuário
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select()
      .eq('usuario_proprietario_id', userId)
      .single()
    
    console.log('Company query result:', { data: empresa, error: empresaError })

    if (empresaError) {
      throw new Error(`Failed to get company: ${empresaError.message}`)
    }
    
    empresaId = empresa?.id || null
    
    // Criar categoria para testes
    const { data: categoria } = await supabase
      .from('categorias_produto')
      .insert({
        nome: 'Categoria Teste',
        empresa_id: empresaId!,
        tipo: 'produto'
      })
      .select()
      .single()
    
    categoriaId = categoria?.id || null
  })
  
  it('should create and manage products', async () => {
    expect(empresaId).not.toBeNull()
    expect(categoriaId).not.toBeNull()
    
    // Criar produto
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .insert({
        codigo_interno: `PROD_${Date.now()}`,
        nome: 'Produto Teste',
        descricao: 'Descrição do produto teste',
        preco_custo: 10.00,
        preco_venda: 20.00,
        categoria_id: categoriaId!,
        empresa_id: empresaId!,
        estoque_minimo: 5,
        estoque_atual: 0,
        unidade_medida: 'UN'
      })
      .select()
      .single()
    
    expect(produtoError).toBeNull()
    expect(produto).not.toBeNull()
    
    // Criar inventário
    const { data: inventario, error: inventarioError } = await supabase
      .from('inventarios')
      .insert({
        nome: 'Inventário Teste',
        descricao: 'Inventário de teste',
        empresa_id: empresaId!,
        responsavel_id: userId!,
        status: 'em_andamento',
        data_inicio: new Date().toISOString()
      })
      .select()
      .single()
    
    expect(inventarioError).toBeNull()
    expect(inventario).not.toBeNull()
    
    // Adicionar item ao inventário
    const { error: itemError } = await supabase
      .from('inventario_itens')
      .insert({
        inventario_id: inventario.id,
        produto_id: produto.id,
        quantidade_sistema: 0,
        quantidade_contada: 10
      })
    
    expect(itemError).toBeNull()
    
    // Finalizar inventário
    const { error: updateError } = await supabase
      .from('inventarios')
      .update({
        status: 'finalizado',
        data_fim: new Date().toISOString()
      })
      .eq('id', inventario.id)
    
    expect(updateError).toBeNull()
    
    // Limpar dados de teste
    await supabase.from('inventario_itens').delete().eq('inventario_id', inventario.id)
    await supabase.from('inventarios').delete().eq('id', inventario.id)
    await supabase.from('produtos').delete().eq('id', produto.id)
    await supabase.from('categorias_produto').delete().eq('id', categoriaId)
  })
})