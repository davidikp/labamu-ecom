import React from "react";

const IconButton = React.forwardRef(
  (
    {
      icon: Icon,
      onClick,
      size = "medium",
      variant, // "primary" | "secondary" | "danger"
      disabled = false,
      color,
      hoverBackground,
      style = {},
      title,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Map sizes including new FE equivalents
    const sizeMap = {
      xs: { button: 18, icon: 12, radius: 4 },
      small: { button: 32, icon: 16, radius: 8 },
      sm: { button: 32, icon: 16, radius: 8 },
      medium: { button: 44, icon: 18, radius: 8 },
      md: { button: 44, icon: 18, radius: 8 },
      large: { button: 50, icon: 20, radius: 12 },
      lg: { button: 50, icon: 20, radius: 12 },
      xlarge: { button: 56, icon: 20, radius: 12 },
      xl: { button: 56, icon: 20, radius: 12 },
    }[size] || { button: 44, icon: 18, radius: 8 };

    // Resolve variants and backward-compatible overrides
    let baseBg = "transparent";
    let baseBorder = "1px solid transparent";
    let baseColor = color || "var(--feature-brand-primary)";
    let hoverBg = hoverBackground || "var(--neutral-surface-grey-lighter)";
    let hoverColor = baseColor;

    if (variant === "primary") {
      baseBg = "var(--feature-brand-primary)";
      baseColor = "var(--feature-brand-on-primary)";
      hoverBg = "#005CE8"; // var(--lb-brand-hover)
      hoverColor = "var(--feature-brand-on-primary)";
    } else if (variant === "secondary") {
      baseBg = "var(--neutral-surface-primary)";
      baseBorder = "1px solid var(--feature-brand-primary)";
      baseColor = "var(--feature-brand-primary)";
      hoverBg = "var(--feature-brand-primary)";
      hoverColor = "var(--neutral-surface-primary)";
    } else if (variant === "danger") {
      baseBg = "var(--neutral-surface-primary)";
      baseBorder = "1px solid var(--status-red-primary)";
      baseColor = "var(--status-red-primary)";
      hoverBg = "var(--status-red-primary)";
      hoverColor = "var(--neutral-surface-primary)";
    }

    if (disabled) {
      baseBg = "var(--neutral-surface-grey-lighter)";
      baseBorder = "1px solid transparent";
      baseColor = "var(--neutral-on-surface-tertiary)";
      hoverBg = baseBg;
      hoverColor = baseColor;
    }

    return (
      <button
        ref={ref}
        type={type}
        title={title}
        className="ds-icon-button ds-flex-center"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          "--ds-icon-button-size": `${sizeMap.button}px`,
          "--ds-icon-button-radius": `${sizeMap.radius}px`,
          "--ds-icon-button-bg": baseBg,
          "--ds-icon-button-cursor": disabled ? "not-allowed" : "pointer",
          border: baseBorder,
          background: baseBg,
          color: baseColor,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
          ...style,
        }}
        onMouseDown={(e) => {
          if (disabled) return;
          e.currentTarget.style.transform = "scale(0.97)";
        }}
        onMouseUp={(e) => {
          if (disabled) return;
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.color = hoverColor;
        }}
        onMouseLeave={(e) => {
          if (disabled) return;
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = baseBg;
          e.currentTarget.style.color = baseColor;
        }}
        {...props}
      >
        <Icon
          size={sizeMap.icon}
          color="currentColor"
        />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
