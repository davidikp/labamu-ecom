import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Catalog List — filterable/sortable product grid with pagination (Xinear's Catalog List page). */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 60, default: 'Shop', group: 'content' },
  columns_desktop: {
    type: 'select', label: 'Columns (desktop)', default: 4, group: 'layout',
    options: [{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }],
  },
  show_filters: { type: 'boolean', label: 'Show filter sidebar', default: true, group: 'layout' },
  show_sort: { type: 'boolean', label: 'Show sort control', default: true, group: 'layout' },
  page_size: {
    type: 'select', label: 'Products per page', default: 16, group: 'layout',
    options: [{ value: 8, label: '8' }, { value: 12, label: '12' }, { value: 16, label: '16' }, { value: 24, label: '24' }],
  },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
