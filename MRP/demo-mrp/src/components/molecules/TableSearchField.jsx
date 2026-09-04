import React from "react";
import { SearchBar } from "../../ce-ui";

/**
 * TableSearchField — adapter over the ce-ui SearchBar.
 * Legacy API: value / onChange(event) / placeholder / width.
 * SearchBar is event-based like a native input, so onChange is forwarded as-is.
 */
const TableSearchField = ({
  value = "",
  onChange,
  placeholder,
  width = "360px",
  minWidth = "280px",
  style,
  className,
  ...props
}) => (
  <div style={{ width, minWidth, ...style }} className={className}>
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="lg"
      {...props}
    />
  </div>
);

export { TableSearchField };
