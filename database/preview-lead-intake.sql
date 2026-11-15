-- Apply ONLY to a confirmed isolated preview Supabase database.
-- Deliberately not applied to the connected, unclassified Supabase project.
begin;
create table public.inquiries (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null check (length(name) <= 120),
  email text not null check (length(email) <= 200),
  phone text not null check (length(phone) <= 40),
  company text not null check (length(company) <= 160),
  stack text not null check (length(stack) <= 400),
  message text not null check (length(message) <= 5000),
  status text not null check (status in ('queued','accepted','send_failed','send_unknown')),
  provider_email_id text unique
);
create table public.inquiry_delivery_events (
  event_id text primary key,
  provider_email_id text not null,
  event_type text not null check (event_type in ('email.sent','email.delivered','email.delivery_delayed','email.bounced','email.complained','email.failed','email.suppressed')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index inquiry_delivery_events_email_time on public.inquiry_delivery_events(provider_email_id, occurred_at desc);
alter table public.inquiries enable row level security;
alter table public.inquiry_delivery_events enable row level security;
revoke all on public.inquiries, public.inquiry_delivery_events from public, anon, authenticated;
grant select, insert, update on public.inquiries to service_role;
grant select, insert on public.inquiry_delivery_events to service_role;
-- Keep events independent of the inquiry insert/update: webhook arrival can race
-- the provider response. The view joins once provider_email_id is persisted.
-- Retain full event history; delivery and complaint can both be true.
create view public.inquiry_delivery_status with (security_invoker=true) as
select i.*, e.event_type as latest_delivery_event, e.occurred_at as latest_delivery_at
from public.inquiries i
left join lateral (
  select event_type, occurred_at from public.inquiry_delivery_events
  where provider_email_id=i.provider_email_id
  order by occurred_at desc, event_id desc limit 1
) e on true;
revoke all on public.inquiry_delivery_status from public, anon, authenticated;
grant select on public.inquiry_delivery_status to service_role;
commit;
