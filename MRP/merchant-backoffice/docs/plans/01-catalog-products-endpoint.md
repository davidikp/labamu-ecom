# Products Endpoint — As-Built Reference

## Goal

Build `GET /demo/v1/products` — a read-only, paginated, filterable product
catalog endpoint backed by SQLite in demo mode. Architecture uses a
provider-switching pattern so the demo layer can be replaced with a real MRP
integration without changing the service or router.

---

## Stack

| Concern | Library | Version |
|---------|---------|---------|
| Web framework | FastAPI | 0.111.0 |
| ORM | SQLAlchemy async | 2.0.30 |
| SQLite driver | aiosqlite | 0.20.0 |
| Validation | Pydantic v2 | 2.7.1 |
| ASGI server | Uvicorn | 0.29.0 |
| HTTP client | httpx (future MRP calls) | 0.27.0 |
| Env config | python-dotenv | 1.0.1 |

---

## Project Structure (as-built)

```
app/
├── main.py
├── demo/
│   ├── router.py           # all demo routes
│   ├── auth.py             # hardcoded tenant-001
│   ├── database.py         # async engine + session factory
│   └── product_seed.py     # 15-product seed (renamed from seed.py)
├── models/
│   └── product.py          # SQLAlchemy ORM — Product + Base
├── schemas/
│   └── product.py          # Pydantic v2 schemas + enums
└── services/
    ├── product_service.py
    └── providers/
        ├── base.py
        ├── demo_provider.py
        └── real_provider.py
```

> Seed file was renamed from `demo/seed.py` → `demo/product_seed.py` when the
> company and category seeds were added, to avoid ambiguity.

---

## `models/product.py` — SQLAlchemy ORM (as-built)

Table name: `products`

| Column | Type | Notes |
|--------|------|-------|
| `id` | String | `str(uuid.uuid4())` primary key |
| `tenant_id` | String | Indexed — all queries filter by this |
| `mrp_id` | String | Format `MRP-XXXX` |
| `sku` | String | Format `MFG-XXXX` |
| `name` | String | |
| `description` | String | |
| `price` | Float | IDR range — see seed section |
| `category_id` | String | One of `cat-001` … `cat-003` |
| `status` | String | `"ACTIVE"` \| `"INACTIVE"` — uppercase to match MRP contract |
| `product_source` | String | `"STANDARD_CATALOG"` — only value in MVP1 |
| `platform_status` | String | `"draft"` \| `"published"` \| `"archived"` |
| `lead_time` | String | Nullable — e.g. `"30 days"`, `"45-60 days"` |
| `selling_price` | Float | Nullable — mirrors `price` in seed; split field for MRP alignment |
| `primary_material` | String | Nullable — `"Teak"`, `"Mahogany"`, `"Mixed Materials"` |
| `gross_weight` | Float | Nullable — not populated in seed, reserved for MRP payload |
| `image_attached` | String | Nullable — JSON string, deserialized by Pydantic validator |
| `sales_price` | String | Nullable — JSON string `[{"currency_code":"IDR","price":N}]` |
| `updated_at` | DateTime | Spread over last 90 days for sort testing |
| `created_at` | DateTime | |
| `synced_at` | DateTime | Nullable |

**Why JSON strings for `image_attached` and `sales_price`:** SQLite has no native
array type. Storing as JSON string and deserializing in Pydantic keeps the DB
layer simple while preserving the MRP array structure in the API response.

**Why `lead_time`, `selling_price`, `primary_material` added:** These fields are
present in the actual MRP product payload. Adding them to the demo model means
the API response shape already matches MRP — the frontend never needs to change
field names when the real provider is wired.

---

## `schemas/product.py` — Pydantic v2 (as-built)

### Enums

```python
class ProductStatus(str, Enum):
    active   = "ACTIVE"
    inactive = "INACTIVE"

class ProductSource(str, Enum):
    STANDARD_CATALOG = "STANDARD_CATALOG"
    # TODO engineer: add CUSTOM_ORDER when custom product catalog integration is built

class PlatformStatus(str, Enum):
    draft     = "draft"
    published = "published"
    archived  = "archived"
```

**Why `ProductStatus` is uppercase:** The MRP contract sends `status=ACTIVE` /
`status=INACTIVE`. The original plan used lowercase `active/inactive`. Corrected
to match MRP so filtering by status works without case transformation.

**Why `ProductSource` has only one value:** MVP1 covers standard catalog products
only. `CUSTOM_ORDER` will be added in MVP2 when the custom product integration
is built. The TODO comment marks this for the next engineer.

**Why `PlatformStatus` stays lowercase:** `platform_status` is an ecommerce-layer
field, not forwarded to MRP. Its values are internal to this service and kept
lowercase for readability.

### `ProductItem` (as-built, including MRP fields)

```python
class ProductItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:               str
    tenant_id:        str
    mrp_id:           str
    sku:              str
    name:             str
    description:      str
    price:            float
    category_id:      str
    status:           ProductStatus
    product_source:   ProductSource
    platform_status:  PlatformStatus
    updated_at:       datetime
    created_at:       datetime
    synced_at:        Optional[datetime]
    lead_time:        Optional[str]    = None
    selling_price:    Optional[float]  = None
    primary_material: Optional[str]    = None
    gross_weight:     Optional[float]  = None
    image_attached:   List[dict]       = []
    sales_price:      List[dict]       = []

    @field_validator('image_attached', 'sales_price', mode='before')
    @classmethod
    def parse_json_field(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v or []
```

**Why `Optional[X]` not `X | None`:** Project runs Python 3.9. The `X | None`
union syntax requires Python 3.10+. Even with `from __future__ import annotations`,
Pydantic v2 evaluates type hints at model-build time via `get_type_hints()` and
raises a `TypeError` on 3.9. All nullable fields use `Optional[X]` from `typing`.

**Why a shared `parse_json_field` validator covers both JSON fields:** Combining
both field names in one `@field_validator` avoids duplicating the same
`json.loads` / `or []` logic. Pydantic v2 supports multiple field names in a
single validator.

### `ProductDetailResponse`

```python
class ProductDetailResponse(BaseModel):
    data: ProductItem
```

Added when `GET /products/{id}` was implemented. Wraps a single `ProductItem`
in a `data` key matching the MRP contract shape
`{ "data": {...}, "message": "Success get product", "status": 200 }`.

### Other schemas

```python
class ProductFilters(BaseModel): ...   # all query params as typed fields
class PaginationMeta(BaseModel): ...   # page, size, total, total_pages
class ProductListResponse(BaseModel): ...  # data + meta
class ErrorResponse(BaseModel): ...    # code, message, detail
```

`PaginationMeta` and `ErrorResponse` are shared with `schemas/category.py` via
import — not redefined there.

---

## `demo/product_seed.py` (as-built)

Seeds 15 products for `tenant_id = "tenant-001"` if the table is empty.

**Why IDR prices:** The original plan used USD placeholder values. Updated to
realistic IDR furniture pricing to match TeakWorks domain (Jepara furniture
manufacturer). This prevents confusion when the frontend displays prices.

| Category | Products | Lead time | Price range (IDR) |
|----------|----------|-----------|-------------------|
| cat-001 Solid Wood Furniture | 5 | 30 days | 3.2M – 12M |
| cat-002 Custom Order Furniture | 5 | 45-60 days | 2.1M – 6.5M |
| cat-003 Outdoor & Garden | 5 | 21 days | 1.2M – 11M |

Distribution: 8 `ACTIVE`, 7 `INACTIVE`; 6 `published`, 5 `draft`, 4 `archived`.

`image_attached` and `sales_price` are stored as JSON strings using helper
functions `_img(sku)` and `_sp(price)` defined at the top of the file.

---

## Provider Pattern

```
router.py  →  ProductService  →  DemoProductProvider (SQLite, demo)
                               →  RealProductProvider (stub, future MRP)
```

`ProductService` does only business logic — pagination math, response assembly.
It never touches SQLite. `DemoProductProvider` owns all filter/sort/query logic.

**Why `app.state` for service injection (not module-level globals):** Services
are attached to `app.state` in the startup handler so they are recreated on each
server start with fresh connections, and are accessible to route handlers via
`request.app.state` without circular imports.

---

## Route Order in `router.py`

```
GET /products          ← list
GET /products/{id}     ← detail (added in plan 04)
GET /categories
GET /company
GET /company/sync
# UTILITY — keep these last
GET /reset
GET /company/reset
```

---

## MRP Contract Alignment

| MRP param | Our param | Notes |
|-----------|-----------|-------|
| `page` | `page` | integer, default 1 |
| `size` | `size` | integer, default 10 |
| `name` | `name` | `ILIKE %name%` |
| `status` | `status` | `ACTIVE` / `INACTIVE` uppercase |
| `product_source` | `product_source` | MVP1: UI filter removed, API param kept for engineer |
| `category_id` | `category_id` | exact match |
| `sku` | `sku` | `ILIKE %sku%` |
| `keyword` | `keyword` | OR across sku + name |
| `sort` | `sort` | `field:asc\|desc`, default `updated_at:desc` |
| *(ecommerce only)* | `platform_status` | not forwarded to MRP |

---

## Verification Checklist

- [x] `GET /demo/v1/products` returns 15 products
- [x] `status=ACTIVE` returns 8, `status=INACTIVE` returns 7
- [x] `keyword=teak` matches by name
- [x] `sort=bad_field:asc` silently returns `updated_at:desc`
- [x] `page=2&size=5` returns correct `total=15, total_pages=3`
- [x] Empty filter result returns `200` with `data:[]`, never `404`
- [x] `image_attached` is deserialized array in response, not raw string
- [x] `sales_price` is deserialized array with `currency_code: "IDR"`
- [x] `GET /demo/v1/products/{id}` returns single product (plan 04)
- [x] `GET /demo/v1/products/{invalid_id}` returns 404

---

## What Is NOT in Scope

- `POST`, `PUT`, `DELETE` endpoints
- Real Postgres / MRP httpx integration (`RealProductProvider` stub only)
- JWT auth
- MRP sync job
- Multi-tenant token switching
