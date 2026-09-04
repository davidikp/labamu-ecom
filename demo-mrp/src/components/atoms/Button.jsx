import React from "react";

const LoadingSpinner = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const Button = ({
  variant = "filled",
  size = "small",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  onClick,
  className = "",
  style = {},
  disabled = false,
  type = "button",
  loading = false,
  ...props
}) => {
  // Alias variants to preserve backward compatibility
  const mappedVariant =
    variant === "primary"
      ? "filled"
      : variant === "secondary"
      ? "outlined"
      : variant;

  const isFilled = mappedVariant === "filled";
  const isDanger = mappedVariant === "danger";
  const isDangerFilled = mappedVariant === "danger-filled";
  const isGhost = mappedVariant === "ghost";
  const isTertiary = mappedVariant === "tertiary";
  const isOutlined =
    !isFilled && !isDanger && !isDangerFilled && !isGhost && !isTertiary;

  const sizeStyles = {
    // Legacy sizes exact preservation
    xlarge: {
      height: "56px",
      padding: "0 24px",
      borderRadius: "var(--radius-button)",
      fontSize: "var(--text-title-2)",
      gap: "8px",
      fontWeight: "var(--font-weight-bold)",
    },
    large: {
      height: "50px",
      padding: "0 24px",
      borderRadius: "var(--radius-button)",
      fontSize: "var(--text-title-2)",
      gap: "8px",
    },
    medium: {
      height: "44px",
      padding: "0 24px",
      borderRadius: "var(--radius-small)",
      fontSize: "var(--text-title-2)",
      gap: "8px",
    },
    small: {
      height: "32px",
      padding: "0 12px",
      borderRadius: "var(--radius-small)",
      fontSize: "var(--text-title-3)",
      gap: "4px",
    },
    // FE Reference sizes
    xl: {
      height: "56px",
      padding: "0 24px",
      borderRadius: "12px",
      fontSize: "16px",
      gap: "8px",
      fontWeight: "var(--font-weight-bold)",
    },
    lg: {
      height: "50px",
      padding: "0 24px",
      borderRadius: "12px",
      fontSize: "16px",
      gap: "8px",
      fontWeight: "var(--font-weight-regular)",
    },
    md: {
      height: "44px",
      padding: "0 24px",
      borderRadius: "8px",
      fontSize: "16px",
      gap: "8px",
      fontWeight: "var(--font-weight-regular)",
    },
    sm: {
      height: "32px",
      padding: "0 12px",
      borderRadius: "8px",
      fontSize: "14px",
      gap: "6px",
      fontWeight: "var(--font-weight-regular)",
    },
  }[size] || {
    height: "32px",
    padding: "0 12px",
    borderRadius: "var(--radius-small)",
    fontSize: "var(--text-title-3)",
    gap: "4px",
  };

  let border =
    isFilled || isGhost || isTertiary
      ? "1px solid transparent"
      : "1px solid var(--feature-brand-primary)";
  let bg = isFilled
    ? "var(--feature-brand-primary)"
    : isOutlined
    ? "var(--neutral-surface-primary)"
    : "transparent";
  let textCol = isFilled
    ? "var(--feature-brand-on-primary)"
    : "var(--feature-brand-primary)";

  if (isDanger) {
    border = "1px solid var(--status-red-primary)";
    bg = "var(--neutral-surface-primary)";
    textCol = "var(--status-red-primary)";
  }

  if (isDangerFilled) {
    border = "1px solid var(--status-red-primary)";
    bg = "var(--status-red-primary)";
    textCol = "#FFFFFF";
  }

  if (isGhost) {
    textCol = "var(--neutral-on-surface-secondary)";
  }

  const effectiveDisabled = disabled || loading;

  if (effectiveDisabled) {
    border = "1px solid transparent";
    bg = "var(--neutral-surface-grey-lighter)";
    textCol = "var(--neutral-on-surface-tertiary)";
  }

  const computedPadding = isTertiary
    ? size === "small" || size === "sm"
      ? "0 4px"
      : "0 8px"
    : sizeStyles.padding;

  const baseStyles = {
    "--ds-button-border": border,
    "--ds-button-bg": bg,
    "--ds-button-color": textCol,
    "--ds-button-cursor": effectiveDisabled ? "not-allowed" : "pointer",
    "--ds-button-height": sizeStyles.height,
    "--ds-button-padding": computedPadding,
    "--ds-button-radius": sizeStyles.borderRadius,
    "--ds-button-font-size": sizeStyles.fontSize,
    "--ds-button-gap": sizeStyles.gap,
    "--ds-button-font-weight": isTertiary
      ? "var(--font-weight-bold)"
      : sizeStyles.fontWeight || "var(--font-weight-regular)",
    background: bg,
    boxShadow: "none",
    transition: "all 0.15s ease",
  };

  const iconSize =
    size === "xlarge" || size === "xl" || size === "large" || size === "lg"
      ? 20
      : size === "medium" || size === "md"
      ? 18
      : 16;

  return (
    <button
      type={type}
      className={`ds-button ${className}`.trim()}
      style={{
        ...baseStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      onClick={effectiveDisabled ? undefined : onClick}
      disabled={effectiveDisabled}
      onMouseDown={(e) => {
        if (effectiveDisabled) return;
        e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseUp={(e) => {
        if (effectiveDisabled) return;
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        if (effectiveDisabled) return;
        e.currentTarget.style.transform = "scale(1)";
        if (isFilled) {
          e.currentTarget.style.background = "var(--feature-brand-primary)";
          e.currentTarget.style.boxShadow = "none";
        } else if (isDanger) {
          e.currentTarget.style.background = "var(--neutral-surface-primary)";
          e.currentTarget.style.color = "var(--status-red-primary)";
        } else if (isDangerFilled) {
          e.currentTarget.style.background = "var(--status-red-primary)";
          e.currentTarget.style.opacity = "1";
        } else if (isGhost) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--neutral-on-surface-secondary)";
        } else if (isTertiary) {
          e.currentTarget.style.background = "transparent";
        } else {
          e.currentTarget.style.background = "var(--neutral-surface-primary)";
        }
      }}
      onMouseEnter={(e) => {
        if (effectiveDisabled) return;
        if (isFilled) {
          e.currentTarget.style.background = "#005CE8"; // var(--lb-brand-hover) roughly
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,104,255,0.28)";
        } else if (isDanger) {
          e.currentTarget.style.background = "var(--status-red-container)";
          e.currentTarget.style.color = "var(--status-red-primary)";
        } else if (isDangerFilled) {
          e.currentTarget.style.background = "var(--status-red-primary)";
          e.currentTarget.style.opacity = "0.9";
        } else if (isGhost) {
          e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)";
          e.currentTarget.style.color = "var(--neutral-on-surface-primary)";
        } else if (isTertiary) {
          e.currentTarget.style.background = "var(--feature-brand-container-lighter)";
        } else {
          e.currentTarget.style.background = "var(--feature-brand-container-lighter)";
        }
      }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={iconSize} />
      ) : LeftIcon ? (
        <LeftIcon size={iconSize} />
      ) : null}
      
      {size === "small" || size === "sm" ? (
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {children}
        </span>
      ) : (
        <span>{children}</span>
      )}

      {!loading && RightIcon ? <RightIcon size={iconSize} /> : null}
    </button>
  );
};

export { Button };
