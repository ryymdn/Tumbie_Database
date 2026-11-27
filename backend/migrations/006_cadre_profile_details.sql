ALTER TABLE public.cadre_profiles
  ADD COLUMN IF NOT EXISTS nik varchar(16),
  ADD COLUMN IF NOT EXISTS nip varchar(18),
  ADD COLUMN IF NOT EXISTS job_title varchar(100);
