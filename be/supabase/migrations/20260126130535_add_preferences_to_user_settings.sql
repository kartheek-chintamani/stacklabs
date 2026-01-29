ALTER TABLE "public"."user_settings" ADD COLUMN IF NOT EXISTS "preferences" jsonb DEFAULT '{"cloaking": false}'::jsonb;
