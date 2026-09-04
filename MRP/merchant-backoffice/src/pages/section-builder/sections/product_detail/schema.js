import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/**
 * Product Detail — gallery + info panel + description tab + related
 * products (Xinear's Catalog Detail page). Distinct from product_spotlight,
 * which is a simpler single-image homepage merchandising block; this is the
 * fuller PDP-style layout.
 */
export const schema = {
  product_id: {
    type: 'select', label: 'Product', default: 'p1', group: 'content',
    // Same mock catalog fixture as product_spotlight/schema.js.
    options: [
      { value: 'p1', label: 'Classic Tote Bag' },
      { value: 'p2', label: 'Minimal Leather Wallet' },
      { value: 'p3', label: 'Everyday Sneakers' },
      { value: 'p4', label: 'Wool Scarf' },
    ],
  },
  show_gallery_thumbnails: { type: 'boolean', label: 'Show gallery thumbnails', default: true, group: 'layout' },
  show_description_tab: { type: 'boolean', label: 'Show description tab', default: true, group: 'layout' },
  custom_description: { type: 'textarea', label: 'Custom description override', maxLength: 1000, default: '', group: 'content' },
  show_related_products: { type: 'boolean', label: 'Show related products', default: true, group: 'layout' },
  related_heading: { type: 'text', label: 'Related products heading', maxLength: 60, default: 'Other picks', group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
