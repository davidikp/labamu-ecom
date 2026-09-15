/**
 * @module section-builder/sections/shared/themedButtonStyle
 * @description Maps theme.buttons (US-5.3) to inline CSS for canvas/preview
 * rendering — sections never hardcode button styling, they inherit it.
 */
import { useState } from 'react';

const LETTER_SPACING = { normal: '0', wide: '0.08em', wider: '0.15em' };

/**
 * `override`: an optional, generic geometry override — `{ paddingX,
 * paddingY, radius, fontSize, fontWeight, boxShadow, transition }`, any
 * subset. Not Houzez-specific: it's how a *semantic* button usage (e.g. a
 * hero CTA sitting in its own recipe-driven context) can resolve different
 * geometry than the theme's generic `theme.buttons` config, without the
 * caller (ButtonBlock) hardcoding any actual pixel value itself — those
 * live in the caller's own recipe (see heroRecipes.js's `ctaButton`).
 * Omitted when a context has no such recipe, so ordinary buttons are
 * unaffected.
 */
export function themedButtonStyle(buttons, { variant = 'filled', primary = '#1a1a1a', primaryText = '#ffffff', override } = {}) {
  const base = {
    borderRadius: `${buttons.corner_radius}px`,
    paddingLeft: `${buttons.padding_horizontal}px`,
    paddingRight: `${buttons.padding_horizontal}px`,
    paddingTop: `${buttons.padding_vertical}px`,
    paddingBottom: `${buttons.padding_vertical}px`,
    fontWeight: buttons.font_weight,
    // Unset (undefined) whenever `buttons.font_size` is null — the theme
    // schema's default, meaning "inherit the surrounding text size" — so
    // every existing theme keeps rendering buttons exactly as before.
    fontSize: buttons.font_size != null ? `${buttons.font_size}px` : undefined,
    textTransform: buttons.text_transform,
    letterSpacing: LETTER_SPACING[buttons.letter_spacing] ?? '0',
    borderWidth: `${buttons.border_width}px`,
    borderStyle: 'solid',
    borderColor: primary,
    display: 'inline-block',
    lineHeight: 1.2,
    transition: 'all 0.2s ease',
  };

  let style;
  if (variant === 'outline') {
    style = { ...base, backgroundColor: 'transparent', color: primary, borderWidth: `${Math.max(buttons.border_width, 1)}px` };
  } else if (variant === 'text') {
    style = { ...base, backgroundColor: 'transparent', color: primary, borderWidth: 0, paddingLeft: 0, paddingRight: 0 };
  } else if (variant === 'inverted') {
    // A CTA sitting on a photo/colored background (e.g. a hero_banner with
    // color_scheme: 'primary') needs to invert against that backdrop
    // instead of repeating it — swap fill/text so the button still reads
    // as "primary" relative to its surroundings. Reusable by any themed
    // hero/banner button, not specific to one theme.
    style = { ...base, backgroundColor: primaryText, color: primary, borderColor: primaryText };
  } else {
    style = { ...base, backgroundColor: primary, color: primaryText };
  }

  if (override) {
    style = {
      ...style,
      ...(override.paddingX != null && { paddingLeft: `${override.paddingX}px`, paddingRight: `${override.paddingX}px` }),
      ...(override.paddingY != null && { paddingTop: `${override.paddingY}px`, paddingBottom: `${override.paddingY}px` }),
      ...(override.radius != null && { borderRadius: `${override.radius}px` }),
      ...(override.fontSize != null && { fontSize: `${override.fontSize}px` }),
      ...(override.fontWeight != null && { fontWeight: override.fontWeight }),
      ...(override.boxShadow != null && { boxShadow: override.boxShadow }),
      ...(override.transition != null && { transition: override.transition }),
    };
  }

  return style;
}

/**
 * `theme.buttons.hover_effect` -> a style object to merge in on hover, on
 * top of `themedButtonStyle`'s own resting style. Was a schema field with no
 * consumer anywhere (every button rendered with zero hover feedback
 * regardless of the merchant's choice here) — this is the missing other
 * half. `restingStyle` is that resting style (so 'outline' can read back its
 * actual resting colors rather than recomputing them) and `primary` is the
 * same resolved color `themedButtonStyle` was called with.
 */
export function themedButtonHoverStyle(buttons, restingStyle, primary) {
  // `hover_color` (a design-token exact hex, e.g. Xinear's golden-reference
  // Figma Hover state, #5e5e5d) only makes sense as a flat swap for a
  // button that already rests on a solid fill — forcing it onto an
  // 'outline'/'text' variant (transparent resting background) would paint
  // in a solid fill that was never part of that variant's design, with the
  // (still-primary-colored) text now illegible against it. Those variants
  // fall back to the generic brightness filter instead, same as a theme
  // with no `hover_color` set at all.
  const canUseExactHoverColor = buttons.hover_color && restingStyle.backgroundColor && restingStyle.backgroundColor !== 'transparent';
  switch (buttons.hover_effect) {
    case 'lighten':
      return canUseExactHoverColor ? { backgroundColor: buttons.hover_color, filter: 'none' } : { filter: 'brightness(1.15)' };
    case 'outline':
      return { backgroundColor: 'transparent', color: primary, borderColor: primary, borderWidth: `${Math.max(buttons.border_width, 1)}px` };
    case 'lift':
      return { transform: 'translateY(-2px)', boxShadow: '0 6px 14px rgba(0,0,0,0.15)' };
    case 'none':
      return {};
    case 'darken':
    default:
      return canUseExactHoverColor ? { backgroundColor: buttons.hover_color, filter: 'none' } : { filter: 'brightness(0.88)' };
  }
}

/**
 * One-call hover wiring for a `themedButtonStyle` result — every button
 * caller was resolving a resting style and stopping there (see
 * `themedButtonHoverStyle`'s own doc comment: the schema field had zero
 * consumers). Returns `{ style, hoverHandlers }` — spread `hoverHandlers`
 * (`onMouseEnter`/`onMouseLeave`) onto the same element `style` goes on.
 */
export function useThemedButtonHover(buttons, restingStyle, primary) {
  const [hovered, setHovered] = useState(false);
  const style = hovered ? { ...restingStyle, ...themedButtonHoverStyle(buttons, restingStyle, primary) } : restingStyle;
  return {
    style,
    hoverHandlers: { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) },
  };
}
