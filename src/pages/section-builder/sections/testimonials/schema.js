import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';

/** US-11.E1 — Testimonials. Quote items are now blocks (see blockConfig). */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'What customers say', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  heading_align: {
    type: 'select', label: 'Heading alignment', default: 'left', group: 'content',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
  },
  ...HEADING_SIZE_FIELD,
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '3', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }],
  },
  // A genuine content-hierarchy choice, not a low-level style knob: which
  // matters more at a glance, the review or who wrote it. Default preserves
  // the original card exactly (quote first, name small/subdued below it);
  // 'name_first' puts the reviewer name above the quote and gives it the
  // prominent treatment a testimonial-led design (e.g. Houzez) wants.
  card_hierarchy: {
    type: 'select', label: 'Card content order', default: 'quote_first', group: 'layout',
    options: [{ value: 'quote_first', label: 'Quote, then reviewer name' }, { value: 'name_first', label: 'Reviewer name, then quote' }],
  },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'surface' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 6, legacyDataKey: 'quotes', allowed: ['quote', 'heading', 'text', 'button', 'image', 'group'], presets: ['quote', 'quote', 'quote'] };
