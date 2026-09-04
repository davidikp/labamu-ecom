import React, { useRef, useState } from "react";
import { ChevronLeftIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";

export const MaterialPlanningSettingsPage = ({ onNavigate, isSidebarCollapsed, settings, onSaveSettings }) => {
  const [urgencyDaysInAdvance, setUrgencyDaysInAdvance] = useState(
    settings?.urgencyDaysInAdvance ?? 5
  );
  const [inputError, setInputError] = useState("");
  const [showDiscardChangesModal, setShowDiscardChangesModal] = useState(false);

  const initialSnapshot = useRef(JSON.stringify({ urgencyDaysInAdvance: settings?.urgencyDaysInAdvance ?? 5 }));

  const isDirty = initialSnapshot.current !== JSON.stringify({ urgencyDaysInAdvance });

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardChangesModal(true);
    } else {
      onNavigate("list");
    }
  };

  const handleDaysChange = (e) => {
    const raw = e.target.value;
    if (raw === "") { setUrgencyDaysInAdvance(""); setInputError(""); return; }
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1) { setInputError("Must be at least 1 day."); setUrgencyDaysInAdvance(raw); return; }
    if (n > 365) { setInputError("Must be 365 days or less."); setUrgencyDaysInAdvance(raw); return; }
    setInputError("");
    setUrgencyDaysInAdvance(n);
  };

  const handleSave = () => {
    const days = parseInt(urgencyDaysInAdvance, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      setInputError("Enter a number between 1 and 365.");
      return;
    }
    onSaveSettings({ urgencyDaysInAdvance: days });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)", position: "relative" }}>
      <div style={{
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        paddingBottom: "100px",
        background: "#F5F5F7",
      }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={handleBack}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              Settings
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)" }}>
            <span
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={handleBack}
            >
              Material Planning
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Settings</span>
          </div>
        </div>

        {/* Settings card */}
        <div style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
        }}>
          {/* Section header */}
          <div style={{ padding: "16px 0 0 0", display: "flex", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "4px", height: "24px", borderRadius: "0 4px 4px 0", background: "var(--feature-brand-primary)", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)" }}>
                  Urgency Threshold
                </span>
              </div>
              <p style={{ margin: 0, paddingLeft: "24px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", lineHeight: "1.6" }}>
                Determine when an unfulfilled material demand should be flagged as urgent, based on the estimated start date of the work order.
              </p>
            </div>
          </div>

          {/* Section content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px 24px 24px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "var(--text-title-2)", color: "var(--neutral-on-surface-primary)" }}>
                  <span style={{ color: "var(--status-red-primary)" }}>* </span>Days in advance for urgent status
                </span>
                <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                  E.g., if set to 5 days, a material demand is marked as urgent when the estimated WO starts within the next 5 days and current stock is insufficient to fulfill the demand.
                </span>
              </div>
              <div style={{ flexShrink: 0, width: "200px" }}>
                <InputField
                  type="number"
                  value={urgencyDaysInAdvance}
                  onChange={handleDaysChange}
                  error={inputError}
                  suffix="Days"
                  min="1"
                  max="365"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: isSidebarCollapsed ? "82px" : "286px",
        right: 0,
        transition: "left 0.2s ease",
        background: "var(--neutral-surface-primary)",
        borderTop: "1px solid var(--neutral-line-separator-1)",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
      }}>
        <Button size="medium" variant="tertiary" onClick={handleBack} style={{ color: "var(--status-red-primary)" }}>
          Cancel
        </Button>
        <Button size="medium" variant="filled" onClick={handleSave} disabled={!!inputError || urgencyDaysInAdvance === ""}>
          Save Settings
        </Button>
      </div>

      <GeneralModal
        isOpen={showDiscardChangesModal}
        onClose={() => setShowDiscardChangesModal(false)}
        title="Discard changes?"
        footer={
          <>
            <Button variant="filled" size="large" style={{ width: "100%" }} onClick={() => { setShowDiscardChangesModal(false); onNavigate("list"); }}>
              Yes, Discard
            </Button>
            <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={() => setShowDiscardChangesModal(false)}>
              Keep Editing
            </Button>
          </>
        }
      />
    </div>
  );
};
