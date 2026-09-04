import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Promotional Banner — inline banner for a promotion, shipping offer, or policy. Content is now blocks. */
export const schema = {
  // Simplification: no icon-picker component exists yet — same emoji-text
  // pattern as brand_values/schema.js's icon field.
  icon: { type: 'text', label: 'Icon (emoji, optional)', maxLength: 4, default: '', group: 'layout' },
  layout: {
    type: 'select', label: 'Layout', default: 'centered', group: 'layout',
    options: [{ value: 'centered', label: 'Centered' }, { value: 'side_by_side', label: 'Text + button side by side' }],
  },
  show_dismiss_button: { type: 'boolean', label: 'Show dismiss button', default: false, group: 'layout' },
  enable_scheduling: { type: 'boolean', label: 'Show only during a scheduled window', default: false, group: 'content' },
  // Simplification: no real datetime-picker field type exists yet — plain
  // text holding an ISO 8601 string, same pattern as countdown_timer's
  // end_datetime. Empty = no bound on that side of the window.
  schedule_start: { type: 'text', label: 'Start (ISO, e.g. 2026-12-01T00:00:00)', default: '', group: 'content', dependsOn: { field: 'enable_scheduling', equals: true } },
  schedule_end: { type: 'text', label: 'End (ISO, e.g. 2026-12-31T23:59:00)', default: '', group: 'content', dependsOn: { field: 'enable_scheduling', equals: true } },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'accent' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 16 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 16 },
};

export const blockConfig = { max: 6, allowed: ['heading', 'text', 'button', 'group'], presets: ['heading', 'button'] };
