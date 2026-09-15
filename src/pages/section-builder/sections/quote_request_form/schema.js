import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Request a Quote Form — a specific, opinionated form layout (Name, Email +
 * Phone, Message, Submit) for quote requests, distinct in purpose/wording
 * from the generic contact_form. Fixed field set, not a generic block canvas. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 100, default: 'Request a Quote', group: 'content' },
  subtext: { type: 'text', label: 'Subtext', maxLength: 200, default: 'Need a custom tailored clothing for special events? Just let us know what you need!', group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 40, default: 'Request a Quote', group: 'content' },
  // Optional full-bleed photo banner treatment (golden reference's RFQ CTA:
  // a construction photo with a dark scrim, centered white heading/subtext,
  // and the CTA button — no visible form fields, matching `modal_trigger`)
  // — absent by default, so every existing section renders exactly as
  // before (plain heading/subtext/form on a normal background).
  background_image: { type: 'image', label: 'Background image (optional)', group: 'media' },
  min_height: { type: 'range', label: 'Min section height', min: 300, max: 800, step: 50, default: 500, unit: 'px', group: 'layout' },
  // 'simple' is the original flat Name/Email/Phone/Message preview (kept as
  // the default so existing sections/templates render unchanged). 'detailed'
  // is a structured, multi-line-item RFQ request (customer info + product
  // line items + attachments + notes). Both layouts are a static/disabled
  // preview in the interactive BUILDER canvas (same convention as every
  // other form section) but genuinely functional on the published
  // storefront — real add/remove line items, real 5MB file validation, and
  // real submission through services/rfqService.js's existing `submitRfq`
  // (already wired to api/client.js's mock-or-real POST /rfq).
  layout: {
    type: 'select', label: 'Layout', default: 'simple', group: 'layout',
    options: [{ value: 'simple', label: 'Simple form' }, { value: 'detailed', label: 'Detailed request (line items, attachments)' }],
  },
  // 'inline' (default) renders the form directly in the section — original
  // behavior, unchanged for every existing saved section. 'modal_trigger'
  // renders only a CTA button in-flow; the full form (always the detailed
  // field set, regardless of `layout`) opens in a dialog on click — matching
  // the golden Houzez reference's CTA-opens-RFQ-dialog experience. See
  // Renderer.jsx's RfqModalFlow. Builder canvas: the CTA renders inert
  // (click selects the section, same convention as header/footer links)
  // rather than opening the dialog, so editing stays uninterrupted.
  presentation: {
    type: 'select', label: 'Presentation', default: 'inline', group: 'layout',
    options: [{ value: 'inline', label: 'Inline form' }, { value: 'modal_trigger', label: 'Button opens a dialog' }],
  },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
