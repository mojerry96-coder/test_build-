CREATE TABLE public.voice_shown (
  user_id uuid NOT NULL,
  text_hash text NOT NULL,
  noted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, text_hash)
);
GRANT ALL ON public.voice_shown TO service_role;
ALTER TABLE public.voice_shown ENABLE ROW LEVEL SECURITY;