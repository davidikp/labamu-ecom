/**
 * @module section-builder/sections/shared/sectionChrome
 * @description Shared "section chrome" fields (color scheme, full-width,
 * padding) merged into individual sections' schemas, instead of each section
 * declaring its own ad hoc background_color/text_color pair. Applied via
 * ui/SectionShell.jsx, which every section Renderer is wrapped in (Canvas.jsx,
 * SectionPickerModal.jsx) — sections that haven't merged these fields in yet
 * simply see `undefined` for all of them, which resolves to "no override" (see
 * resolveSectionScheme) so the rollout is safe to do section-by-section.
 *
 * A "scheme" is one of the theme's existing bg/text colour slot pairs
 * (theme.colors), not a separate parallel data model — Shopify's own
 * multi-scheme picker is a bigger primitive than this app's single global
 * palette needs.
 */
export const COLOR_SCHEME_OPTIONS = [
  { value: 'background', label: 'Background' },
  { value: 'surface', label: 'Surface' },
  { value: 'primary', label: 'Primary' },
  { value: 'accent', label: 'Accent' },
];

const SCHEME_SLOT_PAIRS = {
  background: ['background', 'text_primary'],
  surface: ['surface', 'text_primary'],
  primary: ['primary', 'primary_text'],
  accent: ['accent', 'accent_text'],
};

/** `themeColors` is `theme.colors`; returns `{ background, text }` hex values, or both `undefined` if `schemeKey` isn't set (un-migrated section — no override). */
export function resolveSectionScheme(schemeKey, themeColors) {
  const pair = SCHEME_SLOT_PAIRS[schemeKey];
  if (!pair) return { background: undefined, text: undefined };
  const [bgSlot, textSlot] = pair;
  return { background: themeColors?.[bgSlot], text: themeColors?.[textSlot] };
}

/** Merged into most sections' schema.js. */
export const SECTION_CHROME_FIELDS = {
  color_scheme: { type: 'select', label: 'Color scheme', default: 'background', group: 'color', options: COLOR_SCHEME_OPTIONS },
  full_width: { type: 'boolean', label: 'Full width', default: false, group: 'layout' },
  // responsive: true (Phase 1 — see themes/breakpoints.js) — stored value is
  // a plain number until the merchant overrides a specific breakpoint, at
  // which point it promotes to `{ $res: true, mobile: ..., desktop: ... }`.
  // Resolved back to a scalar per-breakpoint in SectionShell.jsx.
  padding_top: { type: 'range', label: 'Padding top', min: 0, max: 120, step: 4, default: 48, unit: 'px', group: 'layout', responsive: true },
  padding_bottom: { type: 'range', label: 'Padding bottom', min: 0, max: 120, step: 4, default: 48, unit: 'px', group: 'layout', responsive: true },
};

/** Merged into header/footer — global chrome, not page content, so no padding controls. */
export const SECTION_CHROME_FIELDS_NO_PADDING = {
  color_scheme: SECTION_CHROME_FIELDS.color_scheme,
  full_width: SECTION_CHROME_FIELDS.full_width,
};

/** Merged into divider_spacer only — its transparent background is intentional (the section below shows through), so no color_scheme. */
export const SECTION_CHROME_FIELDS_WIDTH_ONLY = {
  full_width: SECTION_CHROME_FIELDS.full_width,
};
