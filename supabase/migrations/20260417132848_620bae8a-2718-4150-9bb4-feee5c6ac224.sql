DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;

CREATE POLICY "Authenticated users can view group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (true);