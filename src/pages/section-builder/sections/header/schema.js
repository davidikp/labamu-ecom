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
  // Content > Menus (US-Content.1) — the header's nav now reads its items
  // from the shared `state.menus['main-menu']` (see builderReducer.js),
  // instead of storing its own inline `nav_links` repeater. This field is a
  // read-only reference + deep link into Content > Menus, not an inline
  // editor (matches Shopify's own header panel) — see
  // ui/fields/MenuReferenceField.jsx.
  nav_menu_ref: {
    type: 'menu_reference',
    label: 'Navigation',
    group: 'content',
    menuId: 'main-menu',
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
      // ISO 3166-1 alpha-2 country code for the flag icon shown in the pill/
      // dropdown (e.g. 'us', 'id') — optional, falls back to a globe icon
      // when unset so every existing `languages` entry without this field
      // keeps rendering exactly as before.
      flag: { type: 'text', label: 'Flag country code (e.g. us, id)', maxLength: 2, default: '' },
    },
  },
  show_border: { type: 'boolean', label: 'Show bottom border', default: false, group: 'layout' },
  // Nav link text color independent of `color_scheme`'s section text color —
  // some templates (golden Houzez reference) always render nav links in the
  // brand/accent color rather than the section's plain text color, even
  // though the header background itself uses `color_scheme: 'background'`.
  // 'text' (default) keeps every existing header's plain-text nav exactly as
  // before.
  nav_color: {
    type: 'select',
    label: 'Nav link color',
    default: 'text',
    group: 'color',
    options: [
      { value: 'text', label: 'Section text color' },
      { value: 'primary', label: "Theme's primary color" },
      { value: 'accent', label: "Theme's accent color" },
    ],
  },
  ...SECTION_CHROME_FIELDS_NO_PADDING,
  // Default 'background' (not the generic SECTION_CHROME_FIELDS 'primary'
  // default every other section starts from) — now that Renderer.jsx
  // actually applies `color_scheme` to a real background/text color (it
  // previously did nothing, so this default's value had no visible effect
  // for any header, including the several site templates that never set it
  // explicitly), 'primary' would paint every un-overridden header as a
  // solid theme-color bar — wrong for the plain page-background look most
  // existing templates (Xinear, and others with no explicit header
  // color_scheme) were actually designed around and already visually had.
  // Templates that do want a solid-color bar (or Houzez/Barger's own
  // deliberate 'background' choice) still set this explicitly.
  color_scheme: { ...SECTION_CHROME_FIELDS_NO_PADDING.color_scheme, default: 'background' },
};
