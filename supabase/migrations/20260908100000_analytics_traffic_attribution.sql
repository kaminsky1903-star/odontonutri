-- Additive only. Apply before deploying the new traffic attribution collector.
-- Old rows stay NULL: historical Google traffic cannot be reclassified reliably.
alter table public.analytics_events
  add column if not exists traffic_attribution jsonb
  check (traffic_attribution is null or (
    jsonb_typeof(traffic_attribution) = 'object'
    and octet_length(traffic_attribution::text) <= 2048
  ));

comment on column public.analytics_events.traffic_attribution is
  'Versioned source, medium, campaign and presence/type of Google click marker. No raw click identifiers.';
