CREATE TABLE public.home_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.home_conversations TO service_role;
ALTER TABLE public.home_conversations ENABLE ROW LEVEL SECURITY;
CREATE INDEX home_conversations_student_idx ON public.home_conversations (student_id, updated_at DESC);
ALTER TABLE public.home_messages ADD COLUMN conversation_id uuid;
CREATE INDEX home_messages_conv_idx ON public.home_messages (conversation_id, created_at);