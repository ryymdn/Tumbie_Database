ALTER TABLE public.cadre_profiles
  ADD COLUMN IF NOT EXISTS area_label varchar(150),
  ADD COLUMN IF NOT EXISTS puskesmas varchar(150);
