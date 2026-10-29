drop index if exists public.sessions_one_active;
create unique index sessions_one_active on public.sessions (student_id, topic_id)
  where status in ('active','paused') and coalesce(state->>'consent_basis','') <> 'admin_preview';
create unique index sessions_one_active_preview on public.sessions (student_id, topic_id)
  where status in ('active','paused') and coalesce(state->>'consent_basis','') = 'admin_preview';