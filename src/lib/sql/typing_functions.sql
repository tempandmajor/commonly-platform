
-- Function to get a user's typing status
CREATE OR REPLACE FUNCTION public.get_typing_status(p_chat_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT is_typing 
  FROM user_typing 
  WHERE chat_id = p_chat_id AND user_id = p_user_id;
$$;

-- Function to update a user's typing status
CREATE OR REPLACE FUNCTION public.update_typing_status(
  p_chat_id UUID, 
  p_user_id UUID, 
  p_is_typing BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_typing (chat_id, user_id, is_typing, updated_at)
  VALUES (p_chat_id, p_user_id, p_is_typing, now())
  ON CONFLICT (chat_id, user_id)
  DO UPDATE SET 
    is_typing = p_is_typing,
    updated_at = now();
END;
$$;
