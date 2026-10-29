drop policy if exists "guardian creates links" on public.guardian_links;
revoke insert on public.guardian_links from authenticated;

drop policy if exists "guardian grants consent" on public.consents;
create policy "parent grants consent for linked student" on public.consents for insert to authenticated
  with check (guardian_id = auth.uid() and public.has_role(auth.uid(),'parent')
    and exists (select 1 from public.guardian_links g where g.guardian_id = auth.uid() and g.student_id = consents.student_id));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  open_access boolean;
  domains jsonb;
  dom text := lower(split_part(coalesce(new.email,''),'@',2));
  first_name text := nullif(split_part(trim(coalesce(new.raw_user_meta_data->>'given_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')),' ',1),'');
begin
  insert into public.profiles (id, display_name) values (new.id, first_name);
  select coalesce((select value = 'true'::jsonb from public.rules where key='dev_open_access' and topic_id is null), false) into open_access;
  select coalesce((select value from public.rules where key='allowed_email_domains' and topic_id is null), '[]'::jsonb) into domains;
  if open_access and (jsonb_array_length(domains) = 0 or exists (select 1 from jsonb_array_elements_text(domains) d where lower(d) = dom)) then
    insert into public.user_roles (user_id, role) values (new.id, 'student') on conflict do nothing;
  end if;
  return new;
end $$;

create table public.settings_audit (
  id uuid primary key default gen_random_uuid(),
  key text not null, topic_id text, old_value jsonb, new_value jsonb,
  changed_by uuid not null, changed_at timestamptz not null default now()
);
grant select on public.settings_audit to authenticated;
grant all on public.settings_audit to service_role;
alter table public.settings_audit enable row level security;
create policy "admin reads settings audit" on public.settings_audit for select to authenticated
  using (public.has_role(auth.uid(),'admin'));