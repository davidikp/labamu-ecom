import React from "react";
import { GeneralModal } from "../../../../../components/modal/GeneralModal.jsx";
import { IconButton } from "../../../../../components/common/IconButton.jsx";
import { Info, CloseIcon } from "../../../../../components/icons/Icons.jsx";
import {
  Button,
  InputField,
  UploadDropzone,
  UploadDescriptionCard,
  LabelValue,
} from "../shared/PoDetailSharedComponents.jsx";

const PoReceiptModals = ({
  receiptLines,
  // Adjust WO Modal Props
  showAdjustWoModal,
  setShowAdjustWoModal,
  handleContinueFromAdjustWo,

  // Confirm Receipt Modal Props
  showConfirmReceiptModal,
  setShowConfirmReceiptModal,
  showAutoAdjustWoMessage,
  receiptReceivedBy,
  setReceiptReceivedBy,
  receiptNotes,
  setReceiptNotes,
  handleSubmitReceipt,
  receiptProofDocuments,
  setReceiptProofDocuments,
  receiptProofUploadError,
  setReceiptProofUploadError,
  receiptProofDescriptionErrors,
  setReceiptProofDescriptionErrors,
  MAX_PROOF_UPLOAD_FILES,
  handleReceiptProofFilesSelected,
  updateReceiptProofDescription,
  removeReceiptProofDocument,
}) => {
  const itemsToReceive = (receiptLines || []).filter(line => Number(line.receiveNow) > 0);

  return (
    <>
      {/* Adjust WO Modal */}
      <GeneralModal
        isOpen={showAdjustWoModal}
        onClose={() => setShowAdjustWoModal(false)}
        title="Adjust Related Work Order?"
        width="480px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => setShowAdjustWoModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={handleContinueFromAdjustWo}
            >
              Continue
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-regular)",
              color: "var(--neutral-on-surface-secondary)",
              lineHeight: "24px",
            }}
          >
            The related work order does not yet reflect the quantity required
            for this receipt. If you continue, the system will automatically
            update the routing quantity to match this receipt.
          </span>
        </div>
      </GeneralModal>

      {/* Confirm Receipt Modal */}
      {showConfirmReceiptModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", justifyContent: "flex-end", zIndex: 20000 }}>
          <div style={{ position: "absolute", inset: 0 }} onClick={() => {
            setShowConfirmReceiptModal(false);
            setReceiptProofDocuments([]);
            setReceiptProofUploadError("");
            setReceiptProofDescriptionErrors({});
            setReceiptNotes("");
          }} />
          <div style={{ position: "relative", width: "600px", background: "var(--neutral-surface-primary)", height: "100%", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--neutral-line-separator-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Confirm Receipt</span>
              </div>
              <IconButton icon={CloseIcon} onClick={() => {
                setShowConfirmReceiptModal(false);
                setReceiptProofDocuments([]);
                setReceiptProofUploadError("");
                setReceiptProofDescriptionErrors({});
                setReceiptNotes("");
              }} size="small" color="var(--neutral-on-surface-primary)" />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {showAutoAdjustWoMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "var(--feature-brand-container-darker)",
                border: "1px solid var(--feature-brand-container-darker)",
              }}
            >
              <Info
                size={16}
                strokeWidth={2.1}
                color="var(--feature-brand-primary)"
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-regular)",
                  color: "var(--neutral-on-surface-primary)",
                  lineHeight: "20px",
                }}
              >
                The related work order will be automatically updated to match
                this receipt.
              </span>
            </div>
          )}
          {itemsToReceive.length > 0 && (
            <div style={{ padding: "16px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "16px" }}>
              {itemsToReceive.length === 1 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", rowGap: "16px" }}>
                  <LabelValue 
                    label="Included Item" 
                    value={itemsToReceive[0].item || itemsToReceive[0].desc || "-"} 
                  />
                  <LabelValue 
                    label="Item Type" 
                    value={itemsToReceive[0].type === "wo" ? "Work Order" : itemsToReceive[0].type === "manual" ? "Manual" : "Material"} 
                  />
                  <LabelValue 
                    label="Receive Amount" 
                    value={`${itemsToReceive[0].receiveNow} pcs`} 
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Included Item</span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Item Type</span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Receive Amount</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {itemsToReceive.map((item, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "center" }}>
                        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)" }}>{item.item || item.desc || "-"}</span>
                        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)" }}>{item.type === "wo" ? "Work Order" : item.type === "manual" ? "Manual" : "Material"}</span>
                        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)" }}>{item.receiveNow} pcs</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <InputField
            label="Received By"
            required
            disabled
            value="Natasha Smith"
            onChange={() => {}}
            placeholder="Enter receiver name"
          />
          <InputField
            label="Notes"
            multiline
            placeholder="Add note for this receipt"
            value={receiptNotes}
            onChange={(e) => setReceiptNotes(e.target.value.slice(0, 1000))}
            maxLength={1000}
            headerRight={`${receiptNotes.length}/1000`}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Upload Proof Document
              </span>
            </div>
            <UploadDropzone
              maxFiles={MAX_PROOF_UPLOAD_FILES}
              multiple
              disabled={receiptProofDocuments.length >= MAX_PROOF_UPLOAD_FILES}
              error={receiptProofUploadError}
              onFilesSelected={handleReceiptProofFilesSelected}
            />
            {receiptProofDocuments.length > 0 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {receiptProofDocuments.map((doc) => (
                  <UploadDescriptionCard
                    key={doc.id}
                    file={doc}
                    descriptionRequired
                    descriptionError={receiptProofDescriptionErrors[doc.id]}
                    onDescriptionChange={(value) =>
                      updateReceiptProofDescription(doc.id, value)
                    }
                    onRemove={() => removeReceiptProofDocument(doc.id)}
                  />
                ))}
              </div>
            )}
            {receiptProofUploadError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                }}
              >
                {receiptProofUploadError}
              </span>
            )}
          </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", display: "flex", gap: "12px" }}>
              <Button
                variant="outlined"
                size="large"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowConfirmReceiptModal(false);
                  setReceiptProofDocuments([]);
                  setReceiptProofUploadError("");
                  setReceiptProofDescriptionErrors({});
                  setReceiptNotes("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                style={{ flex: 1 }}
                onClick={handleSubmitReceipt}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoReceiptModals;
