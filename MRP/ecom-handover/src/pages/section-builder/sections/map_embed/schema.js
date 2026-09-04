import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Map Embed — map of the store's physical location. Heading is now a block. */
export const schema = {
  // Drives the actual map pin now (Renderer.jsx geocodes it via Google's
  // no-API-key ?q=<address>&output=embed iframe) — not just display text.
  address: { type: 'textarea', label: 'Address', maxLength: 1000, default: '', helpText: 'A full, real address — this is geocoded to place the map pin.', group: 'content' },
  show_address_text: { type: 'boolean', label: 'Show address details', default: true, group: 'content' },
  store_hours: { type: 'textarea', label: 'Store hours', maxLength: 400, default: '', group: 'content' },
  phone_number: { type: 'text', label: 'Phone number', maxLength: 100, default: '', group: 'content' },
  map_height: { type: 'range', label: 'Map height', min: 200, max: 600, step: 50, default: 400, unit: 'px', group: 'layout' },
  map_height_mobile: { type: 'range', label: 'Map height (mobile)', min: 150, max: 500, step: 50, default: 250, unit: 'px', group: 'mobile' },
  zoom_level: { type: 'range', label: 'Zoom level', min: 10, max: 18, step: 1, default: 14, group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { max: 4, allowed: ['heading', 'text'], presets: [] };
