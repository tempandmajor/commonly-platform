
-- Create user_follows table for social connections
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
