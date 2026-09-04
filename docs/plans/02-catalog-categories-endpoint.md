# Categories Endpoint — As-Built Reference

## Goal

Add `GET /demo/v1/categories` to the existing FastAPI demo API following all
patterns established for products. No existing product files were touched except
the three listed under **Modified files**.

---

## Files

### New files (6)

| File | Purpose |
|------|---------|
| `app/models/category.py` | SQLAlchemy ORM model: `Category` |
| `app/schemas/category.py` | Pydantic v2 schemas + `CategoryStatus` enum |
| `app/services/providers/demo_category_provider.py` | SQLite implementation — all filter/sort logic |
| `app/services/providers/real_category_provider.py` | Stub — all methods raise `NotImplementedError` |
| `app/services/category_service.py` | Business logic facade, `total_pages` calc here |
| `app/demo/category_seed.py` | 5-category seed for `tenant-001` |

### Modified files (3)

| File | Change |
|------|--------|
| `app/services/providers/base.py` | Appended `CategoryProvider` Protocol (no changes to `ProductProvider`) |
| `app/demo/router.py` | Added `GET /categories` route in correct position |
| `app/main.py` | Wired `CategoryService` DI + `seed_categories_if_empty` in startup |

---

## `models/category.py`

Table name: `categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | String | Fixed IDs `cat-001` … `cat-005` — match `category_id` in product seed |
| `tenant_id` | String | Indexed — all queries filter by this |
| `name` | String | `nullable=False` |
| `description` | String | `nullable=False` |
| `status` | String | `nullable=False` — stored as string, Pydantic coerces to enum |
| `created_at` | DateTime | `nullable=False` |
| `updated_at` | DateTime | `nullable=False` |

```python
class Category(Base):
    __tablename__ = "categories"

    id          = Column(String, primary_key=True)
    tenant_id   = Column(String, index=True, nullable=False)
    name        = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status      = Column(String, nullable=False)
    created_at  = Column(DateTime, nullable=False)
    updated_at  = Column(DateTime, nullable=False)
```

`Base` is imported from `app.models.product` — the same `DeclarativeBase`
instance so `init_db()` creates both tables in a single `metadata.create_all`.
No change to `models/product.py` was needed.

---

## `schemas/category.py`

### `CategoryStatus` enum

```python
class CategoryStatus(str, Enum):
    ACTIVE   = "ACTIVE"
    INACTIVE = "INACTIVE"
```

**Why uppercase:** Matches MRP contract. `ProductStatus` was also corrected to
uppercase in the same pass (see plan 01). Consistency between both enums avoids
filter bugs when filtering by status on either resource.

### Schemas

```python
class CategoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:          str
    tenant_id:   str
    name:        str
    description: str
    status:      CategoryStatus
    created_at:  datetime
    updated_at:  datetime

class CategoryListResponse(BaseModel):
    data: list[CategoryItem]
    meta: PaginationMeta

class CategoryFilters(BaseModel):
    page:    int                      = 1
    size:    int                      = 10
    name:    Optional[str]            = None
    status:  Optional[CategoryStatus] = None
    keyword: Optional[str]            = None
    sort:    str                      = "updated_at:desc"
```

`PaginationMeta` and `ErrorResponse` are imported from `schemas.product` — not
redefined. This keeps the pagination shape identical across all list endpoints.

---

## `services/providers/base.py` — `CategoryProvider` Protocol

Appended after `ProductProvider`. `ProductProvider` was not touched.

```python
class CategoryProvider(Protocol):
    async def get_categories(
        self, tenant_id: str, filters: CategoryFilters
    ) -> CategoryListResponse: ...

    async def get_category_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[CategoryItem]: ...   # stubbed — no route yet

    async def reset_demo_data(self) -> None: ...
```

---

## `services/providers/demo_category_provider.py`

Same structure as `DemoProductProvider`. Session per method call via injected
factory.

### Allowed sort fields

```python
_ALLOWED_SORT_FIELDS = {"id", "name", "status", "updated_at", "created_at"}
_DEFAULT_SORT = ("updated_at", "desc")
```

### Filter rules

| Filter | Logic |
|--------|-------|
| `name` | `ILIKE %name%` |
| `status` | exact match on `CategoryStatus.value` |
| `keyword` | OR across `name ILIKE %kw%` + `description ILIKE %kw%` |
| Multiple params | AND across all active filters |

**Why keyword searches description too:** Categories have meaningful descriptions
(e.g. "Teak and mahogany dining sets, beds and living room pieces"). Searching
description enables discovery by material or product type even when the user
doesn't know the exact category name.

### `reset_demo_data`

Deletes all category rows for `tenant-001`, then reseeds. Called by
`GET /reset` which resets both products and categories together.

---

## `demo/category_seed.py` (as-built)

Seeds 5 furniture categories for TeakWorks (Jepara teak furniture manufacturer).

| `id` | `name` | `status` |
|------|--------|----------|
| `cat-001` | Solid Wood Furniture | `ACTIVE` |
| `cat-002` | Custom Order Furniture | `ACTIVE` |
| `cat-003` | Outdoor & Garden Furniture | `ACTIVE` |
| `cat-004` | Wood Components & Panels | `ACTIVE` |
| `cat-005` | Finishing & Hardware | `INACTIVE` |

**Why furniture categories (not the original manufacturing parts):** The demo
persona is TeakWorks — a teak furniture manufacturer based in Jepara, Indonesia.
The original plan used industrial/mechanical categories (Structural Components,
Drive & Motion, Sensors & Electronics) which were placeholder data. Updated to
furniture domain to match the company seed and product seed.

**Why fixed string IDs (`cat-001` … `cat-005`):** Product seed rows hard-reference
these IDs in `category_id`. Fixed IDs ensure category filter and category name
lookup work without a foreign key constraint.

**Why 4 ACTIVE + 1 INACTIVE:** `cat-005` Finishing & Hardware is `INACTIVE` because
it represents a product category that is not yet live on the storefront. This
gives the status filter something meaningful to demonstrate.

---

## `demo/router.py` — Route position

`GET /categories` is inserted between `GET /products/{id}` and `GET /company`
in the router file. Route insertion order matters — routes are matched top to
bottom by FastAPI.

---

## `main.py` — Startup additions

```python
await seed_categories_if_empty(AsyncSessionLocal)

if APP_ENV == "demo":
    category_provider = DemoCategoryProvider(session_factory=AsyncSessionLocal)
else:
    category_provider = RealCategoryProvider()

app.state.category_service = CategoryService(provider=category_provider)
```

`init_db()` needed no changes — `Category` shares `Base` with `Product`, so
`metadata.create_all` creates both tables automatically on startup.

---

## `GET /reset` — Combined Reset

The `/reset` utility endpoint resets both products AND categories together:

```python
async def reset_demo(
    service: ProductService = Depends(_get_service),
    category_service: CategoryService = Depends(_get_category_service),
) -> dict:
    await service.reset()
    await category_service.reset()
    return {"message": "Demo data reset successfully"}
```

**Why reset both together:** Categories must be present before products are
reseeded because the product seed references `category_id` values. Resetting
only products would leave category data stale; resetting only categories would
leave orphaned product rows.

---

## MRP Contract Alignment

| MRP param | Our param | Notes |
|-----------|-----------|-------|
| `page` | `page` | integer, default 1 |
| `size` | `size` | integer, default 10 |
| `name` | `name` | `ILIKE %name%` |
| `status` | `status` | `ACTIVE` / `INACTIVE` uppercase |
| `keyword` | `keyword` | OR across name + description |
| `sort` | `sort` | `field:asc\|desc`, default `updated_at:desc` |

---

## Verification Checklist

- [x] `GET /demo/v1/categories` returns 5 categories
- [x] `status=ACTIVE` returns 4, `status=INACTIVE` returns 1
- [x] `keyword=teak` matches by description
- [x] `keyword=solid` matches by name
- [x] `sort=bad_field:asc` silently returns `updated_at:desc` order
- [x] `page=2&size=2` returns correct `total=5, total_pages=3`
- [x] Empty filter result returns `200` with `data:[]`, never `404`
- [x] `cat-001`, `cat-002`, `cat-003` IDs match product `category_id` values
- [x] `GET /demo/v1/products` still works unchanged
- [x] Swagger at `/demo/docs` shows categories endpoint
- [x] `GET /reset` resets both products and categories

---

## What Is NOT in Scope

- `POST`, `PUT`, `DELETE` category endpoints
- `GET /demo/v1/categories/{id}` route
- Real Postgres connection
- JWT auth
- MRP sync job
- Changes to any product file other than `main.py`, `base.py`, `router.py`
