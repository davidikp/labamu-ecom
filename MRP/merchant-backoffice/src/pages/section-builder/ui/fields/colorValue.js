/**
 * @module section-builder/ui/fields/colorValue
 * @description Color field values are either a theme palette slot reference
 * ({ slot: "primary" }) or a literal hex override ({ hex: "#custom" }) —
 * US-4.4's core data model, also what Phase 6's theme-undo scoping keys off.
 */
export const SWATCH_SLOT_ORDER = [
  'background',
  'surface',
  'primary',
  'accent',
  'text_primary',
  'text_secondary',
  'border',
];

export function resolveColor(value, palette) {
  if (value?.slot) return palette?.[value.slot] ?? '#000000';
  return value?.hex ?? '#000000';
}

export function isSlotReference(value) {
  return Boolean(value?.slot);
}
