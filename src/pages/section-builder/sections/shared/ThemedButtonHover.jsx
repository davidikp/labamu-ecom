import { useState } from 'react';

/**
 * @module section-builder/sections/shared/ThemedButtonHover
 * @description A resting-style + hover-style pair (see themedButtonStyle.js's
 * `themedButtonHoverStyle`) applied to whatever element `as` renders —
 * `span` for a static/builder preview, `button` for an interactive one.
 * Exists for call sites that render several button instances from shared
 * props (quote_request_form's multi-step flows) where each instance needs
 * its own independent hover state; a single `useThemedButtonHover` call at
 * the component's top level can't do that since it's one hook for one
 * element. Everything besides `as`/`style`/`hoverStyle` is forwarded
 * untouched (onClick, disabled, className, children, ...).
 */
export default function ThemedButtonHover({ as: As = 'span', style, hoverStyle, onMouseEnter, onMouseLeave, ...rest }) {
  const [hovered, setHovered] = useState(false);
  return (
    <As
      {...rest}
      style={hovered ? { ...style, ...hoverStyle } : style}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
    />
  );
}
