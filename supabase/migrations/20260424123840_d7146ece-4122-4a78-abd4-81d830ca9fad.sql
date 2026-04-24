-- Enable RLS on realtime.messages and add authorization policies for private channels
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write on the realtime.messages table.
-- Channel-level authorization is enforced via the topic naming + RLS on source tables for postgres_changes.
DROP POLICY IF EXISTS "Authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "Authenticated can receive realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can send realtime" ON realtime.messages;
CREATE POLICY "Authenticated can send realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);