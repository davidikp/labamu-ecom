import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { IMAGE_ASPECT_RATIO_FIELD } from '../shared/imageAspectRatio';

/** US-11.D1 — Image with Text. Content (eyebrow/heading/body/button) is now blocks. */
export const schema = {
  image: { type: 'image', label: 'Image', helpText: 'Recommended: 800x600px', group: 'media' },
  image_aspect_ratio: { ...IMAGE_ASPECT_RATIO_FIELD.image_aspect_ratio, default: 'landscape' },
  image_position: {
    type: 'select', label: 'Image position', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }],
  },
  image_position_mobile: {
    type: 'select', label: 'Image position on mobile', default: 'top', group: 'mobile',
    options: [{ value: 'top', label: 'Above text' }, { value: 'bottom', label: 'Below text' }],
  },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = {
  allowed: ['heading', 'subheading', 'text', 'button', 'image', 'group'],
  presets: ['subheading', 'heading', 'text', 'button'],
  max: 8,
};
