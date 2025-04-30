
-- Function to increment podcast listen count
CREATE OR REPLACE FUNCTION increment_podcast_listens(podcast_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE podcasts
  SET listens = COALESCE(listens, 0) + 1
  WHERE id = podcast_id_param;
END;
$$;

-- Functions for follower/following count management
CREATE OR REPLACE FUNCTION increment_follower_count(follower_id_param uuid, following_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update follower count for the user being followed
  UPDATE users
  SET follower_count = COALESCE(follower_count, 0) + 1,
      followers = array_append(COALESCE(followers, '{}'::uuid[]), follower_id_param)
  WHERE id = following_id_param;
  
  -- Update following count for the follower
  UPDATE users
  SET following_count = COALESCE(following_count, 0) + 1,
      following = array_append(COALESCE(following, '{}'::uuid[]), following_id_param)
  WHERE id = follower_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_follower_count(follower_id_param uuid, following_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update follower count for the user being unfollowed
  UPDATE users
  SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0),
      followers = array_remove(COALESCE(followers, '{}'::uuid[]), follower_id_param)
  WHERE id = following_id_param;
  
  -- Update following count for the follower
  UPDATE users
  SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0),
      following = array_remove(COALESCE(following, '{}'::uuid[]), following_id_param)
  WHERE id = follower_id_param;
END;
$$;

-- Functions for fetching followers and following
CREATE OR REPLACE FUNCTION get_user_followers(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  photo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.display_name, u.photo_url
  FROM users u
  WHERE u.id = ANY(
    SELECT unnest(followers)
    FROM users
    WHERE id = user_id_param
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_user_following(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  photo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.display_name, u.photo_url
  FROM users u
  WHERE u.id = ANY(
    SELECT unnest(following)
    FROM users
    WHERE id = user_id_param
  );
END;
$$;

-- Create table for user follows if it doesn't exist
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID REFERENCES auth.users NOT NULL,
  following_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS on user_follows table
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_follows
CREATE POLICY "Users can view all follows" ON user_follows 
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own follows" ON user_follows 
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON user_follows 
  FOR DELETE USING (auth.uid() = follower_id);
