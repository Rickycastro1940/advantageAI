# Preview reconciliation and retention preparation

Status: branch proposal only. `database/preview-reconciliation-audit.sql` has not been applied to Supabase. Production intake remains off and PR #6 remains draft.

## Apply and verify in isolated preview

1. Confirm the target is the isolated preview project used by the live verification, and inspect `public.inquiries` and its RLS/grants.
2. Apply the additive SQL through the project's migration process. Existing rows receive `open` and `pending`; no existing inquiry is marked resolved or eligible for deletion.
3. Confirm anonymous and authenticated roles cannot read or write `inquiry_reconciliation_audit` or read `inquiry_retention_candidates`. Confirm `service_role` can read the count-only candidate view.
4. Verify a transaction that inserts an audit record and updates an inquiry, then roll it back using a labeled synthetic inquiry. Check each constraint rejects inconsistent closure, resolution, and hold data.

The view returns identifiers and timestamps for operational inspection; it does not enforce a retention period or delete anything. Do not export its rows into public logs.

## Daily operator procedure

Ricardo is the provisional operator until ownership is confirmed. Inspect `queued` and `send_unknown` records older than 15 minutes, rejected sends, bounced/complained/suppressed events, and accepted sends without a terminal event after 24 hours. Check Resend using the inquiry UUID in the subject or the provider email ID. A timeout or missing webhook does not prove non-delivery.

In one database transaction, record the evidence reference and action in `inquiry_reconciliation_audit` and set `reconciliation_state` / `reconciled_at` on the inquiry when the provider outcome is known. Use an internal ticket ID or provider ID as evidence reference, never a customer message or credential. Leave uncertain cases `pending` or `investigating`; do not automatically resend. Review holds explicitly and set both hold reason and review date. Closure and resolution fields are deliberately separate.

## Retention work still required

The proposed periods in `docs/production-release-review-20261115.md` need Ricardo's decision. After approval, implement and preview-test a bounded daily purge with dry-run mode, exception and hold exclusions, count-only audit output, backup/restore window, and idempotent reruns. No purge is installed by this migration. Provision separate production resources and a production-specific receiver before enabling a production switch. The existing `VERCEL_ENV=preview` guard remains intact.
