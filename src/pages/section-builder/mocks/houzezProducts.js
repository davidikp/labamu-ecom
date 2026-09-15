/**
 * @module section-builder/mocks/houzezProducts
 * @description The single, real source of Houzez's construction-domain
 * products — read verbatim from the golden Houzez storefront's product
 * groups (KRISBOW ladder, DEWALT level kit, safety helmets, etc.), same ids/
 * titles/images/prices `state/siteTemplates.js`'s two `featured_products`
 * sections ("High-Rise Needs" / "Safety Tools") already display. Defined
 * here once and imported by both that seed content and the storefront
 * product-source resolver (`sections/shared/productSource.js`) so there is
 * exactly one Houzez product list, not a second hand-maintained catalog.
 */
export const HOUZEZ_HIGH_RISE_PRODUCTS = [
  { id: 'houzez-prod-ladder', source: 'custom', title: 'KRISBOW Ladder Rolling Multi PRLRM1108 1.1m 4...', image: { mediaId: 'houzez-prod-ladder' }, price: 'Rp 4.200.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-level-kit', source: 'custom', title: 'DEWALT Builders Level Kit DW090PK 1set', image: { mediaId: 'houzez-prod-level-kit' }, price: 'Rp 16.000.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-scaffold-metal', source: 'custom', title: 'METALTECH Portable Scaffold 6-11/64 ft.L Steel...', image: { mediaId: 'houzez-prod-scaffold-metal' }, price: 'Rp 13.885.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-scaffold-tower', source: 'custom', title: 'WERNER Scaffold Tower 75 H, 41D335', image: { mediaId: 'houzez-prod-scaffold-tower' }, price: 'Rp 13.885.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-rammer', source: 'custom', title: 'Hyundai Tamping Rammers HDCR 88H 1pc', image: { mediaId: 'houzez-prod-rammer' }, price: 'Rp 23.330.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-ladder-steel', source: 'custom', title: 'Cotterman Rolling Steel Ladder - 450-Lb. Capacit...', image: { mediaId: 'houzez-prod-ladder-steel' }, price: 'Rp 53.196.000' , category: 'High-Rise Needs' },
];

export const HOUZEZ_SAFETY_PRODUCTS = [
  { id: 'houzez-prod-helmet', source: 'custom', title: 'Safety Helmet Construction Helmet Darl...', image: { mediaId: 'houzez-prod-helmet' }, price: 'Rp 723.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-harness', source: 'custom', title: 'Safety Full Body Harness Five Point Construction D...', image: { mediaId: 'houzez-prod-harness' }, price: 'Rp 166.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-gloves', source: 'custom', title: '48-22-8951 CUT 5 Dipped Safety Gloves Size M - 00...', image: { mediaId: 'houzez-prod-gloves' }, price: 'Rp 185.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-lifeline', source: 'custom', title: 'Rebel Self Retracting Lifeline - Stainless Cable...', image: { mediaId: 'houzez-prod-lifeline' }, price: 'Rp 3.023.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-helmet-2', source: 'custom', title: 'Safety Helmet Construction Helmet Darl...', image: { mediaId: 'houzez-prod-helmet-2' }, price: 'Rp 2.100.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-gloves-heavy', source: 'custom', title: 'SARUNG TANGAN SAFETY KONG HEAVY DUTY HIGH...', image: { mediaId: 'houzez-prod-gloves-heavy' }, price: 'Rp 225.000' , category: 'Safety Tools' },
];

// loremflickr's `/<w>/<h>/<tags>` form — a real Flickr photo search by
// keyword (verified: resolves via a 302 to an actual matching JPEG), unlike
// picsum.photos (a fixed catalog of arbitrary stock photos with no keyword/
// subject control at all — the previous version of this fixture used it and
// every "brick"/"cement"/"rebar" product ended up with an unrelated
// landscape or cityscape photo). Comma-separated tags narrow the match
// (e.g. 'brick,wall' rather than just 'brick').
function stockPhoto(tags, size = 400) {
  return `https://loremflickr.com/${size}/${size}/${tags}`;
}

/** Dummy data for the 6 homepage/Collection category icons that otherwise
 * have zero real products (see `category_grid`'s items in
 * siteTemplates.js) — every icon there now filters to a non-empty Shop
 * result instead of only 'High-Rise Needs'/'Safety Tools' actually working.
 * Each gets its own keyword-matched stock photo (via `stockPhoto`) rather
 * than reusing that category's tiny 40x40 icon image scaled up into a
 * blurry product photo — a placeholder thumbnail, same spirit as the rest
 * of this fixture being illustrative-only mock content.
 */
export const HOUZEZ_HOUSE_PRODUCTS = [
  { id: 'houzez-prod-brick', source: 'custom', title: 'Red Clay Building Brick - Standard Size (Pallet of 500)', image: stockPhoto('brick,wall'), price: 'Rp 2.850.000', category: 'House Construction' },
  { id: 'houzez-prod-cement', source: 'custom', title: 'Portland Cement 50kg Sack - Type I', image: stockPhoto('cement,concrete'), price: 'Rp 78.000', category: 'House Construction' },
];

export const HOUZEZ_GLASS_PRODUCTS = [
  { id: 'houzez-prod-glass-pane', source: 'custom', title: 'Tempered Glass Pane 10mm - Clear, 1200x900mm', image: stockPhoto('glass,pane'), price: 'Rp 1.450.000', category: 'Glass Pane' },
  { id: 'houzez-prod-glass-frame', source: 'custom', title: 'Aluminum Glass Window Frame Kit', image: stockPhoto('aluminum,window'), price: 'Rp 3.200.000', category: 'Glass Pane' },
];

export const HOUZEZ_FOUNDATION_PRODUCTS = [
  { id: 'houzez-prod-rebar', source: 'custom', title: 'Deformed Steel Rebar 12mm x 12m', image: stockPhoto('rebar,steel'), price: 'Rp 145.000', category: 'Foundation' },
  { id: 'houzez-prod-concrete-mix', source: 'custom', title: 'Ready-Mix Concrete K-300 (per m³)', image: stockPhoto('concrete,cement'), price: 'Rp 950.000', category: 'Foundation' },
];

export const HOUZEZ_PAINTS_PRODUCTS = [
  { id: 'houzez-prod-paint-exterior', source: 'custom', title: 'Weather-Shield Exterior Paint 20L - White', image: stockPhoto('paint,wall'), price: 'Rp 685.000', category: 'Paints and Flooring' },
  { id: 'houzez-prod-flooring-vinyl', source: 'custom', title: 'Vinyl Plank Flooring - Oak Finish (per box, 2.2m²)', image: stockPhoto('flooring,wood'), price: 'Rp 320.000', category: 'Paints and Flooring' },
];

export const HOUZEZ_ROOFING_PRODUCTS = [
  { id: 'houzez-prod-roof-tile', source: 'custom', title: 'Concrete Roof Tile - Terracotta (per m²)', image: stockPhoto('roof,tile'), price: 'Rp 210.000', category: 'Roofing' },
  { id: 'houzez-prod-roof-truss', source: 'custom', title: 'Galvanized Steel Roof Truss - 6m Span', image: stockPhoto('roof,steel'), price: 'Rp 1.850.000', category: 'Roofing' },
];

export const HOUZEZ_DOORS_PRODUCTS = [
  { id: 'houzez-prod-door-solid', source: 'custom', title: 'Solid Timber Panel Door 80x210cm', image: stockPhoto('door,wood'), price: 'Rp 2.400.000', category: 'Doors and Windows' },
  { id: 'houzez-prod-window-alum', source: 'custom', title: 'Aluminum Sliding Window 120x100cm', image: stockPhoto('window,aluminum'), price: 'Rp 1.650.000', category: 'Doors and Windows' },
];

export const HOUZEZ_EXCAVATION_PRODUCTS = [
  { id: 'houzez-prod-excavator-bucket', source: 'custom', title: 'Mini Excavator Digging Bucket - 400mm', image: stockPhoto('excavator'), price: 'Rp 4.750.000', category: 'Excavation' },
  { id: 'houzez-prod-shovel-heavy', source: 'custom', title: 'Heavy-Duty Digging Shovel - Forged Steel', image: stockPhoto('shovel'), price: 'Rp 245.000', category: 'Excavation' },
];

/** The full storefront-wide product list for Houzez — everything a
 * storefront feature (RFQ, a future product picker, etc.) should be able to
 * choose from, not just what any one section happens to display. */
export const HOUZEZ_PRODUCTS = [
  ...HOUZEZ_HIGH_RISE_PRODUCTS,
  ...HOUZEZ_SAFETY_PRODUCTS,
  ...HOUZEZ_HOUSE_PRODUCTS,
  ...HOUZEZ_GLASS_PRODUCTS,
  ...HOUZEZ_FOUNDATION_PRODUCTS,
  ...HOUZEZ_PAINTS_PRODUCTS,
  ...HOUZEZ_ROOFING_PRODUCTS,
  ...HOUZEZ_DOORS_PRODUCTS,
  ...HOUZEZ_EXCAVATION_PRODUCTS,
];
