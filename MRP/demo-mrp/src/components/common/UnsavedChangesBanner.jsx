import React from "react";
import { Info } from "../icons/Icons.jsx";
import { Button } from "./Button.jsx";

// Shown above a bulk upload Review step's table whenever the current draft
// has unsaved edits (isDirty). "Save & Check" persists the rows to the draft
// record (same write "Save as Draft" does) and runs the duplicate-value scan
// — but, unlike "Save as Draft", stays on the Review step instead of
// navigating back to the list. Saving via either button clears this banner
// until the next edit.
export const UnsavedChangesBanner = ({ message, buttonLabel = "Save & Check", onSave }) => (
  <div
    style={{
      background: "var(--status-yellow-container)",
      borderRadius: "var(--radius-card)",
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Info size={20} color="var(--status-yellow-primary)" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{message}</span>
    </div>
    <Button variant="outlined" size="small" onClick={onSave} style={{ flexShrink: 0, paddingLeft: "16px", paddingRight: "16px" }}>
      {buttonLabel}
    </Button>
  </div>
);
