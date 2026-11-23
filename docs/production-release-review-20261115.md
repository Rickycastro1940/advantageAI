# Advantage AI Solutions — production release approval package

Status: review complete; production activation NOT authorized. PR #6 stays draft and unmerged.
Scope: green/black website, lead intake hardening, distributed rate limiting, durable inquiries and delivery tracking. Existing Vercel project, GitHub integration, domains and Resend send setup are retained.

## Findings and resolutions

1. Unmatched webhook IDs previously returned 503 indefinitely. The receiver now retries events younger than ten minutes, then acknowledges unmatched events with 204 without storing them. Database/network failures still return 503. This bounds unrelated-account retries without discarding the normal provider-ID update race. Matching events retain signature verification, timestamp tolerance, duplicate-event protection, and provider-time ordering.
2. A send timeout does not prove failure. Current send_unknown and queued records require provider reconciliation; automatic resending remains disabled to avoid duplicate messages.
3. Retention is not enforced by any existing scheduled job. The proposed periods below must be approved and the deletion job verified before production lead storage is enabled. No records have been deleted during this review.
4. The existing intake and Vercel webhook handler explicitly require VERCEL_ENV=preview. Merging PR #6 alone will NOT activate production database intake. Production activation must use an explicit reviewed feature flag and separate production credentials; do not simply remove the environment guard or reuse preview secrets.
5. The current public Edge Function is preview-only storage. A separate production receiver and signing secret are required; production events must not be routed into the preview database.

## Approved retention policy — November 23, 2026

| Record | Proposed period | Disposal rule |
|---|---|---|
| Unqualified or closed-lost inquiry contact details and message | 90 days after closure; review open inquiries at 90 days | Delete personal fields and linked events in one controlled batch |
| Delivery-event metadata | 30 days after reconciliation | Delete old resolved metadata; unresolved exceptions enter the exception queue |
| queued / send_unknown / unresolved delivery failures | Review daily; escalate after 24 hours | Never silently delete unresolved cases; retain until operator resolution, then normal retention applies |
| Won customer | Transfer necessary information to approved client records | Do not use the inquiry store as a permanent contract/accounting archive |
| Conversion reports | 12 months of aggregated counts and values | Remove direct identifiers; report small groups cautiously |

Ricardo approved these operating periods and accepted daily reconciliation ownership on November 23, 2026. These are operating choices, not statements of legal retention requirements. An operator records any explicit hold, purpose, owner and next review date. Before activation, implement an idempotent daily purge with dry-run mode, bounded batches, exclusion of unresolved/held records, count-only audit logs, and restore/backup-expiry documentation. Approval of periods is not permission to delete production data immediately.

## Reconciliation procedure

Owner: Ricardo, confirmed November 23, 2026. Daily review of queued and send_unknown older than 15 minutes, send_failed, bounced, complained, suppressed, and records lacking a terminal event after 24 hours.

1. Look up the inquiry UUID in the Resend subject and provider logs. If provider_email_id exists, use it as the primary correlation key.
2. If Resend accepted the email, record its ID and actual observed state; do not resend. Replay a genuine signed provider webhook if available.
3. If the provider explicitly rejected the send, record send_failed and cause category. Correct the cause before an operator authorizes a new delivery attempt.
4. If acceptance remains uncertain, preserve send_unknown and escalate. Never infer non-delivery from missing webhook data or a timeout.
5. A duplicate browser submission has a different inquiry UUID and is not automatically deduplicated. Compare it manually before follow-up.
6. Record operator, time, evidence reference and decision in a protected operational ticket. Do not paste customer message bodies or credentials into GitHub issues. The current inquiry schema has no reconciliation audit fields; add them before automating this workflow.

## Release sequence — execute only after explicit approval

1. Retention periods and daily operator are approved; separately approve the final release scope, commit SHA, production activation, and rollback window on the PR.
2. Apply and preview-test the additive audit migration and bounded dry-run retention sweep. A daily schedule, backup expiry/restore evidence, and an explicit production activation flag defaulting OFF still need implementation and verification before full production lead storage.
3. Provision isolated production Supabase/Upstash resources and a production-specific Resend receiver/signing secret. Record cost approval before any paid provisioning. Keep existing production Resend send credentials and domain settings.
4. Run migration dry-run and authorization checks, apply additive schema, verify RLS and public-client denial. Keep the intake feature flag OFF.
5. Approve the exact final commit SHA and preview evidence. Merge only on Ricardo's explicit approval; never enable auto-merge.
6. Deploy the approved SHA to the existing Vercel production project. Inspect build logs and mobile/desktop pages. Enable the production intake flag only after its distinct approval checkpoint and resource checks.
7. Submit one labeled synthetic inquiry; confirm UUID persistence, Resend acceptance and genuine signed delivery. Verify rate-limit headers and ensure no production test event reaches preview storage.
8. Monitor errors and delivery exceptions during the first 24 hours. Do not report delivery from provider acceptance alone.

Rollback: disable the new production intake flag and restore the previous known-good deployment in the existing project. Preserve additive tables/events for reconciliation; never drop data to roll back code. Pause only the newly added production receiver if necessary. Keep DNS, integration links, existing Resend setup, and preview resources unchanged. Reconcile any queued/unknown requests around the rollback window before retrying.

## Evidence and limits

See docs/preview-live-verification-20261115.md for hosted evidence: five accepted/delivered inquiries, sixth request 429 with Retry-After, input validation, signed synthetic bounce/replay/order checks, and denied public-client SELECT. New retry-policy boundary tests extend the local suite to 18 tests. The bounded unmatched behavior is deployed only to the isolated preview receiver. Genuine provider bounce, live dependency outages, window expiry and cross-region concurrency remain uninduced scenarios; no claim is made that they were tested live.

## Post-launch revenue measurement specification

This defines the tracking backlog, not an already-running dashboard. Avoid advertising profitability before actual costs are recorded.

| Entity / event | Required fields | Measure |
|---|---|---|
| Inquiry | inquiry UUID, first-touch source/medium/campaign, landing page, referral category, created_at | Qualified leads by acquisition source |
| Qualification | inquiry UUID, qualified_at, outcome, owner | Qualified / valid inquiries |
| Consultation | inquiry UUID, booked_at, scheduled_at, attended_at or canceled_at | Booked / qualified; attended / booked |
| Proposal | proposal ID, inquiry UUID, sent_at, quoted revenue, estimated delivery cost | Proposals / attended consultations |
| Decision | proposal ID, won/lost_at, decision reason, contracted revenue | Wins / decided proposals; show open proposals separately |
| Delivery | project ID, earned revenue, actual direct labor hours and internal cost rates, contractors, attributable API/cloud costs | (Earned revenue - direct delivery cost) / earned revenue; zero revenue = undefined |

Preserve first-touch attribution when later sessions revisit; never store raw arbitrary URLs or query strings that may contain personal data. Use an allowlist and length limits for UTM values; internal cost rates stay server-only. Bookings require a confirmed scheduling event, not merely a calendar-link click. Track amounts in integer minor units with currency; do not combine currencies without an explicit reporting conversion. Fixed-fee work uses earned revenue and actual costs for the same reporting period, with estimates shown separately. Collect source categories first; obtain a separate decision before adding cookies or third-party tracking.

Suggested initial scorecard: valid inquiries, qualified inquiries, consultations booked/attended, proposals sent, won/lost/open proposals, contracted value, earned revenue, direct cost and delivery margin. Start weekly with an owner-reviewed ledger; automate CRM/calendar integrations after the process is reliable. No new calendar, CRM, analytics, or marketing integrations are authorized by this document alone.

## November 23 implementation status

The draft branch includes `database/preview-reconciliation-audit.sql` and `database/preview-retention-policy.sql`. The latter defaults to dry-run, caps each batch at 500, excludes unresolved or held records, retains recent delivery events, and writes count-only run records. The isolated preview project was restored from inactive status; migrations, authorization checks, scheduled execution, and deletion boundary tests must be completed before claiming enforcement. The 12-month aggregate reporting store is a separate post-launch measurement task; no customer value data has been fabricated. PR #6 remains draft; production is unchanged.
