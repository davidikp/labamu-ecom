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
    options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }],
  },
};

export const HEADING_SIZE_CLASS = { small: 'text-lg', medium: 'text-xl', large: 'text-3xl' };
