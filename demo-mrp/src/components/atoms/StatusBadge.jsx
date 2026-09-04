import React from "react";

const StatusBadge = React.forwardRef(
  (
    {
      variant = "grey",
      color,
      tone = "solid",
      label,
      dot = false,
      children,
      className = "",
      style = {},
      ...props
    },
    ref
  ) => {
    // Determine effective color and tone prioritizing the new API over the legacy `variant` API
    const effectiveColor = color || variant.split("-")[0];
    const effectiveTone = color
      ? tone
      : variant.includes("-light")
      ? "soft"
      : "solid";

    const getColors = () => {
      switch (effectiveColor) {
        case "blue":
          return effectiveTone === "soft"
            ? { bg: "var(--feature-brand-container-lighter)", textColor: "#005DE0" }
            : {
                bg: "var(--feature-brand-primary)",
                textColor: "var(--feature-brand-on-primary)",
              };
        case "green":
          return effectiveTone === "soft"
            ? { bg: "#DCFCE7", textColor: "#166534" }
            : {
                bg: "var(--status-green-primary)",
                textColor: "var(--status-green-on-primary)",
              };
        case "yellow":
          return effectiveTone === "soft"
            ? { bg: "#FEF9C3", textColor: "#854D0E" }
            : {
                bg: "var(--status-yellow-primary)",
                textColor: "var(--status-yellow-on-primary)",
              };
        case "orange":
          return effectiveTone === "soft"
            ? { bg: "#FFEDD5", textColor: "#9A3412" }
            : {
                bg: "var(--status-orange-primary)",
                textColor: "var(--status-orange-on-primary)",
              };
        case "red":
          return effectiveTone === "soft"
            ? { bg: "#FEE2E2", textColor: "#991B1B" }
            : {
                bg: "var(--status-red-primary)",
                textColor: "var(--status-red-on-primary)",
              };
        case "grey":
        default:
          return effectiveTone === "soft"
            ? { bg: "#F3F4F6", textColor: "#525252" }
            : {
                bg: "#737373", // matched to reference solid grey
                textColor: "#FFFFFF",
              };
      }
    };

    const { bg, textColor } = getColors();

    return (
      <span
        ref={ref}
        className={`ds-badge ${className}`.trim()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 8px", // matches px-2 py-0.5
          borderRadius: "4px", // matches lb-xs
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
          whiteSpace: "nowrap",
          background: bg,
          color: textColor,
          ...style,
        }}
        {...props}
      >
        {dot && (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "currentColor",
              flexShrink: 0,
            }}
          />
        )}
        {label || children}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
