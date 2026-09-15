/**
 * @module section-builder/sections/shared/cardRecipes
 * @description Internal visual recipe for ProductCard's title/price
 * typography — kept out of the merchant-facing schema for the same reason
 * heroRecipes.js/formRecipes.js/navRecipes.js keep their values internal:
 * a real design-system decision (how big should a card's title/price read),
 * not a per-merchant field in theme-settings-schema.json's `product_cards`
 * group (which only covers layout/behavior toggles like image ratio and
 * quick-add, not typography sizing).
 *
 * DEFAULT_CARD_RECIPE reproduces ProductCard's pre-existing hardcoded sizes
 * exactly (13px/500-weight title, 15px/bold price) so no card without an
 * explicit `theme.cardRecipe` changes at all.
 */

export const DEFAULT_CARD_RECIPE = {
  nameFontSize: '13px',
  nameFontWeight: 500,
  priceFontSize: '15px',
};

/** Barger's Figma card (node 96:114743's `Card`) reads both title and price
 * at 16px — title Open Sans Regular (400), price Open Sans Bold. */
export const BARGER_CARD_RECIPE = {
  nameFontSize: '16px',
  nameFontWeight: 400,
  priceFontSize: '16px',
};

/** `theme.cardRecipe` (set only by templates that want a non-default
 * recipe, e.g. Barger) falling back to the generic default — never a
 * theme-name conditional. */
export function resolveCardRecipe(theme) {
  return theme?.cardRecipe ?? DEFAULT_CARD_RECIPE;
}
