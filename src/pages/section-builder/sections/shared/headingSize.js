/**
 * @module section-builder/sections/shared/headingSize
 * @description Section-level heading-size control for sections whose heading
 * is a section's own hardcoded field (not the shared `heading` BLOCK type,
 * which already has its own per-instance `size` field in blocks/registry.js —
 * those sections don't need this).
 */
export const HEADING_SIZE_FIELD = {
  heading_size: {
    type: 'select', label: 'Heading size', default: 'medium', group: 'content',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      // A step above 'large': bold, editorial display type — for a section
      // heading meant to anchor a page area (e.g. Houzez's Testimonials
      // heading), not a routine section label. Reusable by any section/
      // theme; 'large' itself is untouched, so nothing that already uses it
      // is affected by adding this option.
      { value: 'display', label: 'Display' },
    ],
  },
};

export const HEADING_SIZE_CLASS = { small: 'text-lg', medium: 'text-xl', large: 'text-3xl' };

// 'display' needs a heavier weight/tighter line-height than the shared
// `font-semibold` + HEADING_SIZE_CLASS idiom other sections compose
// (category_grid/featured_products/product_carousel keep using that
// idiom unchanged) — so it's a standalone class string a section swaps in
// wholesale, not a size-only fragment meant to combine with `font-semibold`.
export const DISPLAY_HEADING_CLASS = 'text-[28px] font-extrabold leading-tight';
