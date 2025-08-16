-- Add missing UPDATE policy for subnames table
CREATE POLICY "Users can update their own subnames" ON public.subnames
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = subnames.user_id
    )
  );