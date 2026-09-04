/**
 * @module section-builder/sections/themePresets
 * @description The 4 MVP theme presets (US-5.5). Each fully replaces
 * `theme.colors` and `theme.typography` — never fonts+colors partially, and
 * never buttons/layout/product_cards or section content.
 */
export const THEME_PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    typography: { heading_font: 'Inter', body_font: 'Inter', heading_size: 'small', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
    colors: {
      background: '#ffffff', surface: '#f7f7f7', primary: '#111111', primary_text: '#ffffff',
      accent: '#111111', accent_text: '#ffffff', text_primary: '#111111', text_secondary: '#6b6b6b', border: '#e5e5e5',
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    typography: { heading_font: 'Space Grotesk', body_font: 'DM Sans', heading_size: 'large', body_size: 'medium', letter_spacing: 'tight', heading_transform: 'uppercase' },
    colors: {
      background: '#0d0d0d', surface: '#1a1a1a', primary: '#f5f5f5', primary_text: '#0d0d0d',
      accent: '#ff3b30', accent_text: '#ffffff', text_primary: '#f5f5f5', text_secondary: '#a3a3a3', border: '#2e2e2e',
    },
  },
  {
    id: 'earthy',
    name: 'Earthy',
    typography: { heading_font: 'Cormorant Garamond', body_font: 'Lora', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
    colors: {
      background: '#faf6f0', surface: '#f0e8dc', primary: '#6b4f3b', primary_text: '#ffffff',
      accent: '#b5651d', accent_text: '#ffffff', text_primary: '#3a2e22', text_secondary: '#7a6a58', border: '#e0d3bf',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    typography: { heading_font: 'Montserrat', body_font: 'Nunito', heading_size: 'medium', body_size: 'medium', letter_spacing: 'wide', heading_transform: 'none' },
    colors: {
      background: '#ffffff', surface: '#eef2f7', primary: '#1f2a44', primary_text: '#ffffff',
      accent: '#3d6bff', accent_text: '#ffffff', text_primary: '#1a1a1a', text_secondary: '#5c6470', border: '#dbe1ea',
    },
  },
];

export function presetById(id) {
  return THEME_PRESETS.find((p) => p.id === id) ?? null;
}
