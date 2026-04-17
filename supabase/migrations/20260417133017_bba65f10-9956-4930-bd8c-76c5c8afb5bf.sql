-- Housing ratings: only the author can see their own row
DROP POLICY IF EXISTS "Authenticated users can view housing ratings" ON public.housing_ratings;

CREATE POLICY "Users can view own housing ratings"
ON public.housing_ratings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Restaurant ratings: only the author can see their own row
DROP POLICY IF EXISTS "Authenticated users can view restaurant ratings" ON public.restaurant_ratings;

CREATE POLICY "Users can view own restaurant ratings"
ON public.restaurant_ratings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);