alter table produtos
add column if not exists status_pedido text check (status_pedido in ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
add column if not exists ultima_atualizacao_pedido timestamptz,
add column if not exists observacoes_pedido text,
add column if not exists usuario_ultima_atualizacao uuid references auth.users(id);

-- Create the historical status table
create table if not exists historico_status_pedido (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references produtos(id) not null,
  status text check (status in ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')) not null,
  data timestamptz not null default now(),
  observacoes text,
  usuario_id uuid references auth.users(id) not null,
  empresa_id uuid references empresas(id) not null,
  criado_em timestamptz not null default now(),
  
  constraint fk_historico_status_pedido_produto foreign key (produto_id) references produtos(id) on delete cascade,
  constraint fk_historico_status_pedido_usuario foreign key (usuario_id) references auth.users(id),
  constraint fk_historico_status_pedido_empresa foreign key (empresa_id) references empresas(id)
);

-- Create RLS policies for historico_status_pedido
alter table historico_status_pedido enable row level security;

create policy "Users can view their company's order history"
  on historico_status_pedido for select
  using (
    auth.uid() in (
      select usuario_id from usuarios_empresa where empresa_id = historico_status_pedido.empresa_id
    )
  );

create policy "Users can insert order history for their company"
  on historico_status_pedido for insert
  with check (
    auth.uid() in (
      select usuario_id from usuarios_empresa where empresa_id = historico_status_pedido.empresa_id
    )
  );

-- Create view for products with critical stock and order status
create or replace view view_produtos_pedidos as
  select p.*
  from produtos p
  where p.estoque_atual <= p.estoque_minimo;