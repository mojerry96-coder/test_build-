REVOKE SELECT ON public.repairs, public.hooks, public.simulations, public.sim_tasks FROM authenticated, anon;
GRANT SELECT (id, topic_id, skill_id, practice_item_id) ON public.repairs TO authenticated;
GRANT SELECT (id, topic_id, type, script, asset_url, prediction, answered_by, is_active) ON public.hooks TO authenticated;
GRANT SELECT (id, topic_id, band, url, init) ON public.simulations TO authenticated;
GRANT SELECT (id, simulation_id, sequence, goal, required) ON public.sim_tasks TO authenticated;