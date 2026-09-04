import { SECTION_CHROME_FIELDS_NO_PADDING } from '../shared/sectionChrome';

/** US-11.A1 — Header (global singleton). */
export const schema = {
  logo_text: { type: 'text', label: 'Logo text fallback', maxLength: 100, default: 'My Store', group: 'content' },
  // Optional icon shown alongside logo_text (never a replacement for it —
  // absent by default so every existing header without this field renders
  // exactly as before, text-only).
  logo_image: { type: 'image', label: 'Logo icon', group: 'content' },
  layout_variant: {
    type: 'select',
    label: 'Layout',
    default: 'inline',
    group: 'layout',
    options: [
      { value: 'inline', label: 'Inline — logo left, nav inline' },
      { value: 'centered-split', label: 'Centered — logo center, nav split' },
      { value: 'stacked-bold', label: 'Stacked — bold logo below a slim nav bar' },
      { value: 'centered-nav', label: 'Centered — logo left, nav centered, actions right' },
    ],
  },
  nav_links: {
    type: 'repeater',
    label: 'Nav links',
    maxItems: 8,
    group: 'content',
    // New items default their URL to whichever page is active in the
    // builder when "Add item" is clicked, rather than always defaulting to
    // "/" — see RepeaterField.jsx.
    autofillUrlFromActivePage: true,
    itemSchema: {
      label: { type: 'text', label: 'Label', maxLength: 100, default: '' },
      url: { type: 'text', label: 'URL', default: '/' },
    },
  },
  sticky: { type: 'boolean', label: 'Sticky on scroll', default: true, group: 'layout' },
  show_cart_icon: { type: 'boolean', label: 'Show cart icon', default: true, group: 'layout' },
  show_search_icon: { type: 'boolean', label: 'Show search icon', default: true, group: 'layout' },
  // Collapses nav links beyond this count into a "⋯" overflow dropdown
  // instead of letting the nav wrap/overflow the row.
  nav_overflow_after: { type: 'number', label: 'Collapse nav after N links', min: 2, max: 8, default: 5, group: 'layout' },
  // Decorative-only pill (border + globe icon + code + chevron) — clicking
  // it opens/closes a dropdown list of `languages` below, but nothing here
  // is wired to any real i18n/locale mechanism (see the code comment in
  // Renderer.jsx's renderLanguageSwitcher() — do not mistake this for a
  // functional control). `languages` defaults to a single "EN" entry so
  // existing headers with this flag on render the same single-pill look as
  // before.
  show_language_switcher: { type: 'boolean', label: 'Show language switcher', default: false, group: 'layout' },
  languages: {
    type: 'repeater', label: 'Languages (display only)', group: 'layout',
    maxItems: 6,
    default: [{ id: 'lang-en', code: 'EN', label: 'English' }],
    itemSchema: {
      code: { type: 'text', label: 'Code', maxLength: 4, default: 'EN' },
      label: { type: 'text', label: 'Label', maxLength: 40, default: '' },
    },
  },
  show_border: { type: 'boolean', label: 'Show bottom border', default: false, group: 'layout' },
  ...SECTION_CHROME_FIELDS_NO_PADDING,
  color_scheme: { ...SECTION_CHROME_FIELDS_NO_PADDING.color_scheme, default: 'primary' },
};
