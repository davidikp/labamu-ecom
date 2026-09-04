import React from "react";
import { ChevronLeftIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";

export const MaterialForecastEmptyPage = ({ title, onNavigate }) => {
  return (
    <div style={{
      height: "calc(100vh - 64px)",
      padding: "24px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      background: "var(--neutral-surface-primary)",
      minHeight: 0
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }} onClick={() => onNavigate("list")}>
        <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
        <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
          {title || "Material Forecast List"}
        </h1>
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--neutral-on-surface-tertiary)"
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--neutral-surface-grey-lighter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px"
        }}>
          <span style={{ fontSize: "24px" }}>📋</span>
        </div>
        <p style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", margin: "0 0 8px 0" }}>
          Empty State
        </p>
        <p style={{ fontSize: "var(--text-body)", margin: "0 0 24px 0", maxWidth: "300px", textAlign: "center" }}>
          This page will be defined later. It will display a list specific to "{title}".
        </p>
        <Button onClick={() => onNavigate("list")}>Go Back</Button>
      </div>
    </div>
  );
};
