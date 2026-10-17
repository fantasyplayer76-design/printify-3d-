# Store content data
- `delivery-rates.json` is the single shipping-estimate source. Replace null fee/days with confirmed values; do not publish estimates until verified.
- `reviews.json` accepts only approved reviews with bilingual text, e.g. {"approved":true,"review_en":"…","review_ar":"…","customer_name_en":"…","customer_name_ar":"…","rating":5}. No sample reviews are shown on the storefront.
- `recent-orders.json` accepts only approved real customer photos with bilingual alt text, e.g. {"approved":true,"image":"/assets/customer-orders/order-01.webp","alt_en":"…","alt_ar":"…"}.
