-- Analíticas del sitio (visitas, páginas y clics).
-- Dónde ejecutarlo: Supabase → SQL Editor → New query → pegar este archivo → Run.
-- No guarda contraseñas, nombres, formularios, datos médicos ni IP.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  event_type text not null,
  path text not null,
  session_id uuid,
  visitor_id uuid,
  referrer_host text,
  device_type text,
  city text,
  constraint analytics_events_type_check
    check (
      event_type in (
        'visit',
        'page_view',
        'whatsapp_click',
        'phone_click',
        'location_click'
      )
    ),
  constraint analytics_events_path_check
    check (
      char_length(path) between 1 and 200
      and path like '/%'
      and path !~* '[?#@]'
    ),
  constraint analytics_events_referrer_host_check
    check (
      referrer_host is null
      or (
        char_length(referrer_host) between 1 and 253
        and referrer_host !~ '[/?#@]'
      )
    ),
  constraint analytics_events_device_check
    check (
      device_type is null
      or device_type in ('desktop', 'mobile', 'tablet')
    ),
  constraint analytics_events_city_check
    check (
      city is null
      or (
        char_length(city) between 2 and 80
        and city !~ '[/?#@]'
      )
    )
);

comment on table public.analytics_events is
  'Eventos anónimos del sitio. Sin PII, formularios ni datos clínicos.';

comment on column public.analytics_events.path is
  'Ruta de la página, por ejemplo /nutricion. Sin query string.';

comment on column public.analytics_events.session_id is
  'UUID aleatorio de sesión en el navegador. No identifica a una persona.';

comment on column public.analytics_events.visitor_id is
  'UUID anónimo persistente del navegador para detectar visitas repetidas. No es un dato personal.';

comment on column public.analytics_events.city is
  'Ciudad aproximada según Cloudflare. Sin IP ni coordenadas.';

comment on column public.analytics_events.referrer_host is
  'Solo el host de origen, por ejemplo instagram.com. Sin URL completa.';

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_type_created_at_idx
  on public.analytics_events (event_type, created_at desc);

create index if not exists analytics_events_path_created_at_idx
  on public.analytics_events (path, created_at desc);

create or replace function public.analytics_events_before_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.created_at := timezone('utc', now());
  new.path := left(new.path, 200);
  if new.referrer_host is not null then
    new.referrer_host := left(lower(new.referrer_host), 253);
  end if;
  if new.city is not null then
    new.city := left(btrim(new.city), 80);
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_events_before_insert on public.analytics_events;

create trigger analytics_events_before_insert
before insert on public.analytics_events
for each row
execute function public.analytics_events_before_insert();

alter table public.analytics_events enable row level security;

revoke all on table public.analytics_events from public;
revoke select, update, delete, truncate on table public.analytics_events from anon;
revoke update, delete, truncate on table public.analytics_events from authenticated;

grant insert on table public.analytics_events to anon;
grant insert, select on table public.analytics_events to authenticated;

drop policy if exists analytics_events_anon_insert on public.analytics_events;
drop policy if exists analytics_events_authenticated_insert on public.analytics_events;
drop policy if exists analytics_events_authenticated_select on public.analytics_events;

create policy analytics_events_anon_insert
on public.analytics_events
for insert
to anon
with check (
  event_type in (
    'visit',
    'page_view',
    'whatsapp_click',
    'phone_click',
    'location_click'
  )
);

create policy analytics_events_authenticated_insert
on public.analytics_events
for insert
to authenticated
with check (
  event_type in (
    'visit',
    'page_view',
    'whatsapp_click',
    'phone_click',
    'location_click'
  )
);

create policy analytics_events_authenticated_select
on public.analytics_events
for select
to authenticated
using (true);
