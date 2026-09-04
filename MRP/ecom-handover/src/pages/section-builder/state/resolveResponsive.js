import { BREAKPOINT_ORDER } from '../themes/breakpoints';

/**
 * @module section-builder/state/resolveResponsive
 * @description Resolves a schema field's stored value at a given breakpoint.
 * A responsive-capable field only needs to define the breakpoints where its
 * value actually changes — e.g. `{ $res: true, mobile: 'sm', desktop: 'lg' }`
 * only sets mobile and desktop, and tablet/largeDesktop/fit inherit forward
 * from the nearest narrower breakpoint that has a value. Plain scalars (the
 * shape every field used before this) pass through unchanged, so existing
 * drafts and non-opted-in fields need no migration.
 */

/**
 * @param {*} fieldValue - either a plain scalar (legacy/non-responsive) or a
 *   `{ $res: true, [breakpointId]: value }` object.
 * @param {string} breakpointId - one of BREAKPOINT_ORDER.
 * @returns {*} the resolved scalar value for that breakpoint.
 */
export function resolveResponsiveValue(fieldValue, breakpointId) {
  if (!fieldValue || typeof fieldValue !== 'object' || !fieldValue.$res) {
    return fieldValue;
  }
  const idx = BREAKPOINT_ORDER.indexOf(breakpointId);
  const searchFrom = idx === -1 ? BREAKPOINT_ORDER.length - 1 : idx;
  for (let i = searchFrom; i >= 0; i--) {
    const bp = BREAKPOINT_ORDER[i];
    if (bp in fieldValue) return fieldValue[bp];
  }
  // Nothing defined at or below this breakpoint (e.g. only largeDesktop set) —
  // fall back to the narrowest defined value rather than undefined.
  for (const bp of BREAKPOINT_ORDER) {
    if (bp in fieldValue) return fieldValue[bp];
  }
  return undefined;
}

/**
 * Resolves every `$res`-tagged field in a section's `data` object at once,
 * for a given breakpoint. Non-responsive fields pass through untouched.
 *
 * @param {object} data - a section/block's raw data object.
 * @param {string} breakpointId
 * @returns {object} a new object with responsive fields flattened to scalars.
 */
export function resolveResponsiveData(data, breakpointId) {
  if (!data || typeof data !== 'object') return data;
  const resolved = {};
  for (const [key, value] of Object.entries(data)) {
    resolved[key] = resolveResponsiveValue(value, breakpointId);
  }
  return resolved;
}
