CREATE TABLE public.plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  topic_id text NOT NULL REFERENCES public.topics(id),
  source text NOT NULL DEFAULT 'own',
  label text,
  planned_for timestamptz,
  due_at timestamptz,
  done boolean NOT NULL DEFAULT false,
  sample boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plan_items TO authenticated;
GRANT ALL ON public.plan_items TO service_role;
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student reads own plan" ON public.plan_items FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.guardian_links g WHERE g.student_id = plan_items.student_id AND g.guardian_id = auth.uid()));

CREATE TABLE public.plan_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  plan_item_id uuid,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plan_changes TO authenticated;
GRANT ALL ON public.plan_changes TO service_role;
ALTER TABLE public.plan_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student reads own plan changes" ON public.plan_changes FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.home_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  role text NOT NULL,
  text text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.home_messages TO service_role;
ALTER TABLE public.home_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX home_messages_student_idx ON public.home_messages(student_id, created_at);
CREATE INDEX plan_items_student_idx ON public.plan_items(student_id);