# Preview retention verification — November 23, 2026

Owner: Ricardo Chong (daily reconciliation). Approved policy: 90 days after closure for unqualified/closed-lost inquiry PII; 30 days after reconciliation for resolved delivery metadata; 12 months for de-identified aggregate reporting.

## Applied to the isolated preview project

Project `efhipilxbggwdqiuafhf` (Advantage AI Preview) was restored to ACTIVE_HEALTHY. Its original `inquiries` and `inquiry_delivery_events` tables were inspected before these migrations:

- `preview_reconciliation_audit_20261123`: lifecycle/reconciliation/hold fields, append-only operator evidence references, and count-only candidate view.
- `preview_retention_policy_20261123`: bounded `run_inquiry_retention(execute, batch_size)` function, count-only run ledger, service-role delete grants.

The function defaults to dry run, limits each invocation to 1–500 inquiries plus 1–500 standalone event rows, and excludes unresolved cases and holds. It also protects an inquiry with a delivery event received within the last 30 days, even if the inquiry was closed over 90 days ago. Actual deletion requires `true` in a privileged function call.

## Checks performed

- Existing preview count before and after rollback test: 7 inquiries and 15 delivery events.
- Dry run with a 100-row cap: zero inquiry candidates and zero event candidates; one count-only dry-run record persisted. No live preview row was deleted.
- A transaction inserted synthetic records at 91 and 89 days, held and unresolved records, late and 29/31-day events, then ran dry-run and execute modes. Assertions passed: only the eligible 91-day closed/resolved inquiry and two eligible event rows were removed inside the transaction; held, unresolved, 89-day, and recent-event cases remained. A second execution removed nothing. The transaction was rolled back; no synthetic rows or deletion audit remained.
- Anonymous/authenticated SELECT denied on inquiry and audit tables. Anonymous EXECUTE denied on the retention function; service_role EXECUTE granted.
- Supabase security advisory reports RLS enabled with no policies on four internal tables. That is intentional for service-role-only access. [Advisory explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Scheduling status and daily operation

No cron extension or deletion job is installed. The proposed SQL in `database/preview-retention-schedule.sql` is **not applied**. Automatic approval review rejected persistent daily deletion scheduling because the policy and testing approval did not expressly authorize an irreversible recurring purge; its earlier draft also contained broad cron grants, since removed. The separate scheduling decision remains open. Production resources are still separate and production intake is off.

Until a schedule is authorized, Ricardo should review provider exceptions daily, reconcile uncertain sends in Resend before any retry, and record action/evidence in the protected audit table. A privileged operator may run `select * from public.run_inquiry_retention(false, 100);` to see counts; this writes a count-only dry-run record. Do not call execute mode as a routine operator step before backup/restore and monitoring are reviewed.

Before production activation: document backup retention and a tested restore path, verify daily job monitoring and catch-up behavior for batches over 100, implement separate production storage/Redis/receiver and a default-off activation flag, and approve the final SHA and rollback window. The 12-month aggregate report store and revenue fields are not yet built; no amounts should be inferred from inquiry records.
