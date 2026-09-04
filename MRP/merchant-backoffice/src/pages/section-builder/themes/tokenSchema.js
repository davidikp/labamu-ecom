/**
 * @module section-builder/themes/tokenSchema
 * @description Canonical token schema for the storefront theme layer
 * (`--theme-*` CSS custom properties). This is documentation + validation
 * source of truth, not a runtime CSS thing — it exists so every theme
 * definition (xinear.js and future themes) is guaranteed to carry the full
 * set of slots. Deliberately independent from `--lb-*` and
 * `--neutral-*`/`--feature-*`/`--status-*` — this layer is scoped only to
 * the storefront/section-builder renderer.
 */

export const colorSlots = [
  'background',
  'backgroundPopUp',
  'backgroundImage',
  'surface1',
  'surface2',
  'surface3',
  'surface4',
  'surface5',
  'surface6',
  'surface7',
  'surface8',
  'outline1',
  'outline2',
  'outline3',
  'outline4',
  'outline5',
  'onSurface1',
  'onSurface1_70',
  'onSurface2',
  'onSurface3',
  'onSurface4',
  'onSurface5',
  'onSurface6',
  'onSurface7',
  'onSurface8',
  'onSurface8_60',
  'onSurface9',
  'primary1',
  'primary1_60',
  'primary1_10',
  'primary2',
  'secondary',
  'onPrimary',
  'onPrimary2',
  'hover',
  'alertDanger',
  'alertDangerContainer',
  'alertWarning',
  'alertWarningContainer',
  'alertSuccess',
  'alertSuccessContainer',
  'otherRating',
  'otherBlack',
  'otherWhite',
  'otherDarkGrey',
  'otherOutline',
  'otherPlaceholder',
  'otherBackground',
];

// Each role needs { fontFamily, fontWeight }. Mode-independent — same value
// in light and dark, so these live at the theme's top level, not under
// `light`/`dark`.
export const typographyRoles = ['heading', 'body'];

// Mode-independent shape tokens — also live at the theme's top level.
export const shapeTokens = ['radiusSm', 'radiusMd', 'radiusLg', 'shadowSm', 'shadowMd'];

/**
 * Validates that a theme definition carries every colorSlot under both
 * `light` and `dark`, and every typographyRole/shapeToken at the top level.
 * Throws a descriptive Error listing exactly which keys are missing —
 * fails loudly rather than silently falling back, since a theme missing a
 * slot would otherwise render with an unset/blank CSS variable.
 *
 * @param {object} themeDef
 */
export function validateTheme(themeDef) {
  const missing = [];

  if (!themeDef || typeof themeDef !== 'object') {
    throw new Error('validateTheme: themeDef must be an object');
  }

  for (const mode of ['light', 'dark']) {
    const modeObj = themeDef[mode];
    for (const slot of colorSlots) {
      if (!modeObj || !(slot in modeObj)) {
        missing.push(`${mode}.${slot}`);
      }
    }
  }

  for (const role of typographyRoles) {
    const roleObj = themeDef.typography?.[role];
    if (!roleObj || !('fontFamily' in roleObj)) missing.push(`typography.${role}.fontFamily`);
    if (!roleObj || !('fontWeight' in roleObj)) missing.push(`typography.${role}.fontWeight`);
  }

  for (const token of shapeTokens) {
    if (!themeDef.shape || !(token in themeDef.shape)) {
      missing.push(`shape.${token}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `validateTheme: theme "${themeDef.id ?? '(unknown id)'}" is missing required keys:\n  ${missing.join('\n  ')}`
    );
  }
}
