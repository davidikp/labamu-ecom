/**
 * @module section-builder/sections/shared/imageAspectRatio
 * @description Shared image aspect-ratio control for sections that render a
 * single fixed image box per item (product/collection cards, image-with-text,
 * gallery grid). Masonry-layout galleries intentionally don't use this — a
 * fixed ratio would defeat the point of masonry's variable-height columns.
 */
export const IMAGE_ASPECT_RATIO_FIELD = {
  image_aspect_ratio: {
    type: 'select', label: 'Image aspect ratio', default: 'square', group: 'layout',
    options: [
      { value: 'square', label: 'Square (1:1)' },
      { value: 'portrait', label: 'Portrait (3:4)' },
      { value: 'landscape', label: 'Landscape (4:3)' },
      { value: 'wide', label: 'Wide (16:9)' },
    ],
  },
};

export const ASPECT_RATIO_CLASS = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-video',
};
