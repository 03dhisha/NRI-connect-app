
-- Add is_read to direct_messages
ALTER TABLE public.direct_messages ADD COLUMN is_read boolean NOT NULL DEFAULT false;

-- Add is_read to group_messages  
ALTER TABLE public.group_messages ADD COLUMN is_read boolean NOT NULL DEFAULT false;
