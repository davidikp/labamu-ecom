# Wire ShopPage into HouzezPreview — Implementation Plan

## Goal

Wire `ShopPage` with real API data into `HouzezPreview` only when a merchant
is editing their website (`isBuilderMode = true`). The template showcase preview
(`/templates-preview/houzez`, `isBuilderMode = false`) keeps its existing static
asset images and hardcoded demo products.

Additionally, the `enableCheckout` toggle in ShopPanel controls **product card
CTA mode** across both renderers:

| `enableCheckout` | Card CTA | Shop mode |
|-----------------|----------|-----------|
| `false` (default) | "Request Quotation" button | Catalog only — no checkout |
| `true` | "Add to Cart" button | E-commerce — online checkout |

The Shop section **always renders** when `'shop'` is in `selectedFeatures` —
`enableCheckout` only changes the card CTA, not section visibility.

---

## Two Preview Modes

| Mode | Route | `isBuilderMode` | Shop renderer |
|------|-------|----------------|---------------|
| Template showcase | `/templates-preview/houzez` | `false` | Static `ProductGroup` with `/assets/templates/houzez/catalog/` images |
| Website editor | `/templates-edit/:id` | `true` | `ShopPage` with real catalog API data |

---

## Files Modified (4)

| File | Change |
|------|--------|
| `src/pages/websites/templates/houzez/HouzezPreview.jsx` | Add imports, shop API state & effect (builder mode only), swap shop case, pass `enableCheckout` and `sortKey` to both renderers |
| `src/pages/websites/shared/ShopPage.jsx` | Add `enableCheckout` and `sortKey` props; pass to `ProductCard`; `ProductCard` renders CTA button; strip `{ id: 'all' }` sentinel |
| `src/pages/websites/templates/houzez/HouzezPreview.jsx` (same file) | Update `ProductGroup` to render "Request Quotation" when `enableCheckout = false` instead of no button |
| `src/services/catalogService.js` | Add optional `signal` param to `fetchProducts` and `fetchCategories`, pass through to `fetchWithTimeout` |

**`ShopPanel.jsx` — no changes.** The `enableCheckout` value it manages is already
passed through `builderConfig?.enableCheckout` into HouzezPreview.

---

## Analysis of Current State

### enableCheckout flow

`ShopPanel` exposes one toggle: `enableCheckout` / `handleSetCheckout`. This
value is stored in builder state and surfaced in `HouzezPreview` via
`builderConfig?.enableCheckout`. Currently only `ProductGroup` reads it:

```js
isEcommerce={selectedFeatures.has('shop') && builderConfig?.enableCheckout}
```

When `isEcommerce = false`, `ProductGroup` renders **no CTA at all**. The plan
changes this to "Request Quotation".

### selectedFeatures vs enableCheckout — two separate concerns

| Concern | Controlled by |
|---------|--------------|
| Is shop section visible? | `selectedFeatures.has('shop')` — remove from Set to hide |
| Does the shop do checkout or just catalog? | `enableCheckout` in ShopPanel — toggles card CTA only |

These must not be conflated. The section always renders when shop is in
`selectedFeatures`; `enableCheckout` only changes what happens when a product
card is interacted with.

### ShopPage current ProductCard — no CTA rendered

`ProductCard` currently shows image + name + price, with `onAction` on the card
`onClick`. There is no visible button. The plan adds a CTA button below the price.

### ShopPage — `{ id: 'all' }` duplication

`CategorySidebar` always prepends `{ id: 'all', name: 'All Categories' }`:

```js
// ShopPage.jsx line 44
const allCategories = [{ id: 'all', name: 'All Categories' }, ...categories];
```

If the caller also passes `{ id: 'all' }`, "All Categories" appears twice.
Fix: filter it out at the top of `ShopPage`.

---

## Changes — FILE 1: HouzezPreview.jsx

### 1. Add imports (after existing imports, before `const NavButton`)

```js
import ShopPage from '../../shared/ShopPage';
import { fetchProducts, fetchCategories } from '../../../../services/catalogService';
```

### 2. Add sort-key → API sort string map (file-local const, before `HouzezPreview`)

```js
const SHOP_SORT_MAP = {
  newest:     'updated_at:desc',
  oldest:     'updated_at:asc',
  price_asc:  'price:asc',
  price_desc: 'price:desc',
};
```

### 3. Add shop API state (inside `HouzezPreview`, after existing `useState` lines)

Declared unconditionally to satisfy Rules of Hooks:

```js
const [shopProducts,       setShopProducts]       = useState([]);
const [shopCategories,     setShopCategories]     = useState([]);
const [shopTotal,          setShopTotal]          = useState(0);
const [shopPage,           setShopPage]           = useState(1);
const [shopLoading,        setShopLoading]        = useState(false);
const [shopCategoryFilter, setShopCategoryFilter] = useState(undefined);
const [shopSort,           setShopSort]           = useState('updated_at:desc');
```

> `shopLoading` starts `false` — no spinner flash on the showcase where the
> effect never runs.

### 4. Derive `shopFeatureEnabled` boolean before the fetch effect

```js
const shopFeatureEnabled = selectedFeatures.has('shop');
```

**Why derive a boolean from selectedFeatures:** If `selectedFeatures` is a new
`Set` on every render (common with `useState` + spread), using it directly in
the `useEffect` dependency array causes infinite re-runs. A primitive boolean is
referentially stable and only changes when the shop feature is actually toggled.

### 5. Add fetch effect (after the existing language `useEffect`)

Uses `AbortController` for clean cancellation on rapid filter changes.

```js
useEffect(() => {
  if (!isBuilderMode) return;       // showcase uses static assets
  if (!shopFeatureEnabled) return;  // shop disabled, skip fetch

  const controller = new AbortController();
  setShopLoading(true);

  async function load() {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetchProducts({
          size: 16,
          page: shopPage,
          platform_status: 'published',
          sort: shopSort,
          ...(shopCategoryFilter ? { category_id: shopCategoryFilter } : {}),
        }, controller.signal),
        fetchCategories({ status: 'ACTIVE', size: 100 }, controller.signal),
      ]);
      setShopProducts((prodRes.data || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.selling_price ?? p.price,
        image_url:
          p.image_attached?.find(i => i.is_primary)?.document_public_url
          ?? p.image_attached?.[0]?.document_public_url
          ?? null,
        category_id: p.category_id,
      })));
      // Raw categories only — ShopPage's CategorySidebar prepends 'All Categories' internally
      setShopCategories((catRes.data || []).map(c => ({ id: c.id, name: c.name })));
      setShopTotal(prodRes.meta?.total ?? 0);
    } catch (e) {
      if (e.name === 'AbortError') return; // expected on cleanup — not an error
      console.error('Shop data fetch failed:', e);
      setShopProducts([]);
      setShopTotal(0);
    } finally {
      setShopLoading(false);
    }
  }

  load();
  return () => controller.abort();
}, [isBuilderMode, shopPage, shopCategoryFilter, shopSort, shopFeatureEnabled]);
```

**Why AbortController instead of a `cancelled` boolean:** When the user clicks
category A then immediately clicks category B, both fetches run concurrently with
the boolean approach. The first fetch might resolve after the second, briefly
showing wrong results. `AbortController` cancels the in-flight network request
entirely so only the latest completes.

### 6. Replace the `'shop'` case in the feature switch

The case branches on `isBuilderMode`. Both branches receive `enableCheckout` and
`sortKey`.

```jsx
case 'shop': {
  const enableCheckout = builderConfig?.enableCheckout === true;
  const sortKey = Object.keys(SHOP_SORT_MAP).find(k => SHOP_SORT_MAP[k] === shopSort) || 'newest';

  // ── Builder/edit mode: real merchant products via ShopPage ──
  if (isBuilderMode) {
    return (
      <section key={featureId} id="shop" style={{ background: '#FFFFFF' }}>
        {shopLoading ? (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '320px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '3px solid #E6F0FF', borderTopColor: '#006BFF',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <ShopPage
            products={shopProducts}
            categories={shopCategories}
            totalCount={shopTotal}
            currentPage={shopPage}
            pageSize={16}
            sortKey={sortKey}
            enableCheckout={enableCheckout}
            onPageChange={(p) => setShopPage(p)}
            onCategoryChange={(catId) => {
              setShopPage(1);
              setShopCategoryFilter(catId === 'all' ? undefined : catId);
            }}
            onSortChange={(key) => {
              setShopPage(1);
              setShopSort(SHOP_SORT_MAP[key] || 'updated_at:desc');
            }}
            accentColor={content?.styling?.accentColor || '#006BFF'}
            isMobile={isMobile}
            handleDemoAction={handleDemoAction}
          />
        )}
      </section>
    );
  }

  // ── Showcase/demo mode: static asset products ──
  return (
    <React.Fragment key={featureId}>
      <ProductGroup
        id="shop"
        title={content.sections.highRise}
        items={products.highRise}
        onDemo={() => handleDemoAction(content.previewOnly)}
        seeAllLabel={content.sections.seeAll}
        isMobile={isMobile}
        enableCheckout={enableCheckout}
      />
      <ProductGroup
        title={content.sections.safetyTools}
        items={products.safety}
        onDemo={() => handleDemoAction(content.previewOnly)}
        seeAllLabel={content.sections.seeAll}
        isMobile={isMobile}
        enableCheckout={enableCheckout}
      />
    </React.Fragment>
  );
}
```

**Why pass `sortKey` back to ShopPage:** ShopPage manages its own sort display
state internally. Without receiving the current `sortKey`, ShopPage's dropdown
label resets to "Newest to Oldest" on every re-render even if the user selected
a different sort. Passing `sortKey` keeps the display in sync with the actual
API sort applied in HouzezPreview.

**Why `accentColor={content?.styling?.accentColor || '#006BFF'}`:** Builder
styling config may not have `accentColor` set if the merchant hasn't customised
it. The Labamu default blue is used as fallback. If `content.styling.accentColor`
path differs in the actual builder config, adjust accordingly.

> `isEcommerce` prop on `ProductGroup` is renamed to `enableCheckout` for
> consistent naming across both renderers.

### 7. Update `ProductGroup` component (file-local, at bottom of file)

Replace `isEcommerce` prop with `enableCheckout` and add "Request Quotation"
button for catalog mode.

Update prop destructuring:
```js
// Before
const ProductGroup = ({ id, title, items, onDemo, seeAllLabel, isMobile, isEcommerce }) => ...

// After
const ProductGroup = ({ id, title, items, onDemo, seeAllLabel, isMobile, enableCheckout }) => ...
```

Replace CTA block inside the product card:
```jsx
{/* Before: only rendered Add to Cart when isEcommerce = true */}
{isEcommerce && (
  <div onClick={...}>Add to Cart</div>
)}

{/* After: always render a CTA, switching label by enableCheckout */}
{enableCheckout ? (
  <div
    onClick={(e) => { e.stopPropagation(); onDemo(); }}
    style={{
      marginTop: '12px', height: '32px', background: '#16894B',
      borderRadius: '6px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'white',
      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    }}
  >
    Add to Cart
  </div>
) : (
  <div
    onClick={(e) => { e.stopPropagation(); onDemo(); }}
    style={{
      marginTop: '12px', height: '32px',
      border: '1px solid #16894B', borderRadius: '6px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#16894B', fontSize: '12px', fontWeight: 600,
      cursor: 'pointer', background: 'transparent',
    }}
  >
    Request Quotation
  </div>
)}
```

---

## Changes — FILE 2: ShopPage.jsx

### 1. Add `enableCheckout` and `sortKey` props

```js
export default function ShopPage({
  // ... existing props ...
  enableCheckout = false,   // controls card CTA: 'Add to Cart' vs 'Request Quotation'
  sortKey: sortKeyProp,     // controlled sort label from parent; syncs dropdown display
}) {
```

When `sortKeyProp` is provided, use it as the initial/controlled sort key for
`ShopTopBar`'s display. Pass it through to `ShopTopBar`:

```jsx
<ShopTopBar
  from={from}
  to={to}
  total={effectiveTotal}
  sortKey={sortKeyProp || sortKey}
  onSortChange={handleSortChange}
/>
```

### 2. Strip `{ id: 'all' }` sentinel (defensive)

```js
const cleanCategories = categories.filter(c => c.id !== 'all');
```

Pass `cleanCategories` to `CategorySidebar` instead of `categories`.

### 3. Pass `enableCheckout` down to `ProductCard`

```jsx
{pagedProducts.map(product => (
  <ProductCard
    key={product.id}
    product={product}
    enableCheckout={enableCheckout}
    onAction={handleDemoAction || undefined}
  />
))}
```

### 4. Update `ProductCard` to render CTA button

Update prop signature:
```js
function ProductCard({ product, onAction, enableCheckout }) {
```

Add CTA block below the price, only when `onAction` is provided:

```jsx
{/* Price */}
<div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
  {formatRp(product.price)}
</div>

{/* CTA — only when there is an action handler */}
{onAction && (
  enableCheckout ? (
    <button
      onClick={(e) => { e.stopPropagation(); onAction(); }}
      style={{
        marginTop: '10px', width: '100%', height: '34px',
        background: '#006BFF', border: 'none', borderRadius: '6px',
        color: '#FFFFFF', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', fontFamily: "'Lato', sans-serif",
      }}
    >
      Add to Cart
    </button>
  ) : (
    <button
      onClick={(e) => { e.stopPropagation(); onAction(); }}
      style={{
        marginTop: '10px', width: '100%', height: '34px',
        background: 'transparent', border: '1px solid #006BFF',
        borderRadius: '6px', color: '#006BFF',
        fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', fontFamily: "'Lato', sans-serif",
      }}
    >
      Request Quotation
    </button>
  )
)}
```

> `onClick` on the outer card div still fires `onAction` for the whole card.
> The button uses `e.stopPropagation()` to prevent double-firing.

---

## Changes — FILE 3: catalogService.js

`fetchProducts` and `fetchCategories` must accept an optional `signal` parameter
and pass it through to the underlying `fetchWithTimeout` (or `fetch`) call:

```js
// Before
export async function fetchProducts(params = {}) {
  ...
  const res = await fetchWithTimeout(url);
  ...
}

// After
export async function fetchProducts(params = {}, signal) {
  ...
  const res = await fetchWithTimeout(url, { signal });
  ...
}
```

Same change for `fetchCategories`.

`fetchWithTimeout` must forward `signal` to `fetch`:

```js
// Before
async function fetchWithTimeout(url, timeout = 10000) {
  const res = await fetch(url);
  ...
}

// After
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const res = await fetch(url, options);
  ...
}
```

> If `fetchWithTimeout` already accepts options, just ensure `signal` is included
> in the options object passed to `fetch`.

---

## Decisions NOT Taken

| Option | Decision | Reason |
|--------|----------|--------|
| Price filter API integration | Not done | Price filter works client-side on current page data only. Backend does not support min/max price query params yet. For production, add `price_min` and `price_max` params to `GET /products` endpoint and wire `onPriceChange` to refetch |
| Hide shop section entirely when `enableCheckout = false` | Not done | Catalog mode is a valid and common use case — merchants want a product showcase without checkout |
| Show no button when `enableCheckout = false` | Not done | "Request Quotation" provides a clear customer action in catalog mode |
| Separate `ctaLabel` prop on `ProductCard` | Not done | Only two states exist — a boolean is simpler than an open string |
| Always show API data regardless of `isBuilderMode` | Not done | Template showcase needs polished static assets; a sparse merchant catalog would look broken |
| Inline `.then()` fetch chains in callbacks | Not used | State-driven single `useEffect` avoids duplicated mapping; `AbortController` handles cancellation |
| `cancelled` boolean flag | Not used | `AbortController` cancels the in-flight network request itself, not just the state update. Prevents stale responses from rapid filter changes from briefly showing wrong data |

---

## Verification Checklist

**Template showcase (`/templates-preview/houzez`, `isBuilderMode = false`)**
- [ ] Shop section shows static asset product images (unchanged from before)
- [ ] `enableCheckout = false` → "Request Quotation" button on each card
- [ ] `enableCheckout = true` → "Add to Cart" button on each card
- [ ] Clicking either button fires demo toast
- [ ] No API calls made for shop data in this mode

**Website editor (`/templates-edit/:id`, `isBuilderMode = true`)**
- [ ] Shop section shows `ShopPage` with real published products from API
- [ ] `enableCheckout = false` → "Request Quotation" button on each card
- [ ] `enableCheckout = true` → "Add to Cart" button on each card
- [ ] Toggling Online Checkout in ShopPanel immediately switches card CTA
- [ ] Category sidebar lists active categories from API
- [ ] "All Categories" appears exactly once (no duplication)
- [ ] Clicking a category refetches with that category filter
- [ ] Sort dropdown label stays in sync after sort change (no reset to "Newest")
- [ ] Sort dropdown refetches with correct sort order
- [ ] Pagination navigates pages via API
- [ ] Rapid category clicks do not cause stale data flash (AbortController working)
- [ ] Loading spinner shown while data fetches
- [ ] API down / empty → empty state shown, no crash
- [ ] Disabling Shop in builder sidebar hides section and skips fetch
- [ ] Re-enabling Shop triggers fetch and shows products
- [ ] Mobile toggle switches grid to 2 columns, sidebar hidden
- [ ] Clicking a product card fires demo toast

**Both modes**
- [ ] All other template sections render correctly
- [ ] Builder panels work correctly

**fetchProductById compatibility:** fetchProductById already has its own
internal AbortController for timeout. When the signal parameter feature
is added to fetchWithTimeout, fetchProductById should be left unchanged —
it does not pass a signal and its internal timeout still works via
fetchWithTimeout's default behavior. No conflict because fetchWithTimeout's
options.signal and its internal timeout AbortController are separate — 
either can abort the request independently. Document this in a code comment.