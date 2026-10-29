create type public.app_role as enum ('student','instructor','parent','admin');
create type public.lesson_step as enum ('readiness','hook','video','simulation','worksheet','guided','exit_ticket','reflection');
create type public.item_kind as enum ('mcq','numeric','structured','line_work','theory','prediction');
create type public.band as enum ('rebuild','bridge','stretch');
create type public.session_mode as enum ('autopilot','override');
create type public.session_status as enum ('active','paused','completed','abandoned');
create type public.class_status as enum ('open','live','paused','closed');
create type public.controller as enum ('ai','instructor');
create type public.channel as enum ('voice','text');
create type public.skill_role as enum ('prerequisite','taught');
create type public.confidence as enum ('sure','think_so','guessing');
create type public.evidence_strength as enum ('strong','moderate','weak','none');
create type public.hook_type as enum ('prediction','puzzling_question','real_life','surprising_fact');
create type public.consent_scope as enum ('learning_data','voice','transcript');
create type public.ai_provider as enum ('mock','lovable_ai','ai_team');
create type public.voice_provider as enum ('mock','elevenlabs');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create table public.guardian_links (
  guardian_id uuid not null,
  student_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (guardian_id, student_id)
);
grant select, insert on public.guardian_links to authenticated;
grant all on public.guardian_links to service_role;
alter table public.guardian_links enable row level security;

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  guardian_id uuid not null,
  scope public.consent_scope not null,
  granted boolean not null,
  version text not null,
  created_at timestamptz not null default now()
);
create index on public.consents (student_id, scope, created_at desc);
grant select, insert on public.consents to authenticated;
grant all on public.consents to service_role;
alter table public.consents enable row level security;

create table public.topics (
  id text primary key, display_name text not null, subject text, chapter text, quest text,
  is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.skills (id text primary key, name text not null, description text);
create table public.topic_skills (
  topic_id text not null references public.topics(id) on delete cascade,
  skill_id text not null references public.skills(id) on delete cascade,
  role public.skill_role not null,
  primary key (topic_id, skill_id)
);
create table public.misconceptions (
  id text primary key, skill_id text references public.skills(id) on delete set null,
  label text not null, plain_words text
);
create table public.items (
  id text primary key,
  topic_id text not null references public.topics(id) on delete cascade,
  step public.lesson_step not null, kind public.item_kind not null, sequence int not null default 0,
  prompt jsonb not null default '[]', options jsonb, fields jsonb,
  skill_ids text[] not null default '{}', tags jsonb not null default '{}', config jsonb not null default '{}'
);
create table public.item_keys (
  item_id text primary key references public.items(id) on delete cascade,
  answer jsonb, accepted_forms jsonb, worked_solution jsonb, accepted_methods jsonb, marking_guide jsonb
);
create table public.feedback (
  id text primary key, item_id text not null references public.items(id) on delete cascade,
  trigger text not null, misconception_id text references public.misconceptions(id) on delete set null,
  script jsonb not null default '[]'
);
create table public.escalations (
  id text primary key, item_id text not null references public.items(id) on delete cascade,
  attempt int not null check (attempt in (2,3)), script jsonb not null default '[]',
  unique (item_id, attempt)
);
create table public.hints (
  id text primary key, item_id text not null references public.items(id) on delete cascade,
  rung int not null check (rung between 0 and 4), script jsonb not null default '[]',
  unique (item_id, rung)
);
create table public.repairs (
  id text primary key, topic_id text not null references public.topics(id) on delete cascade,
  skill_id text not null references public.skills(id), micro_lesson jsonb not null default '[]',
  practice_item_id text references public.items(id) on delete set null
);
create table public.hooks (
  id text primary key, topic_id text not null references public.topics(id) on delete cascade,
  type public.hook_type not null, script jsonb not null default '[]', asset_url text,
  prediction jsonb, answered_by text, close_script jsonb not null default '[]',
  is_active boolean not null default false
);
create unique index hooks_one_active_per_topic on public.hooks (topic_id) where is_active;
create table public.simulations (
  id text primary key, topic_id text not null references public.topics(id) on delete cascade,
  band public.band not null, url text, init jsonb not null default '{}',
  opening_lines jsonb not null default '[]', closing jsonb not null default '{}',
  unique (topic_id, band)
);
create table public.sim_tasks (
  id text primary key, simulation_id text not null references public.simulations(id) on delete cascade,
  sequence int not null default 0, goal text not null, hint_script jsonb, completion_script jsonb,
  required boolean not null default true
);
create table public.clips (
  id text primary key, topic_id text not null references public.topics(id) on delete cascade,
  url_low text, url_standard text, captions_url text, poster_url text,
  skill_ids text[] not null default '{}', misconception_ids text[] not null default '{}'
);
create table public.clip_checks (
  clip_id text not null references public.clips(id) on delete cascade,
  at_seconds numeric not null, item_id text not null references public.items(id) on delete cascade,
  primary key (clip_id, item_id)
);
create table public.fallback_lines (
  id text primary key, topic_id text references public.topics(id) on delete cascade,
  step public.lesson_step, decision_key text not null, script jsonb not null default '[]', audio_url text,
  unique nulls not distinct (topic_id, step, decision_key)
);
create table public.rules (
  key text not null, topic_id text references public.topics(id) on delete cascade,
  value jsonb not null, description text,
  unique nulls not distinct (key, topic_id)
);
create table public.content_imports (
  id uuid primary key default gen_random_uuid(), topic_id text, pack_version text,
  dry_run boolean not null default false, status text not null, report jsonb not null default '{}',
  imported_by uuid, created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['topics','skills','topic_skills','misconceptions','items','repairs','hooks','simulations','sim_tasks','clips','clip_checks','rules'] loop
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "signed-in read" on public.%I for select to authenticated using (true)', t);
  end loop;
  foreach t in array array['item_keys','feedback','escalations','hints','fallback_lines'] loop
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

grant select on public.content_imports to authenticated;
grant all on public.content_imports to service_role;
alter table public.content_imports enable row level security;
create policy "admin read imports" on public.content_imports for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

create or replace function public.has_learning_consent(_student_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce((select (value = 'true'::jsonb) from public.rules where key='dev_open_access' and topic_id is null), false)
  or exists (
    select 1 from public.consents c
    join public.guardian_links g on g.guardian_id = c.guardian_id and g.student_id = c.student_id
    where c.student_id = _student_id and c.scope = 'learning_data'
      and c.id = (select c2.id from public.consents c2
                  where c2.student_id = c.student_id and c2.guardian_id = c.guardian_id and c2.scope='learning_data'
                  order by c2.created_at desc limit 1)
      and c.granted
  )
$$;

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null, topic_id text not null references public.topics(id),
  join_code text not null unique check (join_code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$'),
  status public.class_status not null default 'open', controller public.controller not null default 'ai',
  paused boolean not null default false, instructor_last_seen_at timestamptz,
  created_at timestamptz not null default now(), ended_at timestamptz
);
create table public.class_members (
  class_session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null, joined_at timestamptz not null default now(),
  primary key (class_session_id, student_id)
);
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null, topic_id text not null references public.topics(id),
  attempt int not null default 1, class_session_id uuid references public.class_sessions(id) on delete set null,
  pack_version text, step public.lesson_step not null default 'readiness', state jsonb not null default '{}',
  mode public.session_mode not null default 'autopilot', channel public.channel not null default 'text',
  band public.band, status public.session_status not null default 'active',
  controller public.controller not null default 'ai', paused boolean not null default false,
  started_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz,
  unique (student_id, topic_id, attempt)
);
create unique index sessions_one_active on public.sessions (student_id, topic_id) where status in ('active','paused');
create table public.events (
  id bigserial primary key, session_id uuid not null references public.sessions(id) on delete cascade,
  seq int not null, actor text not null check (actor in ('student','instructor','system')),
  type text not null, step public.lesson_step, payload jsonb not null default '{}',
  client_ts timestamptz, created_at timestamptz not null default now(),
  unique (session_id, seq)
);
create table public.turns (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.sessions(id) on delete cascade,
  trigger text not null, decision jsonb not null default '{}', ai_request jsonb, ai_reply jsonb,
  checks jsonb not null default '{}', used_fallback boolean not null default false,
  latency_ms int, first_audio_ms int, flagged boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.evidence (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null, item_id text references public.items(id) on delete set null, skill_id text,
  step public.lesson_step, attempt int not null default 1, is_first_try boolean not null default true,
  correct boolean, response jsonb, confidence public.confidence, hint_rung int, opted_out boolean not null default false,
  strength public.evidence_strength not null default 'none', misconception_id text,
  status text check (status in ('shown','repaired','not_repaired')),
  created_at timestamptz not null default now()
);
create index on public.evidence (student_id, skill_id);
create table public.summaries (
  id uuid primary key default gen_random_uuid(), session_id uuid not null unique references public.sessions(id) on delete cascade,
  student_id uuid not null, content jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.flags (
  id uuid primary key default gen_random_uuid(), session_id uuid references public.sessions(id) on delete cascade,
  turn_id uuid references public.turns(id) on delete set null,
  kind text not null check (kind in ('flagged_reply','distress','other')), note text, created_by uuid,
  created_at timestamptz not null default now()
);

create or replace function public.owns_class(_class_session_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.class_sessions where id = _class_session_id and instructor_id = auth.uid()) $$;
create or replace function public.is_class_member(_class_session_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.class_members where class_session_id = _class_session_id and student_id = auth.uid()) $$;
create or replace function public.session_in_owned_class(_session_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.sessions s join public.class_sessions c on c.id = s.class_session_id
                     where s.id = _session_id and c.instructor_id = auth.uid()) $$;

do $$ declare t text; begin
  foreach t in array array['class_sessions','class_members','sessions','events','evidence','summaries','flags'] loop
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
revoke all on public.turns from anon, authenticated;
grant all on public.turns to service_role;
alter table public.turns enable row level security;
grant usage, select on sequence public.events_id_seq to service_role;

create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "guardian reads links" on public.guardian_links for select to authenticated
  using (guardian_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "guardian creates links" on public.guardian_links for insert to authenticated
  with check (guardian_id = auth.uid() and public.has_role(auth.uid(),'parent'));
create policy "guardian reads consents" on public.consents for select to authenticated
  using (guardian_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "guardian grants consent" on public.consents for insert to authenticated
  with check (guardian_id = auth.uid() and exists (select 1 from public.guardian_links g where g.guardian_id = auth.uid() and g.student_id = consents.student_id));

create policy "read sessions" on public.sessions for select to authenticated using (
  (student_id = auth.uid() and public.has_learning_consent(auth.uid()))
  or (class_session_id is not null and public.owns_class(class_session_id))
  or public.has_role(auth.uid(),'admin'));
create policy "read events" on public.events for select to authenticated using (
  exists (select 1 from public.sessions s where s.id = events.session_id and s.student_id = auth.uid() and public.has_learning_consent(auth.uid()))
  or public.session_in_owned_class(session_id) or public.has_role(auth.uid(),'admin'));
create policy "read evidence" on public.evidence for select to authenticated using (
  (student_id = auth.uid() and public.has_learning_consent(auth.uid()))
  or public.session_in_owned_class(session_id) or public.has_role(auth.uid(),'admin'));
create policy "read summaries" on public.summaries for select to authenticated using (
  student_id = auth.uid()
  or exists (select 1 from public.guardian_links g where g.guardian_id = auth.uid() and g.student_id = summaries.student_id)
  or public.has_role(auth.uid(),'admin'));
create policy "read class" on public.class_sessions for select to authenticated using (
  instructor_id = auth.uid() or public.is_class_member(id) or public.has_role(auth.uid(),'admin'));
create policy "read members" on public.class_members for select to authenticated using (
  student_id = auth.uid() or public.owns_class(class_session_id) or public.has_role(auth.uid(),'admin'));
create policy "admin flags" on public.flags for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'student') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;
create trigger sessions_touch before update on public.sessions for each row execute function public.touch_updated_at();

alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.class_sessions;