import React, { useState } from "react";
import { AddIcon, CloseIcon } from "../icons/Icons.jsx";

export const ImageUpload = ({ value, onChange, disabled }) => {
  const [preview, setPreview] = useState(value);

  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const file = fileList[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderEmptyTile = () => (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        handleIncomingFiles(e.dataTransfer?.files);
      }}
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: `1px dashed #A9A9A9`,
        background: "var(--neutral-surface-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-grey-lighter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" />
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {preview ? (
          <div style={{ position: "relative", width: "120px", height: "120px" }}>
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "16px",
              border: "2px solid var(--feature-brand-primary)",
              padding: "4px",
              boxSizing: "border-box"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                overflow: "hidden"
              }}>
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => { setPreview(null); onChange(null); }}
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#FFF",
                  border: "1px solid var(--status-red-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  zIndex: 2
                }}
              >
                <CloseIcon size={16} color="var(--status-red-primary)" />
              </button>
            )}
          </div>
        ) : renderEmptyTile()}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
          Allowed formats (JPG, JPEG, PNG, WebP), Max size 25MB per file
        </span>
      </div>
    </div>
  );
};
