import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/**
 * Modifier Popup — required-radio group + optional-checkbox group with a
 * max, live pricing, sticky CTA (Xinear's Pop Up Modifier page).
 */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 60, default: 'Product Options', group: 'content' },
  required_group_label: { type: 'text', label: 'Required group label', maxLength: 60, default: 'Choose an option', group: 'content' },
  optional_group_label: { type: 'text', label: 'Optional group label', maxLength: 60, default: 'Add-ons', group: 'content' },
  optional_max_selections: { type: 'number', label: 'Max optional selections', default: 2, group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
