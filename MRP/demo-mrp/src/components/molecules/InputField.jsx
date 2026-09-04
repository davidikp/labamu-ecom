import React from "react";
import { TextField } from "../../ce-ui";
import { FormField } from "./FormField.jsx";
import { DateInputControl } from "./DateInputControl.jsx";
import {
  formatNumberWithCommas,
  parseNumberFromCommas,
} from "../../utils/format/formatUtils.js";

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
  const { prefix, suffix, ...inputRest } = rest;

  // date type: keep custom DateInputControl (API incompatible with ce-ui DateField)
  if (type === "date") {
    return (
      <FormField
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        headerRight={headerRight}
      >
        <DateInputControl
          value={value}
          onChange={onChange}
          disabled={disabled}
          hasError={!!error || errorState}
          placeholder={placeholder || "yyyy-mm-dd"}
          maxDate={max}
        />
      </FormField>
    );
  }

  // number type: comma-formatted value routed through ce-ui TextField
  if (type === "number") {
    const leftIcon = prefix
      ? <span style={{ color: "var(--neutral-on-surface-secondary)", fontSize: "var(--text-subtitle-1)", whiteSpace: "nowrap" }}>{prefix}</span>
      : undefined;
    const rightIcon = suffix
      ? <span style={{ color: "var(--neutral-on-surface-secondary)", fontSize: "var(--text-subtitle-1)", whiteSpace: "nowrap" }}>{suffix}</span>
      : undefined;

    const field = (
      <TextField
        label={headerRight ? undefined : label}
        required={required}
        placeholder={placeholder}
        value={formatNumberWithCommas(value)}
        onChange={(e) => {
          const raw = parseNumberFromCommas(e.target.value);
          if (raw === "" || !isNaN(raw) || raw === "-") {
            onChange?.({ ...e, target: { ...e.target, value: raw } });
          }
        }}
        disabled={disabled}
        maxLength={maxLength}
        errorText={label ? error : undefined}
        helperText={label ? helperText : undefined}
        state={disabled ? "disabled" : !error && errorState ? "error" : undefined}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        inputMode="numeric"
        {...inputRest}
      />
    );

    if (!headerRight) return field;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {required && (
              <span style={{ fontSize: "14px", fontWeight: "bold", lineHeight: "18px", color: "var(--status-red-primary)" }}>*</span>
            )}
            {label && (
              <span style={{ fontSize: "12px", lineHeight: "18px", color: "var(--neutral-on-surface-primary)" }}>{label}</span>
            )}
          </div>
          {headerRight}
        </div>
        {field}
      </div>
    );
  }

  // text / multiline: route through ce-ui TextField
  const leftIcon = Icon
    ? <Icon size={20} color="var(--neutral-on-surface-tertiary)" />
    : prefix
      ? <span style={{ color: "var(--neutral-on-surface-secondary)", fontSize: "var(--text-subtitle-1)", whiteSpace: "nowrap" }}>{prefix}</span>
      : undefined;

  const rightIcon = suffix
    ? <span style={{ color: "var(--neutral-on-surface-secondary)", fontSize: "var(--text-subtitle-1)", whiteSpace: "nowrap" }}>{suffix}</span>
    : undefined;

  const field = (
    <TextField
      label={headerRight ? undefined : label}
      required={required}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      showCount={!!(showCounter && maxLength)}
      multiline={multiline}
      errorText={label ? error : undefined}
      helperText={label ? helperText : undefined}
      state={disabled ? "disabled" : !error && errorState ? "error" : undefined}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      {...inputRest}
    />
  );

  if (!headerRight) return field;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {required && (
            <span style={{ fontSize: "14px", fontWeight: "bold", lineHeight: "18px", color: "var(--status-red-primary)" }}>*</span>
          )}
          {label && (
            <span style={{ fontSize: "12px", lineHeight: "18px", color: "var(--neutral-on-surface-primary)" }}>{label}</span>
          )}
        </div>
        {headerRight}
      </div>
      {field}
    </div>
  );
};
