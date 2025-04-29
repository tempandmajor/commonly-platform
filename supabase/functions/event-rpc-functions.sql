
-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment shares count
CREATE OR REPLACE FUNCTION increment_shares_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;
