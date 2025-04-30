
-- Create index for podcast queries
CREATE INDEX IF NOT EXISTS idx_podcasts_published ON podcasts (published);
CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts (user_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_category_id ON podcasts (category_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts (created_at);

-- Create index for podcast_comments
CREATE INDEX IF NOT EXISTS idx_podcast_comments_podcast_id ON podcast_comments (podcast_id);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (user_id, read);

-- Create index for orders
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders (merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- Create spatial index for events geo_location
CREATE INDEX IF NOT EXISTS idx_events_geo_location ON events USING GIST (geo_location);
CREATE INDEX IF NOT EXISTS idx_events_published ON events (published);

-- Create index for user_follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows (following_id);
