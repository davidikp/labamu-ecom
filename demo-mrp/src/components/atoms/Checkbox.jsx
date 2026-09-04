import React from "react";

const Checkbox = React.forwardRef(
  (
    {
      checked = false,
      indeterminate = false,
      disabled = false,
      onChange,
      className = "",
      style = {},
      ...props
    },
    ref
  ) => {
    const isChecked = checked;
    const isIndeterminate = indeterminate;
    const filled = isChecked || isIndeterminate;

    let bg = "var(--neutral-surface-primary)";
    let border = "1px solid var(--neutral-line-separator-2)";

    if (disabled) {
      bg = "var(--neutral-surface-grey-lighter)";
      border = "1px solid var(--neutral-line-separator-1)";
    } else if (filled) {
      bg = "var(--feature-brand-primary)";
      border = "1px solid var(--feature-brand-primary)";
    }

    return (
      <div
        ref={ref}
        role="checkbox"
        aria-checked={isIndeterminate ? "mixed" : isChecked}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) onChange?.(!isChecked);
        }}
        className={`ds-checkbox ${className}`.trim()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
          borderRadius: "4px",
          background: bg,
          border: border,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          flexShrink: 0,
          ...style,
        }}
        {...props}
      >
        {isChecked && !isIndeterminate && (
          <svg
            width="14"
            height="11"
            viewBox="0 0 14 11"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 5.5L5 9.5L13 1.5"
              stroke={
                disabled ? "var(--neutral-on-surface-tertiary)" : "white"
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {isIndeterminate && (
          <svg
            width="10"
            height="2"
            viewBox="0 0 10 2"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1H9"
              stroke={
                disabled ? "var(--neutral-on-surface-tertiary)" : "white"
              }
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
