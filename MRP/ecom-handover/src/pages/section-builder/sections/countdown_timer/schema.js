import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Countdown Timer — live countdown to a deadline or sale end. Heading/subtext are now blocks. */
export const schema = {
  show_button: { type: 'boolean', label: 'Show button', default: false, group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 100, default: 'Shop the sale', group: 'content', dependsOn: { field: 'show_button', equals: true } },
  button_url: { type: 'text', label: 'Button URL', default: '', group: 'content', dependsOn: { field: 'show_button', equals: true } },
  // Simplification: no datetime field component exists yet — plain text
  // holding an ISO 8601 string (e.g. 2026-12-31T23:59:00), parsed with
  // Date.parse in the Renderer/countdownMath.
  end_datetime: { type: 'text', label: 'End date and time (ISO, e.g. 2026-12-31T23:59:00)', default: '', group: 'content' },
  // Without this, "end_datetime" was parsed in each *viewer's* own browser
  // timezone, so the countdown expired at a different real moment for every
  // customer. This pins it to one actual instant for everyone.
  timezone: {
    type: 'select', label: 'Timezone', default: 'UTC', group: 'content',
    options: [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
      { value: 'America/Denver', label: 'Mountain Time (US)' },
      { value: 'America/Chicago', label: 'Central Time (US)' },
      { value: 'America/New_York', label: 'Eastern Time (US)' },
      { value: 'Europe/London', label: 'London' },
      { value: 'Europe/Paris', label: 'Paris' },
      { value: 'Asia/Jakarta', label: 'Jakarta' },
      { value: 'Asia/Singapore', label: 'Singapore' },
      { value: 'Asia/Tokyo', label: 'Tokyo' },
      { value: 'Australia/Sydney', label: 'Sydney' },
    ],
  },
  action_when_expired: {
    type: 'select', label: 'Action when expired', default: 'hide', group: 'layout',
    options: [
      { value: 'hide', label: 'Hide section' },
      { value: 'show_message', label: 'Show "Sale ended" message' },
    ],
  },
  custom_expired_message: { type: 'text', label: 'Custom expired message', maxLength: 400, default: 'Sale ended', group: 'layout', dependsOn: { field: 'action_when_expired', equals: 'show_message' } },
  show_days: { type: 'boolean', label: 'Show days', default: true, group: 'layout' },
  show_hours: { type: 'boolean', label: 'Show hours', default: true, group: 'layout' },
  show_minutes: { type: 'boolean', label: 'Show minutes', default: true, group: 'layout' },
  show_seconds: { type: 'boolean', label: 'Show seconds', default: true, group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'accent' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 32 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 32 },
};

export const blockConfig = { max: 4, allowed: ['heading', 'subheading', 'group'], presets: ['heading'] };
