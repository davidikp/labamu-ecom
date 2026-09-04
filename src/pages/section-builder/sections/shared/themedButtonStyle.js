/**
 * @module section-builder/sections/shared/themedButtonStyle
 * @description Maps theme.buttons (US-5.3) to inline CSS for canvas/preview
 * rendering — sections never hardcode button styling, they inherit it.
 */
const LETTER_SPACING = { normal: '0', wide: '0.08em', wider: '0.15em' };

export function themedButtonStyle(buttons, { variant = 'filled', primary = '#1a1a1a', primaryText = '#ffffff' } = {}) {
  const base = {
    borderRadius: `${buttons.corner_radius}px`,
    paddingLeft: `${buttons.padding_horizontal}px`,
    paddingRight: `${buttons.padding_horizontal}px`,
    paddingTop: `${buttons.padding_vertical}px`,
    paddingBottom: `${buttons.padding_vertical}px`,
    fontWeight: buttons.font_weight,
    textTransform: buttons.text_transform,
    letterSpacing: LETTER_SPACING[buttons.letter_spacing] ?? '0',
    borderWidth: `${buttons.border_width}px`,
    borderStyle: 'solid',
    borderColor: primary,
    display: 'inline-block',
    lineHeight: 1.2,
  };

  if (variant === 'outline') {
    return { ...base, backgroundColor: 'transparent', color: primary, borderWidth: `${Math.max(buttons.border_width, 1)}px` };
  }
  if (variant === 'text') {
    return { ...base, backgroundColor: 'transparent', color: primary, borderWidth: 0, paddingLeft: 0, paddingRight: 0 };
  }
  return { ...base, backgroundColor: primary, color: primaryText };
}
