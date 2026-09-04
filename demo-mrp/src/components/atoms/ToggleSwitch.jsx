import React from "react";

const ToggleSwitch = React.forwardRef(
  ({ checked = false, onChange, disabled = false, size = "big", className = "", style = {}, ...props }, ref) => {
    const isBig = size === "big";

    const trackBg = disabled
      ? checked
        ? "var(--neutral-line-separator-1)"
        : "var(--neutral-surface-grey-lighter)"
      : checked
      ? "var(--feature-brand-primary)"
      : "var(--neutral-surface-primary)";

    const trackBorder = checked
      ? "1px solid transparent"
      : disabled
      ? "1px solid var(--neutral-line-separator-1)"
      : "1px solid var(--neutral-line-separator-2)";

    const knobTranslate = checked
      ? isBig
        ? "translateX(19px)"
        : "translateX(16px)"
      : "translateX(0)";

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange?.(!checked);
        }}
        className={`ds-toggle ${className}`.trim()}
        style={{
          position: "relative",
          borderRadius: "100px",
          transition: "all 0.2s ease",
          outline: "none",
          width: isBig ? "51px" : "40px",
          height: isBig ? "32px" : "24px",
          background: trackBg,
          border: trackBorder,
          cursor: disabled ? "not-allowed" : "pointer",
          flexShrink: 0,
          ...style,
        }}
        {...props}
      >
        <span
          className="ds-toggle__thumb"
          style={{
            position: "absolute",
            top: "50%",
            left: "2px", // Slight adjustment for border width to match design
            transform: `translateY(-50%) ${knobTranslate}`,
            background: "var(--neutral-surface-primary)",
            borderRadius: "50%",
            border: checked
              ? "1px solid transparent"
              : "1px solid var(--neutral-line-separator-1)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            transition: "transform 0.2s ease",
            width: isBig ? "26px" : "18px",
            height: isBig ? "26px" : "18px",
            display: "block",
            boxSizing: "border-box",
          }}
        />
      </button>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };
