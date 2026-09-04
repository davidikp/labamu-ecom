import React from "react";
import { Tooltip as CeTooltip } from "../../ce-ui";

export const Tooltip = ({ content, children, placement = "top" }) => (
  <CeTooltip content={content} placement={placement}>
    {children}
  </CeTooltip>
);
