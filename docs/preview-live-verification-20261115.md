# Preview live verification — November 15, 2026

Branch: security/lead-intake-hardening-20261115
Preview source: 3a5f48e1678708b2b908b7bcabde73cfddf3a00c
All requests targeted the protected preview alias or isolated Supabase project efhipilxbggwdqiuafhf. Temporary alias-specific test access was revoked afterward.

## Live contact endpoint

| Check | Actual result |
|---|---|
| text/plain submission | 415 |
| Malformed JSON | 400 |
| Array JSON | 400 |
| Missing required fields | 422 |
| Body over 16 KiB | 413 |
| Five sequential valid submissions | Five 200 responses |
| Sixth submission in same window | 429, Retry-After: 576 seconds |
| Database effects | Exactly five matching inquiries, all accepted |
| Genuine Resend delivery | All five show email.delivered |

Rate test inquiry IDs: 25a69c5d-ec29-4b46-ad49-56aaa58170b6, b0dcc6e7-390c-4bf5-aad7-a5b584be34ab, 36aa287c-6947-411b-ba6d-3170939cb185, 03121f34-9210-4f74-8ac5-2e8a17f89d6a, 997b5ade-a553-47a3-8467-1ee92a3389b3. The sixth request created no matching inquiry or email.

## Live public webhook receiver

These failure events were synthetic payloads signed with the dedicated preview webhook secret, not actual bounced email from Resend. They used a clearly marked synthetic inquiry with provider ID preview-webhook-verification-20261115.

| Check | Actual result |
|---|---|
| Signed delivered event | 204 and persisted |
| Same event ID replay | 204, still exactly one delivery event |
| Older sent event arrives after delivery | 204, original provider timestamp preserved |
| Forged signature | 400, no row |
| Signature older than verification tolerance | 400, no row |
| Signed bounced event | 204, latest delivery event becomes email.bounced |
| Event history | Exactly three rows: sent, delivered, bounced |

SQL inspection confirmed anon and authenticated roles lack SELECT privileges on inquiries. RLS is enabled. No production credentials, settings, domains, or deployment were changed. Draft PR remains unmerged.

## Local validation

npm test: 15 passing tests. Injected provider failures cover persistence failure blocking sending, send rejection, ambiguous send timeout, missing configuration, corrupt limiter responses, signature rejection, and production isolation.

## Limits and remaining production decisions

- Live provider outage, database outage, rate-window expiry, cross-region concurrency, and actual provider-generated bounce were not induced; associated unit tests do not establish those hosted scenarios.
- This batch verifies real accepted/delivered email plus synthetic signed failure events.
- The receiver currently retries unmatched provider email IDs with 503 to accommodate the provider-ID persistence race. Unrelated account email events can therefore be retried by Resend; review a bounded race-handling strategy before production.
- Retention/deletion and queued/send_unknown reconciliation policy remain decisions; no automatic retry worker exists.
- The integrations are deliberately guarded by VERCEL_ENV=preview. Production activation needs a separate reviewed configuration/code decision and explicit approval.
