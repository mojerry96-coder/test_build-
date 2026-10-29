CREATE TABLE public.scripts (
  id text PRIMARY KEY,
  owner_table text NOT NULL,
  owner_id text NOT NULL,
  field text NOT NULL,
  topic_id text REFERENCES public.topics(id),
  script jsonb NOT NULL DEFAULT '[]'::jsonb
);
GRANT ALL ON public.scripts TO service_role;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
CREATE INDEX scripts_owner_idx ON public.scripts (owner_table, owner_id);
COMMENT ON TABLE public.scripts IS 'Server-only tutor scripts (repair lessons, hook close, simulation lines, readiness opener). No browser access.';

ALTER TABLE public.item_keys ADD COLUMN wrong_paths jsonb;

ALTER TABLE public.repairs ALTER COLUMN micro_lesson SET DEFAULT '[]'::jsonb;
ALTER TABLE public.hooks ALTER COLUMN close_script SET DEFAULT '[]'::jsonb;
ALTER TABLE public.simulations ALTER COLUMN opening_lines SET DEFAULT '[]'::jsonb;
ALTER TABLE public.simulations ALTER COLUMN closing SET DEFAULT '{}'::jsonb;
COMMENT ON COLUMN public.repairs.micro_lesson IS 'DEPRECATED: moved to scripts (server-only)';
COMMENT ON COLUMN public.hooks.close_script IS 'DEPRECATED: moved to scripts (server-only)';
COMMENT ON COLUMN public.simulations.opening_lines IS 'DEPRECATED: moved to scripts (server-only)';
COMMENT ON COLUMN public.simulations.closing IS 'DEPRECATED: moved to scripts (server-only)';
COMMENT ON COLUMN public.sim_tasks.hint_script IS 'DEPRECATED: moved to scripts (server-only)';
COMMENT ON COLUMN public.sim_tasks.completion_script IS 'DEPRECATED: moved to scripts (server-only)';

CREATE OR REPLACE FUNCTION public.apply_content_pack(_ops jsonb, _import jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare
  op jsonb; t text; conflict text; setlist text; k jsonb; import_id uuid;
  allowed text[] := array['topics','skills','topic_skills','misconceptions','items','item_keys','feedback','escalations','hints','repairs','hooks','clips','clip_checks','simulations','sim_tasks','fallback_lines','rules','scripts'];
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