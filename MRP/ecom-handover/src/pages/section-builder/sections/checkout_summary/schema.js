import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Checkout Summary — order total plus placeholder shipping/payment fields. There's no payment backend yet (see publishChecks.js), so the fields here are visual-only and the submit button is a no-op. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 60, default: 'Checkout', group: 'content' },
  show_order_summary: { type: 'boolean', label: 'Show order summary', default: true, group: 'layout' },
  show_shipping_fields: { type: 'boolean', label: 'Show shipping fields', default: true, group: 'layout' },
  show_payment_fields: { type: 'boolean', label: 'Show payment fields', default: true, group: 'layout' },
  button_label: { type: 'text', label: 'Submit button label', maxLength: 40, default: 'Place order', group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
