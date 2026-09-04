import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';

/** Product Carousel — horizontally scrollable product row. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'You might also like', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  ...HEADING_SIZE_FIELD,
  source_mode: {
    type: 'select', label: 'Content source', default: 'dynamic', group: 'content',
    options: [{ value: 'dynamic', label: 'From a source' }, { value: 'manual', label: 'Manual blocks' }],
  },
  source: {
    type: 'select', label: 'Product source', default: 'collection', group: 'content',
    options: [
      { value: 'collection', label: 'From a collection' },
      { value: 'best_sellers', label: 'Best sellers' },
      { value: 'newest', label: 'Newest arrivals' },
    ],
  },
  products_to_show: { type: 'range', label: 'Products to show', min: 4, max: 20, step: 1, default: 8, group: 'layout' },
  cards_visible_desktop: {
    type: 'select', label: 'Cards visible on desktop', default: '4', group: 'layout',
    options: [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }],
  },
  cards_visible_mobile: {
    type: 'select', label: 'Cards visible on mobile', default: '2', group: 'mobile',
    options: [{ value: '1', label: '1' }, { value: '2', label: '2' }],
  },
  show_price: { type: 'boolean', label: 'Show price', default: true, group: 'layout' },
  show_add_to_cart: { type: 'boolean', label: 'Show "Add to cart" button', default: false, group: 'layout' },
  show_nav_arrows: { type: 'boolean', label: 'Show navigation arrows', default: true, group: 'layout' },
  autoplay: { type: 'boolean', label: 'Autoplay', default: false, group: 'layout' },
  autoplay_speed: { type: 'range', label: 'Autoplay speed', min: 2, max: 10, step: 1, default: 4, unit: 's', group: 'layout', dependsOn: { field: 'autoplay', equals: true } },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { allowed: ['product'], presets: [], max: 16 };
