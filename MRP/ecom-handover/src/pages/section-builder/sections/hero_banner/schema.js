import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** US-11.B1 — Hero Banner. Content (heading/subtext/button) is now blocks. */
export const schema = {
  background_image: { type: 'image', label: 'Background image', helpText: 'Recommended: 1440x640px. Slide 1 of the carousel.', group: 'media' },
  extra_slides: {
    type: 'repeater', label: 'Additional slides', helpText: 'Each one adds another slide to the carousel.', group: 'media',
    maxItems: 4,
    itemSchema: { image: { type: 'image', label: 'Image' } },
  },
  text_alignment: {
    type: 'select', label: 'Text alignment', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }],
  },
  content_position: {
    type: 'select', label: 'Content position', default: 'center', group: 'layout',
    options: [{ value: 'top', label: 'Top' }, { value: 'center', label: 'Center' }, { value: 'bottom', label: 'Bottom' }],
  },
  overlay_opacity: { type: 'range', label: 'Image overlay opacity', min: 0, max: 80, step: 5, default: 0, unit: '%', group: 'layout' },
  min_height: { type: 'range', label: 'Min section height', min: 300, max: 800, step: 50, default: 500, unit: 'px', group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'surface' },
};

export const blockConfig = {
  allowed: ['heading', 'subheading', 'text', 'button', 'image', 'group'],
  presets: ['heading', 'subheading', 'button'],
  max: 8,
};
