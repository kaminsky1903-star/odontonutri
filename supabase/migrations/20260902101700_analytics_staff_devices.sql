-- Equipos de la clínica (celulares y computadoras del panel).
-- Dónde ejecutarlo: Supabase → SQL Editor → pegar este archivo → Run.
-- Se excluyen de las visitas. No guarda nombres, IP ni datos personales.

create table if not exists public.analytics_staff_devices (
  visitor_id uuid primary key,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.analytics_staff_devices is
  'Navegadores del equipo de la clínica. Quedan fuera de las analíticas. No es un dato personal.';

comment on column public.analytics_staff_devices.visitor_id is
  'UUID anónimo del navegador que abrió /admin. No identifica a una persona.';

alter table public.analytics_staff_devices enable row level security;

revoke all on table public.analytics_staff_devices from public;
revoke all on table public.analytics_staff_devices from anon;
revoke update, delete, truncate on table public.analytics_staff_devices from authenticated;

grant select, insert on table public.analytics_staff_devices to authenticated;

drop policy if exists analytics_staff_devices_authenticated_select
  on public.analytics_staff_devices;
drop policy if exists analytics_staff_devices_authenticated_insert
  on public.analytics_staff_devices;

create policy analytics_staff_devices_authenticated_select
on public.analytics_staff_devices
for select
to authenticated
using (true);

create policy analytics_staff_devices_authenticated_insert
on public.analytics_staff_devices
for insert
to authenticated
with check (true);
