import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unmatchedStatus } from '../supabase/functions/preview-resend-webhook/retry-policy.js';
test('recent unmatched event retries to accommodate provider ID race',()=>assert.equal(unmatchedStatus('2026-11-15T12:00:00Z',Date.parse('2026-11-15T12:09:59Z')),503));
test('unmatched event stops retries after ten minutes',()=>assert.equal(unmatchedStatus('2026-11-15T12:00:00Z',Date.parse('2026-11-15T12:10:00Z')),204));
test('invalid and future event timestamps are rejected',()=>{assert.equal(unmatchedStatus('invalid',Date.now()),400);assert.equal(unmatchedStatus('2026-11-15T12:00:01Z',Date.parse('2026-11-15T12:00:00Z')),400);});
