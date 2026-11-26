ALTER TABLE public.examinations ADD COLUMN IF NOT EXISTS measurement_position text
  CHECK (measurement_position IN ('lying', 'standing'));