CREATE TABLE public.voice_clips (
  clip_key text PRIMARY KEY,
  audio_b64 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.voice_clips TO service_role;
ALTER TABLE public.voice_clips ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.voice_clips IS 'Server-only: made voice clips keyed by sha256(voice settings + spoken text); no browser access.';