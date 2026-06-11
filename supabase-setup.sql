-- Awareness · estructura de datos (fase 2)
-- Pega TODO este archivo en Supabase → SQL Editor → Run.

-- Perfiles (uno por usuario)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  alias text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "perfil propio: leer"     on public.profiles for select using (auth.uid() = id);
create policy "perfil propio: crear"    on public.profiles for insert with check (auth.uid() = id);
create policy "perfil propio: editar"   on public.profiles for update using (auth.uid() = id);

-- Partidas de módulos (el contrato de módulo)
create table if not exists public.module_runs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  modulo text not null,
  nivel int,
  duracion_s int,
  fecha timestamptz default now(),
  metricas jsonb
);
alter table public.module_runs enable row level security;
create policy "partidas propias: leer"  on public.module_runs for select using (auth.uid() = user_id);
create policy "partidas propias: crear" on public.module_runs for insert with check (auth.uid() = user_id);
create index if not exists module_runs_user_fecha on public.module_runs (user_id, fecha);
create index if not exists module_runs_modulo on public.module_runs (modulo);

-- Sesiones guiadas completadas
create table if not exists public.session_runs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  sesion text not null,
  fecha timestamptz default now(),
  juegos jsonb
);
alter table public.session_runs enable row level security;
create policy "sesiones propias: leer"  on public.session_runs for select using (auth.uid() = user_id);
create policy "sesiones propias: crear" on public.session_runs for insert with check (auth.uid() = user_id);
