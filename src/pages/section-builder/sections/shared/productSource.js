/**
 * @module section-builder/sections/shared/productSource
 * @description Storefront product source — lets a storefront feature (RFQ's
 * product picker today; any future product-aware section tomorrow) ask "what
 * products belong to the current template?" without knowing whether the
 * answer is a template's own real product data, the generic cross-template
 * demo catalog, or (eventually) a live API. Mirrors the exact pattern
 * heroRecipes.js/formRecipes.js/navRecipes.js already use for internal,
 * non-merchant-facing per-template resolution: `theme.productCatalog` (set
 * only by templates with their own storefront product data, e.g. Houzez —
 * see mocks/houzezProducts.js) falling back to the generic demo catalog
 * (mocks/catalog.json, today's Xinear/clothing-domain products) — never a
 * theme-name conditional.
 *
 * Deliberately a plain resolver function, not a service/hook/context: every
 * consumer today (RFQ) already receives `theme` as a prop, so there's
 * nothing here that needs its own data-fetching lifecycle — see
 * quote_request_form/Renderer.jsx's call sites.
 *
 * Phase 1 (Shop/PDP foundation) extends the normalized shape with
 * handle/images/compareAtPrice/stock/category/description/priceValue, all
 * additive — `id`/`name`/`image`/`price` keep their exact pre-existing
 * values and meaning, so RFQ (the only consumer today) is unaffected.
 */
import catalog from '../../mocks/catalog.json';
import { resolveMedia } from '../../ui/fields/imageValue';

function slugifyName(value) {
  return (value ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Deterministic handle assignment, in array order — prefers an explicit
 * `handle`/`slug` field on the product data (nothing in today's fixtures has
 * one, but a future/real catalog might); otherwise derives one from the
 * name/title. Collisions (two products deriving the same base handle) are
 * suffixed `-2`, `-3`, ... in the order they're encountered — no randomness,
 * so the same catalog always produces the same handles. */
function computeHandles(products) {
  const seenCounts = new Map();
  return products.map((product) => {
    const explicit = product.handle ?? product.slug;
    const base = (explicit ? slugifyName(explicit) : slugifyName(product.name ?? product.title)) || 'product';
    const count = seenCounts.get(base) ?? 0;
    seenCounts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

/** A product's `image`/`images` fields come in two different shapes
 * depending on where the data was authored: the generic demo catalog
 * (mocks/catalog.json) stores a plain URL string (or null); a template's own
 * product content (e.g. Houzez's mocks/houzezProducts.js, authored the same
 * way section image fields are — see ui/fields/ImageField.jsx) stores a
 * `{ mediaId }` reference into the site's media library instead. Resolving
 * that reference here — the same `resolveMedia` helper every other image
 * field in this codebase uses (see featured_products/Renderer.jsx) — is
 * what makes `image`/`images` always end up a real, renderable URL (or
 * null), regardless of which shape the source data used. Without this, a
 * `{ mediaId }` object was being handed straight to an `<img src>`, which
 * React stringifies to "[object Object]" — a broken-image icon in the
 * running preview. */
function resolveImageValue(value, mediaLibrary) {
  if (value && typeof value === 'object') return resolveMedia(value, mediaLibrary)?.url ?? null;
  return value ?? null;
}

/** `images` normalization: preserve an existing `images` array as-is (each
 * entry resolved individually); fall back to a single-item array from
 * `image` when only that exists; `[]` when neither exists. Never fabricates/
 * duplicates entries. */
function normalizeImages(product, mediaLibrary) {
  if (Array.isArray(product.images) && product.images.length) {
    return product.images.map((img) => resolveImageValue(img, mediaLibrary)).filter(Boolean);
  }
  const resolved = resolveImageValue(product.image, mediaLibrary);
  return resolved ? [resolved] : [];
}

/** `catalog.json`'s prices are plain numbers; Houzez's own product data
 * (mocks/houzezProducts.js) uses pre-formatted Indonesian-Rupiah strings
 * ("Rp 4.200.000") meant for display, not arithmetic. `priceValue` is a
 * best-effort *numeric* normalization for Shop/PDP display logic (sorting,
 * formatting) that needs a number either way — it strips everything but
 * digits/decimal point/minus sign. It's additive: the original `price`
 * field is left completely untouched (same value, same type) for existing
 * consumers (RFQ) that never look at `priceValue`. Trade-off: a locale
 * string like "Rp 4.200.000" uses '.' as a thousands separator, not a
 * decimal point, so naively stripping non-digits reads "4.200.000" as
 * 4.2 rather than 4,200,000 — acceptable for this phase (no numeric price
 * consumer exists yet) but worth a real currency parser once Shop/PDP
 * actually renders/sorts by price. */
function normalizePriceValue(product) {
  if (typeof product.price === 'number') return product.price;
  if (typeof product.price === 'string') {
    const stripped = product.price.replace(/[^0-9.,-]/g, '').trim();
    // Rupiah-style thousands grouping ("4.200.000" / "4,200,000") — one or
    // more groups of exactly 3 digits chained by '.'/',' with no
    // fractional remainder. A genuine decimal ("12.5") never matches this
    // shape, so it falls through to the plain-numeric branch below.
    const thousandsGrouped = /^-?\d{1,3}([.,]\d{3})+$/;
    let numeric;
    if (thousandsGrouped.test(stripped)) {
      numeric = Number(stripped.replace(/[.,]/g, ''));
    } else {
      numeric = Number(stripped.replace(/,/g, ''));
    }
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}

/** Normalizes whichever product shape a template's data uses — the generic
 * demo catalog already has `{id, name, price, ...}`; a template's own
 * product content (e.g. featured_products' `{id, title, image, price}`
 * convention — mocks/houzezProducts.js) uses `title` instead of `name` — to
 * the fields storefront consumers need. `id`/`name`/`image`/`price` are
 * unchanged from the pre-Phase-1 shape (same values, same meaning) so
 * existing consumers (RFQ) keep working exactly as before; everything else
 * is additive. */
function normalizeProduct(product, handle, mediaLibrary) {
  return {
    id: product.id,
    name: product.name ?? product.title ?? '',
    image: resolveImageValue(product.image, mediaLibrary),
    price: product.price,
    handle,
    images: normalizeImages(product, mediaLibrary),
    compareAtPrice: product.compareAtPrice ?? null,
    stock: product.stock ?? null,
    category: product.category ?? product.vendor ?? null,
    description: product.description ?? '',
    priceValue: normalizePriceValue(product),
  };
}

/** Resolves the current template's storefront product collection.
 * `mediaLibrary` is optional — pass it (from the store/site draft, see
 * ui/ProductDetailPage.jsx) whenever the caller can render images, so any
 * `{ mediaId }`-shaped `image`/`images` values resolve to real URLs; omitted,
 * such products simply resolve to no image (never a broken one). */
export function resolveStorefrontProducts(theme, mediaLibrary) {
  const templateProducts = theme?.productCatalog ?? catalog.products;
  const handles = computeHandles(templateProducts);
  return templateProducts.map((product, index) => normalizeProduct(product, handles[index], mediaLibrary));
}

/** Resolves a single product by its (derived-or-explicit) handle, using the
 * exact same normalization/handle-assignment as resolveStorefrontProducts —
 * no duplicated logic, so a handle produced by one always matches the other.
 * Returns `null` for an unknown handle; never throws. */
export function resolveStorefrontProductByHandle(theme, handle, mediaLibrary) {
  if (!handle) return null;
  return resolveStorefrontProducts(theme, mediaLibrary).find((product) => product.handle === handle) ?? null;
}

/** Shared route-builder for a product's storefront URL — single source of
 * truth for the `/products/:handle` path shape, matching the `product`
 * system page's slug pattern in defaultTheme.js. */
export function buildProductPath(handle) {
  return `/products/${handle}`;
}

/** Shared route-builder for the Shop system page — matches `catalog_list`'s
 * own filter semantics (`category !== 'all' && product.category !== category`
 * — see its Renderer.jsx), so a link built here always lands on a
 * pre-filtered Shop exactly reproducing what re-selecting that category in
 * the sidebar would show. No `category` (or 'all') links to the plain,
 * unfiltered Shop page. The query string travels as part of the same
 * opaque path string `onNavigate`/`navigateToPath` already thread through
 * (see ThemePreview.jsx/PreviewLive.jsx) — `catalog_list`'s Renderer reads
 * it back out via its own `initialCategory` prop, not by parsing this
 * string itself. */
export function buildShopPath(category) {
  return category && category !== 'all' ? `/shop?category=${encodeURIComponent(category)}` : '/shop';
}
