-- Ciudad aproximada y visitante anónimo (visitas repetidas).
-- Dónde ejecutarlo: Supabase → SQL Editor → pegar este archivo → Run.
-- No guarda IP, nombres ni datos personales.

alter table public.analytics_events
  add column if not exists visitor_id uuid;

alter table public.analytics_events
  add column if not exists city text;

alter table public.analytics_events
  drop constraint if exists analytics_events_city_check;

alter table public.analytics_events
  add constraint analytics_events_city_check
  check (
    city is null
    or (
      char_length(city) between 2 and 80
      and city !~ '[/?#@]'
    )
  );

comment on column public.analytics_events.visitor_id is
  'UUID anónimo persistente del navegador para detectar visitas repetidas. No es un dato personal.';

comment on column public.analytics_events.city is
  'Ciudad aproximada según Cloudflare. Sin IP ni coordenadas.';

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
