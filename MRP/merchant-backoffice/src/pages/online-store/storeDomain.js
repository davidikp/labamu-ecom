/**
 * @module online-store/storeDomain
 * @description The store's real public-facing domain — `<company_slug>.labamu.co.id`,
 * built from the company's real `slug` (see services/companyService.js /
 * contexts/CompanyContext.jsx), not the old `<storeId>.myshopify.com`
 * placeholder ThemeGallery.jsx/StorePreferences.jsx previously hardcoded
 * (there was no real domain field wired in anywhere at the time). Call with
 * `useCompany().companyData` — falls back to a generic label while company
 * data is still loading or unavailable, so callers never have to null-check
 * before building a URL.
 */
export function storeDomainFor(companyData) {
  return `${companyData?.slug || 'store'}.labamu.co.id`;
}
