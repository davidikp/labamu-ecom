import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** US-11.B1 — Hero Banner. Content (heading/subtext/button) is now blocks. */
export const schema = {
  background_image: { type: 'image', label: 'Background image', helpText: 'Recommended: 1440x640px. Slide 1 of the carousel.', group: 'media' },
  extra_slides: {
    type: 'repeater', label: 'Additional slides', helpText: 'Each one adds another slide to the carousel.', group: 'media',
    maxItems: 4,
    itemSchema: { image: { type: 'image', label: 'Image' } },
  },
  // 'background': full-bleed photo with content overlaid — the original,
  // still-default look, unchanged for every existing saved section.
  // 'split_panel': a framed two-panel card (content | image) blended into
  // the theme's surface color — a reusable composition (not Houzez-named),
  // any theme can opt into it. See Renderer.jsx's SplitPanelHero.
  layout_variant: {
    type: 'select', label: 'Layout', default: 'background', group: 'layout',
    options: [{ value: 'background', label: 'Full-bleed background' }, { value: 'split_panel', label: 'Split panel' }],
  },
  text_alignment: {
    type: 'select', label: 'Text alignment', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }],
  },
  content_position: {
    type: 'select', label: 'Content position', default: 'center', group: 'layout',
    options: [{ value: 'top', label: 'Top' }, { value: 'center', label: 'Center' }, { value: 'bottom', label: 'Bottom' }],
  },
  // 'dark': a flat black scrim — the original (and still default) behavior,
  // unchanged for every existing saved section. 'theme': a directional wash
  // in the theme's primary color, for a branded CTA over a photo (the
  // golden-reference Appointment banner; reusable by any theme, not a
  // Houzez-only gradient). 'none': no overlay at all.
  overlay_style: {
    type: 'select', label: 'Overlay style', default: 'dark', group: 'layout',
    options: [{ value: 'none', label: 'None' }, { value: 'dark', label: 'Dark' }, { value: 'theme', label: "Theme color" }],
  },
  overlay_opacity: { type: 'range', label: 'Image overlay opacity', min: 0, max: 100, step: 5, default: 0, unit: '%', group: 'layout' },
  min_height: { type: 'range', label: 'Min section height', min: 300, max: 800, step: 50, default: 500, unit: 'px', group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'surface' },
};

export const blockConfig = {
  allowed: ['heading', 'subheading', 'text', 'button', 'image', 'group'],
  presets: ['heading', 'subheading', 'button'],
  max: 8,
};
