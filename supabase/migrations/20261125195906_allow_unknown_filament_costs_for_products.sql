ALTER TABLE public.products ALTER COLUMN filament_cost DROP NOT NULL;
COMMENT ON COLUMN public.products.filament_cost IS 'Internal filament cost in EGP; NULL means not measured or provided yet. Generated profit is therefore NULL until a real cost is entered.';
