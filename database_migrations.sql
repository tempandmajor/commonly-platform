
-- Create the presence tables for user online status tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime
ADD TABLE messages, chats, users, notifications, podcasts;

-- Change REPLICA IDENTITY to FULL for realtime tracking
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE chats REPLICA IDENTITY FULL;
ALTER TABLE users REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE podcasts REPLICA IDENTITY FULL;

-- Create product_images table for product gallery
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_main_image BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_typing table for chat typing indicators
CREATE TABLE IF NOT EXISTS public.user_typing (
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

-- Create podcast_likes table for tracking podcast likes
CREATE TABLE IF NOT EXISTS public.podcast_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(podcast_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_typing ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_likes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for product_images
CREATE POLICY "Anyone can view product images" 
ON public.product_images 
FOR SELECT USING (true);

CREATE POLICY "Merchants can insert product images" 
ON public.product_images 
FOR INSERT 
WITH CHECK ((SELECT is_merchant FROM users WHERE id = auth.uid()));

CREATE POLICY "Merchants can update their product images" 
ON public.product_images 
FOR UPDATE 
USING ((SELECT merchant_id FROM products WHERE id = product_id) = 
       (SELECT merchant_store_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Merchants can delete their product images" 
ON public.product_images 
FOR DELETE 
USING ((SELECT merchant_id FROM products WHERE id = product_id) = 
       (SELECT merchant_store_id FROM users WHERE id = auth.uid()));

-- Add RLS policies for user_typing
CREATE POLICY "Users can view typing status for their chats" 
ON public.user_typing 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM chats WHERE id = chat_id AND auth.uid() = ANY(participants)));

CREATE POLICY "Users can update typing status for their chats" 
ON public.user_typing 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own typing status" 
ON public.user_typing 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS policies for podcast_likes
CREATE POLICY "Anyone can view podcast likes" 
ON public.podcast_likes 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like podcasts" 
ON public.podcast_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike podcasts they liked" 
ON public.podcast_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.increment(row_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count int;
BEGIN
  SELECT like_count INTO current_count FROM podcasts WHERE id = row_id;
  RETURN COALESCE(current_count, 0) + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement(row_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count int;
BEGIN
  SELECT like_count INTO current_count FROM podcasts WHERE id = row_id;
  RETURN GREATEST(COALESCE(current_count, 0) - 1, 0);
END;
$$;
