import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Before & After Slider — two images side by side with a draggable divider. */
export const schema = {
  before_image: { type: 'image', label: 'Before image', helpText: 'Recommended: 800x600px', group: 'media' },
  before_label: { type: 'text', label: 'Before label', maxLength: 100, default: 'Before', group: 'content' },
  after_image: { type: 'image', label: 'After image', helpText: 'Recommended: 800x600px, matching before image dimensions', group: 'media' },
  after_label: { type: 'text', label: 'After label', maxLength: 100, default: 'After', group: 'content' },
  initial_divider_position: { type: 'range', label: 'Initial divider position', min: 20, max: 80, step: 5, default: 50, unit: '%', group: 'layout' },
  section_height: { type: 'range', label: 'Section height', min: 300, max: 600, step: 50, default: 400, unit: 'px', group: 'layout' },
  section_height_mobile: { type: 'range', label: 'Section height (mobile)', min: 200, max: 500, step: 50, default: 280, unit: 'px', group: 'mobile' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 4, allowed: ['heading', 'text'], presets: [] };
