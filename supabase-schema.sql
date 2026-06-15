-- Ejecutar esto en el SQL Editor de Supabase (supabase.com → tu proyecto → SQL Editor)

create table public.pantry_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('heladera', 'freezer', 'despensa', 'verduras')),
  created_at timestamptz default now() not null
);

-- Row Level Security: cada usuario solo ve sus propios ingredientes
alter table public.pantry_items enable row level security;

create policy "Users manage their own pantry"
  on public.pantry_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
