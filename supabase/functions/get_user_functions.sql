
-- Function to get user followers
CREATE OR REPLACE FUNCTION public.get_user_followers(user_id_param uuid)
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

-- Function to get users that a user is following
CREATE OR REPLACE FUNCTION public.get_user_following(user_id_param uuid)
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

-- New function to follow a user
CREATE OR REPLACE FUNCTION public.follow_user(follower_id_param uuid, following_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the follow relationship already exists
  IF EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = follower_id_param AND following_id = following_id_param
  ) THEN
    RETURN false; -- Already following
  END IF;
  
  -- Insert the new follow relationship
  INSERT INTO user_follows (follower_id, following_id)
  VALUES (follower_id_param, following_id_param);
  
  -- Update the follower and following counts
  UPDATE users
  SET following_count = following_count + 1
  WHERE id = follower_id_param;
  
  UPDATE users
  SET follower_count = follower_count + 1
  WHERE id = following_id_param;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- New function to unfollow a user
CREATE OR REPLACE FUNCTION public.unfollow_user(follower_id_param uuid, following_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the follow relationship exists
  IF NOT EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = follower_id_param AND following_id = following_id_param
  ) THEN
    RETURN false; -- Not following
  END IF;
  
  -- Delete the follow relationship
  DELETE FROM user_follows
  WHERE follower_id = follower_id_param AND following_id = following_id_param;
  
  -- Update the follower and following counts
  UPDATE users
  SET following_count = GREATEST(following_count - 1, 0)
  WHERE id = follower_id_param;
  
  UPDATE users
  SET follower_count = GREATEST(follower_count - 1, 0)
  WHERE id = following_id_param;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
