-- Additive, review-only migration for the isolated preview lead store.
-- Inspect the target schema and apply through the project's migration process.
-- No retention deletion or production activation is performed here.
begin;

alter table public.inquiries
  add column lead_outcome text not null default 'open'
    check (lead_outcome in ('open', 'qualified', 'won', 'unqualified', 'closed_lost')),
  add column closed_at timestamptz,
  add column reconciliation_state text not null default 'pending'
    check (reconciliation_state in ('pending', 'investigating', 'resolved')),
  add column reconciled_at timestamptz,
  add column retention_hold_reason text,
  add column retention_hold_review_at timestamptz;

alter table public.inquiries
  add constraint inquiry_closure_consistent check (
    (lead_outcome in ('unqualified', 'closed_lost') and closed_at is not null)
    or (lead_outcome not in ('unqualified', 'closed_lost') and closed_at is null)
  ),
  add constraint inquiry_reconciliation_consistent check (
    (reconciliation_state = 'resolved' and reconciled_at is not null)
    or (reconciliation_state <> 'resolved' and reconciled_at is null)
  ),
  add constraint inquiry_hold_consistent check (
    (retention_hold_reason is null and retention_hold_review_at is null)
    or (nullif(btrim(retention_hold_reason), '') is not null and retention_hold_review_at is not null)
  );

create table public.inquiry_reconciliation_audit (
  id bigint generated always as identity primary key,
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  actor text not null check (length(btrim(actor)) between 1 and 120),
  action text not null check (action in (
    'review_started', 'provider_checked', 'provider_accepted',
    'provider_rejected', 'state_resolved', 'hold_placed',
    'hold_reviewed', 'hold_released', 'outcome_updated'
  )),
  evidence_reference text not null check (length(btrim(evidence_reference)) between 1 and 500)
);
comment on column public.inquiry_reconciliation_audit.evidence_reference is
  'Opaque provider or internal ticket reference only; never paste lead text or credentials.';
create index inquiry_reconciliation_audit_inquiry_time
  on public.inquiry_reconciliation_audit(inquiry_id, recorded_at desc);
create index inquiries_reconciliation_queue
  on public.inquiries(reconciliation_state, created_at)
  where reconciliation_state <> 'resolved';
create index inquiries_retention_candidates
  on public.inquiries(closed_at)
  where lead_outcome in ('unqualified', 'closed_lost')
    and reconciliation_state = 'resolved'
    and retention_hold_reason is null;

alter table public.inquiry_reconciliation_audit enable row level security;
revoke all on public.inquiry_reconciliation_audit from public, anon, authenticated;
grant select, insert on public.inquiry_reconciliation_audit to service_role;

-- Count-only candidate view. Approval of a policy and a separately reviewed
-- purge job are required before deleting any customer or delivery data.
create view public.inquiry_retention_candidates with (security_invoker=true) as
select id, closed_at, reconciled_at, provider_email_id
from public.inquiries
where lead_outcome in ('unqualified', 'closed_lost')
  and reconciliation_state = 'resolved'
  and retention_hold_reason is null;
revoke all on public.inquiry_retention_candidates from public, anon, authenticated;
grant select on public.inquiry_retention_candidates to service_role;

commit;
