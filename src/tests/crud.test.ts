import { supabase } from '@/lib/supabase'

async function testConnection() {
  try {
    // Test the connection
    const { data, error } = await supabase.from('usuarios').select('count').single()
    
    if (error) {
      throw error
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error)
    return false
  }
}

async function testUserOperations() {
  console.log('\n🔍 Testando operações de usuário...')
  
  try {
    // Test user registration
    const testEmail = `test_${Date.now()}@example.com`
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
    console.log('✅ Registro de usuário: OK')

    // Test user login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'Test@123456'
    })

    if (signInError) throw signInError
    console.log('✅ Login de usuário: OK')

    return true
  } catch (error) {
    console.error('❌ Erro nas operações de usuário:', error)
    return false
  }
}

async function testProductOperations() {
  console.log('\n🔍 Testando operações de produtos...')
  
  try {
    // Create test category first
    const { data: category, error: categoryError } = await supabase
      .from('categorias_produto')
      .insert({
        nome: 'Categoria Teste',
        empresa_id: 'test_company' // Você precisa ter uma empresa válida
      })
      .select()
      .single()

    if (categoryError) throw categoryError
    console.log('✅ Criação de categoria: OK')

    // Create product
    const { data: product, error: createError } = await supabase
      .from('produtos')
      .insert({
        codigo: `PROD_${Date.now()}`,
        nome: 'Produto Teste',
        preco_custo: 10.00,
        preco_venda: 20.00,
        categoria_id: category.id,
        empresa_id: 'test_company'
      })
      .select()
      .single()

    if (createError) throw createError
    console.log('✅ Criação de produto: OK')

    // Read product
    const { data: readProduct, error: readError } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', product.id)
      .single()

    if (readError) throw readError
    console.log('✅ Leitura de produto: OK')

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('produtos')
      .update({ nome: 'Produto Teste Atualizado' })
      .eq('id', product.id)
      .select()
      .single()

    if (updateError) throw updateError
    console.log('✅ Atualização de produto: OK')

    // Delete product
    const { error: deleteError } = await supabase
      .from('produtos')
      .delete()
      .eq('id', product.id)

    if (deleteError) throw deleteError
    console.log('✅ Exclusão de produto: OK')

    // Clean up - delete test category
    await supabase
      .from('categorias_produto')
      .delete()
      .eq('id', category.id)

    return true
  } catch (error) {
    console.error('❌ Erro nas operações de produtos:', error)
    return false
  }
}

async function testInventoryOperations() {
  console.log('\n🔍 Testando operações de inventário...')
  
  try {
    // Create inventory
    const { data: inventory, error: createError } = await supabase
      .from('inventarios')
      .insert({
        data_inicio: new Date().toISOString(),
        status: 'em_andamento',
        empresa_id: 'test_company',
        usuario_id: 'test_user' // Você precisa ter um usuário válido
      })
      .select()
      .single()

    if (createError) throw createError
    console.log('✅ Criação de inventário: OK')

    // Create inventory item
    const { data: item, error: itemError } = await supabase
      .from('inventario_itens')
      .insert({
        inventario_id: inventory.id,
        produto_id: 'test_product', // Você precisa ter um produto válido
        quantidade_sistema: 10
      })
      .select()
      .single()

    if (itemError) throw itemError
    console.log('✅ Criação de item de inventário: OK')

    // Update inventory item
    const { error: updateError } = await supabase
      .from('inventario_itens')
      .update({
        quantidade_contagem: 9,
        diferenca: -1
      })
      .eq('id', item.id)

    if (updateError) throw updateError
    console.log('✅ Atualização de item de inventário: OK')

    // Close inventory
    const { error: closeError } = await supabase
      .from('inventarios')
      .update({
        status: 'finalizado',
        data_fim: new Date().toISOString()
      })
      .eq('id', inventory.id)

    if (closeError) throw closeError
    console.log('✅ Fechamento de inventário: OK')

    return true
  } catch (error) {
    console.error('❌ Erro nas operações de inventário:', error)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes do CRUD...\n')

  const connected = await testConnection()
  if (!connected) {
    console.error('❌ Testes interrompidos devido a falha na conexão')
    return
  }

  const userOps = await testUserOperations()
  if (!userOps) {
    console.error('❌ Testes interrompidos devido a falha nas operações de usuário')
    return
  }

  const productOps = await testProductOperations()
  if (!productOps) {
    console.error('❌ Testes interrompidos devido a falha nas operações de produtos')
    return
  }

  const inventoryOps = await testInventoryOperations()
  if (!inventoryOps) {
    console.error('❌ Testes interrompidos devido a falha nas operações de inventário')
    return
  }

  console.log('\n✅ Todos os testes completados com sucesso!')
}

// Execute os testes
runAllTests()