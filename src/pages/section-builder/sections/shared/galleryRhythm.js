/**
 * @module section-builder/sections/shared/galleryRhythm
 * @description Deterministic full-width / two-column gallery grouping shared
 * by editorial_collection_detail/Renderer.jsx (and any future section that
 * wants the same editorial rhythm) — index 0 full width, indexes 1–2 a pair,
 * index 3 full width, indexes 4–5 a pair, and so on. No per-collection
 * configuration: the rhythm is derived purely from array position, so it
 * stays consistent across every collection's gallery, whatever length it
 * happens to have. A trailing odd image (no partner left for what would be a
 * pair row) renders full width instead of leaving a blank column.
 *
 * Kept out of Renderer.jsx (a component-only file, so react-refresh can
 * treat it as a Fast Refresh boundary) rather than exported alongside the
 * default component export.
 */
export function groupGalleryRows(images) {
  const rows = [];
  let i = 0;
  let wantsFullRow = true; // the gallery always opens with a full-width row
  let pairIndex = 0;
  while (i < images.length) {
    if (wantsFullRow || i + 1 >= images.length) {
      // Also used for a trailing odd image that has no partner left for a
      // pair row — never a half-empty two-column row.
      rows.push({ type: 'full', items: [images[i]] });
      i += 1;
    } else {
      // `pairIndex` lets a renderer alternate pair-row composition (e.g.
      // which side is portrait) without needing a mutable counter of its
      // own during render.
      rows.push({ type: 'pair', items: [images[i], images[i + 1]], pairIndex });
      pairIndex += 1;
      i += 2;
    }
    wantsFullRow = !wantsFullRow;
  }
  return rows;
}
