import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';

/** Press Logos — logos of publications or brands that have featured the
 * store. Logo items are now blocks (see blockConfig). */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'As seen in', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  ...HEADING_SIZE_FIELD,
  logos_per_row_desktop: {
    type: 'select', label: 'Logos per row on desktop', default: '4', group: 'layout',
    options: [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }],
  },
  logos_per_row_mobile: {
    type: 'select', label: 'Logos per row on mobile', default: '2', group: 'mobile',
    options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }],
  },
  logo_height: { type: 'range', label: 'Logo height', min: 32, max: 80, step: 4, default: 48, unit: 'px', group: 'layout' },
  logo_style: {
    type: 'select', label: 'Logo style', default: 'monochrome', group: 'layout',
    options: [{ value: 'original', label: 'Original colors' }, { value: 'monochrome', label: 'Monochrome' }],
  },
  animate: { type: 'boolean', label: 'Animate (slow horizontal scroll)', default: false, group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 8, legacyDataKey: 'logos', allowed: ['logo', 'heading', 'text', 'button', 'image', 'group'], presets: ['logo', 'logo', 'logo', 'logo'] };
