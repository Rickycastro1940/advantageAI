-- PROPOSAL ONLY. Not applied. Requires separate approval for persistent
-- automatic deletion after backup/restore and operator monitoring review.
-- Isolated preview only; never apply to production as written.
begin;
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'advantage-preview-retention',
  '0 8 * * *',
  'select * from public.run_inquiry_retention(true, 100);'
);
commit;
