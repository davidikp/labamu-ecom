import { SECTION_CHROME_FIELDS_NO_PADDING } from '../shared/sectionChrome';

/** US-11.A2 — Footer (global singleton). */
export const schema = {
  layout_variant: {
    type: 'select',
    label: 'Layout',
    default: 'columns',
    group: 'layout',
    options: [
      { value: 'columns', label: 'Columns — tagline, link columns, and a bottom bar' },
      { value: 'centered-tagline', label: 'Centered — tagline and copyright only, no columns' },
      { value: 'minimal-bar', label: 'Minimal — a single slim copyright row' },
    ],
  },
  tagline: { type: 'textarea', label: 'Tagline', maxLength: 400, group: 'content' },
  // Logo row (icon + wordmark) shown above the rest of the footer content
  // when either is set — footer had neither field before, so this is
  // purely additive; absent/empty by default renders nothing extra.
  logo_text: { type: 'text', label: 'Logo text', maxLength: 100, default: '', group: 'content' },
  logo_image: { type: 'image', label: 'Logo icon', group: 'content' },
  social_links: {
    type: 'repeater',
    label: 'Social links',
    maxItems: 5,
    group: 'content',
    itemSchema: {
      platform: {
        type: 'select',
        label: 'Platform',
        default: 'x',
        options: [
          { value: 'x', label: 'X (Twitter)' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
        ],
      },
      url: { type: 'text', label: 'URL', default: '' },
    },
  },
  // Structured address/contact block — supersedes `tagline` when any of
  // these 4 fields is non-empty (see Renderer.jsx). All 3 existing
  // templates leave these empty, so they keep falling back to `tagline`.
  address_heading: { type: 'text', label: 'Address heading (e.g. city)', maxLength: 60, default: '', group: 'content' },
  address_body: { type: 'textarea', label: 'Address body', maxLength: 400, default: '', group: 'content' },
  phone: { type: 'text', label: 'Phone', maxLength: 40, default: '', group: 'content' },
  email: { type: 'text', label: 'Email', maxLength: 100, default: '', group: 'content' },
  link_columns: {
    type: 'repeater',
    label: 'Link columns',
    maxItems: 4,
    group: 'content',
    itemSchema: {
      heading: { type: 'text', label: 'Column heading', maxLength: 100, default: '' },
      links: {
        type: 'repeater',
        label: 'Links',
        maxItems: 8,
        itemSchema: {
          label: { type: 'text', label: 'Label', maxLength: 100, default: '' },
          url: { type: 'text', label: 'URL', default: '/' },
        },
      },
    },
  },
  copyright_text: { type: 'text', label: 'Copyright text', maxLength: 400, default: '', group: 'content' },
  show_social_icons: { type: 'boolean', label: 'Show social icons', default: true, group: 'content' },
  show_border: { type: 'boolean', label: 'Show borders', default: false, group: 'layout' },
  ...SECTION_CHROME_FIELDS_NO_PADDING,
  color_scheme: { ...SECTION_CHROME_FIELDS_NO_PADDING.color_scheme, default: 'primary' },
};
