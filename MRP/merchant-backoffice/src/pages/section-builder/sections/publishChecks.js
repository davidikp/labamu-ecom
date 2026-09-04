/**
 * @module section-builder/sections/publishChecks
 * @description US-8.2's pre-publish validation checklist. Real checks need
 * catalog/payment/domain APIs this repo doesn't have yet — each check's
 * `pass` state is a demo-only toggle the merchant flips in the drawer
 * itself (see PublishDrawer), not a real system check. TODO(backend):
 * replace with actual product-count / payment-connection / domain lookups.
 */
export const PUBLISH_CHECKS = [
  { key: 'products', label: 'At least one product exists', actionLabel: 'Add your first product' },
  { key: 'payment', label: 'A payment method is connected', actionLabel: 'Connect a payment method' },
  { key: 'domain', label: 'A domain is configured', actionLabel: 'Set up your domain' },
];

export function createInitialCheckState() {
  return Object.fromEntries(PUBLISH_CHECKS.map((c) => [c.key, false]));
}

export function allChecksPass(checkState) {
  return PUBLISH_CHECKS.every((c) => checkState[c.key]);
}
