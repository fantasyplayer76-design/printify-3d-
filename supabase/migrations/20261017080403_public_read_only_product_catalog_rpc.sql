grant select (id, slug, name, name_en, name_ar, category, price, stock, description, desc_en, desc_ar, material, dims, customizable, available, image_url, icon) on table public.products to anon, authenticated;

create or replace function public.get_public_product_catalog()
returns table (
  id bigint,
  slug text,
  name text,
  name_en text,
  name_ar text,
  category text,
  price numeric,
  stock integer,
  description text,
  desc_en text,
  desc_ar text,
  material text,
  dims text,
  customizable boolean,
  available boolean,
  image_url text,
  icon text
)
language sql
stable
security invoker
set search_path = ''
as $function$
  select
    p.id, p.slug, p.name, p.name_en, p.name_ar, p.category, p.price, p.stock,
    p.description, p.desc_en, p.desc_ar, p.material, p.dims, p.customizable,
    p.available, p.image_url, p.icon
  from public.products as p
  where p.available is true
  order by p.slug asc;
$function$;

revoke all on function public.get_public_product_catalog() from public;
grant execute on function public.get_public_product_catalog() to anon, authenticated;
