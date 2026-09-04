import React from "react";
import { MainBtn, CTAButton } from "../../ce-ui";

/**
 * Button — adapter over the ce-ui design system (MainBtn / CTAButton).
 * Preserves the project's existing Button API (variant/size/leftIcon/rightIcon/
 * loading/children) so no page changes are required.
 */

// project size names -> ce-ui sizes
const SIZE_MAP = {
  xlarge: "xl", xl: "xl",
  large: "lg", lg: "lg",
  medium: "md", md: "md",
  small: "sm", sm: "sm",
};

// project variants -> ce-ui MainBtn variants
const VARIANT_MAP = {
  filled: "primary",
  primary: "primary",
  outlined: "secondary",
  secondary: "secondary",
  danger: "danger",
  "danger-filled": "danger-fill",
};

const iconPxFor = (ceSize) =>
  ceSize === "xl" || ceSize === "lg" ? 20 : ceSize === "md" ? 18 : 16;

const Button = ({
  variant = "filled",
  size = "small",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  loading = false,
  className = "",
  ...props
}) => {
  const ceSize = SIZE_MAP[size] || "sm";
  const px = iconPxFor(ceSize);
  const left = LeftIcon ? <LeftIcon size={px} /> : undefined;
  const right = RightIcon ? <RightIcon size={px} /> : undefined;

  // Text/link-style buttons -> CTAButton
  if (variant === "ghost" || variant === "tertiary") {
    return (
      <CTAButton
        variant="primary"
        size={ceSize === "xl" ? "lg" : ceSize}
        leftIcon={left}
        rightIcon={right}
        label={children}
        className={className}
        {...props}
      />
    );
  }

  return (
    <MainBtn
      variant={VARIANT_MAP[variant] || "primary"}
      size={ceSize}
      leftIcon={left}
      rightIcon={right}
      loading={loading}
      label={children}
      className={className}
      {...props}
    />
  );
};

export { Button };
