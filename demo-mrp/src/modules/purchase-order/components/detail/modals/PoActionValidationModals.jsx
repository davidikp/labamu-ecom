import React from "react";
import { GeneralModal } from "../../../../../components/modal/GeneralModal.jsx";
import { Button } from "../shared/PoDetailSharedComponents.jsx";
import { Info } from "../../../../../components/icons/Icons.jsx";

const PoActionValidationModals = ({
  // Submit Guard Modal
  showSubmitGuardModal,
  setShowSubmitGuardModal,
  validateDetailRequiredInfo,

  // Zero Price Warning Modal
  showZeroPriceWarningModal,
  setShowZeroPriceWarningModal,
  setShowDetailSubmitConfirmModal,

  // Submit Confirm Modal
  showDetailSubmitConfirmModal,
  poApprovalSettings,
  handleConfirmDetailSubmit,

  // Future Date Blocker
  showFutureDateBlocker,
  setShowFutureDateBlocker,
  handleEditPo,

  // Decision Modal (Approve/Reject/Revise/Cancel)
  isDecisionModalOpen,
  setIsDecisionModalOpen,
  decisionType,
  decisionComment,
  setDecisionComment,
  decisionError,
  setDecisionError,
  getDecisionMeta,
  handleSubmitDecision,

  // Canceled WO Blocker
  showCanceledWOBlocker,
  setShowCanceledWOBlocker,
  canceledWOsFound,
}) => {
  return (
    <>
      <GeneralModal
        isOpen={showSubmitGuardModal}
        onClose={() => setShowSubmitGuardModal(false)}
        title="Complete Required Information"
        description="Please fill in the required information below before submitting this purchase order."
        width="440px"
        footer={
          <Button
            variant="filled"
            size="large"
            style={{ width: "100%" }}
            onClick={() => setShowSubmitGuardModal(false)}
          >
            Okay
          </Button>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "var(--neutral-surface-grey-lighter)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          {validateDetailRequiredInfo().map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--status-red-primary)",
                  flexShrink: 0,
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showZeroPriceWarningModal}
        onClose={() => setShowZeroPriceWarningModal(false)}
        title="Zero Unit Price Detected"
        width="420px"
        description="Some items have a unit price of 0. Please review them before submitting, or continue if this is intentional."
        descriptionStyle={{ fontSize: "14px" }}
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
              marginTop: "24px",
            }}
          >
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowZeroPriceWarningModal(false);
                setShowDetailSubmitConfirmModal(true);
              }}
            >
              Continue to Submit
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowZeroPriceWarningModal(false)}
            >
              Go Back to Edit
            </Button>
          </div>
        }
      />

      <GeneralModal
        isOpen={showDetailSubmitConfirmModal}
        onClose={() => setShowDetailSubmitConfirmModal(false)}
        title="Submit PO?"
        width="376px"
        description={
          poApprovalSettings?.isApprovalActive
            ? "This PO will be submitted for approval."
            : "This PO will be automatically approved upon submission."
        }
        footer={
          <>
            <Button
              size="large"
              style={{ width: "100%" }}
              onClick={handleConfirmDetailSubmit}
            >
              Yes, Submit
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowDetailSubmitConfirmModal(false)}
            >
              Cancel
            </Button>
          </>
        }
      />

      <GeneralModal
        isOpen={showFutureDateBlocker}
        onClose={() => setShowFutureDateBlocker(false)}
        title="Invalid Purchase Order Date"
        width="376px"
        description="The purchase order date cannot be later than today. Please update the date before submitting."
        footer={
          <>
            <Button
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowFutureDateBlocker(false);
                handleEditPo();
              }}
            >
              Edit PO
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowFutureDateBlocker(false)}
            >
              Close
            </Button>
          </>
        }
      />

      <GeneralModal
        isOpen={isDecisionModalOpen}
        onClose={() => {
          setIsDecisionModalOpen(false);
          setDecisionError("");
        }}
        title={getDecisionMeta().title}
        width="440px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setIsDecisionModalOpen(false);
                setDecisionError("");
              }}
            >
              Back
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={handleSubmitDecision}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {getDecisionMeta().mandatory && (
                  <span
                    style={{
                      color: "var(--status-red-primary)",
                      fontSize: "var(--text-body)",
                    }}
                  >
                    *
                  </span>
                )}
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Comment
                </span>
              </div>
              <span
                style={{
                  fontSize: "var(--text-desc)",
                  color: "var(--neutral-on-surface-tertiary)",
                }}
              >
                {decisionComment.length}/400
              </span>
            </div>
            <textarea
              value={decisionComment}
              maxLength={400}
              onChange={(e) => {
                setDecisionComment(e.target.value);
                if (decisionError) setDecisionError("");
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--feature-brand-primary)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 104, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = decisionError
                  ? "var(--status-red-primary)"
                  : "var(--neutral-line-separator-2)";
                e.currentTarget.style.boxShadow = "none";
              }}
              placeholder={getDecisionMeta().helper}
              style={{
                minHeight: "120px",
                border: decisionError
                  ? "1px solid var(--status-red-primary)"
                  : "1px solid var(--neutral-line-separator-2)",
                borderRadius: "12px",
                padding: "12px 16px",
                background: "var(--neutral-surface-primary)",
                fontSize: "var(--text-subtitle-1)",
                color: "var(--neutral-on-surface-primary)",
                width: "100%",
                outline: "none",
                fontFamily: "Lato, sans-serif",
                resize: "vertical",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            />
            {decisionError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                }}
              >
                {decisionError}
              </span>
            )}
          </div>
        </div>
      </GeneralModal>

      <CanceledWorkOrderBlockerModal
        isOpen={showCanceledWOBlocker}
        onClose={() => setShowCanceledWOBlocker(false)}
        canceledWOs={canceledWOsFound}
        mode="detail"
        onEditPO={() => {
          setShowCanceledWOBlocker(false);
          handleEditPo();
        }}
      />
    </>
  );
};

const CanceledWorkOrderBlockerModal = ({
  isOpen,
  onClose,
  canceledWOs,
  mode = "edit",
  onEditPO,
}) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    width="520px"
    title="Canceled Work Orders Found"
    description="Some work orders in this purchase order have already been canceled."
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "var(--feature-brand-container-lighter)",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          textAlign: "left",
          marginBottom: "32px",
        }}
      >
        <div style={{ marginTop: "2px" }}>
          <Info size={20} color="var(--feature-brand-primary)" />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {canceledWOs.map((wo) => (
            <div
              key={wo}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--feature-brand-primary)",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--feature-brand-primary)",
                }}
              />
              {wo}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {mode === "detail" ? (
          <>
            <Button
              variant="filled"
              size="large"
              onClick={onEditPO}
              style={{ width: "100%", height: "56px", fontSize: "18px" }}
            >
              Edit PO
            </Button>
            <Button
              variant="outline"
              size="large"
              onClick={onClose}
              style={{ width: "100%", height: "56px", fontSize: "18px" }}
            >
              Close
            </Button>
          </>
        ) : (
          <Button
            variant="filled"
            size="large"
            onClick={onClose}
            style={{ width: "100%", height: "56px", fontSize: "18px" }}
          >
            Okay
          </Button>
        )}
      </div>
    </div>
  </GeneralModal>
);

export default PoActionValidationModals;
