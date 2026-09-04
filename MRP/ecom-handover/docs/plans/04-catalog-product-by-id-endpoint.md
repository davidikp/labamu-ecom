# Product by ID Endpoint — As-Built Reference

## Goal

Add `GET /demo/v1/products/{id}` to the existing FastAPI demo API. No new files
created — all existing models, schemas, providers, and services are reused and
extended in place.

---

## Files

### New files

None.

### Modified files (5)

| File | Change |
|------|--------|
| `app/schemas/product.py` | Added `ProductDetailResponse` |
| `app/services/providers/demo_provider.py` | Implemented `get_product_by_id` (was stubbed) |
| `app/services/providers/real_provider.py` | Updated stub comment with MRP httpx note |
| `app/services/product_service.py` | Added `get_product_by_id` method |
| `app/demo/router.py` | Added `GET /products/{id}` route in correct position |

---

## `schemas/product.py` — `ProductDetailResponse`

```python
class ProductDetailResponse(BaseModel):
    data: ProductItem
```

**Why a dedicated response class (not returning `ProductItem` directly):** The
MRP contract wraps single-product responses in a `data` envelope:
`{ "data": {...}, "message": "Success get product", "status": 200 }`.
Using `ProductDetailResponse` keeps the response shape consistent with MRP and
consistent with `ProductListResponse` which also uses a `data` key.

---

## `services/providers/demo_provider.py` — `get_product_by_id`

Was previously stubbed with a comment. Now implemented:

```python
async def get_product_by_id(
    self, tenant_id: str, id: str
) -> Optional[ProductItem]:
    async with self._session_factory() as session:
        result = await session.execute(
            select(Product).where(
                Product.id == id,
                Product.tenant_id == tenant_id,
            )
        )
        row = result.scalar_one_or_none()
        return ProductItem.model_validate(row) if row else None
```

**Why `AND tenant_id = ?` on the detail query:** Tenant isolation must be
enforced on every query — including single-item lookups. A product ID is a UUID
and is globally unique in practice, but the tenant check prevents cross-tenant
data leaks if UUIDs ever collide or if the provider is reused in a multi-tenant
context.

---

## `services/providers/real_provider.py` — Updated stub

```python
async def get_product_by_id(self, tenant_id, id):
    # TODO engineer: implement get_product_by_id
    # Calls GET /products/{id} from MRP API via httpx
    # MRP endpoint returns single product wrapped in { data: {...}, message, status }
    # Extract data field and map to ProductItem schema
    raise NotImplementedError
```

Updated comment documents the MRP integration path so the next engineer knows
exactly what the real implementation needs to do.

---

## `services/product_service.py` — `get_product_by_id`

```python
async def get_product_by_id(
    self, tenant_id: str, id: str
) -> Optional[ProductItem]:
    return await self.provider.get_product_by_id(tenant_id, id)
```

`Optional[ProductItem]` and `ProductItem` added to the import block.
The service method is intentionally thin — no business logic beyond delegation.
The `None` return propagates to the router which converts it to a 404.

---

## `demo/router.py` — Route

```python
@router.get(
    "/products/{id}",
    response_model=ProductDetailResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get product by ID",
    description="Retrieve a single product by ID for the authenticated tenant.",
)
async def get_product(
    id: str,
    tenant_id: str = Depends(get_demo_tenant_id),
    service: ProductService = Depends(_get_service),
) -> ProductDetailResponse:
    try:
        product = await service.get_product_by_id(tenant_id, id)
        if not product:
            return JSONResponse(
                status_code=404,
                content=ErrorResponse(
                    code=404, message="Product not found",
                    detail=f"No product with id {id}"
                ).model_dump(),
            )
        return ProductDetailResponse(data=product)
    except Exception as exc:
        logger.exception("Unhandled error in GET /products/{id}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                code=500, message="Internal server error", detail=str(exc)
            ).model_dump(),
        )
```

**Why `return JSONResponse(status_code=404, ...)` instead of
`raise HTTPException(status_code=404, ...)`:** Consistent with how the product
list and other endpoints handle errors — returning a `JSONResponse` with a typed
`ErrorResponse` body gives the frontend a predictable `{ code, message, detail }`
structure. `HTTPException` with a `detail` dict produces a different JSON shape
`{ "detail": {...} }` which would need special-casing on the client.

### Route order

```
GET /products          ← list
GET /products/{id}     ← detail — must come after list
GET /categories
GET /company
GET /company/sync
# UTILITY — keep these last
GET /reset
GET /company/reset
```

**Why `GET /products/{id}` is positioned after `GET /products`:** FastAPI matches
routes top to bottom. If the detail route were registered first, a request to
`GET /products` could conceivably match — though in practice FastAPI resolves
the literal `/products` before the path parameter. Placing list before detail
is the conventional and unambiguous ordering.

---

## MRP Contract Alignment

| Concern | Detail |
|---------|--------|
| Response shape | `{ "data": { ...ProductItem } }` matches MRP single-product envelope |
| 404 body | `{ "code": 404, "message": "Product not found", "detail": "..." }` |
| 500 body | `{ "code": 500, "message": "Internal server error", "detail": "..." }` |
| Tenant isolation | `tenant_id` filter on DB query — same guard as list endpoint |
| Auth | `get_demo_tenant_id` dependency — hardcoded `tenant-001` in demo mode |

---

## Verification Checklist

- [x] `GET /demo/v1/products/{valid_id}` returns `200` with `{ "data": { ...ProductItem } }`
- [x] `GET /demo/v1/products/{invalid_id}` returns `404` with `ErrorResponse`
- [x] `GET /demo/v1/products` list endpoint unchanged
- [x] Route order is correct — list before detail
- [x] Swagger at `/demo/docs` shows the new endpoint

---

## What Is NOT in Scope

- `POST`, `PUT`, `DELETE` product endpoints
- `GET /demo/v1/categories/{id}`
- Real Postgres / MRP httpx integration
- JWT auth
- Changes to category, company, or any unrelated files
