
-- Fix 1: Restrict housing_listings SELECT to authenticated users only (protects phone_number PII)
DROP POLICY IF EXISTS "Anyone can view available housing listings" ON housing_listings;
CREATE POLICY "Authenticated users can view housing listings"
  ON housing_listings FOR SELECT
  TO authenticated
  USING (true);

-- Fix 2: Restrict event_attendees SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view event attendees" ON event_attendees;
CREATE POLICY "Authenticated users can view event attendees"
  ON event_attendees FOR SELECT
  TO authenticated
  USING (true);
