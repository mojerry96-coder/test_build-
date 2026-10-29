CREATE TABLE public.admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL CHECK (action IN ('setting_changed','role_granted','role_removed')),
  actor_id uuid,
  target_user_id uuid,
  role public.app_role,
  key text,
  old_value jsonb,
  new_value jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit TO authenticated;
GRANT ALL ON public.admin_audit TO service_role;
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX admin_audit_created_idx ON public.admin_audit (created_at DESC);
COMMENT ON TABLE public.settings_audit IS 'DEPRECATED: replaced by admin_audit (action = setting_changed)';

ALTER TABLE public.user_roles
  ADD COLUMN granted_via text NOT NULL DEFAULT 'admin' CHECK (granted_via IN ('dev_open_access','admin','system')),
  ADD COLUMN granted_by uuid DEFAULT auth.uid(),
  ADD COLUMN granted_at timestamptz NOT NULL DEFAULT now();

UPDATE public.user_roles SET granted_via = 'dev_open_access', granted_by = NULL WHERE role = 'student';

CREATE OR REPLACE FUNCTION public.log_role_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  if tg_op = 'INSERT' then
    insert into public.admin_audit(action, actor_id, target_user_id, role, details)
    values ('role_granted', auth.uid(), new.user_id, new.role, jsonb_build_object('granted_via', new.granted_via));
    return new;
  else
    insert into public.admin_audit(action, actor_id, target_user_id, role, details)
    values ('role_removed', auth.uid(), old.user_id, old.role, jsonb_build_object('granted_via', old.granted_via));
    return old;
  end if;
end $$;
CREATE TRIGGER user_roles_audit AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
    insert into public.user_roles (user_id, role, granted_via, granted_by) values (new.id, 'student', 'dev_open_access', null) on conflict do nothing;
  end if;
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.count_dev_open_access_roles() RETURNS integer
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  return (select count(*) from public.user_roles where granted_via = 'dev_open_access');
end $$;

CREATE OR REPLACE FUNCTION public.cleanup_dev_open_access_roles() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare n integer;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  delete from public.user_roles where granted_via = 'dev_open_access';
  get diagnostics n = row_count;
  return n;
end $$;
REVOKE ALL ON FUNCTION public.count_dev_open_access_roles() FROM public, anon;
REVOKE ALL ON FUNCTION public.cleanup_dev_open_access_roles() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.count_dev_open_access_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_dev_open_access_roles() TO authenticated;

-- Applies a validated content pack in one transaction. ops: [{table, conflict:[cols], rows:[...], delete:[{col:val}]}]
CREATE OR REPLACE FUNCTION public.apply_content_pack(_ops jsonb, _import jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare
  op jsonb; t text; cols text; conflict text; setlist text; k jsonb; import_id uuid;
  allowed text[] := array['topics','skills','topic_skills','misconceptions','items','item_keys','feedback','escalations','hints','repairs','hooks','clips','clip_checks','simulations','sim_tasks','fallback_lines','rules'];
begin
  for op in select * from jsonb_array_elements(_ops) loop
    t := op->>'table';
    if not (t = any(allowed)) then raise exception 'table % not allowed', t; end if;
    for k in select * from jsonb_array_elements(coalesce(op->'delete','[]'::jsonb)) loop
      execute format('delete from public.%I x where to_jsonb(x) @> $1', t) using k;
    end loop;
    if jsonb_array_length(coalesce(op->'rows','[]'::jsonb)) > 0 then
      select string_agg(quote_ident(c), ',') into conflict from jsonb_array_elements_text(op->'conflict') c;
      select string_agg(format('%1$I = excluded.%1$I', a.attname), ',') into setlist
        from pg_attribute a where a.attrelid = ('public.'||t)::regclass and a.attnum > 0 and not a.attisdropped
        and a.attname not in (select jsonb_array_elements_text(op->'conflict'));
      execute format('insert into public.%I select * from jsonb_populate_recordset(null::public.%I, $1) on conflict (%s) do %s',
        t, t, conflict, case when setlist is null then 'nothing' else 'update set '||setlist end) using op->'rows';
    end if;
  end loop;
  insert into public.content_imports(topic_id, pack_version, dry_run, status, report, imported_by)
  values (_import->>'topic_id', _import->>'pack_version', false, 'success', _import->'report', (_import->>'imported_by')::uuid)
  returning id into import_id;
  return import_id;
end $$;
REVOKE ALL ON FUNCTION public.apply_content_pack(jsonb, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_content_pack(jsonb, jsonb) TO service_role;