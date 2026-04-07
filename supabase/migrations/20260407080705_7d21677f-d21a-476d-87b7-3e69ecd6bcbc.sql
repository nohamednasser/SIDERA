CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));