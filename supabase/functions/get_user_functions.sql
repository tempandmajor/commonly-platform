
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
