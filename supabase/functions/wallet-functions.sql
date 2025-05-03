
-- Function to decrement wallet amount
CREATE OR REPLACE FUNCTION public.decrement_wallet_amount(p_user_id UUID, p_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance numeric;
  new_balance numeric;
BEGIN
  -- Get current balance
  SELECT available_balance INTO current_balance
  FROM wallets
  WHERE user_id = p_user_id;
  
  -- Calculate new balance (prevent negative values)
  new_balance := GREATEST(0, COALESCE(current_balance, 0) - p_amount);
  
  -- Update wallet with new balance
  UPDATE wallets
  SET available_balance = new_balance
  WHERE user_id = p_user_id;
  
  RETURN new_balance;
END;
$$;
