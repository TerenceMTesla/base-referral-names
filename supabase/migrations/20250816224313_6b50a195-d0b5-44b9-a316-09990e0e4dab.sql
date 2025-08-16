-- Remove the overly permissive public read policy on subnames table
-- This policy was allowing anyone to read all user data including user_id, metadata, and transaction details
DROP POLICY IF EXISTS "Public can view subnames for display" ON public.subnames;

-- The existing "Users can view their own subnames" policy provides appropriate user-specific access control
-- No additional policies needed as all legitimate use cases are covered by the user-specific policy