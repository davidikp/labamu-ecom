import React from "react";
import { ChevronLeft } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { PRODUCT_FIELDS_CONFIG } from "../mock/productFieldsConfig.js";

// Minimal "Manage" stub for the Product Catalog module — lists the product
// field schema (used by the bulk upload Mapping step) as a lightweight,
// read-only settings-style page. Kept intentionally light per spec; the
// bulk upload flow is the main focus of this module.
export const ProductCatalogManagePage = ({ onNavigate }) => (
  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <IconButton icon={ChevronLeft} onClick={() => onNavigate("product_catalog_list")} />
      <h1 style={{ margin: 0, fontSize: "var(--text-big-title)", fontWeight: "var(--font-weight-bold)" }}>
        Manage Product Catalog
      </h1>
    </div>

    <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--neutral-line-separator-2)" }}>
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Product Fields</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {PRODUCT_FIELDS_CONFIG.map((field) => (
          <div key={field.key} style={{ display: "flex", padding: "12px 20px", borderBottom: "1px solid var(--neutral-line-separator-1)", alignItems: "center", gap: "16px" }}>
            <span style={{ flex: 1.4, fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>{field.label}</span>
            <span style={{ flex: 1, fontSize: "var(--text-body)", color: field.required ? "var(--status-red-primary)" : "var(--neutral-on-surface-tertiary)" }}>
              {field.required ? "Required" : "Optional"}
            </span>
            <span style={{ flex: 2, fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{field.example}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
