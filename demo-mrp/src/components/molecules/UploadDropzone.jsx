import React from "react";
import { CloudUploadIcon } from "../icons/Icons.jsx";

export const UploadDropzone = ({
  multiple = false,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxFiles = 1,
  maxText,
  allowedText = "Allowed formats (PDF, JPG, JPEG, PNG, WebP)",
  disabled = false,
  error = "",
  onFilesSelected,
}) => {
  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []);
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  return (
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
        width: "100%",
        minHeight: "168px",
        borderRadius: "24px",
        border: `2px dashed ${disabled
            ? "var(--neutral-line-separator-1)"
            : error
              ? "var(--status-red-primary)"
              : "var(--feature-brand-primary)"
          }`,
        background: disabled
          ? "var(--neutral-surface-grey-lighter)"
          : "var(--neutral-surface-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "24px",
        textAlign: "center",
        boxSizing: "border-box",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: 1,
      }}
    >
      <CloudUploadIcon
        size={40}
        color={
          disabled
            ? "var(--neutral-on-surface-tertiary)"
            : error
              ? "var(--status-red-primary)"
              : "var(--feature-brand-primary)"
        }
      />
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "#A9A9A9",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        {maxText ||
          (maxFiles === 1 ? "Max 1 file, 25MB each" : "Max 3 files, 25MB each")}
      </span>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "#A9A9A9",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        {allowedText}
      </span>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: disabled
            ? "var(--neutral-on-surface-tertiary)"
            : "var(--neutral-on-surface-primary)",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        Drag file or{" "}
        <span
          style={{
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : "var(--feature-brand-primary)",
          }}
        >
          browse file
        </span>
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
};
