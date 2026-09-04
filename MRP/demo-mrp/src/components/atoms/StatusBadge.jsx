import React from "react";
import { StatusBadge as CeStatusBadge } from "../../ce-ui";

/**
 * StatusBadge — adapter over the ce-ui StatusBadge.
 * Preserves the legacy API: `variant` may be a color ("blue") or a soft alias
 * ("blue-light" / "grey-light"); also supports the newer color/tone API, plus
 * `label` or `children`. Extra style/props are forwarded via a wrapper span.
 */
const StatusBadge = React.forwardRef(
  (
    { variant = "grey", color, tone = "solid", label, dot = false, children, className = "", style, ...props },
    ref
  ) => {
    const base = color || String(variant).split("-")[0];
    const effectiveTone = color
      ? tone
      : String(variant).includes("-light") || String(variant).includes("-soft")
      ? "soft"
      : tone;

    const badge = (
      <CeStatusBadge
        color={base}
        tone={effectiveTone}
        label={label ?? children}
        dot={dot}
        className={className}
      />
    );

    if (style || Object.keys(props).length) {
      return (
        <span ref={ref} style={{ display: "inline-flex", ...style }} {...props}>
          {badge}
        </span>
      );
    }
    return badge;
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
