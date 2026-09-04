import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Cart Summary — line items from the mock catalog, subtotal, and a checkout button. Cart/checkout have no real backend yet, so line items are always the same demo products. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 60, default: 'Your cart', group: 'content' },
  empty_state_message: { type: 'text', label: 'Empty cart message', maxLength: 120, default: "Your cart is empty.", group: 'content' },
  show_subtotal: { type: 'boolean', label: 'Show subtotal', default: true, group: 'layout' },
  button_label: { type: 'text', label: 'Checkout button label', maxLength: 40, default: 'Checkout', group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
