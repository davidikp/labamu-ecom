import { SECTION_CHROME_FIELDS_WIDTH_ONLY } from '../shared/sectionChrome';

/** US-11.H4 — Divider / Spacer. */
export const schema = {
  type_variant: {
    type: 'select', label: 'Type', default: 'spacer', group: 'layout',
    options: [{ value: 'spacer', label: 'Spacer' }, { value: 'divider', label: 'Divider' }],
  },
  height: { type: 'range', label: 'Height', min: 8, max: 120, step: 4, default: 40, unit: 'px', group: 'layout', dependsOn: { field: 'type_variant', equals: 'spacer' } },
  divider_style: {
    type: 'select', label: 'Divider style', default: 'solid', group: 'layout',
    options: [{ value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }],
    dependsOn: { field: 'type_variant', equals: 'divider' },
  },
  divider_color: { type: 'color', label: 'Divider color', default: { slot: 'border' }, group: 'color', dependsOn: { field: 'type_variant', equals: 'divider' } },
  ...SECTION_CHROME_FIELDS_WIDTH_ONLY,
};
