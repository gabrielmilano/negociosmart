# API Documentation - NegocioSmart

## Autenticação

Todas as requisições à API devem incluir o cabeçalho `x-api-key` com uma chave de API válida.

```http
x-api-key: sua-chave-api-aqui
```

## Endpoints

### GET /api/v1/estoque/critico

Retorna todos os itens do estoque que estão abaixo do estoque mínimo.

**Resposta (200 OK)**
```json
{
  "items": [
    {
      "id": "uuid",
      "nome": "string",
      "quantidade_atual": "number",
      "estoque_minimo": "number",
      "preco_custo": "number",
      "preco_venda": "number",
      "categoria_id": "uuid | null",
      "fornecedor_id": "uuid | null",
      "created_at": "string (ISO date)",
      "updated_at": "string (ISO date)"
    }
  ]
}
```

**Erros**
- 401: Chave de API inválida
- 500: Erro interno do servidor

### POST /api/v1/estoque/movimento

Registra uma movimentação de estoque (entrada ou saída) e atualiza a quantidade do produto.

**Request Body**
```json
{
  "produto_id": "uuid",
  "quantidade": "number",
  "tipo": "entrada | saida",
  "data": "string (ISO date)",
  "observacao": "string (opcional)"
}
```

**Resposta (200 OK)**
```json
{
  "success": true,
  "quantidade_atual": "number"
}
```

**Erros**
- 401: Chave de API inválida
- 404: Produto não encontrado
- 500: Erro interno do servidor

## Exemplo de Uso

### Consultar Estoque Crítico

```bash
curl -X GET https://seu-projeto.supabase.co/functions/v1/estoque-critico \
  -H "x-api-key: sua-chave-api-aqui"
```

### Registrar Movimentação

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/estoque-movimento \
  -H "x-api-key: sua-chave-api-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "produto_id": "123e4567-e89b-12d3-a456-426614174000",
    "quantidade": 10,
    "tipo": "entrada",
    "data": "2025-09-24T10:00:00Z",
    "observacao": "Recebimento de fornecedor"
  }'
```