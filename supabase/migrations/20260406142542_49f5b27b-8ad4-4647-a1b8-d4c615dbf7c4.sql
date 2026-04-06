
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email text NOT NULL,
    role text NOT NULL DEFAULT 'user',
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_user_email ON public.chat_messages(user_email);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat messages"
ON public.chat_messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read own chat messages"
ON public.chat_messages FOR SELECT
TO anon, authenticated
USING (true);
