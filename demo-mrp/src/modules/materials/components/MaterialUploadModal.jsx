import React, { useState } from "react";
import { 
  CloudUploadIcon, 
  DownloadIcon,
  CloseIcon 
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";

export const MaterialUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload?.(selectedFile);
      onClose();
    }
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Material"
      width="560px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button 
            variant="filled" 
            size="large" 
            onClick={handleUpload} 
            disabled={!selectedFile}
            style={{ flex: 1 }}
          >
            Upload
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Template Section */}
        <div style={{ 
          padding: "16px 20px", 
          borderRadius: "12px", 
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--neutral-surface-primary)"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>
              Download Excel Template
            </span>
          </div>
          <Button variant="outlined" leftIcon={DownloadIcon} onClick={() => {}}>
            Template
          </Button>
        </div>

        {/* Upload Area */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            height: "220px",
            border: `2px dashed var(--feature-brand-primary)`,
            borderRadius: "24px",
            background: dragActive ? "rgba(0, 104, 255, 0.04)" : "var(--neutral-surface-primary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            position: "relative"
          }}
          onClick={() => document.getElementById("file-upload").click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <CloudUploadIcon size={48} color="var(--feature-brand-primary)" />
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-tertiary)" }}>
              Max 1 file, 25MB each
            </span>
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-tertiary)" }}>
              Allowed formats (.xlsx, .xls)
            </span>
            <div style={{ marginTop: "4px", fontSize: "14px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              {selectedFile ? (
                <span style={{ color: "var(--feature-brand-primary)" }}>{selectedFile.name}</span>
              ) : (
                <>
                  Drag file or <span style={{ color: "var(--feature-brand-primary)" }}>browse file</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Text */}
        <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>
          Total data found: 0 rows
        </span>
      </div>
    </GeneralModal>
  );
};
