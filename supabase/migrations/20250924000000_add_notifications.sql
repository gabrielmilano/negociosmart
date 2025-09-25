create table "public"."notificacoes" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "message" text not null,
    "type" text not null,
    "created_at" timestamp with time zone not null default now(),
    "read" boolean not null default false,
    "user_id" uuid not null
);

alter table "public"."notificacoes" enable row level security;

create policy "Users can read their own notifications"
on notificacoes for select
using (auth.uid() = user_id);

create policy "Users can update their own notifications"
on notificacoes for update
using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
on notificacoes for insert
with check (auth.uid() = user_id);

-- Create triggers to sync with realtime subscriptions
alter publication supabase_realtime add table notificacoes;