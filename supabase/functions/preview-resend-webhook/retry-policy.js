/** Bound the provider-ID persistence race without endlessly retrying unrelated mail. */
export function unmatchedStatus(createdAt, now = Date.now()) {
  const occurred = Date.parse(createdAt);
  if (!Number.isFinite(occurred) || occurred > now) return 400;
  return now - occurred < 600_000 ? 503 : 204;
}
