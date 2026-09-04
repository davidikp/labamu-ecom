import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/**
 * Order Detail — order info card, payment card with countdown, customer
 * detail, itemized table, and totals breakdown (Xinear's Detail Order page).
 */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 60, default: 'Order Detail', group: 'content' },
  show_payment_countdown: { type: 'boolean', label: 'Show payment countdown', default: true, group: 'layout' },
  tax_rate_percent: { type: 'number', label: 'Tax rate (%)', default: 11, group: 'content' },
  demo_point_used: { type: 'number', label: 'Demo points used', default: 0, group: 'content' },
  demo_point_redeemed: { type: 'number', label: 'Demo points redeemed', default: 0, group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
