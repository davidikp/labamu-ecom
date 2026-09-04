import { baseInputBorderColor } from "../../../components/atoms/inputStyles.js";
export { baseInputBorderColor, focusInputFrame, blurInputFrame } from "../../../components/atoms/inputStyles.js";

export const inputFrameStyle = (disabled = false, hasError = false) => ({
  border: `1px solid ${
    hasError
      ? "var(--status-red-primary)"
      : disabled
        ? "var(--neutral-line-outline)"
        : baseInputBorderColor
  }`,
  borderRadius: "10px",
  background: disabled
    ? "var(--neutral-surface-grey-lighter)"
    : "var(--neutral-surface-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
});

export const inputControlStyle = (disabled = false, hasValue = false) => ({
  width: "100%",
  outline: "none",
  fontSize: "var(--text-subtitle-1)",
  color: disabled
    ? "var(--neutral-on-surface-tertiary)"
    : hasValue !== false && hasValue !== "" && hasValue !== null && hasValue !== undefined
      ? "var(--neutral-on-surface-primary)"
      : "var(--neutral-on-surface-tertiary)",
  fontFamily: "Lato, sans-serif",
  boxSizing: "border-box",
});

export const fieldStyle = (disabled = false, hasValue = false, hasError = false) => ({
  height: "46px",
  padding: "0 16px",
  width: "100%",
  border: "none",
  background: "transparent",
  ...inputFrameStyle(disabled, hasError),
  ...inputControlStyle(disabled, hasValue),
});
