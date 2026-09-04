import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Single Product Spotlight — one product with large image, description, and buy button. */
export const schema = {
  source_mode: {
    type: 'select', label: 'Content source', default: 'dynamic', group: 'content',
    options: [{ value: 'dynamic', label: 'From a source' }, { value: 'manual', label: 'Manual blocks' }],
  },
  product_id: {
    type: 'select', label: 'Product', default: 'p1', group: 'content',
    // Simplification: no real product picker exists in this codebase yet
    // (see featured_products/Renderer.jsx's mock-catalog note) — this
    // mirrors the mock catalog fixture directly.
    options: [
      { value: 'p1', label: 'Classic Tote Bag' },
      { value: 'p2', label: 'Minimal Leather Wallet' },
      { value: 'p3', label: 'Everyday Sneakers' },
      { value: 'p4', label: 'Wool Scarf' },
    ],
  },
  custom_heading: { type: 'text', label: 'Custom heading override', maxLength: 100, default: '', group: 'content' },
  custom_description: { type: 'textarea', label: 'Custom description override', maxLength: 1000, default: '', group: 'content' },
  show_price: { type: 'boolean', label: 'Show price', default: true, group: 'layout' },
  show_variant_selector: { type: 'boolean', label: 'Show variant selector', default: true, group: 'layout' },
  show_quantity_selector: { type: 'boolean', label: 'Show quantity selector', default: true, group: 'layout' },
  show_add_to_cart: { type: 'boolean', label: 'Show "Add to cart" button', default: true, group: 'layout' },
  button_label: { type: 'text', label: 'Button label override', maxLength: 100, default: 'Add to cart', group: 'layout' },
  image_position: {
    type: 'select', label: 'Image position', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }],
  },
  image_position_mobile: {
    type: 'select', label: 'Image position on mobile', default: 'top', group: 'mobile',
    options: [{ value: 'top', label: 'Above details' }, { value: 'bottom', label: 'Below details' }],
  },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { allowed: ['product', 'text', 'button'], presets: [], max: 6 };
