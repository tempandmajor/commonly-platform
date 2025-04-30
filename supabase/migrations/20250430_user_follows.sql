
-- Create user_follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- Apply RLS policies
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Allow users to see follower relationships
CREATE POLICY "Users can view follows"
  ON public.user_follows 
  FOR SELECT 
  USING (true);

-- Allow users to manage their own follow relationships
CREATE POLICY "Users can follow/unfollow"
  ON public.user_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows 
  FOR DELETE 
  USING (auth.uid() = follower_id);

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
