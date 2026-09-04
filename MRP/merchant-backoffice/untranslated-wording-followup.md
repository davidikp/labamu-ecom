# Untranslated Wording Follow-up — Catalog, Delivery Settings, Orders

Second pass, scoped to the Catalog, Delivery Settings, and Orders modules — checking for anything left over after the earlier i18n wiring pass, plus a check for **untranslated keys** (a `t()` call exists, but the Indonesian value in `id/*.json` is byte-identical to the English value in `en/*.json`, which isn't just a proper noun).

Legend:
- **Not wired** — a raw hardcoded English literal, no `t()` call at all.
- **Untranslated key** — already wired to `t()`, but the `id` locale value equals the `en` value (a real translation gap, not just missing wiring).
- **Intentional** — byte-identical value is a proper noun/brand/technical term that's fine to leave as-is.

No code was changed for this review — findings only.

---

## Catalog (7)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Failed to load products | CatalogProducts.jsx:165 | Not wired |
| 2 | "Connected" (in `` `${modifierCount} Connected` ``) | ProductDetail.jsx:127 | Not wired |
| 3 | Unit | catalog.json `common.unit` | Untranslated key |
| 4 | Total | catalog.json `common.total` | Untranslated key |
| 5 | Volume | catalog.json `common.volumeLabel` | Untranslated key |
| 6 | Modifier | catalog.json `products.modifierLabel` | Untranslated key |
| 7 | SKU | catalog.json `packages.sku` | Untranslated key |

*(CatalogSettings.jsx, BulkEditCatalog.jsx, PackageList.jsx, PackageDetail.jsx, DeliveryCards.jsx, ImagePlaceholder.jsx — clean, no remaining gaps.)*

---

## Delivery Settings (8 + 2 flagged for confirmation)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Select at least one option | DeliverySettings.jsx:122, 591 | Not wired — `purchasability.selectAtLeastOne` key missing entirely from delivery.json |
| 2 | Loading... | DeliverySettings.jsx:235 | Not wired — `pickupInfo.zipLoading` key missing |
| 3 | Your address is outside the courier's coverage area. Please use a different delivery address. | DeliverySettings.jsx:401 | Not wired — `courier.outOfCoverage` key missing |
| 4 | No Delivery Service Connected | DeliverySettings.jsx:665 | Not wired — `noCourierModal.title` key missing |
| 5 | Delivery is enabled, but no delivery service is connected. If you continue, the Delivery option will be turned off automatically. You can connect a delivery service and enable it again anytime. | DeliverySettings.jsx:666 | Not wired — `noCourierModal.description` key missing |
| 6 | Cancel | DeliverySettings.jsx:667 | Not wired — `noCourierModal.cancel` key missing |
| 7 | Continue | DeliverySettings.jsx:668 | Not wired — `noCourierModal.continue` key missing |

**Byte-identical en/id values (proper nouns — likely fine, listed for completeness):**
| # | English | Location | Status |
|---|---|---|---|
| 8 | Lalamove | `courier.lalamoveName` | Intentional (brand name) |
| 9 | Lalamove Partner Portal | `courier.stepByStep.step1.item1LinkText` | Intentional (product name) |
| 10 | Lalamove Business Account | `courier.prerequisites.item1LinkText` | Intentional (product name) |
| 11 | API Key | `courier.apiKey` | Flag for confirmation — technical term, commonly left untranslated but worth a product/localization call |
| 12 | API Secret | `courier.apiSecret` | Flag for confirmation — same as above |

*(deliverySettingsStorage.js and StaticMapPreview.jsx — clean.)*

Note: findings 1–7 above are all in code paths that call `t('delivery:key', 'English fallback text')` — the key doesn't exist in either locale file yet, so it silently falls back to the hardcoded English default at runtime in **both** languages. This is the same "invisible gap" pattern as before, just one level removed (the t() call exists, but points at nothing).

---

## Orders (27)

This module has partial i18n coverage already (`orders` namespace exists, some strings wired) — these are the gaps.

| # | English | Location | Status |
|---|---|---|---|
| 1 | Last 30 Days / Last 14 Days / Last 7 Days / Today (date filter options) | OrderList.jsx:8-11 | Not wired |
| 2 | Delivery / Pick-Up (filter option labels) | OrderList.jsx:15-16 | Not wired |
| 3 | In Progress / Completed / Cancelled (status filter options) | OrderList.jsx:20-22 | Not wired |
| 4 | "{val} Items" | OrderList.jsx:93 | Not wired |
| 5 | Pick-Up / Delivery (table cell render) | OrderList.jsx:104 | Not wired |
| 6 | Now (button text) | PlaceOrderModal.jsx:150 | Not wired |
| 7 | Now (fallback display text) | PlaceOrderModal.jsx:191 | Not wired |
| 8 | Select Vehicle (placeholder + closed-state label) | PlaceOrderModal.jsx:241, 245 | Not wired |
| 9 | No vehicles found | PlaceOrderModal.jsx:268 | Not wired |
| 10 | Select Method (closed-state label) | PlaceOrderModal.jsx:302 | Not wired |
| 11 | Order in Process / Waiting for Pickup / On Delivery / Order Delivered (delivery step labels) | orderService.js:8 | Not wired — rendered directly as Stepper labels in OrderDetail.jsx |
| 12 | Waiting to be Collected / Order Collected (pickup step labels) | orderService.js:9 | Not wired |
| 13 | Motorcycle / Sedan / etc. — vehicle type names, dimensions, and descriptions (VEHICLE_TYPES) | orderService.js:234-246 | Not wired — rendered directly in the vehicle-select dropdown, a whole untranslated catalog |
| 14 | Wallet / "IDR 0" (PAYMENT_METHODS) | orderService.js:230 | Not wired |
| 15 | Service add-on labels: "Lift and carry assistance (door-to-door)", "Extra waiting time (exceeding to 1hr)", "Round trip", "Fragile handling", "Help to buy (shopping assistance)", "Cash on delivery", "Thermal bag", "Frozen truck", "Extra length (1 meter)", "Extra length (2 meters)" | orderService.js:252-266 | Not wired / needs verification — `OrderDetail.jsx` calls `t(\`orders:placeOrder.services.${key}\`)` elsewhere, but these `label` fields on the data objects themselves look like unused or fallback duplicates; worth confirming whether any code path actually renders the raw `label` field instead of the translated key |
| 16 | Toll Fee (Intra City) / Toll to Bandung / Toll to Cirebon | orderService.js:270-272 | Not wired / same verification caveat as above |
| 17 | Delivery | orders.json `list.delivery` | Untranslated key |
| 18 | Pick-Up | orders.json `list.pickup` | Untranslated key |
| 19 | Total | orders.json `list.columns.total` | Untranslated key |
| 20 | AWB | orders.json `detail.awb` | Untranslated key |
| 21 | Subtotal | orders.json `detail.subtotal` | Untranslated key |
| 22 | PB1 (10%) | orders.json `detail.pb1` | Untranslated key |
| 23 | Total | orders.json `detail.total` | Untranslated key |

*(OrderDetail.jsx — clean on its own; its remaining gaps come from the `orderService.js` data source it renders.)*

---

## Summary

| Module | Not wired | Untranslated key | Intentional/flag |
|---|---|---|---|
| Catalog | 2 | 5 | 0 |
| Delivery Settings | 7 | 0 | 5 |
| Orders | 16 | 7 | 0 |
| **Total** | **25** | **12** | **5** |

## Notes
- The **Delivery Settings** gaps are all `t()` calls pointing at keys that don't exist yet — an easy, low-risk fix (just add the missing keys to `delivery.json`, no JSX changes needed).
- The **Orders** module's `orderService.js` constants (vehicle types, payment methods, toll/service add-ons) are the biggest remaining gap — a full untranslated data catalog rendered directly in dropdowns and fee breakdowns, not just isolated strings.
- The **Catalog** "Untranslated key" rows (Unit, Total, Volume, Modifier, SKU) are single common words — quick to fix, but double-check each isn't intentionally identical (e.g. "SKU" is often left untranslated as an acronym; the others look like genuine oversights).
- `API Key` / `API Secret` in Delivery Settings are flagged, not counted as confirmed gaps — recommend a quick check with whoever owns the copy deck before touching them.
