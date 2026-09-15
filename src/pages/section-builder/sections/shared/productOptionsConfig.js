/**
 * @module section-builder/sections/shared/productOptionsConfig
 * @description Visual-only product option groups (Size/Color-style chips)
 * for `product_detail`. PRESENTATION ONLY — selecting a value here never
 * changes price, stock, id, or image; there is no per-variant inventory in
 * this codebase. Sourced from a small per-theme config object
 * (`theme.pdpOptions.groups`, set in state/siteTemplates.js for templates
 * that want them — see the 'clothing'/Xinear theme for an example) rather
 * than the normalized product shape (`productSource.js`), so RFQ/Shop and
 * any other consumer of `resolveStorefrontProducts` are completely
 * unaffected. A theme that sets nothing here renders no selector at all.
 */
export function resolvePdpOptionGroups(theme) {
  const groups = theme?.pdpOptions?.groups;
  if (!Array.isArray(groups)) return [];
  return groups.filter((g) => g && typeof g.id === 'string' && Array.isArray(g.values) && g.values.length > 0);
}
