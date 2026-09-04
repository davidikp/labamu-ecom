/**
 * @module section-builder/sections/themeHelpers
 * @description US-7.5 — "affects N sections" count for the undo tooltip.
 * Counts entities (header/footer/sections) with at least one field whose
 * value is a slot reference `{ slot }` pointing at the given palette slot.
 * Literal hex overrides never count — they're unaffected by theme undo
 * (US-7.6), by construction: they don't reference the theme at all.
 */
export function countEntitiesUsingSlot(state, slot) {
  const usesSlot = (entity) =>
    Boolean(entity?.data && Object.values(entity.data).some((v) => v?.slot === slot));

  let count = 0;
  if (usesSlot(state.header)) count += 1;
  if (usesSlot(state.footer)) count += 1;
  for (const page of state.pages) {
    for (const section of page.sections) {
      if (usesSlot(section)) count += 1;
    }
  }
  return count;
}
