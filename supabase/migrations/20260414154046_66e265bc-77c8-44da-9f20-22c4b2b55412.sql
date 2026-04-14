
-- Allow conversation participants to update direct messages (mark as read)
CREATE POLICY "Users can update messages in their conversations"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = direct_messages.conversation_id
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);

-- Allow group members to update group messages (mark as read)
CREATE POLICY "Group members can update messages"
ON public.group_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_messages.group_id
    AND gm.user_id = auth.uid()
  )
);
