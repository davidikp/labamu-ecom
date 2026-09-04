import React from "react";
import { IconBtn } from "../../ce-ui";

/**
 * IconButton — adapter over the ce-ui IconBtn.
 * Legacy API: icon (component) / size / variant / color / onClick / disabled / title.
 * No `variant` defaults to the borderless "ghost" look the project relied on.
 * A custom `color` is applied via style so the (currentColor) icon picks it up.
 */
const SIZE_MAP = {
  xs: "sm", small: "sm", sm: "sm",
  medium: "md", md: "md",
  large: "lg", lg: "lg", xlarge: "lg", xl: "lg",
};
const ICON_PX = { sm: 16, md: 18, lg: 20 };

const IconButton = React.forwardRef(
  ({ icon: Icon, size = "medium", variant, color, hoverBackground, style = {}, ...props }, ref) => {
    const ceSize = SIZE_MAP[size] || "md";
    const ceVariant = variant || "ghost";
    const node = Icon ? <Icon size={ICON_PX[ceSize]} /> : null;
    return (
      <IconBtn
        ref={ref}
        icon={node}
        variant={ceVariant}
        size={ceSize}
        style={color ? { color, ...style } : style}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
