CREATE TABLE public.student_prefs (
  student_id uuid PRIMARY KEY,
  maths_feeling text CHECK (maths_feeling IN ('enjoy','ok','hard')),
  hardest_area text CHECK (hardest_area IN ('graphs','algebra','word_problems','not_sure')),
  intro_done_at timestamptz,
  last_opening_line_id text,
  last_visit_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.student_prefs TO service_role;
ALTER TABLE public.student_prefs ENABLE ROW LEVEL SECURITY;