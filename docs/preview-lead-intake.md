# Preview lead intake — PR #6

## Scope and isolation

Only branch `security/lead-intake-hardening-20261115`; do not merge without Ricardo's approval. No changes to production environment variables, domains, GitHub integration, Vercel project settings, or existing Resend configuration. New integrations execute only with `VERCEL_ENV=preview`; the existing production send path remains. The branch also enforces exact JSON content type and a streaming 16 KiB input limit.

## Behavior

1. Validate and bound input. Honeypot submissions return success without persistence or delivery.
2. Atomically count accepted-form attempts in Upstash using Redis EVAL, with five attempts per ten-minute window per HMAC-hashed ingress IP. No raw IP is stored. Vercel's overwritten x-vercel-forwarded-for is used, never the caller-controlled generic forwarding header. Missing ingress identity shares one fallback bucket.
3. Persist a queued inquiry in Supabase before sending. Dependency failures close intake with 503 rather than bypassing controls.
4. Send through existing Resend credentials with inquiry UUID in subject and idempotency key. Store provider ID and `accepted`; HTTP acceptance is not email delivery. Rejections become `send_failed`; timeout/ambiguous response becomes `send_unknown`.
5. Verify webhook raw payload with Svix; store only event ID, provider email ID, event type and timestamp. Duplicate event IDs are ignored. Events can arrive before the provider ID update; the status view joins later and orders by provider timestamp. Preserve event history so a later complaint does not erase delivery evidence.

## Required preview resources (not yet configured)

Use an isolated Supabase preview project/database and an isolated Upstash Redis database. Do not use an unidentified existing database or temporary, automatically expiring Redis service for durable setup.

Set only Vercel Preview variables, branch override `security/lead-intake-hardening-20261115`:

- `SUPABASE_URL`: isolated preview project URL
- `SUPABASE_SECRET_KEY`: backend-only secret or legacy service-role key
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: isolated preview Redis
- `RATE_LIMIT_HMAC_SECRET`: random stable secret (at least 32 bytes)
- `RESEND_WEBHOOK_SECRET`: signing secret from a dedicated preview webhook

Keep all secrets server-only, never NEXT_PUBLIC_*. Apply `database/preview-lead-intake.sql` only after the preview database has been identified and inspected. RLS denies anonymous and authenticated clients; only service_role has data access. The SQL is a reviewable setup script, not an applied migration. Record it through the chosen project's migration process when provisioned.

Existing Preview Resend send credentials are present and unchanged. Configure a dedicated preview webhook only after choosing how Resend reaches the protected preview URL. Do not disable Vercel protection or modify a production webhook. A webhook signing secret generated locally is not a substitute for a registered Resend endpoint.

## Verification

Run `npm test`, `npx tsc --noEmit`, `npm run build`. Tests use injected HTTP responses for provider failure paths; these do not establish hosted connectivity. Tests cover success ordering, persistence failure, rejection, timeout, malformed rate-limit response, rate-limit rejection, body limits, signed/forged events, and production isolation.

Hosted completion requires: preview build Ready at the pushed SHA; invalid JSON/media type/size tests; five allowed synthetic attempts followed by 429 with Retry-After; Supabase query matching inquiry UUID and provider ID; genuine signed Resend delivery event persisted; failed/bounced event and duplicate/out-of-order event checks; anon/authenticated read denial; production env metadata unchanged.

## Operational limits

No automatic email retry worker is added. If sending succeeds but the following database update fails, the record stays queued and the request returns 503. Reconcile queued/unknown records against Resend using the UUID subject before retrying; do not interpret queued/unknown as proof that no email was sent. Different browser submissions receive different UUIDs and can generate separate inquiries. Define a retention/deletion policy before production approval; no lead data should be submitted to an unapproved test database.
