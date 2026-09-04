import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** US-11.B2 — Announcement Bar. Messages are now blocks (see blockConfig). */
export const schema = {
  text_alignment: {
    type: 'select', label: 'Text alignment', default: 'center', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
  },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'accent' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 8 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 8 },
};

export const blockConfig = { allowed: ['announcement'], presets: ['announcement'], max: 5 };
