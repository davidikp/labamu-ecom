import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';
import { IMAGE_ASPECT_RATIO_FIELD } from '../shared/imageAspectRatio';

/** Image Gallery — collection of photos in a grid or masonry layout. Images
 * are now blocks (see blockConfig). */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: '', group: 'content' },
  ...HEADING_SIZE_FIELD,
  layout_style: {
    type: 'select', label: 'Layout style', default: 'grid', group: 'layout',
    options: [{ value: 'grid', label: 'Grid' }, { value: 'masonry', label: 'Masonry' }],
  },
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '3', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
  },
  columns_mobile: {
    type: 'select', label: 'Columns on mobile', default: '2', group: 'mobile',
    options: [{ value: '1', label: '1' }, { value: '2', label: '2' }],
  },
  // Masonry's whole point is variable-height columns, so the fixed-ratio
  // control only makes sense (and is only shown) in grid mode.
  image_aspect_ratio: { ...IMAGE_ASPECT_RATIO_FIELD.image_aspect_ratio, dependsOn: { field: 'layout_style', equals: 'grid' } },
  enable_lightbox: { type: 'boolean', label: 'Enable lightbox', default: true, group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 12, legacyDataKey: 'images', allowed: ['image', 'heading', 'text', 'button', 'group'], presets: ['image', 'image', 'image'] };
