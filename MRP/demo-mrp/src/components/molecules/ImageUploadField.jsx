import React from "react";
import { AddIcon, CloseIcon } from "../icons/Icons.jsx";
import {
  createImageUploadRecord,
  getImageUploadName,
  getImageUploadPreviewUrl,
} from "../../utils/upload/uploadUtils.js";

export const ImageUploadField = ({
  label = "Images",
  images = [],
  maxFiles = 1,
  disabled = false,
  error = "",
  helperText = "",
  onFilesSelected,
  onRemove,
}) => {
  const normalizedImages = images
    .map((image) => createImageUploadRecord(image))
    .filter(Boolean)
    .slice(0, maxFiles);
  const canAddMore = !disabled && normalizedImages.length < maxFiles;

  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []).slice(
      0,
      Math.max(0, maxFiles - normalizedImages.length)
    );
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  const renderDisabledEmptyTile = () => (
    <div
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: "1px dashed var(--neutral-line-separator-2)",
        background: "var(--neutral-surface-grey-lighter)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "not-allowed",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--neutral-line-separator-1)",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" style={{ opacity: 0.5 }} />
      </div>
      <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
        No Image
      </span>
    </div>
  );

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
        border: `1px dashed ${error ? "var(--status-red-primary)" : "#A9A9A9"}`,
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
        multiple={maxFiles > 1}
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
    <div className="flex flex-col gap-sm">
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>

      <div className="flex gap-md" style={{ flexWrap: "wrap" }}>
        {normalizedImages.map((image, index) => {
          const previewUrl = getImageUploadPreviewUrl(image);
          const imageName = getImageUploadName(image);
          return (
            <div
              key={image.id || `${imageName}-${index}`}
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "12px",
                border:
                  index === 0
                    ? "2px solid var(--feature-brand-primary)"
                    : "1px solid var(--neutral-line-separator-2)",
                padding: "4px",
                background: "var(--neutral-surface-primary)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-grey-lighter)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={imageName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      padding: "0 10px",
                      textAlign: "center",
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                      lineHeight: "18px",
                      wordBreak: "break-word",
                    }}
                  >
                    {imageName || "Image"}
                  </span>
                )}
              </div>
              {index === 0 && maxFiles > 1 ? (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "var(--feature-brand-primary)",
                    color: "#fff",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--font-weight-bold)",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    pointerEvents: "none",
                  }}
                >
                  Primary
                </span>
              ) : null}
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => onRemove?.(image)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    border: "1px solid var(--status-red-primary)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <CloseIcon size={14} color="var(--status-red-primary)" />
                </button>
              ) : null}
            </div>
          );
        })}

        {canAddMore ? renderEmptyTile() : null}
        {disabled && normalizedImages.length === 0 ? renderDisabledEmptyTile() : null}
      </div>

      {error ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--status-red-primary)",
          }}
        >
          {error}
        </span>
      ) : null}

      {helperText ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
