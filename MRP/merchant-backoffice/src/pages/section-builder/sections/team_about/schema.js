import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';

/** Team / About — introduce team members with photos and names. Members are
 * now blocks (see blockConfig). */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Meet the team', group: 'content' },
  subtext: { type: 'textarea', label: 'Section subtext', maxLength: 400, default: '', group: 'content' },
  ...HEADING_SIZE_FIELD,
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '3', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
  },
  columns_mobile: {
    type: 'select', label: 'Columns on mobile', default: '1', group: 'mobile',
    options: [{ value: '1', label: '1' }, { value: '2', label: '2' }],
  },
  photo_style: {
    type: 'select', label: 'Photo style', default: 'circle', group: 'layout',
    options: [{ value: 'square', label: 'Square' }, { value: 'circle', label: 'Circle' }],
  },
  show_bio: { type: 'boolean', label: 'Show bio', default: true, group: 'layout' },
  show_social_link: { type: 'boolean', label: 'Show social link', default: false, group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'surface' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 8, legacyDataKey: 'members', allowed: ['member', 'heading', 'text', 'button', 'image', 'group'], presets: ['member', 'member', 'member'] };
