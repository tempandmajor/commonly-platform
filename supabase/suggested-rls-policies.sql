
-- RLS Policy Suggestions for Chat-Related Features
-- These are suggestions that should be implemented via SQL migrations to improve security

-- 1. RLS policies for messages table 
-- Ensure users can only access messages from chats they're participants in
CREATE POLICY "Users can view messages from chats they participate in" 
ON messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = messages.chat_id 
    AND auth.uid() = ANY(chats.participants)
  )
);

CREATE POLICY "Users can insert messages to chats they participate in" 
ON messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = chat_id 
    AND auth.uid() = ANY(chats.participants)
  )
);

CREATE POLICY "Users can update only their own messages" 
ON messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete only their own messages" 
ON messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- 2. RLS policies for chats table
-- Ensure users can only access chats where they are participants
CREATE POLICY "Users can view chats they participate in" 
ON chats 
FOR SELECT 
USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create chats with themselves as participant" 
ON chats 
FOR INSERT 
WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Users can update chats they participate in" 
ON chats 
FOR UPDATE 
USING (auth.uid() = ANY(participants));

-- 3. RLS policies for user_typing table
-- Ensure users can only manage their own typing status
CREATE POLICY "Users can see typing status in chats they participate in" 
ON user_typing 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = user_typing.chat_id 
    AND auth.uid() = ANY(chats.participants)
  )
);

CREATE POLICY "Users can insert their own typing status" 
ON user_typing 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM chats 
    WHERE chats.id = chat_id 
    AND auth.uid() = ANY(chats.participants)
  )
);

CREATE POLICY "Users can update their own typing status" 
ON user_typing 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own typing status" 
ON user_typing 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Function to check if a user is part of a chat (for more complex policies)
CREATE OR REPLACE FUNCTION user_in_chat(chat_id UUID, user_id UUID) 
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chats
    WHERE id = chat_id
    AND user_id = ANY(participants)
  );
$$;

-- Note: This is a security definer function, which means it will execute with
-- the privileges of the user who created it, not the user who calls it.
-- This is important for RLS policies to avoid infinite recursion issues.

-- 5. Ensure realtime is correctly configured
-- Make sure the following is executed to enable realtime for chat tables:
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_typing;

-- And ensure REPLICA IDENTITY is set to FULL for realtime changes to work properly
ALTER TABLE chats REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE user_typing REPLICA IDENTITY FULL;

/* 
IMPORTANT NOTES:

1. These policies are suggestions and should be adapted to your specific app requirements
2. Always test policies thoroughly before applying them to production
3. Consider additional filtering based on chat or message visibility/privacy settings
4. Remember that these policies do not enforce end-to-end encryption; 
   they merely control database access
5. For Supabase functions that need to bypass RLS for administrative operations,
   use the SECURITY DEFINER attribute
*/
