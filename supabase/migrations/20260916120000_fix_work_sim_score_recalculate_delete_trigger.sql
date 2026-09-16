-- Stage results are immutable through the supported application flows. Recalculate
-- attempt scores when a result is inserted or updated, but not when a result is
-- removed as part of an account-deletion cascade: at that point the parent attempt
-- is already being deleted and must not be updated by this trigger.
DROP TRIGGER IF EXISTS work_sim_attempt_score_recalculate ON public.work_sim_stage_results;

CREATE TRIGGER work_sim_attempt_score_recalculate
  AFTER INSERT OR UPDATE ON public.work_sim_stage_results
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_work_sim_attempt_score();
