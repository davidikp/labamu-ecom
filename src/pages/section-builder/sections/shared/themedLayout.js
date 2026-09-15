/**
 * @module section-builder/sections/shared/themedLayout
 * @description Maps `theme.layout` (theme-settings-schema.json's "Layout and
 * spacing" group — already merchant-facing in the Theme panel, previously
 * unconsumed by any Renderer) to concrete CSS values. Sections and layout
 * primitives read container width / gutter / card chrome from here instead
 * of hardcoding their own `px-*`/`max-w-*`/`rounded-*` literals, so the same
 * theme setting drives every section consistently.
 */

// `full_width` sections and SectionShell's max-width wrap both key off this.
// '1200' is the schema default and matches every section's previous
// hardcoded `max-w-[1200px]` exactly — themes that don't override
// container_width see zero change.
export const CONTAINER_WIDTH_PX = {
  1024: '1024px',
  1200: '1200px',
  1280: '1280px',
  1400: '1400px',
  full: 'none',
};

// Only the 'spacious' tier steps down between breakpoints. 'standard' (the
// schema default) matches every section's previous hardcoded `px-6` (24px)
// at every breakpoint exactly, so themes that don't opt in see zero change.
export const GUTTER_PX = {
  compact: { mobile: 16, tablet: 16, desktop: 16 },
  standard: { mobile: 24, tablet: 24, desktop: 24 },
  spacious: { mobile: 16, tablet: 24, desktop: 40 },
};

export const CARD_SHADOW_CSS = {
  none: 'none',
  subtle: '0 1px 3px rgba(0,0,0,0.08)',
  medium: '0 4px 12px rgba(0,0,0,0.08)',
};

/** `theme.layout.container_width` -> a CSS max-width value (string). */
export function resolveContainerWidth(layout = {}) {
  return CONTAINER_WIDTH_PX[layout.container_width] ?? CONTAINER_WIDTH_PX[1200];
}

/** `theme.layout.container_gutter` -> `{ mobile, tablet, desktop }` px numbers. */
export function resolveGutter(layout = {}) {
  return GUTTER_PX[layout.container_gutter] ?? GUTTER_PX.standard;
}

/** `theme.layout` -> `{ borderRadius, boxShadow }` for product/testimonial/content cards. */
export function themedCardStyle(layout = {}) {
  return {
    borderRadius: `${layout.card_corners ?? 4}px`,
    boxShadow: CARD_SHADOW_CSS[layout.card_shadow] ?? 'none',
  };
}
