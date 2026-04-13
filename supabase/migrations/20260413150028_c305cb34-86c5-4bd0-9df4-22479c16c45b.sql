
-- Fix: Restrict restaurant_ratings SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view restaurant ratings" ON restaurant_ratings;
CREATE POLICY "Authenticated users can view restaurant ratings"
  ON restaurant_ratings FOR SELECT
  TO authenticated
  USING (true);

-- Fix: Restrict housing_ratings SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view housing ratings" ON housing_ratings;
CREATE POLICY "Authenticated users can view housing ratings"
  ON housing_ratings FOR SELECT
  TO authenticated
  USING (true);
