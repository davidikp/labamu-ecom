import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** US-11.H1 — Contact Form. Heading/subtext/fields are now blocks (see blockConfig). */
export const schema = {
  reply_to_email: { type: 'text', label: 'Send replies to', default: '', helpText: 'Defaults to your store owner email once onboarding is wired up.', group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { allowed: ['heading', 'text', 'form_field'], presets: ['form_field', 'form_field', 'form_field'], max: 12 };
