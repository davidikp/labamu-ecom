import React from "react";
import { CloudUploadIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Shared background-processing interstitial — used both while a fresh
// upload is being imported (Start Upload) and while a mapped file is being
// normalized in the background (Normalize and Review). Both flows persist a
// store record, simulate a delay via setTimeout in materialUploadsStore.js,
// and rely on MaterialUploadNotifier to fire the in-app/email notification
// once the status transition happens — regardless of whether this screen is
// still mounted.
export const BackgroundProcessingScreen = ({ title, message, onBackToList, buttonLabel = "Back to Bulk Upload List", secondaryActionLabel, onSecondaryAction }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      padding: "80px 24px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "var(--feature-brand-container-lighter)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <CloudUploadIcon size={32} color="var(--feature-brand-primary)" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "3px solid var(--neutral-line-separator-2)",
          borderTopColor: "var(--feature-brand-primary)",
          animation: "mc-spin 1s linear infinite",
        }}
      />
    </div>
    <style>{`@keyframes mc-spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "460px" }}>
      <span style={{ fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)" }}>
        {title}
      </span>
      <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
        {message}
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <Button variant="outlined" size="large" onClick={onBackToList}>
        {buttonLabel}
      </Button>
      {onSecondaryAction && (
        <Button variant="tertiary" size="large" onClick={onSecondaryAction} style={{ color: "var(--status-red-primary)" }}>
          {secondaryActionLabel}
        </Button>
      )}
    </div>
  </div>
);
