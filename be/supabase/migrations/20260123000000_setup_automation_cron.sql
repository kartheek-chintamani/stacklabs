-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule fetch-deals to run every 6 hours
select
  cron.schedule(
    'fetch-deals-every-6-hours',
    '0 */6 * * *',
    $$
    select
      net.http_post(
          url:='https://mnahoxvifejaqrlcerij.supabase.co/functions/v1/fetch-deals',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.jwt.claim.role_key', true) || '"}'::jsonb
      ) as request_id;
    $$
  );

-- Schedule process-schedule to run every 15 minutes
select
  cron.schedule(
    'process-schedule-every-15-mins',
    '*/15 * * * *',
    $$
    select
      net.http_post(
          url:='https://mnahoxvifejaqrlcerij.supabase.co/functions/v1/process-schedule',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.jwt.claim.role_key', true) || '"}'::jsonb
      ) as request_id;
    $$
  );
