import React, { useState } from "react";
import { ChevronLeftIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { DetailCard } from "../../bill-of-materials/components/BomShared.jsx";

export const CustomProductRequestSettingsPage = ({ onNavigate, isSidebarCollapsed }) => {
  const [requireApproval, setRequireApproval] = useState(true);
  const [requireComment, setRequireComment] = useState(false);

  return (
    <div style={{ paddingBottom: "108px" }}>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }} onClick={() => onNavigate("list")}>
          <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
            Custom Product Request Settings
          </h1>
        </div>

        <DetailCard title="Approval Settings">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>Require Approval</span>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
                Submitted CPRs must be approved by a Product Manager before they can be completed.
              </span>
            </div>
            <ToggleSwitch checked={requireApproval} onChange={setRequireApproval} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>Require Comment on Rejection</span>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
                Approvers must leave a comment when rejecting or requesting revision.
              </span>
            </div>
            <ToggleSwitch checked={requireComment} onChange={setRequireComment} />
          </div>
        </DetailCard>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: isSidebarCollapsed ? "82px" : "286px",
          right: 0,
          transition: "left 0.2s ease",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          zIndex: 100,
        }}
      >
        <Button size="medium" variant="tertiary" onClick={() => onNavigate("list")} style={{ color: "var(--status-red-primary)" }}>
          Cancel
        </Button>
        <Button size="medium" variant="filled" onClick={() => onNavigate("list")}>
          Save
        </Button>
      </div>
    </div>
  );
};
