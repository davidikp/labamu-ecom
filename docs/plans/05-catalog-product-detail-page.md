# Product Detail Page — Implementation Plan

## Goal

Build `src/pages/ProductDetail.jsx` — a read-only product detail page that fetches
a single product from `GET /demo/v1/products/{id}`, displays image, identity,
pricing, logistics fields, and publish controls in a three-column card layout.
Wire into the App router at `/catalog/:id`. Add `fetchProductById` to the catalog
service.

---

## Files

### New (1)

| File | Purpose |
|------|---------|
| `src/pages/ProductDetail.jsx` | Full product detail page component |

### Modified (2)

| File | Change |
|------|--------|
| `src/App.jsx` | Lazy-import `ProductDetail` + `/catalog/:id` route after `/catalog` |
| `src/services/catalogService.js` | Add `fetchProductById(id)` export |

---

## `src/services/catalogService.js` — `fetchProductById`

```js
export async function fetchProductById(id) {
  const res = await fetchWithTimeout(`${BASE_URL}/products/${id}`);
  if (res.status === 404) return { data: null };
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

**Why return `{ data: null }` on 404 instead of throwing:** The `ProductDetail`
component distinguishes 404 (product not found) from other errors (network
failure, 500, timeout). A thrown error always lands in the `error` state and
shows the error banner. Returning `{ data: null }` instead lets the component
set `product = null` without setting `error`, which triggers the dedicated
"Product not found" 404 state — a cleaner UX than showing an error message for
a legitimately missing resource.

**Why use existing `fetchWithTimeout` helper (not inline `AbortController`):** The
file already has `fetchWithTimeout` at the top. Using it keeps `fetchProductById`
consistent with `fetchProducts` and `fetchCategories` — all three have the same
10-second timeout behaviour without duplicating the `AbortController` setup.

---

## `src/App.jsx` changes

```js
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));

// Inside <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>:
<Route path="/catalog"     element={<CatalogProducts />} />
<Route path="/catalog/:id" element={<ProductDetail />} />
```

**Why `/catalog/:id` after `/catalog`:** React Router v6 uses specificity
matching, not order-based matching, so the order doesn't technically matter for
correctness. The conventional listing order (list before detail) is preserved
for readability.

---

## `src/pages/ProductDetail.jsx` — Architecture

### Imports

```js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { fetchProductById, fetchCategories } from '../services/catalogService';
```

**Why no `React` default import:** React 17+ JSX transform does not require it.
The existing pages (`CatalogProducts.jsx`) follow the same convention.

### State

| State | Initial | Purpose |
|-------|---------|---------|
| `product` | `null` | Loaded product object (`res.data`) |
| `loading` | `true` | Shows skeleton card |
| `error` | `null` | Error string from catch |
| `activeImage` | `0` | Index into `image_attached` array |
| `imgError` | `false` | True when active image fires `onError` — shows SKU placeholder |
| `categoryName` | `''` | Resolved category name from categories API |

### Data fetching

```js
useEffect(() => {
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProductById(id);
      setProduct(res.data);
      const catRes = await fetchCategories({ status: 'ACTIVE', size: 100 });
      const cat = catRes.data.find(c => c.id === res.data.category_id);
      setCategoryName(cat?.name || res.data.category_id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  load();
}, [id]);
```

**Why two sequential fetches (product then categories):** The category name
lookup needs `res.data.category_id` from the product response. They cannot be
parallelised with `Promise.all` without either fetching categories unconditionally
before knowing the product exists, or restructuring to use a secondary effect.
Sequential is simpler and the latency delta is negligible (two local API calls).

**Why `size: 100` when fetching categories:** The default page size is 10 and
there are only 5 categories in the demo. Passing `size: 100` avoids a pagination
edge case where categories 11+ would be invisible in the dropdown. Same reasoning
as the category fetch in `CatalogProducts.jsx`.

**Why `status: 'ACTIVE'` (uppercase):** `CategoryStatus` enum values are uppercase
to match MRP contract. Lowercase returns 0 results. See plan 02.

### Formatters

Defined locally in the component — not imported from a shared util:

```js
function formatPrice(val) {
  if (val == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(val);
}

function formatPriceByCurrency(val, currency) {
  if (val == null) return '-';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency || 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(val);
  } catch {
    return `${currency} ${val}`;
  }
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const PLATFORM_BADGE = {
  published: { bg: '#DBEAFE', color: '#2563EB', label: 'Published' },
  draft:     { bg: '#FEF9C3', color: '#CA8A04', label: 'Draft' },
  archived:  { bg: '#F3F4F6', color: '#6B7280', label: 'Archived' },
};
```

**Why `formatPrice` uses `id-ID` and `formatPriceByCurrency` uses `en-US`:**
`formatPrice` is always IDR (selling price, main price field) — `id-ID` gives
natural Indonesian number grouping. `formatPriceByCurrency` serves the sales
price list which may contain USD, EUR, or other currencies; `en-US` formats all
of them readably (`$531`, `€486`, `IDR 8,500,000`) without Indonesian-style
symbol placement for non-IDR codes. The `try/catch` guards against invalid
currency codes from malformed data.

**Why duplicate instead of shared util:** No shared formatter module exists in
the project. Creating one for two callers is premature abstraction. If a third
page needs these, extract then.

---

## Layout

### Page container

```
padding: 24px 32px
background: #F4F4F4
fontFamily: Lato, sans-serif
minHeight: 100vh
```

### Header row

```
display: flex
alignItems: center
justifyContent: space-between
marginBottom: 20px
```

Left side: back `←` button (background none, fontSize 20px, color #6B7280) +
"Product Detail" title (fontSize 20px, fontWeight 700, color #1B1B1B), gap 12px.

Right side: empty. `// TODO MVP2: Add "Edit Product" and "Delete Product" buttons`

### Breadcrumb

```
marginBottom: 16px
fontSize: 13px
color: #9CA3AF
```

"Catalog" (color #006BFF, cursor pointer, onClick navigate('/catalog')) / product.name
(color #6B7280).

### Main card

```
background: #FFFFFF
borderRadius: 12px
border: 1px solid #E9E9E9
overflow: hidden
```

Three-column grid inside:

```
display: grid
gridTemplateColumns: isNarrow ? '1fr' : '360px 1fr 280px'
minHeight: 500px
```

Where `isNarrow = window.innerWidth < 1100`.

**Why `window.innerWidth` check (not CSS media query):** Inline styles are used
throughout the project (no CSS modules or Tailwind). A one-time `window.innerWidth`
read at render time is the simplest approach consistent with the rest of the
codebase. It does not respond to window resize — that is acceptable for MVP1.

---

## Left Column — Images

`padding: 24px`, `borderRight: 1px solid #F3F4F6`

### Primary image

```
width: 100%
aspectRatio: 1
borderRadius: 8px
objectFit: cover
background: #F9FAFB
```

Image source resolution:
1. `image_attached[activeImage].document_public_url || image_attached[activeImage].url` if array is non-empty and `imgError` is false
2. If array is empty, or `imgError` is true (image fired `onError`): grey box with SKU text centered
   (color #D1D5DB, fontSize 16px, fontWeight 600)

**Why `onError` (not URL string matching):** Seed images use `placehold.co` URLs
that actually load. Checking for a specific hostname string would need updating
whenever the seed URL changes. `onError` fires on any load failure regardless of
URL shape and is the correct browser-native signal that the image is unavailable.

**Why support both `document_public_url` and `url`:** The MRP payload uses
`document_public_url`; the seed helper `_img(sku)` also sets `document_public_url`.
Both fields are checked as a defensive fallback in case the field name changes
between MRP payload versions.

### Thumbnail row

Shown only when `image_attached.length > 1`.

```
display: flex
gap: 8px
marginTop: 12px
```

Each thumbnail: 64×64px, borderRadius 6px, objectFit cover, cursor pointer.
Active: `border: 2px solid #006BFF`. Inactive: `border: 2px solid transparent`.
`onClick`: `setActiveImage(index)`.

---

## Middle Column — Product Info

`padding: 32px`, `borderRight: 1px solid #F3F4F6`

### Identity block

- Category badge: inline-block, bg #F3F4F6, color #4B5563, fontSize 12px,
  fontWeight 600, padding 4px 12px, borderRadius 999px, text: `categoryName`
- Product name: fontSize 22px, fontWeight 700, color #1B1B1B, marginTop 10px,
  lineHeight 1.3
- SKU: fontSize 14px, color #9CA3AF, marginTop 4px
- MRP ID: fontSize 12px, color #D1D5DB, marginTop 2px

### Pricing row

Two items side by side (`display: flex`, `gap: 40px`):

| Item | Label | Value |
|------|-------|-------|
| Selling Price | `SELLING PRICE` | `formatPrice(product.selling_price \|\| product.price)` |
| Lead Time | `LEAD TIME` | `product.lead_time \|\| '-'` |

Label style: fontSize 11px, color #9CA3AF, textTransform uppercase,
letterSpacing 0.5px, marginBottom 4px.

**Why `selling_price || price` fallback:** `selling_price` is an MRP field that
mirrors `price` in the seed but may differ in production. Falling back to `price`
ensures the field always shows a value without branching.

### Detail rows

7 label:value rows, label width 140px, fontSize 13px, color #9CA3AF:

| Label | Value |
|-------|-------|
| Category | `categoryName` |
| Material | `product.primary_material \|\| '-'` |
| Weight | `product.gross_weight ? \`${product.gross_weight} kg\` : '-'` |
| Source | `'Standard Catalog'` |
| Created | `formatDate(product.created_at)` |
| Last Updated | `formatDate(product.updated_at)` |
| Last Synced | `product.synced_at ? formatDate(product.synced_at) : 'Never'` |

**Why hardcode `'Standard Catalog'` for Source:** All MVP1 products are
`STANDARD_CATALOG`. Displaying the raw enum value (`STANDARD_CATALOG`) is not
merchant-friendly. The label will be made dynamic when `CUSTOM_ORDER` is added
in MVP2. See filter removal rationale in plan 03.

### Description

Uppercase label + body text (fontSize 14px, color #4B5563, lineHeight 1.7).

### Sales price list

Rendered only when `product.sales_price.length > 0`.

`<table>` width 100%, borderCollapse collapse, fontSize 14px.  
Headers: Currency (left), Price (right) — bg #F9FAFB.  
Each row: `item.currency_code` | price formatted with `Intl.NumberFormat` using
`item.currency_code` (not hardcoded IDR — the list may contain multiple currencies).

```js
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: item.currency_code,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(item.price)
```

**Why `en-US` locale (not `id-ID`):** The sales price list may contain USD, EUR,
or other non-IDR currencies. Using `id-ID` with a foreign currency code produces
correct symbol placement for IDR but looks odd for USD/EUR (e.g. `US$531` with
Indonesian grouping). `en-US` formats all currencies in a universally readable
way: `$531`, `€486`, `IDR 8,500,000`.

### Multi-currency seed data

All 15 products are seeded with three currency entries in `sales_price`:
- IDR (base price, same as `selling_price`)
- USD (IDR / 16,000, rounded)
- EUR (IDR / 17,500, rounded)

Example for Teak Dining Table 6-Seater (IDR 8,500,000):
```json
[
  {"currency_code": "IDR", "price": 8500000},
  {"currency_code": "USD", "price": 531},
  {"currency_code": "EUR", "price": 486}
]
```

This demonstrates the Sales Price List table in the product detail page
with multiple rows. Conversion rates are approximate and for demo only.

---

## Right Column — Publish Controls Sidebar

`padding: 24px`, `background: #FAFAFA`

### Publish status

Badge using `PLATFORM_BADGE` — same config as catalog list:
`padding: 6px 16px`, `borderRadius: 999px`, `fontSize: 13px`, `fontWeight: 600`.

### Show on Store toggle (read-only)

Visual toggle only — not wired to any action:

```
width: 44px, height: 24px, borderRadius: 12px
ON  (platform_status === 'published'): background #006BFF, circle right
OFF (anything else):                   background #E5E7EB, circle left
Circle: 20×20px, borderRadius 50%, background white, position absolute
```

`// TODO MVP2: Make toggle interactive — calls PUT to change platform_status`

### Feature Product toggle (read-only)

Same visual layout as Show on Store. Always OFF — no `featured_product` field
exists in the model yet.

`// TODO MVP2: Add featured_product field to product model`

~~### Metadata~~

Product ID and Tenant ID were removed from the UI — internal system identifiers
are not merchant-facing information.

---

## Loading State

Full card skeleton matching the three-column grid:

- Left: large square placeholder (aspect-ratio 1)
- Middle: 6 horizontal bars, varying widths (80%, 60%, 40%, 90%, 70%, 50%)
- Right: 3 horizontal bars

Same `@keyframes skeleton-pulse` (opacity 1→0.4→1, 1.4s) as `CatalogProducts.jsx`.
Injected as inline `<style>` tag.

---

## Error State

Centered in card, padding 64px, textAlign center:

```
"Failed to load product"  — color #D0021B, fontSize 16px
{error message}           — color #6B7280, fontSize 13px, marginTop 4px
<Button variant="tertiary" size="small" onClick={() => navigate('/catalog')}>
  Back to Catalog
</Button>
```

---

## 404 State

When `product === null` after loading completes without error (API returned 404):

```
"Product not found"  — color #6B7280, fontSize 16px
<Button variant="tertiary" size="small" onClick={() => navigate('/catalog')}>
  Back to Catalog
</Button>
```

---

## Decisions NOT in Scope (MVP1)

| Feature | Reason deferred |
|---------|-----------------|
| Edit product | No PUT endpoint yet |
| Delete product | No DELETE endpoint yet |
| Publish toggle action | No PATCH endpoint for `platform_status` |
| Feature toggle action | No `featured_product` field in model |
| Real auth / BearerAuth | Mock auth in use throughout |
| Stock tracking | Field not in MRP payload |
| Window resize listener | One-time `innerWidth` check is sufficient for demo |

---

## Verification Checklist

- [ ] Click product row in catalog list → navigates to `/catalog/:id`
- [ ] Page loads with correct product name, SKU, MRP ID
- [ ] Breadcrumb shows "Catalog / Product Name"; Catalog link returns to `/catalog`
- [ ] Back arrow `←` returns to `/catalog`
- [ ] Primary image displayed from `image_attached`; placeholder shown if seed URL
- [ ] Thumbnail row visible when multiple images exist; active thumbnail highlighted
- [ ] Category badge above product name shows resolved category name
- [ ] Selling price formatted as IDR
- [ ] Lead time displayed (`30 days`, `45-60 days`, `21 days`)
- [ ] Material, weight, source, created, updated, synced in detail rows
- [ ] Description renders full text
- [ ] Sales price list table visible when `sales_price` array is non-empty
- [ ] Sales price list table shows 3 rows (IDR, USD, EUR) for every product
- [ ] Each currency formatted correctly using its own currency code
- [ ] Right sidebar shows correct publish status badge
- [ ] Show on Store toggle is blue (ON) for `published`, grey (OFF) for others
- [ ] Feature Product toggle always shows grey (OFF)
- [ ] Loading skeleton appears on first load
- [ ] Error state shown with "Back to Catalog" button on API failure
- [ ] 404 state shown for unknown product ID
- [ ] Three-column layout on wide screens; single column on narrow (`< 1100px`)
- [ ] `/catalog`, `/dashboard`, `/websites`, `/profile` routes still work

---

## What Is NOT in Scope

- Edit / delete product UI
- Publish toggle action (PUT `platform_status`)
- Featured product toggle
- Category detail page
- Real auth / BearerAuth
- i18n translations (fallback strings used throughout)
- Window resize listener for responsive layout
