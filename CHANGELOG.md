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

- Fixed the generated PDP language-toggle binding and footer labels discovered in live-route verification.


## Phase 3 — SEO and bilingual discovery
- Added four English/Arabic landing pages generated from the existing Supabase catalog for Cairo 3D printing, custom name stands, 3D printed keychains, and custom printing.
- Added canonical URLs and reciprocal ar-EG/en/x-default alternates to those pages and generated product pages; sitemap generation includes the localized pages and current product URLs.
- Linked the landing pages from the English and Arabic home-page footers.
- Updated the English and Arabic privacy pages and storefront notice to disclose privacy-friendly, cookieless Plausible analytics.

## Phase 4 — Measurement and quality
- Added cookieless Plausible event hooks for WhatsApp clicks, add-to-cart, checkout start, and successful quote submission. No customer or order details are included in event properties.
- Plausible domain is configured in the site code as www.printfy3d-eg.com. The corresponding domain and event goals must be enabled in the Plausible dashboard to view reports.
- Product pages and landing pages load event tracking through the shared build template.