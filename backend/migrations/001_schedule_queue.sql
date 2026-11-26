CREATE TABLE IF NOT EXISTS public.schedule_queue (
  schedule_id bigint NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  child_id bigint NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  attended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (schedule_id, child_id)
);