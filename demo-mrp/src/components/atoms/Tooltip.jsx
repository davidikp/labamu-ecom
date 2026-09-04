import React, { useState } from "react";

export const Tooltip = ({ content, children, style = {} }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        ...style,
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible ? (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            maxWidth: "1600px",
            width: "max-content",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "var(--neutral-on-surface-primary)",
            color: "var(--neutral-surface-primary)",
            fontSize: "var(--text-desc)",
            lineHeight: "1.6",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {content}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "6px",
              borderStyle: "solid",
              borderColor:
                "var(--neutral-on-surface-primary) transparent transparent transparent",
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
