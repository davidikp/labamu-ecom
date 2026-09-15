/**
 * @module section-builder/sections/shared/navRecipes
 * @description Internal visual recipe for Header's nav link typography —
 * weight (inactive vs. active) and letter-spacing — kept out of the
 * merchant-facing schema for the same reason heroRecipes.js/formRecipes.js
 * keep their values internal: this is a real design-system decision (how
 * bold should an active nav link look relative to its siblings), not a
 * per-merchant "useful website-building decision" worth a dedicated Header
 * field. `nav_color` (schema.js) stays merchant-facing because color is
 * already a normal, expected per-section customization; font-weight
 * granularity is not.
 *
 * DEFAULT_NAV_RECIPE reproduces every existing header's current rendering
 * exactly (400 inactive / 700 active, via `font-bold` — see Renderer.jsx)
 * so no header without an explicit `theme.navRecipe` changes at all.
 */

export const DEFAULT_NAV_RECIPE = {
  fontWeight: 400,
  activeFontWeight: 700,
  letterSpacing: undefined,
};

/** Golden reference HouzezPreview.jsx's nav buttons — inactive 500,
 * active 700 (NavButton, HouzezPreview.jsx:37-53), letter-spacing -0.3px. */
export const HOUZEZ_NAV_RECIPE = {
  fontWeight: 500,
  activeFontWeight: 700,
  letterSpacing: '-0.3px',
};

/** `theme.navRecipe` (set only by templates that want a non-default recipe,
 * e.g. Houzez) falling back to the generic default — never a theme-name
 * conditional. */
export function resolveNavRecipe(theme) {
  return theme?.navRecipe ?? DEFAULT_NAV_RECIPE;
}
