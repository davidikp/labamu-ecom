import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Request a Quote Form — a specific, opinionated form layout (Name, Email +
 * Phone, Message, Submit) for quote requests, distinct in purpose/wording
 * from the generic contact_form. Fixed field set, not a generic block canvas. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 100, default: 'Request a Quote', group: 'content' },
  subtext: { type: 'text', label: 'Subtext', maxLength: 200, default: 'Need a custom tailored clothing for special events? Just let us know what you need!', group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 40, default: 'Request a Quote', group: 'content' },
  // 'simple' is the original flat Name/Email/Phone/Message preview (kept as
  // the default so existing sections/templates render unchanged). 'detailed'
  // is a static preview of a structured, multi-line-item RFQ request (real
  // customer info + product line items + attachments + notes) — visual
  // only, like every other form in this section-builder: nothing here
  // opens/submits for real yet. A working modal (open/close, add/remove
  // line items, real submission) is tracked as a follow-up, once there's a
  // backend module to store the submitted RFQ against.
  layout: {
    type: 'select', label: 'Layout', default: 'simple', group: 'layout',
    options: [{ value: 'simple', label: 'Simple form' }, { value: 'detailed', label: 'Detailed request (line items, attachments)' }],
  },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
