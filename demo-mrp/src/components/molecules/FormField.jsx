import React from "react";

export const FormField = ({
  label,
  required = false,
  children,
  error,
  helperText,
  headerRight,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
    }}
  >
    {label || headerRight ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "var(--text-body)",
          fontWeight: "var(--font-weight-regular)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {required ? (
            <span style={{ color: "var(--status-red-primary)" }}>*</span>
          ) : null}
          {label && (
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              {label}
            </span>
          )}
        </div>
        {headerRight && (
          <span style={{ color: "var(--neutral-on-surface-tertiary)", fontSize: "12px" }}>
            {headerRight}
          </span>
        )}
      </div>
    ) : null}
    {children}
    {error ? (
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--status-red-primary)",
          marginTop: "-4px",
        }}
      >
        {error}
      </span>
    ) : null}
    {!error && helperText ? (
      <span
        style={{
          fontSize: "var(--text-desc)",
          color: "var(--neutral-on-surface-secondary)",
          marginTop: "-4px",
        }}
      >
        {helperText}
      </span>
    ) : null}
  </div>
);
