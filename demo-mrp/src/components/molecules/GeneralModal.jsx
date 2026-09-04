import React from "react";
import { IconButton } from "../atoms/IconButton.jsx";
import { CloseIcon } from "../icons/Icons.jsx";

const GeneralModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = "400px",
  showCloseButton = true,
  centeredHeader = true,
  zIndex = 5000,
  noPadding = false,
}) => {
  if (!isOpen) return null;
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div
      className="ds-modal-overlay"
      style={{
        "--ds-modal-z-index": zIndex,
      }}
    >
      <div
        className="ds-modal-shell"
        style={{
          "--ds-modal-width": width,
          padding: noPadding ? "0" : undefined,
          gap: noPadding ? "0" : undefined,
        }}
      >
        {showCloseButton ? (
          <IconButton
            icon={CloseIcon}
            size="large"
            onClick={onClose}
            style={{ position: "absolute", top: "16px", right: "16px" }}
            color="var(--neutral-on-surface-primary)"
          />
        ) : null}

        <div
          className="ds-modal-header"
          style={{
            textAlign: centeredHeader ? "center" : "left",
          }}
        >
          <h2 className="ds-modal-title">{title}</h2>
          {description ? (
            <p className="ds-modal-description">{description}</p>
          ) : null}
        </div>

        {hasChildren ? <div className="ds-modal-body">{children}</div> : null}

        {footer ? <div className="ds-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
};

export { GeneralModal };
