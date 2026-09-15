import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** US-11.H1 — Contact Form. Heading/subtext/fields are now blocks (see blockConfig). */
export const schema = {
  reply_to_email: { type: 'text', label: 'Send replies to', default: '', helpText: 'Defaults to your store owner email once onboarding is wired up.', group: 'content' },
  // 'form_only': the original single-column form — unchanged default.
  // 'split': form beside a showroom/brand photo — the exact column ratio
  // and image treatment come from the layout implementation (Renderer.jsx),
  // not a merchant-facing field.
  layout: {
    type: 'select', label: 'Layout', default: 'form_only', group: 'layout',
    options: [{ value: 'form_only', label: 'Form only' }, { value: 'split', label: 'Split with image' }],
  },
  image: { type: 'image', label: 'Image', helpText: 'Shown beside the form when layout is "Split with image".', group: 'media' },
  // 'right' (image after the form) is the original layout — unchanged
  // default, matches Houzez's reference composition. 'left' matches
  // Xinear's reference (photo first, form second).
  image_position: {
    type: 'select', label: 'Image position', default: 'right', group: 'layout',
    dependsOn: { field: 'layout', equals: 'split' },
    options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }],
  },
  // Falls back to the shared sectionBuilder:sections.contactForm.sendButton
  // translation ("Send") when unset — unchanged default for every existing
  // section. A per-section override lets a theme like Xinear's reference
  // ("Send Message") differ without changing that shared string globally.
  button_label: { type: 'text', label: 'Button label', maxLength: 40, default: '', group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { allowed: ['heading', 'text', 'form_field'], presets: ['form_field', 'form_field', 'form_field'], max: 12 };
