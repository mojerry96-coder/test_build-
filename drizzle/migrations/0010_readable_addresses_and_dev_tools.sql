create or replace function public.slugify(_s text) returns text language sql immutable set search_path = public as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(lower(coalesce(_s,'')), '[^a-z0-9]+', '-', 'g')), ''), 'general')
$$;

alter table public.topics add column if not exists chapter_slug text generated always as (public.slugify(chapter)) stored;
alter table public.topics add column if not exists quest_slug text generated always as (public.slugify(quest)) stored;
alter table public.topics add column if not exists topic_slug text generated always as (public.slugify(display_name)) stored;

create table public.slug_history (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('chapter','quest','topic')),
  old_slug text not null,
  new_slug text not null,
  topic_id text references public.topics(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select on public.slug_history to authenticated;
grant all on public.slug_history to service_role;
alter table public.slug_history enable row level security;
create policy "Signed-in users read slug history" on public.slug_history for select to authenticated using (true);

create or replace function public.record_slug_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.chapter_slug is distinct from old.chapter_slug then
    insert into public.slug_history(kind, old_slug, new_slug, topic_id) values ('chapter', old.chapter_slug, new.chapter_slug, new.id);
  end if;
  if new.quest_slug is distinct from old.quest_slug then
    insert into public.slug_history(kind, old_slug, new_slug, topic_id) values ('quest', old.quest_slug, new.quest_slug, new.id);
  end if;
  if new.topic_slug is distinct from old.topic_slug then
    insert into public.slug_history(kind, old_slug, new_slug, topic_id) values ('topic', old.topic_slug, new.topic_slug, new.id);
  end if;
  return new;
end $$;
revoke execute on function public.record_slug_change() from public, anon, authenticated;
create trigger topics_slug_history after update on public.topics for each row execute function public.record_slug_change();

alter table public.admin_audit drop constraint admin_audit_action_check;
alter table public.admin_audit add constraint admin_audit_action_check check (action = any (array['setting_changed','role_granted','role_removed','test_data_reset','test_data_restart','test_data_reset_success','test_data_restart_success','lesson_restarted','dev_tool_used']));