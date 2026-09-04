/**
 * @module section-builder/mocks/registerBuilderMocks
 * @description Registers mock catalog endpoints for the section builder via
 * the existing api/client.js mock registry, gated by VITE_USE_MOCK_API — no
 * backend for store/page/theme/product exists yet (see implementation plan's
 * "frontend only" decision). Call once, e.g. from SectionBuilder's module scope.
 */
import { registerMock } from '../../../api/client';
import catalog from './catalog.json';

let registered = false;

export function registerBuilderMocks() {
  if (registered) return;
  registered = true;

  registerMock('GET', '/storefront/products', () => ({ data: catalog.products }));
  registerMock('GET', '/storefront/collections', () => ({ data: catalog.collections }));
  registerMock('GET', '/storefront/collections/:id', (params) => ({
    data: catalog.collections.find((c) => c.id === params.id) ?? null,
  }));
  registerMock('GET', '/storefront/customers', () => ({ data: catalog.customers }));
}
