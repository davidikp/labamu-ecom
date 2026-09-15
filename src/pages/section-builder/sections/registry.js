/**
 * @module section-builder/sections/registry
 * @description Metadata for all 33 section types (Epic 10 companion PRD)
 * that power the "Add section" modal picker and sidebar/canvas labels. Each
 * type has a real `schema.js` + `Renderer.jsx` under `sections/<type>/`,
 * wired into `SECTION_DEFINITIONS` in `index.js`. This registry is just the
 * curated list + category grouping + short description (US-3.5) — there is no
 * hard cap on catalog size, `SectionPickerModal.jsx` renders however many
 * entries exist.
 *
 * Header and footer are deliberately excluded — they're global singletons
 * (US-3.6) with no "add" flow, only a hide toggle.
 */
export const SECTION_CATEGORIES = {
  hero: 'Hero & Banner',
  product: 'Product Display',
  brand: 'Brand Story',
  social: 'Social Proof',
  marketing: 'Marketing & Conversion',
  media: 'Media',
  utility: 'Utility',
  commerce: 'Cart & Checkout',
  editorial: 'Editorial & Storytelling',
};

export const SECTION_REGISTRY = [
  { type: 'hero_banner', label: 'Hero Banner', category: 'hero', description: 'Full-width banner with a headline, subtext and call-to-action button.' },
  { type: 'announcement_bar', label: 'Announcement Bar', category: 'hero', description: 'Slim strip for promos or shipping notices at the top of the page.' },
  { type: 'video_banner', label: 'Video Banner', category: 'hero', description: 'Hero area with a background video and overlaid text.' },
  { type: 'featured_products', label: 'Featured Products', category: 'product', description: 'Grid of hand-picked or collection-sourced products.' },
  { type: 'collection_list', label: 'Collection List', category: 'product', description: 'Showcase multiple collections as browsable cards.' },
  { type: 'category_grid', label: 'Category Grid', category: 'product', description: 'Row of icon-circle category shortcuts, e.g. a construction-supply category strip.' },
  { type: 'product_carousel', label: 'Product Carousel', category: 'product', description: 'Horizontally scrollable row of products.' },
  { type: 'product_spotlight', label: 'Single Product Spotlight', category: 'product', description: 'Highlight one product with image, details and buy button.' },
  { type: 'image_with_text', label: 'Image with Text', category: 'brand', description: 'Side-by-side image and text block to tell your story.' },
  { type: 'rich_text', label: 'Rich Text', category: 'brand', description: 'Formatted paragraph of text with headings and links.' },
  { type: 'brand_values', label: 'Brand Values', category: 'brand', description: 'Row of icons and captions covering your key selling points.' },
  { type: 'team_about', label: 'Team / About', category: 'brand', description: 'Introduce your team or company with photos and bios.' },
  { type: 'testimonials', label: 'Testimonials', category: 'social', description: 'Quotes and ratings from happy customers.' },
  { type: 'star_rating_bar', label: 'Star Rating Bar', category: 'social', description: 'Compact aggregate star rating and review count.' },
  { type: 'press_logos', label: 'Press Logos', category: 'social', description: 'Logos of publications or partners that featured you.' },
  { type: 'rating_form', label: 'Rating & Review Form', category: 'social', description: 'Star rating, name and message fields for visitors to leave a review.' },
  { type: 'newsletter_signup', label: 'Newsletter Signup', category: 'marketing', description: 'Email capture form to grow your subscriber list.' },
  { type: 'countdown_timer', label: 'Countdown Timer', category: 'marketing', description: 'Urgency timer counting down to a sale or launch.' },
  { type: 'promotional_banner', label: 'Promotional Banner', category: 'marketing', description: 'Eye-catching banner for an offer or campaign.' },
  { type: 'quote_request_form', label: 'Request a Quote Form', category: 'marketing', description: 'Name, contact and message fields for visitors requesting a custom quote.' },
  { type: 'image_gallery', label: 'Image Gallery', category: 'media', description: 'Grid or masonry layout of multiple images.' },
  { type: 'before_after_slider', label: 'Before & After Slider', category: 'media', description: 'Drag-to-compare slider between two images.' },
  { type: 'contact_form', label: 'Contact Form', category: 'utility', description: 'Let visitors send you a message with a simple form.' },
  { type: 'faq_accordion', label: 'FAQ Accordion', category: 'utility', description: 'Expandable list of frequently asked questions.' },
  { type: 'map_embed', label: 'Map Embed', category: 'utility', description: 'Embedded map with your address, hours and phone.' },
  { type: 'divider_spacer', label: 'Divider / Spacer', category: 'utility', description: 'Add whitespace or a dividing line between sections.' },
  { type: 'cart_summary', label: 'Cart Summary', category: 'commerce', description: 'Line items, subtotal and a checkout button for the Cart page.' },
  { type: 'checkout_summary', label: 'Checkout Summary', category: 'commerce', description: 'Order summary with placeholder shipping and payment fields for the Checkout page.' },
  { type: 'catalog_list', label: 'Catalog List', category: 'commerce', description: 'Filterable, sortable product grid with pagination for a shop/catalog page.' },
  { type: 'product_detail', label: 'Product Detail', category: 'commerce', description: 'Full product page layout with gallery, info panel, description tab and related products.' },
  { type: 'order_detail', label: 'Order Detail', category: 'commerce', description: 'Order info, payment status, customer detail, itemized table and totals breakdown.' },
  { type: 'modifier_popup', label: 'Modifier Popup', category: 'commerce', description: 'Required and optional option groups with live pricing and an Add to Order CTA.' },
  { type: 'editorial_collection_list', label: 'Editorial Collection List', category: 'editorial', description: 'Showcase editorial collections — portfolios, lookbooks, campaigns — as visual cards.' },
  { type: 'editorial_collection_detail', label: 'Editorial Collection Detail', category: 'editorial', description: 'Editorial storytelling template: title, description, hero image, gallery and an optional CTA.' },
];

export const SECTION_LABELS = Object.fromEntries(SECTION_REGISTRY.map((s) => [s.type, s.label]));

export function labelForType(type) {
  if (type === 'header') return 'Header';
  if (type === 'footer') return 'Footer';
  return SECTION_LABELS[type] ?? type;
}
