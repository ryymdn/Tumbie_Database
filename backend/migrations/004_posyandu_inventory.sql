CREATE TABLE IF NOT EXISTS public.posyandu_inventory (
  posyandu_id bigint NOT NULL REFERENCES public.posyandu(id) ON DELETE CASCADE,
  item text NOT NULL CHECK (item IN ('vitamin_a', 'immunization', 'pmt')),
  quantity integer NOT NULL CHECK (quantity >= 0),
  updated_by bigint REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (posyandu_id, item)
);