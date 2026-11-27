CREATE TABLE IF NOT EXISTS public.notification_reads (
  user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_key text NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notification_key)
);
