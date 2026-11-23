-- Approved policy: 90 days after closure for lost/unqualified inquiries;
-- 30 days after reconciliation for delivery metadata; unresolved and held
-- records are excluded. Preview only; separate production migration required.
begin;

create table public.inquiry_retention_runs (
  id bigint generated always as identity primary key,
  ran_at timestamptz not null default now(),
  mode text not null check (mode in ('dry_run', 'execute')),
  inquiry_candidates integer not null,
  event_candidates integer not null,
  inquiries_deleted integer not null,
  events_deleted integer not null
);
alter table public.inquiry_retention_runs enable row level security;
revoke all on public.inquiry_retention_runs from public, anon, authenticated;
grant select, insert on public.inquiry_retention_runs to service_role;
-- Existing preview grants omit DELETE; only the service role may run the sweep.
grant delete on public.inquiries, public.inquiry_delivery_events to service_role;

create or replace function public.run_inquiry_retention(
  p_execute boolean default false,
  p_batch_size integer default 100
)
returns table (
  inquiry_candidates integer,
  event_candidates integer,
  inquiries_deleted integer,
  events_deleted integer
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inquiry_cutoff timestamptz := statement_timestamp() - interval '90 days';
  v_event_cutoff timestamptz := statement_timestamp() - interval '30 days';
  v_id uuid;
  v_provider_id text;
  v_rows integer;
begin
  if current_user not in ('service_role', 'postgres') then
    raise exception 'Retention operator role required';
  end if;
  if p_batch_size < 1 or p_batch_size > 500 or p_batch_size is null then
    raise exception 'Batch size must be between 1 and 500';
  end if;

  select count(*)::integer into inquiry_candidates from (
    select i.id from public.inquiries i
    where i.lead_outcome in ('unqualified', 'closed_lost')
      and i.closed_at <= v_inquiry_cutoff
      and i.reconciliation_state = 'resolved'
      and i.retention_hold_reason is null
      and not exists (
        select 1 from public.inquiry_delivery_events e
        where e.provider_email_id = i.provider_email_id
          and e.received_at > v_event_cutoff
      )
    order by i.closed_at, i.id limit p_batch_size
  ) eligible;

  select count(*)::integer into event_candidates from (
    select e.event_id from public.inquiry_delivery_events e
    join public.inquiries i on i.provider_email_id = e.provider_email_id
    where i.reconciliation_state = 'resolved'
      and i.reconciled_at <= v_event_cutoff
      and i.retention_hold_reason is null
      and e.received_at <= v_event_cutoff
    order by e.received_at, e.event_id limit p_batch_size
  ) eligible;

  inquiries_deleted := 0;
  events_deleted := 0;
  if p_execute then
    for v_id, v_provider_id in
      select i.id, i.provider_email_id from public.inquiries i
      where i.lead_outcome in ('unqualified', 'closed_lost')
        and i.closed_at <= v_inquiry_cutoff
        and i.reconciliation_state = 'resolved'
        and i.retention_hold_reason is null
        and not exists (
          select 1 from public.inquiry_delivery_events e
          where e.provider_email_id = i.provider_email_id
            and e.received_at > v_event_cutoff
        )
      order by i.closed_at, i.id limit p_batch_size
      for update of i skip locked
    loop
      if v_provider_id is not null then
        delete from public.inquiry_delivery_events e where e.provider_email_id = v_provider_id;
        get diagnostics v_rows = row_count;
        events_deleted := events_deleted + v_rows;
      end if;
      -- The reconciliation audit has an ON DELETE CASCADE relationship.
      delete from public.inquiries i where i.id = v_id;
      get diagnostics v_rows = row_count;
      inquiries_deleted := inquiries_deleted + v_rows;
    end loop;

    with eligible as (
      select e.event_id from public.inquiry_delivery_events e
      join public.inquiries i on i.provider_email_id = e.provider_email_id
      where i.reconciliation_state = 'resolved'
        and i.reconciled_at <= v_event_cutoff
        and i.retention_hold_reason is null
        and e.received_at <= v_event_cutoff
      order by e.received_at, e.event_id limit p_batch_size
      for update of e skip locked
    )
    delete from public.inquiry_delivery_events e
    using eligible where e.event_id = eligible.event_id;
    get diagnostics v_rows = row_count;
    events_deleted := events_deleted + v_rows;
  end if;

  insert into public.inquiry_retention_runs
    (mode, inquiry_candidates, event_candidates, inquiries_deleted, events_deleted)
  values
    (case when p_execute then 'execute' else 'dry_run' end,
     inquiry_candidates, event_candidates, inquiries_deleted, events_deleted);
  return next;
end;
$$;

revoke all on function public.run_inquiry_retention(boolean, integer)
  from public, anon, authenticated;
grant execute on function public.run_inquiry_retention(boolean, integer) to service_role;

commit;
