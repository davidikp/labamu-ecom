import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** US-11.D2 — Rich Text. Content is now blocks. */
export const schema = {
  content_width: {
    type: 'select', label: 'Content width', default: '680', group: 'layout',
    options: [
      { value: '680', label: 'Narrow 680px' },
      { value: '860', label: 'Standard 860px' },
      { value: '1200', label: 'Wide 1200px' },
    ],
  },
  text_alignment: {
    type: 'select', label: 'Text alignment', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
  },
  ...SECTION_CHROME_FIELDS,
};

export const blockConfig = {
  allowed: ['heading', 'text', 'button', 'group'],
  presets: ['heading', 'text'],
  max: 6,
};
