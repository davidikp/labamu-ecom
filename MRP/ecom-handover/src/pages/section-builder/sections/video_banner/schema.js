import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Video Banner — full-width video section with optional text overlay.
 *  Content (heading/subtext/button) is now blocks. */
export const schema = {
  video_source: {
    type: 'select', label: 'Video source', default: 'upload', group: 'media',
    options: [
      { value: 'upload', label: 'Upload' },
      { value: 'youtube', label: 'YouTube URL' },
      { value: 'vimeo', label: 'Vimeo URL' },
    ],
  },
  video_file: { type: 'image', label: 'Video file', helpText: 'MP4, max 50MB', group: 'media', dependsOn: { field: 'video_source', equals: 'upload' } },
  external_video_url: { type: 'text', label: 'External video URL', default: '', group: 'media', dependsOn: { field: 'video_source', equals: ['youtube', 'vimeo'] } },
  poster_image: { type: 'image', label: 'Poster image', helpText: 'Recommended: 1440x640px', group: 'media' },
  text_overlay: { type: 'boolean', label: 'Text overlay', default: true, group: 'layout' },
  text_position: {
    type: 'select', label: 'Text position', default: 'center', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }],
  },
  overlay_opacity: { type: 'range', label: 'Overlay opacity', min: 0, max: 80, step: 5, default: 40, unit: '%', group: 'layout' },
  section_height: { type: 'range', label: 'Section height', min: 300, max: 800, step: 50, default: 560, unit: 'px', group: 'layout' },
  ...SECTION_CHROME_FIELDS,
  color_scheme: { ...SECTION_CHROME_FIELDS.color_scheme, default: 'primary' },
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 64 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 64 },
};

export const blockConfig = {
  allowed: ['heading', 'subheading', 'button', 'group'],
  presets: ['heading', 'button'],
  max: 6,
};
