import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';

export function defaultCategoryItems(labels) {
  return labels.map((label, i) => ({ id: `cg-default-${i}`, label, icon_image: null, url: '' }));
}

/** Category Grid — a row of icon-circle category shortcuts (e.g. Houzez's
 * "Categories strip"). Distinct from collection_list's 'circular' display
 * style: that one renders square-ish catalog-collection thumbnails at a
 * fixed 6-item Xinear-style scale; this one is icon-in-a-circle at a
 * merchant-chosen column count, purely custom items (no catalog source —
 * a "category" here is just a shortcut link + icon, not a real collection). */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: '', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: false, group: 'content' },
  ...HEADING_SIZE_FIELD,
  items: {
    type: 'repeater', label: 'Categories', group: 'content',
    maxItems: 12,
    default: defaultCategoryItems(['Category 1', 'Category 2', 'Category 3', 'Category 4']),
    itemSchema: {
      icon_image: { type: 'image', label: 'Icon' },
      label: { type: 'text', label: 'Label', maxLength: 60, default: '' },
      url: { type: 'text', label: 'Link URL', default: '' },
    },
  },
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '8', group: 'layout',
    options: [{ value: '4', label: '4' }, { value: '6', label: '6' }, { value: '8', label: '8' }, { value: '10', label: '10' }],
  },
  columns_mobile: {
    type: 'select', label: 'Columns on mobile', default: '4', group: 'mobile',
    options: [{ value: '3', label: '3' }, { value: '4', label: '4' }],
  },
  icon_size: { type: 'range', label: 'Icon circle size', min: 48, max: 120, step: 4, default: 84, unit: 'px', group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 30 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 30 },
};

// Plain repeater items (like featured_products/collection_list), no block
// canvas — a category shortcut is just an icon + label + link, nothing that
// benefits from freeform block composition.
export const blockConfig = { allowed: [], presets: [], max: 0 };
