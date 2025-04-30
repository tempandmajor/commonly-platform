
-- Create user_follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Add RPC functions for user followers and following
CREATE OR REPLACE FUNCTION public.get_user_followers(user_id_param UUID)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'uid', u.id,
    'email', u.email,
    'displayName', u.display_name,
    'photoURL', u.photo_url,
    'bio', u.bio,
    'isOnline', u.is_online,
    'lastSeen', u.last_seen
  ) AS user_data
  FROM users u
  JOIN user_follows f ON f.follower_id = u.id
  WHERE f.following_id = user_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_following(user_id_param UUID)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'uid', u.id,
    'email', u.email,
    'displayName', u.display_name,
    'photoURL', u.photo_url,
    'bio', u.bio,
    'isOnline', u.is_online,
    'lastSeen', u.last_seen
  ) AS user_data
  FROM users u
  JOIN user_follows f ON f.following_id = u.id
  WHERE f.follower_id = user_id_param;
END;
$$;
