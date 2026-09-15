/**
 * @module section-builder/mocks/bargerProducts
 * @description Barger's fast-food/F&B product catalog — read from the
 * Barger Figma homepage (Labamu E-Commerce MVP 2, node 96:114687's "Best
 * Seller" `featured_products` row) and its footer's category list (Best
 * Seller, Burger, Side Dish, Chicken, Drinks, Dessert). The Figma cards only
 * carry placeholder "Name"/price text, not real product names — titles here
 * are plausible fast-food menu items filling that placeholder content,
 * matching the reference's price format (`IDR24.000`).
 *
 * The 4 Best Seller products (the homepage's own showcase row, node
 * 96:114756 — 4 cards, not 6: "Lihat Semua" links out to the rest of the
 * catalog rather than the row itself listing every product) use the exact
 * cutout product photos from that Figma node, downloaded once into
 * public/assets/templates/barger/catalog/ as transparent-background PNGs
 * (matching Figma's own object-contain-on-a-flat-surface card treatment,
 * not a full-bleed photo) — `stockPhoto`'s live loremflickr.com redirect
 * (still used for the lower-visibility per-category filler lists below,
 * same convention `mocks/houzezProducts.js` uses) turned out unreliable for
 * two of these tag combinations specifically (consistently failed to
 * resolve, not a one-off network blip), which is exactly the kind of
 * flakiness self-hosting avoids — matching how the hero/appointment/contact
 * photos are already handled in state/siteTemplates.js.
 */
const BARGER_CATALOG_PATH = '/assets/templates/barger/catalog';

// loremflickr's `/<w>/<h>/<tags>` form — see mocks/houzezProducts.js for why
// this is preferred over a fixed stock-photo catalog with no keyword control.
function stockPhoto(tags, size = 400) {
  return `https://loremflickr.com/${size}/${size}/${tags}`;
}

// Titles/prices here match node 96:114756's own placeholder text exactly
// ("Classic Smashed Cheeseburger" / IDR44.000, "Classic Fries" / IDR24.000,
// "Classic Coke Soda" / IDR12.000, "Classic Fried Chicken (Whole)" /
// IDR90.000) rather than the earlier invented menu names/prices.
export const BARGER_BEST_SELLER_PRODUCTS = [
  { id: 'barger-prod-classic-cheeseburger', source: 'custom', title: 'Classic Smashed Cheeseburger', image: `${BARGER_CATALOG_PATH}/classic-cheeseburger.png`, price: 'IDR44.000', category: 'Burger' },
  { id: 'barger-prod-crispy-fries', source: 'custom', title: 'Classic Fries', image: `${BARGER_CATALOG_PATH}/crispy-fries.png`, price: 'IDR24.000', category: 'Side Dish' },
  { id: 'barger-prod-iced-cola', source: 'custom', title: 'Classic Coke Soda', image: `${BARGER_CATALOG_PATH}/iced-cola.png`, price: 'IDR12.000', category: 'Drinks' },
  { id: 'barger-prod-fried-chicken-bucket', source: 'custom', title: 'Classic Fried Chicken (Whole)', image: `${BARGER_CATALOG_PATH}/fried-chicken-bucket.png`, price: 'IDR90.000', category: 'Chicken' },
];

export const BARGER_BURGER_PRODUCTS = [
  { id: 'barger-prod-classic-cheeseburger-2', source: 'custom', title: 'Classic Smashed Cheeseburger', image: `${BARGER_CATALOG_PATH}/classic-cheeseburger.png`, price: 'IDR44.000', category: 'Burger' },
  { id: 'barger-prod-double-patty-burger-2', source: 'custom', title: 'Double Patty Burger', image: stockPhoto('double,burger'), price: 'IDR32.000', category: 'Burger' },
  { id: 'barger-prod-spicy-chicken-burger', source: 'custom', title: 'Spicy Chicken Burger', image: stockPhoto('chicken,burger'), price: 'IDR28.000', category: 'Burger' },
];

export const BARGER_SIDE_DISH_PRODUCTS = [
  { id: 'barger-prod-crispy-fries-2', source: 'custom', title: 'Classic Fries', image: `${BARGER_CATALOG_PATH}/crispy-fries.png`, price: 'IDR24.000', category: 'Side Dish' },
  { id: 'barger-prod-onion-rings', source: 'custom', title: 'Onion Rings', image: stockPhoto('onion,rings'), price: 'IDR14.000', category: 'Side Dish' },
];

export const BARGER_CHICKEN_PRODUCTS = [
  { id: 'barger-prod-fried-chicken-bucket-2', source: 'custom', title: 'Classic Fried Chicken (Whole)', image: `${BARGER_CATALOG_PATH}/fried-chicken-bucket.png`, price: 'IDR90.000', category: 'Chicken' },
  { id: 'barger-prod-chicken-wings', source: 'custom', title: 'Chicken Wings', image: stockPhoto('chicken,wings'), price: 'IDR35.000', category: 'Chicken' },
];

export const BARGER_DRINKS_PRODUCTS = [
  { id: 'barger-prod-iced-cola-2', source: 'custom', title: 'Classic Coke Soda', image: `${BARGER_CATALOG_PATH}/iced-cola.png`, price: 'IDR12.000', category: 'Drinks' },
  { id: 'barger-prod-iced-tea', source: 'custom', title: 'Iced Tea', image: stockPhoto('iced,tea'), price: 'IDR8.000', category: 'Drinks' },
];

export const BARGER_DESSERT_PRODUCTS = [
  { id: 'barger-prod-chocolate-sundae-2', source: 'custom', title: 'Chocolate Sundae', image: stockPhoto('chocolate,sundae'), price: 'IDR15.000', category: 'Dessert' },
  { id: 'barger-prod-apple-pie', source: 'custom', title: 'Apple Pie', image: stockPhoto('apple,pie'), price: 'IDR13.000', category: 'Dessert' },
];

/** The full storefront-wide product list for Barger — everything a
 * storefront feature (RFQ-style picker, etc.) should be able to choose
 * from, not just what the homepage happens to display. */
export const BARGER_PRODUCTS = [
  ...BARGER_BEST_SELLER_PRODUCTS,
  ...BARGER_BURGER_PRODUCTS,
  ...BARGER_SIDE_DISH_PRODUCTS,
  ...BARGER_CHICKEN_PRODUCTS,
  ...BARGER_DRINKS_PRODUCTS,
  ...BARGER_DESSERT_PRODUCTS,
];
