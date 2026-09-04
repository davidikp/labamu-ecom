import React from "react";
import { FormField } from "./FormField.jsx";
import { DateInputControl } from "./DateInputControl.jsx";
import {
  formatNumberWithCommas,
  parseNumberFromCommas,
} from "../../utils/format/formatUtils.js";
import {
  inputFrameStyle,
  inputControlStyle,
  focusInputFrame,
  blurInputFrame,
} from "../atoms/inputStyles.js";

export const InputField = ({
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  icon: Icon,
  max,
  maxLength,
  showCounter,
  multiline = false,
  error,
  // Apply the error (red) frame without rendering a message — for when the message
  // is shown elsewhere (e.g. a shared row-level error).
  errorState = false,
  helperText,
  headerRight,
  labelFontSize,
  headerRightFontSize,
  headerRightColor,
  ...rest
}) => {
  const hasError = !!error || errorState;
  return (
  <FormField
    label={label}
    required={required}
    error={error}
    helperText={helperText}
    headerRight={headerRight}
    labelFontSize={labelFontSize}
    headerRightFontSize={headerRightFontSize}
    headerRightColor={headerRightColor}
  >
    <div style={{ position: "relative", width: "100%" }}>
      {multiline ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          {...rest}
          style={{
            minHeight: "120px",
            padding: showCounter ? "12px 16px 32px 16px" : "12px 16px",
            width: "100%",
            resize: "vertical",
            border: "1px solid transparent",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            ...inputFrameStyle(disabled, hasError),
            ...inputControlStyle(disabled, !!value),
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) => blurInputFrame(e.currentTarget, disabled, hasError)}
        />
      ) : type === "date" ? (
        <DateInputControl
          value={value}
          onChange={onChange}
          disabled={disabled}
          hasError={hasError}
          placeholder={placeholder || "yyyy-mm-dd"}
          maxDate={max}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "48px",
            padding: "0 16px",
            gap: "8px",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            ...inputFrameStyle(disabled, hasError),
            boxSizing: "border-box",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) => blurInputFrame(e.currentTarget, disabled, hasError)}
        >
          {Icon && (
            <Icon size={20} color="var(--neutral-on-surface-tertiary)" />
          )}
          {rest.prefix && (
            <span
              style={{
                color: "var(--neutral-on-surface-secondary)",
                fontSize: "var(--text-subtitle-1)",
              }}
            >
              {rest.prefix}
            </span>
          )}
          <input
            type={type === "number" ? "text" : type}
            placeholder={placeholder}
            value={type === "number" ? formatNumberWithCommas(value) : value}
            onChange={(e) => {
              if (type === "number") {
                const raw = parseNumberFromCommas(e.target.value);
                if (raw === "" || !isNaN(raw) || raw === "-") {
                  onChange?.({
                    ...e,
                    target: { ...e.target, value: raw },
                  });
                }
              } else {
                onChange?.(e);
              }
            }}
            disabled={disabled}
            max={max}
            maxLength={maxLength}
            {...rest}
            style={{
              flex: 1,
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              paddingRight: showCounter || Icon ? "44px" : "0",
              ...inputControlStyle(disabled, !!value),
            }}
          />
          {rest.suffix && (
            <span
              style={{
                color: "var(--neutral-on-surface-secondary)",
                fontSize: "var(--text-subtitle-1)",
              }}
            >
              {rest.suffix}
            </span>
          )}
        </div>
      )}
      {showCounter && maxLength && (
        <span
          style={{
            position: "absolute",
            right: "16px",
            bottom: multiline ? "12px" : "auto",
            top: multiline ? "auto" : "50%",
            transform: multiline ? "none" : "translateY(-50%)",
            fontSize: "12px",
            color: "var(--neutral-on-surface-tertiary)",
            pointerEvents: "none",
          }}
        >
          {String(value || "").length}/{maxLength}
        </span>
      )}
    </div>
  </FormField>
  );
};
