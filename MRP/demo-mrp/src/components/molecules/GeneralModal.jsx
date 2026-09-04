import React from "react";
import { Popup } from "../../ce-ui";

const GeneralModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = "400px",
  centeredHeader = true,
  zIndex = 5000,
  noPadding = false,
  hideFooterDivider = false,
  footerPaddingTop,
}) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <Popup
      open={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      align={centeredHeader ? "center" : "left"}
      platform="desktop"
      className="gm-modal-width"
      style={{ zIndex, "--gm-width": width }}
      hideFooterDivider={hideFooterDivider}
      footerPaddingTop={footerPaddingTop}
      footer={
        footer && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            {footer}
          </div>
        )
      }
    >
      {hasChildren && (
        noPadding
          ? <div style={{ margin: "-16px -24px" }}>{children}</div>
          : <>{children}</>
      )}
    </Popup>
  );
};

export { GeneralModal };
