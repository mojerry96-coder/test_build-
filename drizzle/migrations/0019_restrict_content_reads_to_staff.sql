do $$ declare t text; begin
foreach t in array array['clips','simulations','clip_checks','skills','hooks','sim_tasks','misconceptions','repairs','topic_skills'] loop
  execute format('drop policy if exists "signed-in read" on public.%I', t);
  execute format('create policy "staff read" on public.%I for select to authenticated using (public.has_role(auth.uid(),''admin'') or public.has_role(auth.uid(),''instructor''))', t);
end loop; end $$;