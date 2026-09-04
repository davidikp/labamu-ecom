import React from "react";
import { Checkbox as CeCheckbox } from "../../ce-ui";

/**
 * Checkbox — adapter over the ce-ui Checkbox.
 * Legacy API: checked / indeterminate / disabled / onChange(boolean).
 * ce-ui represents the mixed state as checked="indeterminate".
 */
const Checkbox = React.forwardRef(
  ({ checked = false, indeterminate = false, disabled = false, onChange, className = "", style, ...props }, ref) => {
    const cb = (
      <CeCheckbox
        checked={indeterminate ? "indeterminate" : checked}
        onChange={onChange}
        disabled={disabled}
        className={className}
      />
    );

    if (style || Object.keys(props).length) {
      return (
        <span ref={ref} style={{ display: "inline-flex", ...style }} {...props}>
          {cb}
        </span>
      );
    }
    return cb;
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
