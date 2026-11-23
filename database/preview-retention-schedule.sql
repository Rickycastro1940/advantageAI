-- Isolated preview only. Run after preview audit and retention migrations
-- and their rollback-only boundary test. Daily at 08:00 UTC.
begin;
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.schedule(
  'advantage-preview-retention',
  '0 8 * * *',
  'select * from public.run_inquiry_retention(true, 100);'
);
commit;
