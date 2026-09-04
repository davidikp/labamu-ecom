# Storefront Shop Page Component — Implementation Plan

## Goal

Build `src/components/storefront/ShopPage.jsx` — a self-contained, reusable
shop page component that renders a category sidebar, price filter, product grid,
sort/count bar, and pagination. Designed to be dropped into any website template
preview and later into a published storefront with no structural changes.

---

## UI Reference (from screenshot)

```
┌──────────────────────────────────────────────────────────────┐
│  ▌ All Categories       ▲   1–16 from 1600 products          │
│    Tops                     Sort by Newest to Oldest ▾       │
│    Bottoms                                                    │
│    Dresses              ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│    Shoes                │ img  │ │ img  │ │ img  │ │ img  │ │
│    Bags                 │      │ │      │ │      │ │      │ │
│    Parfumes             └──────┘ └──────┘ └──────┘ └──────┘ │
│                         Name     Name     Name     Name      │
│  ▌ Price Filter    ▲   Rp X,XXX  Rp X,XXX Rp X,XXX Rp X,XXX│
│  ┌──────────────┐                                            │
│  │ Rp  Lowest   │  ... (3 more rows of 4) ...               │
│  └──────────────┘                                            │
│  ┌──────────────┐        ← 1  2  3  …  40  →               │
│  │ Rp  Highest  │                                            │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
```

### Visual specifications

**Sidebar**
- Width: 220px fixed, separated from grid by a right border or gap
- Active category: blue left border pill (4px, `#006BFF`) + `fontWeight: 700`
- Inactive category: `fontWeight: 400`, `color: #374151`, hover `#F9FAFB` bg
- Section headers ("All Categories", "Price Filter"): `fontWeight: 700`, `fontSize: 14px`, `color: #111827`
- Collapse chevron on "Price Filter" header — rotates 180° when collapsed
- Price inputs: bordered box, `Rp` prefix in grey, `fontSize: 14px`

**Top bar**
- Left: `"{from}–{to} from {total} products"`, `fontSize: 13px`, `color: #6B7280`
- Right: `"Sort by {label} ▾"` — inline text trigger (no pill/box border), `fontWeight: 600`, `fontSize: 14px`

**Product grid**
- Desktop: 4 columns, `gap: 24px`
- Mobile (`isMobile: true`): 2 columns, `gap: 12px`
- Product card: no border, no shadow — image on top, name below (`fontSize: 14px`, `color: #111827`), price bold (`fontSize: 15px`, `color: #111827`, Rp formatted)
- Image: `aspect-ratio: 3/4`, `objectFit: cover`, `borderRadius: 8px`, `background: #F3F4F6` as placeholder

**Pagination**
- Current page: box border `1px solid #111827`, `fontWeight: 700`
- Other pages: `color: #6B7280`, no border, hover underline
- Ellipsis `…` between page 3 and last page
- Prev `←` / Next `→` arrow buttons — disabled when at boundary

---

## File

### New (2)

| File | Purpose |
|------|---------|
| `src/components/storefront/ShopPage.jsx` | Full shop page component |
| `src/components/storefront/index.js` | Barrel export |

> No existing files are modified in this plan.

---

## Props API

```js
ShopPage.propTypes = {
  // Data
  products:       array,   // required — ProductShape[]
  categories:     array,   // required — CategoryShape[]
  totalCount:     number,  // required — total products across all pages
  currentPage:    number,  // required — 1-indexed
  pageSize:       number,  // default 16

  // Callbacks (all optional — omit for static/demo render)
  onCategoryChange: func,  // (categoryId: string) => void
  onPriceChange:    func,  // ({ min, max }) => void
  onSortChange:     func,  // (sortKey: string) => void
  onPageChange:     func,  // (page: number) => void

  // Template / theming
  accentColor:    string,  // default '#006BFF' — active indicators, buttons
  isMobile:       bool,    // injected by PreviewLayout — switches to 2-col grid
  handleDemoAction: func,  // injected by PreviewLayout — intercepts cart/buy clicks
}
```

### Data shapes

```js
// ProductShape
{
  id:          string,
  name:        string,
  price:       number,   // raw IDR value, e.g. 2800000
  image_url:   string,   // primary image URL
  category_id: string,
}

// CategoryShape
{
  id:   string,   // 'all' for the "All Categories" sentinel
  name: string,
}
```

---

## Internal state (self-managed when no callbacks provided)

| State | Initial | Purpose |
|-------|---------|---------|
| `selectedCategory` | `'all'` | Active sidebar category |
| `priceMin` | `''` | Lowest price input value |
| `priceMax` | `''` | Highest price input value |
| `sortKey` | `'newest'` | Active sort option |
| `priceFilterOpen` | `true` | Price filter section collapsed or expanded |

When a callback prop (`onCategoryChange`, etc.) is provided, the component
becomes controlled for that dimension and calls the callback instead of updating
internal state. This lets the same component work in static demo mode (no
callbacks) and in a live storefront (all callbacks wired).

---

## Sub-components (file-local, not exported)

### `CategorySidebar`

Props: `categories`, `selected`, `onSelect`, `accentColor`,
`priceMin`, `priceMax`, `onPriceChange`, `priceFilterOpen`, `onTogglePriceFilter`

Renders:
- Category list with active pill indicator
- "Price Filter" section header with collapse chevron
- Two price inputs when `priceFilterOpen: true`

### `ProductCard`

Props: `product`, `onAction` (calls `handleDemoAction` or future cart handler)

Renders: image → name → formatted price. No hover overlay. No add-to-cart
button visible by default (MVP1 is catalogue-only; `onAction` is wired for
when `enableCheckout` is true in a future iteration).

### `ShopTopBar`

Props: `from`, `to`, `total`, `sortKey`, `onSortChange`

Sort options:
```js
const SORT_OPTIONS = [
  { id: 'newest',    label: 'Newest to Oldest' },
  { id: 'oldest',    label: 'Oldest to Newest' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];
```

Sort trigger renders as inline text `"Sort by {label} ▾"`, not a boxed dropdown.

### `ShopPagination`

Props: `currentPage`, `totalPages`, `onPageChange`

Renders: `←  1  2  3  …  40  →`

Page window logic: always show first, last, current ± 1, and ellipsis where
there are gaps. Ellipsis rendered when gap > 1 between shown page numbers.

---

## Formatting helpers (file-local)

```js
function formatRp(value) {
  if (value == null || value === '') return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}
```

---

## PreviewLayout compatibility

`PreviewLayout` injects `handleDemoAction` and `isMobile` via `React.cloneElement`.
`ShopPage` must accept both as optional props and pass `handleDemoAction` down
to `ProductCard` as the `onAction` handler. When `isMobile` is `true`, the
product grid switches from 4 to 2 columns and sidebar collapses into an
above-grid horizontal scroll filter row (MVP2 — sidebar stays visible on mobile
in MVP1 to keep scope tight).

---

## Verification Checklist

- [ ] ShopPage renders with mock products and categories
- [ ] Category sidebar highlights active category with blue pill
- [ ] Clicking category filters product grid
- [ ] Price filter inputs accept numeric values
- [ ] Price filter section collapses/expands with chevron
- [ ] Sort dropdown changes sort order
- [ ] Product grid shows 4 columns on desktop, 2 on mobile
- [ ] Product card shows image, name, price formatted as IDR
- [ ] Placeholder image shown when product has no image
- [ ] Pagination shows correct page numbers with ellipsis
- [ ] Prev/Next disabled at boundaries
- [ ] handleDemoAction fires toast when product card clicked in preview
- [ ] isMobile prop switches grid to 2 columns
- [ ] Component renders without callbacks (uncontrolled mode)
- [ ] Component works with callbacks (controlled mode)
- [ ] No existing files modified

---

## Integration (future, not in scope)

The caller that wires ShopPage into the website template preview is
`HouzezPreview.jsx` or a future `ShopPreviewPage.jsx`. The caller is responsible for:
- Calling `fetchProducts` and `fetchCategories` from `catalogService.js`
- Mapping API response to `ProductShape` and `CategoryShape`
- Passing callbacks for filter/sort/page changes
- Re-fetching on filter/sort/page change

This integration is a separate plan — ShopPage only receives props.

### image_url mapping (caller responsibility)

```js
image_url: product.image_attached?.find(i => i.is_primary)?.document_public_url
  || product.image_attached?.[0]?.document_public_url
  || null
```

**Why no `platform_status` filter in ShopPage:** The caller is responsible for
fetching only published products (`platform_status=published`). ShopPage
renders whatever products it receives — it has no knowledge of publish status.
The admin catalog page handles publish status; the storefront does not.

---

## Decisions NOT Taken

| Feature | Decision | Reason |
|---------|----------|--------|
| Cart / Add to Cart button | Not built | Checkout is a separate feature controlled by `enableCheckout` flag in ShopPanel. MVP1 is catalogue-only |
| Product detail navigation | Not built | Clicking a card calls `handleDemoAction` in preview (toast). Real navigation is a separate route plan |
| Search bar | Not built | Not visible in the UI reference screenshot. Can be added above the top bar in a later plan |
| Mobile sidebar collapse to horizontal filter | Not built | MVP2. `isMobile` prop is accepted but only affects grid column count in MVP1 |
| Real API integration | Not built | Component is data-driven via props. Caller (preview page or published page) is responsible for data fetching |
| Ratings / reviews on card | Not built | Not in UI reference |
| Stock / availability badge | Not built | Not in UI reference |

---

## What Is NOT in Scope

- Any changes to existing files (`App.jsx`, `HouzezPreview.jsx`, `catalogService.js`, etc.)
- Cart, checkout, or order management
- Product detail page or routing
- Mobile-specific sidebar layout (grid column count only)
- i18n — English strings hardcoded with inline fallbacks (same pattern as other storefront components)
- Backend aggregation for price range or category counts
