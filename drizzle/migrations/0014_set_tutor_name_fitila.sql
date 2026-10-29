insert into public.settings_audit(key, topic_id, old_value, new_value, changed_by)
select 'tutor_display_name', null, (select value from public.rules where key='tutor_display_name' and topic_id is null), '"Fitila"'::jsonb, 'c421aca2-e316-4b92-aa84-bb0a4f95b380'::uuid;
insert into public.admin_audit(action, actor_id, key, old_value, new_value, details)
select 'setting_changed', 'c421aca2-e316-4b92-aa84-bb0a4f95b380'::uuid, 'tutor_display_name', (select value from public.rules where key='tutor_display_name' and topic_id is null), '"Fitila"'::jsonb, '{"via":"admin settings change"}'::jsonb;
delete from public.rules where key='tutor_display_name' and topic_id is null;
insert into public.rules(key, topic_id, value, description) values ('tutor_display_name', null, '"Fitila"'::jsonb, 'Tutor display name');