# Catalog Products List Page — As-Built Reference

## Goal

Build `src/pages/CatalogProducts.jsx` — a read-only product list page that reads
from the FastAPI demo API, with filters, column sorting, pagination, and badge
rendering. Wire it into the Layout sidebar and App router.

---

## Files

### New (2)

| File | Purpose |
|------|---------|
| `src/services/catalogService.js` | `fetchProducts(params)`, `fetchCategories(params)` |
| `src/pages/CatalogProducts.jsx` | Full page component |

### Modified (2)

| File | Change |
|------|--------|
| `src/App.jsx` | Lazy-import + `/catalog` route inside protected Layout block |
| `src/components/Layout.jsx` | "Catalog" sidebar nav item after Websites |

> `.env` already had `VITE_CATALOG_API_URL=http://127.0.0.1:8001/demo/v1` from
> the company profile work. No `.env` change was needed.

---

## `src/services/catalogService.js` (as-built)

Named exports `fetchProducts` and `fetchCategories` — uses direct `fetch()` with
a 10-second `AbortController` timeout. Does not go through any shared API client
or mock interceptor.

```js
const BASE_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:8001/demo/v1';

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.page)           query.set('page', params.page);
  if (params.size)           query.set('size', params.size);
  if (params.platformStatus) query.set('platform_status', params.platformStatus);
  if (params.categoryId)     query.set('category_id', params.categoryId);
  if (params.keyword)        query.set('keyword', params.keyword);
  if (params.sort)           query.set('sort', params.sort);
  const res = await fetchWithTimeout(`${BASE_URL}/products?${query}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchCategories(params = {}) { ... }
```

**Why explicit `URLSearchParams` construction (not `Object.entries` loop):**
The original plan used a generic loop over all filter keys. The explicit approach
maps camelCase JS names (`platformStatus`) to snake_case API params
(`platform_status`) and skips keys with no value cleanly without falsy-value
edge cases.

**Why `127.0.0.1` fallback (not `localhost`):** macOS resolves `localhost` to
`::1` (IPv6) first. The uvicorn backend binds to `0.0.0.0` which covers IPv4
but not IPv6 by default. Using `127.0.0.1` forces IPv4 and avoids the
connection hang that caused a visible "Failed to load data" bug in the company
profile page.

---

## `src/pages/CatalogProducts.jsx` (as-built)

### Imports

```js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import { fetchProducts, fetchCategories } from '../services/catalogService';
```

**Why `useNavigate`:** Added when row click navigation was implemented. Each table
row navigates to `/catalog/${product.id}` on click.

**Why `useCallback` and `useRef`:** `useCallback` wraps `loadProducts` to prevent
infinite `useEffect` re-runs. `useRef` holds the keyword debounce timer handle
so it survives re-renders without triggering them.

### State

| State | Initial | Purpose |
|-------|---------|---------|
| `products` | `[]` | Current page rows |
| `total` | `0` | Total row count from `meta.total` |
| `isLoading` | `true` | Shows skeleton rows |
| `error` | `null` | Error string from catch |
| `categoryOptions` | `[{ id:'', label:'All Categories' }]` | Dropdown options |
| `categoryMap` | `{}` | `{ id: name }` for table cell display |
| `filters` | see below | All active query params |
| `draftKeyword` | `''` | Controlled input — debounce source |
| `sortKey` | `'updated_at'` | Active sort column |
| `sortDir` | `'desc'` | `'asc'` or `'desc'` |
| `page` | `1` | Current page |
| `size` | `10` | Rows per page |

**Why `total` from `meta.total` not `data.total`:** The API response shape is
`{ data: [...], meta: { page, size, total, total_pages } }`. The original plan
assumed a flat `total` key on the root. Fixed after observing `undefined` total
in the pagination bar.

### Filters (as-built)

```js
const EMPTY_FILTERS = {
  platformStatus: '',
  categoryId: '',
  keyword: '',
};
```

**Why `status` and `productSource` were removed from filters:**

- `status` (`ACTIVE`/`INACTIVE`): Removed from the filter bar and table because
  the catalog page is meant to show all products regardless of internal
  activation state. Status is an operational concern, not a browsing concern.
- `productSource`: MVP1 has only `STANDARD_CATALOG`. A filter with one meaningful
  option adds no value to the user and clutters the UI. The filter will be
  re-added when `CUSTOM_ORDER` is introduced in MVP2.

### Debounce pattern (as-built)

Single `useRef` timer — does not use two separate `useEffect` calls:

```js
const keywordTimer = useRef(null);

function handleKeywordInput(e) {
  const val = e.target.value;
  setDraftKeyword(val);
  clearTimeout(keywordTimer.current);
  keywordTimer.current = setTimeout(() => {
    setFilters(prev => ({ ...prev, keyword: val }));
    setPage(1);
  }, 350);
}
```

**Why 350ms (not 400ms):** Feels more responsive on fast typists without
triggering on every keystroke.

### Data loading (`useCallback` + `useEffect`)

```js
const loadProducts = useCallback(async () => { ... },
  [page, size, filters, sortKey, sortDir]);

useEffect(() => { loadProducts(); }, [loadProducts]);
```

**Why `useCallback` wrapping:** Prevents `loadProducts` from being redefined on
every render, which would cause infinite `useEffect` loops. The dependency array
`[page, size, filters, sortKey, sortDir]` is the single source of truth for when
a new fetch should fire.

### Sorting

Sort state is two separate pieces (`sortKey`, `sortDir`) rather than a combined
`sort` string. They are joined into `${sortKey}:${sortDir}` when building the
API request.

Sortable columns: `name`, `price`, `updated_at`.

**Why sort is not stored as a combined string:** The `SortIcon` component needs
to compare `sortKey === column` and `sortDir === 'asc'|'desc'` independently to
render the correct arrow direction. Splitting avoids parsing a combined string
on every render.

### Badge configs (as-built)

```js
const PLATFORM_BADGE = {
  published: { bg: '#DBEAFE', color: '#2563EB', label: 'Published' },
  draft:     { bg: '#FEF9C3', color: '#CA8A04', label: 'Draft' },
  archived:  { bg: '#F3F4F6', color: '#6B7280', label: 'Archived' },
};
```

**Why `STATUS_BADGE` and `SOURCE_BADGE` were removed:** See filter removal
rationale above. Displaying a Status badge column alongside the Publish Status
badge was redundant for the browsing use case. Source badge was removed because
all products are `STANDARD_CATALOG` — a badge that is always the same value
communicates nothing.

### Table columns (as-built)

| # | Header | Field | Sortable |
|---|--------|-------|----------|
| 1 | Product Name | `name` | ✓ |
| 2 | SKU | `sku` | — |
| 3 | Category | `category_id` → `categoryMap` | — |
| 4 | Price | `price` | ✓ |
| 5 | Publish Status | `platform_status` | — |
| 6 | Last Updated | `updated_at` | ✓ |

**Why the column header says "Publish Status" not "Platform Status":** "Platform
Status" is an internal developer term. "Publish Status" is what a merchant
understands — whether a product is visible on their storefront.

`colSpan` on the empty-state row is `6` matching the 6 columns above.

### Price formatter (as-built)

```js
function formatPrice(val) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(val);
}
```

**Why IDR (not USD):** The seed data prices are in IDR (Rp 1.2M – Rp 12M) to
match TeakWorks' Indonesian pricing. The original plan used USD formatters with
USD placeholder prices.

### Category name lookup (as-built)

Categories are fetched once on mount with `status: 'ACTIVE'`. Two data structures
are built from the result:

1. `categoryMap` (`{ id: name }`) — used in table cell display
2. `categoryOptions` (dropdown array) — used in the filter dropdown

```js
const map = {};
cats.forEach(c => { map[c.id] = c.name; });
setCategoryMap(map);
setCategoryOptions([{ id: '', label: 'All Categories' }, ...cats.map(...)]);
```

**Why `status: 'ACTIVE'` when fetching for filter dropdown:** Inactive categories
should not appear as filter options because filtering by them would return no
products. Active categories only.

**Why uppercase `'ACTIVE'`:** `CategoryStatus` enum values are uppercase to match
MRP contract. Sending lowercase `'active'` would return 0 results.

### Skeleton rows

8 rows, pulse animation at 1.4s, varying widths per row to look natural.
`@keyframes skeleton-pulse` is injected as an inline `<style>` tag.

**Why 8 skeleton rows (not 5 from original plan):** The default page size is 10.
8 skeletons gives a more realistic preview of the loaded state without
overflowing the viewport on typical screen heights.

### Row click navigation (as-built)

```jsx
<tr
  key={p.id}
  onClick={() => navigate(`/catalog/${p.id}`)}
  style={{ cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
>
```

`useNavigate` is called at the top of the component. `cursor: 'pointer'` gives
the visual affordance that rows are clickable.

**Note:** `/catalog/:id` is not yet registered in `src/App.jsx`. Row clicks
navigate there but hit the catch-all redirect until the product detail page
is built in plan 05.

### Pagination (as-built)

Left: `"Showing {from}–{to} of {total} products"` hardcoded English string.

Right: rows-per-page `Dropdown` + Prev/Next icon buttons.

**Why Prev/Next buttons instead of page number buttons:** Simpler to implement
and sufficient for the demo. Page number buttons would require handling edge
cases (many pages, ellipsis logic) with no clear benefit for the current data
size (15 products).

---

## `src/App.jsx` changes

```js
const CatalogProducts = React.lazy(() => import('./pages/CatalogProducts'));

// Inside <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>:
<Route path="/catalog" element={<CatalogProducts />} />
```

---

## `src/components/Layout.jsx` changes

Catalog nav item added after Websites using identical structure (active pill,
hover, icon, label). Shopping bag SVG icon. Uses `isActive('/catalog')`.

```js
{t('dashboard:sidebar.catalog', 'Catalog')}
```

Falls back to `'Catalog'` if the translation key is not yet defined.

---

## Decisions NOT Taken From Original Plan

| Original plan | Actual build | Reason |
|---------------|-------------|--------|
| Row click → `navigate('/catalog/:id')` | Implemented — `navigate('/catalog/${p.id}')` | Added after initial build; `/catalog/:id` route not yet registered in App.jsx |
| Status filter dropdown | Removed | Operational field, not needed for browsing |
| Source filter dropdown | Removed | Only one value in MVP1 |
| Status badge column | Removed | Same reason as filter removal |
| Source badge column | Removed | All products are same source |
| `flexWrap: 'wrap'` on filter bar | Removed | Filters fit one line; wrapping looked broken |
| 5 skeleton rows | 8 skeleton rows | Closer to actual default page size |
| `colSpan={8}` | `colSpan={6}` | Matches actual 6-column table |

---

## Verification Checklist

- [x] Table renders 15 products from live API
- [x] Category column shows names, not `cat-001`/`cat-002`/`cat-003`
- [x] Publish Status filter and badge work (`published` / `draft` / `archived`)
- [x] Category filter dropdown populated from `GET /demo/v1/categories`
- [x] Keyword search debounces and resets to page 1
- [x] Column sort toggles asc/desc; sort arrows update
- [x] Pagination "Showing X–Y of Z" reflects actual data
- [x] Page size change resets to page 1
- [x] Skeleton rows appear during loading
- [x] Empty state shown when filters return no results
- [x] Error state shown with Retry button on API failure
- [x] Catalog link in sidebar navigates and shows active state
- [x] `/dashboard`, `/websites`, `/profile` routes still work
- [x] Table rows show pointer cursor and navigate to `/catalog/${id}` on click

---

## What Is NOT in Scope

- Product detail page (`/catalog/:id`)
- Create / edit / delete product
- Category management page
- Status column or filter
- Source column or filter
- Real auth / BearerAuth
- i18n translations for catalog keys (fallback strings used throughout)
