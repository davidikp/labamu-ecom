# Catalog Categories List Page — Implementation Plan

## Goal

Build `src/pages/CatalogCategories.jsx` — a read-only category list page that
reads from `GET /demo/v1/categories` (documented in plan 02), with a status
filter, keyword search, column sorting, and pagination. Wire it into the Layout
sidebar and App router. No detail page. No row click navigation.

---

## UI Reference

Combines elements from MRP Product Categories and Core Catalog Settings pages.

### From MRP — adopt:
- Clean table with Name, Description, Status badge columns
- Green pill badge for Active, Red pill for Inactive
- Simple pagination with "Total Material Categories: X" count
- Edit action column style (but read-only for MVP1)

### From Core — adopt:
- "Total Products" column showing product count per category
- Search input on top right
- Clean card layout with no outer table borders
- Breadcrumb style header

### Skip from both:
- MRP "Edit" action column — read-only for ecommerce MVP1
- Core "Total Services" — not applicable
- Core "Change Category Order" — MVP2 feature
- Core "New Category" / "New Unit" buttons — categories managed in MRP
- Core info banner — not needed for read-only view

---

## Files

### New (1)

| File | Purpose |
|------|---------|
| `src/pages/CatalogCategories.jsx` | Full page component |

### Modified (3)

| File | Change |
|------|--------|
| `src/App.jsx` | Lazy-import + `/categories` route inside protected Layout block |
| `src/components/Layout.jsx` | "Categories" sidebar nav item after Catalog |
| `src/services/catalogService.js` | Add `keyword` and `sort` params to `fetchCategories` |

---

## `src/services/catalogService.js` — `fetchCategories` gap

Current implementation passes only `page`, `size`, `status`. The categories
page also needs `keyword` and `sort`. Two params must be added:

```js
export async function fetchCategories(params = {}) {
  const query = new URLSearchParams();
  if (params.page)    query.set('page', params.page);
  if (params.size)    query.set('size', params.size);
  if (params.status)  query.set('status', params.status);
  if (params.keyword) query.set('keyword', params.keyword);  // add
  if (params.sort)    query.set('sort', params.sort);        // add

  const res = await fetchWithTimeout(`${BASE_URL}/categories?${query.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

**Why only `keyword` and `sort` (not `name`):** The page uses keyword search
(OR across name + description). The `name` param also exists on the API but is
not surfaced in the UI — adding it to the service without a caller is
unnecessary.

**Why this doesn't break existing callers:** `CatalogProducts.jsx` and
`ProductDetail.jsx` both call `fetchCategories({ status: 'ACTIVE', size: 100 })`
to populate dropdowns. Neither passes `keyword` or `sort`, so both new params
are falsy and excluded from the query string — existing behaviour is unchanged.

---

## `src/pages/CatalogCategories.jsx` (to be built)

### State

| State | Initial | Purpose |
|-------|---------|---------|
| `categories` | `[]` | Current page rows |
| `total` | `0` | Total row count from `meta.total` |
| `isLoading` | `true` | Shows skeleton rows |
| `error` | `null` | Error string from catch |
| `filters` | see below | Active status + keyword params |
| `draftKeyword` | `''` | Controlled input — debounce source |
| `sortKey` | `'updated_at'` | Active sort column |
| `sortDir` | `'desc'` | `'asc'` or `'desc'` |
| `page` | `1` | Current page |
| `size` | `10` | Rows per page |
| `productCounts` | `{}` | `{ category_id: count }` map |

### Filters

```js
const EMPTY_FILTERS = {
  status:  '',
  keyword: '',
};
```

**Why no `categoryId` or `platformStatus`:** This IS the category page — there
is no parent category to filter by. Categories have no `platform_status` field.

**Why status values are `'ACTIVE'` / `'INACTIVE'` (uppercase):** The API
`CategoryStatus` enum values are uppercase to match the MRP contract. Sending
lowercase returns 0 results. See plan 02 for the enum definition.

### Debounce pattern

Single `useRef` timer — identical to `CatalogProducts.jsx`:

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

### Data loading (`useCallback` + `useEffect`)

```js
const loadCategories = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await fetchCategories({
      page, size,
      status:  filters.status  || undefined,
      keyword: filters.keyword || undefined,
      sort:    `${sortKey}:${sortDir}`,
    });
    setCategories(data.data || []);
    setTotal(data.meta?.total ?? 0);
  } catch (err) {
    setError(err.message || 'Failed to load categories');
    setCategories([]);
    setTotal(0);
  } finally {
    setIsLoading(false);
  }
}, [page, size, filters, sortKey, sortDir]);

useEffect(() => { loadCategories(); }, [loadCategories]);
```

### Sorting

Sort state is two separate pieces (`sortKey`, `sortDir`) joined into
`${sortKey}:${sortDir}` for the API request. Same `SortIcon` component pattern
as `CatalogProducts.jsx`.

Sortable columns: `name`, `status`, `updated_at`.

### Badge config

```js
const STATUS_BADGE = {
  ACTIVE:   { bg: '#DCFCE7', color: '#166534', label: 'Active' },
  INACTIVE: { bg: '#FEE2E2', color: '#991B1B', label: 'Inactive' },
};
```

**Why uppercase keys (`ACTIVE`, `INACTIVE`):** The API returns `status` as an
uppercase string. Looking up `STATUS_BADGE[item.status]` requires keys that
match the raw value.

**Why green/red (not blue/yellow/grey like `PLATFORM_BADGE`):** Platform status
(published/draft/archived) is a multi-state publishing workflow. Category status
is a simple binary active/inactive flag — the conventional green/red pair
maps directly to enabled/disabled without ambiguity.

**Why badge label is sentence case (`'Active'`) not uppercase (`'ACTIVE'`):**
The raw enum value is an internal identifier. Sentence case is more readable
in the UI and matches how status labels appear elsewhere in the product.

### Table columns (5 columns)

| # | Header | Field | Sortable | Notes |
|---|--------|-------|----------|-------|
| 1 | Category Name | `name` | ✓ | fontWeight 600, color #1B1B1B |
| 2 | Description | `description` | — | color #6B7280, maxWidth 400px, overflow hidden, textOverflow ellipsis, whiteSpace nowrap |
| 3 | Total Products | computed | — | `productCounts[category.id] || 0`. fontWeight 500, color #1B1B1B. Show "0" not "-" if empty |
| 4 | Status | `status` | ✓ | Badge: ACTIVE green, INACTIVE red |
| 5 | Last Updated | `updated_at` | ✓ | formatDate |

`colSpan` on empty/error state rows is `5`.

**Why 5 columns (not 4 or 6):** Adding Total Products from Core reference gives the operator immediate visibility into which categories are populated. Without it the category list is just a name list with no operational value.

**Why Total Products is not sortable:** The count is computed client-side from a separate fetch. Sorting by it would require client-side sort logic which conflicts with the server-side sort pattern used by all other columns. Can be made sortable when backend aggregation is added.

**Why Description is not sortable:** Sorting by free-text description has no
meaningful use case. Name, status, and date sorting cover all practical needs.

**Why Description is truncated:** Category descriptions are prose (e.g.
"Teak and mahogany dining sets, beds and living room pieces") — full text
in a table cell would make rows too tall and break scan-ability.

### Data fetching — product counts

**Product counts** — once on mount:

```js
const [productCounts, setProductCounts] = useState({});

useEffect(() => {
  fetchProducts({ size: 200 }).then(res => {
    const counts = {};
    (res.data || []).forEach(p => {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    setProductCounts(counts);
  }).catch(() => {});
}, []);
```

**Why frontend computed (not backend aggregation):** The demo has 15 products. Fetching all and counting client-side is simpler than building a new aggregation endpoint.

**Why silent catch:** Product counts are supplementary. If the product API fails, the category list should still render with "0" in the count column.

**Why size 200:** Ensures all products are fetched in one call for accurate counting.

### Imports

```js
import { fetchCategories, fetchProducts } from '../services/catalogService';
```

`fetchProducts` imported for product count computation only.

### Filter bar layout

```
LEFT:  [Status dropdown]  [Clear button — shown when any filter active]
RIGHT: [Keyword search input with magnifier icon]
```

Identical structure to `CatalogProducts.jsx` — same padding, same gap, same
input focus style.

### Pagination

Left: `"Total Categories: {total}"` — matches MRP style  
Right: rows-per-page `Dropdown` (10 / 25 / 50) + Prev/Next icon buttons.

Same button style, spacing, and disabled state logic as `CatalogProducts.jsx`.

### Skeleton rows

5 rows, pulse animation at 1.4s, varying widths per column, same
`@keyframes skeleton-pulse` injected as inline `<style>` tag.

**Why 5 skeleton rows (not 8):** There are only 5 seed categories. 5 skeletons
give a realistic preview that matches the actual loaded state.

---

## `src/App.jsx` changes

```js
const CatalogCategories = React.lazy(() => import('./pages/CatalogCategories'));

// Inside <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>:
<Route path="/catalog"     element={<CatalogProducts />} />
<Route path="/catalog/:id" element={<ProductDetail />} />
<Route path="/categories"  element={<CatalogCategories />} />
```

---

## `src/components/Layout.jsx` changes

Categories nav item added after Catalog using identical structure (active pill,
hover, icon, label). Four-squares grid SVG icon. Uses `isActive('/categories')`.

```jsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
  strokeLinejoin="round">
  <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
</svg>
{t('dashboard:sidebar.categories', 'Categories')}
```

Falls back to `'Categories'` if the translation key is not yet defined.

**Why `isActive('/categories')` is a separate check from `isActive('/catalog')`:**
`isActive` uses strict path equality (`location.pathname === path`). The Catalog
item highlights only on `/catalog` exactly. Categories highlights only on
`/categories`. No change to the existing Catalog nav item is needed.

---

## Product Count Per Category

### Option A — Frontend computed (demo, implemented)

Fetch all products once on mount via `fetchProducts({ size: 200 })`, then build
a `{ category_id: count }` map client-side. Count is displayed in the
Total Products column. Silent catch ensures category list renders even if the
product API fails.

### Option B — Backend aggregation (production, future)

```js
// TODO engineer: add product_count to CategoryItem response
// Either as a JOIN count in the SQL query or as a separate stats endpoint
```

Option B enables server-side sorting by product count and removes the extra
`fetchProducts` call. Not needed for demo scale (15 products, 5 categories).

---

## Decisions NOT Taken

| Feature | Decision | Reason |
|---------|----------|--------|
| Row click navigation | Not added | All category information is visible in the 5 list columns — no additional data to show on a detail page |
| Category detail page | Not built | A category has only name, description, status, and timestamps. A dedicated detail page would display the same 4 fields in a larger layout with no added value |
| Status badge filter in dropdown | Uppercase option labels (`ACTIVE`/`INACTIVE`) | Kept uppercase to match enum values sent to the API; sentence-case badge label is only for display inside the table cell |
| 6 columns like products | Reduced to 5 | Categories are structurally simpler — SKU, price, platform status, and category lookup fields do not exist |
| Edit action column | Not built | Categories managed in MRP, read-only for MVP1 |
| Change Category Order | Not built | MVP2 feature — requires drag-and-drop or order field |
| New Category button | Not built | Categories synced from MRP, not created in ecommerce |
| Total Products sortable | Not added | Count is frontend-computed, conflicts with server-side sort pattern |

---

## Verification Checklist

- [ ] Page renders 5 categories from live API
- [ ] Status filter `ACTIVE` returns 4 rows, `INACTIVE` returns 1 row
- [ ] Keyword `teak` matches rows by description
- [ ] Keyword `solid` matches rows by name
- [ ] Keyword search debounces 350ms and resets to page 1
- [ ] Column sort toggles asc/desc on name, status, updated_at; sort arrows update
- [ ] Pagination "Total Categories: {total}" shown on left
- [ ] Page size change resets to page 1
- [ ] Skeleton rows appear during loading
- [ ] Empty state "No categories found" + Clear button shown when filters return no results
- [ ] Error state "Failed to load categories" + Retry button shown on API failure
- [ ] Categories link in sidebar navigates to `/categories` and shows active state
- [ ] Table rows are NOT clickable — no pointer cursor, no navigation on click
- [ ] `/catalog`, `/catalog/:id`, `/dashboard`, `/websites`, `/profile` routes still work
- [ ] Total Products column shows correct count per category (e.g. cat-001 = 5, cat-002 = 5, cat-003 = 5)
- [ ] Categories with no products show "0"
- [ ] Product count does not block category list if product API fails
- [ ] Description column truncated with ellipsis for long text

---

## What Is NOT in Scope

- Category detail page (`/categories/:id`)
- Create / edit / delete category
- Row click navigation
- Status toggle or publish controls
- Real auth / BearerAuth
- i18n translations for category page keys (fallback strings used throughout)
- Edit action column
- Change category order / drag-and-drop
- Backend product count aggregation (frontend computed for demo)
