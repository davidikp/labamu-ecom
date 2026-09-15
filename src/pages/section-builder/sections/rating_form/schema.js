import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Rating & Review Form — a small, single-purpose "leave a rating" sub-form
 * (e.g. below a Testimonials section), fixed field set like cart_summary
 * rather than a generic block canvas. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 140, default: 'Leave us your thoughts on how do you like our products.', group: 'content' },
  name_field_label: { type: 'text', label: 'Name field label', maxLength: 40, default: 'Name', group: 'content' },
  message_field_label: { type: 'text', label: 'Message field label', maxLength: 40, default: 'Message', group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 40, default: 'Give Rating', group: 'content' },
  // 'stacked': the original single-column form — unchanged default.
  // 'inline': Name / Review / Rating side-by-side on desktop, stacking to
  // one column on mobile — the exact field geometry/column ratio for this
  // layout comes from the theme's internal form recipe (see
  // shared/formRecipes.js), not merchant-facing fields.
  layout: {
    type: 'select', label: 'Layout', default: 'stacked', group: 'layout',
    options: [{ value: 'stacked', label: 'Stacked' }, { value: 'inline', label: 'Inline (3-column)' }],
  },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
