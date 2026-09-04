import React, { useState, useEffect } from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Reason textarea mirrors the app's other cancel-with-reason flows (e.g.
// CancelOrderModal in orders/pages/OrderDetailPage.jsx) — required, 400-char
// cap, raw textarea rather than a shared FormField, consistent with that
// existing pattern. The reason becomes the "Upload Cancelled" activity log's
// description (see BulkUploadNewPage.handleCancelUpload).
export const CancelUploadConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Field cannot be empty");
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel this upload?"
      description="You won’t be able to continue this upload. It will remain in the Bulk Upload list with a Cancelled status."
      width="560px"
      hideFooterDivider
      footerPaddingTop={24}
      footer={
        <>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
            Keep Editing
          </Button>
          <Button variant="danger-filled" size="large" onClick={handleConfirm} style={{ flex: 1 }}>
            Yes, Cancel
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "var(--status-red-primary)" }}>*</span>
            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>
              Cancellation Reason
            </span>
          </div>
          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
            {reason.length}/400
          </span>
        </div>
        <textarea
          value={reason}
          maxLength={400}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          placeholder="Add a reason for canceling this upload."
          style={{
            minHeight: "120px",
            border: error ? "1px solid var(--status-red-primary)" : "1px solid var(--neutral-line-separator-2)",
            borderRadius: "12px",
            padding: "12px 16px",
            background: "var(--neutral-surface-primary)",
            fontSize: "var(--text-subtitle-1)",
            color: "var(--neutral-on-surface-primary)",
            width: "100%",
            outline: "none",
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        {error && <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{error}</span>}
      </div>
    </GeneralModal>
  );
};
