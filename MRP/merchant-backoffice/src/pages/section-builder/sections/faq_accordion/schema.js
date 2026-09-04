import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';

/** US-11.H2 — FAQ Accordion. FAQ items are now blocks (see blockConfig). */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Frequently asked questions', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  ...HEADING_SIZE_FIELD,
  allow_multiple_open: { type: 'boolean', label: 'Allow multiple open', default: false, group: 'layout' },
  open_first_by_default: { type: 'boolean', label: 'Open first item by default', default: false, group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 20, legacyDataKey: 'faq_items', allowed: ['faq', 'heading', 'text', 'button', 'image', 'group'], presets: ['faq', 'faq', 'faq'] };
