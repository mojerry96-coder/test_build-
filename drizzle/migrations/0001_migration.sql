do $$ declare t text; begin
  foreach t in array array['class_members','class_sessions','clip_checks','clips','consents','content_imports','events','evidence','flags','guardian_links','hooks','items','misconceptions','profiles','repairs','rules','sessions','sim_tasks','simulations','skills','summaries','topic_skills','topics','user_roles'] loop
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
grant insert on public.consents to authenticated;
grant insert on public.guardian_links to authenticated;
grant update (display_name) on public.profiles to authenticated;
alter default privileges in schema public revoke all on tables from anon;
revoke execute on function public.has_learning_consent(uuid) from anon;
revoke execute on function public.has_role(uuid, public.app_role) from anon;