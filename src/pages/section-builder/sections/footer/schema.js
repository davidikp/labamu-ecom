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
  // Content > Menus (US-Content.1) — a reference + deep link to the shared
  // "Footer menu" (`state.menus['footer-menu']`, see builderReducer.js),
  // matching header/schema.js's `nav_menu_ref`. The footer's own rendered
  // content today comes from `link_columns` below, not a flat nav list —
  // this field exists so a merchant can still discover/manage the Footer
  // menu from here, ready for a future footer layout that renders it.
  nav_menu_ref: {
    type: 'menu_reference',
    label: 'Navigation',
    group: 'content',
    menuId: 'footer-menu',
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
      // Golden reference's single "Category" column lays its 8 links out as
      // an internal 2-column grid rather than one long vertical list. Kept
      // per-column (not global) since a footer can mix a short 1-column
      // "Company" list with a longer 2-column "Category" list. 'list'
      // (default) reproduces every existing column's plain <ul> unchanged.
      links_layout: {
        type: 'select',
        label: 'Links layout',
        default: 'list',
        options: [
          { value: 'list', label: 'Single list' },
          { value: '2-column', label: 'Two columns (splits evenly)' },
        ],
      },
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
  show_copyright: { type: 'boolean', label: 'Show copyright row', default: true, group: 'content' },
  show_social_icons: { type: 'boolean', label: 'Show social icons', default: true, group: 'content' },
  // When set (and link_columns has at least one entry), social icons render
  // as their own titled column — e.g. "Follow Us" — beside the link
  // columns, instead of the bottom bar. Empty by default, so every existing
  // footer keeps the bottom-bar social icons unchanged.
  social_heading: { type: 'text', label: 'Social column heading', maxLength: 60, default: '', group: 'content' },
  // Desktop-only column-width ratio for the 'columns' variant's link-column
  // row. 'equal' reproduces every existing footer's flex-1/flex-1/... row
  // unchanged (the default). 'balanced' widens the first (brand/contact)
  // column and the link columns relative to a narrower trailing column —
  // Houzez's own ratio (~1.5fr contact : 2fr categories : 1fr social) — kept
  // as a constrained semantic choice, not raw grid-template-columns, so any
  // future template with a similarly lopsided 3-column footer can reuse it.
  // No effect on mobile stacking or on variants other than 'columns'.
  column_ratio: {
    type: 'select',
    label: 'Column width ratio (desktop)',
    default: 'equal',
    group: 'layout',
    options: [
      { value: 'equal', label: 'Equal width columns' },
      { value: 'balanced', label: 'Balanced — wider brand & link columns, narrower trailing column' },
    ],
  },
  show_border: { type: 'boolean', label: 'Show borders', default: false, group: 'layout' },
  ...SECTION_CHROME_FIELDS_NO_PADDING,
  color_scheme: { ...SECTION_CHROME_FIELDS_NO_PADDING.color_scheme, default: 'primary' },
};
