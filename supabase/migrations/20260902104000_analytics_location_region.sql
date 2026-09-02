-- Localidad aproximada por visita (ciudad, región y país).
-- Dónde ejecutarlo: Supabase → SQL Editor → pegar este archivo → Run.
-- No guarda IP, coordenadas, código postal ni datos personales.
-- visitor_id y city ya existen; esta migración solo agrega región y país.

alter table public.analytics_events
  add column if not exists visitor_id uuid;

alter table public.analytics_events
  add column if not exists city text;

alter table public.analytics_events
  add column if not exists region text;

alter table public.analytics_events
  add column if not exists country text;

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

alter table public.analytics_events
  drop constraint if exists analytics_events_region_check;

alter table public.analytics_events
  add constraint analytics_events_region_check
  check (
    region is null
    or (
      char_length(region) between 2 and 80
      and region !~ '[/?#@]'
    )
  );

alter table public.analytics_events
  drop constraint if exists analytics_events_country_check;

alter table public.analytics_events
  add constraint analytics_events_country_check
  check (
    country is null
    or country ~ '^[A-Z]{2}$'
  );

comment on column public.analytics_events.visitor_id is
  'UUID v4 anónimo persistente del navegador. No es un dato personal.';

comment on column public.analytics_events.city is
  'Ciudad aproximada según Cloudflare. Sin IP ni coordenadas.';

comment on column public.analytics_events.region is
  'Provincia o región aproximada según Cloudflare. Sin IP ni coordenadas.';

comment on column public.analytics_events.country is
  'País ISO 3166-1 alpha-2 según Cloudflare. Sin IP ni coordenadas.';

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
  if new.region is not null then
    new.region := left(btrim(new.region), 80);
  end if;
  if new.country is not null then
    new.country := left(upper(btrim(new.country)), 2);
  end if;
  return new;
end;
$$;
