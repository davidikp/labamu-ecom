import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Star Rating Bar — overall review score and total review count. */
export const schema = {
  overall_rating: { type: 'range', label: 'Overall rating', min: 1, max: 5, step: 0.1, default: 4.8, group: 'content' },
  total_reviews_count: { type: 'text', label: 'Total reviews count', maxLength: 20, default: '2,400+', group: 'content' },
  tagline: { type: 'text', label: 'Tagline', maxLength: 400, default: 'Rated by customers worldwide', group: 'content' },
  show_read_reviews_link: { type: 'boolean', label: 'Show "Read reviews" link', default: false, group: 'content' },
  link_url: { type: 'text', label: 'Link URL', default: '', group: 'content', dependsOn: { field: 'show_read_reviews_link', equals: true } },
  star_display_style: {
    type: 'select', label: 'Star display style', default: 'filled', group: 'layout',
    options: [{ value: 'filled', label: 'Filled stars' }, { value: 'filled_empty', label: 'Filled + empty stars' }],
  },
  show_rating_number: { type: 'boolean', label: 'Show rating number', default: true, group: 'layout' },
  show_review_count: { type: 'boolean', label: 'Show review count', default: true, group: 'layout' },
  // Intentional exception (PRD note): hardcoded amber, not theme-sourced —
  // universally recognized as a rating color; must not regress to a
  // theme-slot default.
  star_color: { type: 'color', label: 'Star color', default: { hex: '#F59E0B' }, group: 'color' },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'surface' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 24 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 24 },
};

export const blockConfig = { max: 4, allowed: ['heading', 'text'], presets: [] };
