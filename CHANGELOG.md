# Changelog

## Phase 1 — Bugs and structure
- Fixed the custom quote WhatsApp link so it always points to WhatsApp and refreshes with the current name, phone, description, size, and color.
- Simplified desktop and mobile navigation to Shop, Gifts, Custom Print, FAQ, and Contact.
- Changed footer legal links to their real English pages and redirected legacy legal hashes to the matching English or Arabic pages.
- Confirmed the homepage already ships a static first product grid with product names, images, and EGP prices; preserved it.


## Phase 2 — Conversion and product data
- Added a dependency-free Vercel build step that reads current product/catalog/category data from Supabase, pre-renders unique EN/AR product routes and the homepage catalogs, and refreshes product sitemap/schema entries.
- Reused the existing product detail/cart/WhatsApp behavior and added stock-aware availability, canonical unique product URLs, image fallbacks, and swipeable color/size variant cards.
- Added a single governorate fee config and delivery estimator to the homepage FAQ/cart, dedicated FAQ pages, and generated product pages. Fees and delivery days remain unconfirmed until populated.
- Replaced invented testimonials with JSON-backed approved-review slots; added JSON-backed recent-order photo slots, materials/About blocks, and the 12-question bilingual homepage FAQ.
- Confirmed quote uploads already have a 5 MB Supabase Storage limit and MIME allowlist enforced server-side.
- De-emphasized MakerWorld and added product-page WhatsApp floating buttons.


## Deployment fix — Supabase catalog access
- Added a SECURITY INVOKER read-only catalog RPC and narrow column-level SELECT grants for the existing public product fields; existing RLS policies are unchanged and private cost/profit columns are not exposed.
- Updated the Vercel static build to read products through that RPC; no service-role key or browser secret is used.
