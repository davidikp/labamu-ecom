import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** US-11.F1 — Newsletter Signup. Heading/subtext are now blocks (see blockConfig). */
export const schema = {
  button_label: { type: 'text', label: 'Button label', maxLength: 100, default: 'Subscribe', group: 'content' },
  show_disclaimer: { type: 'boolean', label: 'Show privacy disclaimer', default: true, group: 'content' },
  disclaimer_text: { type: 'text', label: 'Disclaimer text', maxLength: 400, default: 'No spam. Unsubscribe anytime.', group: 'content', dependsOn: { field: 'show_disclaimer', equals: true } },
  layout_style: {
    type: 'select', label: 'Layout style', default: 'centered', group: 'layout',
    options: [{ value: 'centered', label: 'Centered' }, { value: 'split', label: 'Split — text left, form right' }],
  },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'primary' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 4, allowed: ['heading', 'text', 'group'], presets: ['heading', 'text'] };
