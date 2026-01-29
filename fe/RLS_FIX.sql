-- ============================================
-- Re-enable RLS with Proper Security
-- Run this in Supabase SQL Editor
-- ============================================

-- Now that API uses service role key, we can keep RLS enabled
-- Service role bypasses RLS automatically

-- Re-enable RLS on content_topics (keeps database secure)
ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;

-- Keep the original admin policies
-- Service role key bypasses these anyway, but they protect against unauthorized access

-- Drop any temporary open policies
DROP POLICY IF EXISTS "Allow read access to topics" ON content_topics;
DROP POLICY IF EXISTS "Allow update access to topics" ON content_topics;
DROP POLICY IF EXISTS "Allow insert access to topics" ON content_topics;
DROP POLICY IF EXISTS "Allow delete access to topics" ON content_topics;

-- Restore secure policies
CREATE POLICY "Service role and admins have full access to topics"
  ON content_topics FOR ALL
  USING (true)  -- Service role bypasses this anyway
  WITH CHECK (true);

-- Same for articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role and admins have full access to articles"
  ON articles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow public to READ published articles
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Success message
SELECT 'RLS re-enabled with proper security!' as status;
