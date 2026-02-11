
-- Group messages table for community group chat
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Members can view messages in groups they belong to
CREATE POLICY "Group members can view messages"
  ON public.group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
    OR group_messages.user_id = auth.uid()
  );

-- Members can post messages in groups they belong to
CREATE POLICY "Group members can post messages"
  ON public.group_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON public.group_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Add unique constraint for housing_ratings to support upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'housing_ratings_listing_user_unique'
  ) THEN
    ALTER TABLE public.housing_ratings ADD CONSTRAINT housing_ratings_listing_user_unique UNIQUE (listing_id, user_id);
  END IF;
END $$;

-- Add unique constraint for restaurant_ratings to support upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'restaurant_ratings_restaurant_user_unique'
  ) THEN
    ALTER TABLE public.restaurant_ratings ADD CONSTRAINT restaurant_ratings_restaurant_user_unique UNIQUE (restaurant_id, user_id);
  END IF;
END $$;

-- Enable realtime for group_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
