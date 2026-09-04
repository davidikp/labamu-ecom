import React from "react";
import { Toggle } from "../../ce-ui";

/**
 * ToggleSwitch — adapter over the ce-ui Toggle.
 * Legacy API: checked / onChange(boolean) / disabled / size ("big" | "small").
 */
const ToggleSwitch = React.forwardRef(
  ({ checked = false, onChange, disabled = false, size = "big", className = "", style, ...props }, ref) => {
    const toggle = (
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size={size === "small" ? "small" : "big"}
        className={className}
      />
    );

    if (style || Object.keys(props).length) {
      return (
        <span ref={ref} style={{ display: "inline-flex", ...style }} {...props}>
          {toggle}
        </span>
      );
    }
    return toggle;
  }
);

ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };
