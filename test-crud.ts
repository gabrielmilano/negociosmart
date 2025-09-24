# Este é um script para testar as operações CRUD básicas
# Execute com: pnpm tsx test-crud.ts

import { supabase } from './src/lib/supabase'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testUserOperations() {
  console.log('\n🔍 Testando operações de usuário...')
  
  const testEmail = `test_${Date.now()}@example.com`
  
  try {
    // Test user registration
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test@123456',
      options: {
        data: {
          nome: 'Usuário Teste'
        }
      }
    })

    if (signUpError) throw signUpError
    console.log('✅ Registro de usuário:', testEmail)

    // Wait a bit for the user to be created
    await sleep(2000)

    // Test user login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'Test@123456'
    })

    if (signInError) throw signInError
    console.log('✅ Login de usuário')
    
    return signInData.user?.id
  } catch (error) {
    console.error('❌ Erro:', error)
    return null
  }
}

async function testCompanySetup(userId: string) {
  console.log('\n🔍 Testando setup da empresa...')
  
  try {
    const { data: company, error } = await supabase
      .from('empresas')
      .insert({
        nome: 'Empresa Teste',
        tipo_negocio: 'varejo',
        usuario_proprietario_id: userId
      })
      .select()
      .single()

    if (error) throw error
    console.log('✅ Empresa criada:', company.nome)
    
    return company.id
  } catch (error) {
    console.error('❌ Erro:', error)
    return null
  }
}

async function testProductOperations(empresaId: string) {
  console.log('\n🔍 Testando operações de produtos...')
  
  try {
    // Create category
    const { data: category, error: categoryError } = await supabase
      .from('categorias_produto')
      .insert({
        nome: 'Categoria Teste',
        empresa_id: empresaId
      })
      .select()
      .single()

    if (categoryError) throw categoryError
    console.log('✅ Categoria criada:', category.nome)

    // Create product
    const { data: product, error: productError } = await supabase
      .from('produtos')
      .insert({
        codigo_interno: `PROD_${Date.now()}`,
        nome: 'Produto Teste',
        preco_custo: 10.00,
        preco_venda: 20.00,
        categoria_id: category.id,
        empresa_id: empresaId
      })
      .select()
      .single()

    if (productError) throw productError
    console.log('✅ Produto criado:', product.nome)

    // Update product
    const { error: updateError } = await supabase
      .from('produtos')
      .update({ nome: 'Produto Teste Atualizado' })
      .eq('id', product.id)

    if (updateError) throw updateError
    console.log('✅ Produto atualizado')

    // Delete product
    const { error: deleteError } = await supabase
      .from('produtos')
      .delete()
      .eq('id', product.id)

    if (deleteError) throw deleteError
    console.log('✅ Produto deletado')

    // Delete category
    await supabase
      .from('categorias_produto')
      .delete()
      .eq('id', category.id)

    return true
  } catch (error) {
    console.error('❌ Erro:', error)
    return false
  }
}

async function testInventoryOperations(empresaId: string, userId: string) {
  console.log('\n🔍 Testando operações de inventário...')
  
  try {
    // Create inventory
    const { data: inventory, error: invError } = await supabase
      .from('inventarios')
      .insert({
        nome: 'Inventário Teste',
        empresa_id: empresaId,
        responsavel_id: userId,
        status: 'em_andamento'
      })
      .select()
      .single()

    if (invError) throw invError
    console.log('✅ Inventário criado:', inventory.nome)

    // Create test product
    const { data: product, error: prodError } = await supabase
      .from('produtos')
      .insert({
        codigo_interno: `PROD_INV_${Date.now()}`,
        nome: 'Produto para Inventário',
        preco_custo: 15.00,
        preco_venda: 30.00,
        empresa_id: empresaId,
        categoria_id: 'default' // Você precisa ter uma categoria padrão
      })
      .select()
      .single()

    if (prodError) throw prodError
    console.log('✅ Produto criado para inventário')

    // Create inventory item
    const { error: itemError } = await supabase
      .from('inventario_itens')
      .insert({
        inventario_id: inventory.id,
        produto_id: product.id,
        quantidade_sistema: 10
      })

    if (itemError) throw itemError
    console.log('✅ Item adicionado ao inventário')

    // Update inventory status
    const { error: closeError } = await supabase
      .from('inventarios')
      .update({
        status: 'finalizado'
      })
      .eq('id', inventory.id)

    if (closeError) throw closeError
    console.log('✅ Inventário finalizado')

    // Clean up
    await supabase.from('inventario_itens').delete().eq('inventario_id', inventory.id)
    await supabase.from('produtos').delete().eq('id', product.id)
    await supabase.from('inventarios').delete().eq('id', inventory.id)

    return true
  } catch (error) {
    console.error('❌ Erro:', error)
    return false
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes CRUD...')

  // Test user operations
  const userId = await testUserOperations()
  if (!userId) {
    console.error('❌ Falha nos testes de usuário')
    return
  }

  // Test company setup
  const empresaId = await testCompanySetup(userId)
  if (!empresaId) {
    console.error('❌ Falha nos testes de empresa')
    return
  }

  // Test product operations
  const productResult = await testProductOperations(empresaId)
  if (!productResult) {
    console.error('❌ Falha nos testes de produtos')
    return
  }

  // Test inventory operations
  const inventoryResult = await testInventoryOperations(empresaId, userId)
  if (!inventoryResult) {
    console.error('❌ Falha nos testes de inventário')
    return
  }

  console.log('\n✅ Todos os testes completados com sucesso!')
}

// Run the tests
runTests()