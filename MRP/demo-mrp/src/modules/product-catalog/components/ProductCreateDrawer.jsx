import React, { useEffect, useState } from "react";
import { CloseIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { FormField, InputField } from "../../../components/index.js";
import { addProducts } from "../mock/productsMocks.js";

// Minimal create-product drawer — covers the four required product fields
// (Name, Category Name, Lead Time, Selling Price) plus SKU, following the
// same right-side drawer pattern as WorkOrderCreateDrawer.jsx. The bulk
// upload flow is the main focus of this module; this drawer intentionally
// keeps field coverage light.
const EMPTY_FORM = { sku: "", name: "", categoryName: "", leadTime: "", sellingPrice: "" };

export const ProductCreateDrawer = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Field cannot be empty";
    if (!formData.categoryName.trim()) newErrors.categoryName = "Field cannot be empty";
    if (!formData.leadTime.trim()) newErrors.leadTime = "Field cannot be empty";
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) newErrors.sellingPrice = "Field cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addProducts([formData]);
    onSaved?.();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.28)", display: "flex", justifyContent: "flex-end", zIndex: 13000 }}>
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />
      <div style={{ position: "relative", width: "480px", maxWidth: "calc(100vw - 24px)", height: "100vh", background: "var(--neutral-surface-primary)", boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--neutral-line-separator-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)" }}>New Product</h2>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <FormField label="SKU">
            <InputField
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Leave blank to auto-generate"
            />
          </FormField>
          <FormField label="Name" required error={errors.name}>
            <InputField
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Teak Wooden Board 120cm"
              errorState={!!errors.name}
            />
          </FormField>
          <FormField label="Category Name" required error={errors.categoryName}>
            <InputField
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="e.g. Wooden Boards"
              errorState={!!errors.categoryName}
            />
          </FormField>
          <FormField label="Lead Time" required error={errors.leadTime}>
            <InputField
              value={formData.leadTime}
              onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
              placeholder="e.g. 10 Days"
              errorState={!!errors.leadTime}
            />
          </FormField>
          <FormField label="Selling Price" required error={errors.sellingPrice}>
            <InputField
              type="number"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              placeholder="e.g. 850000"
              errorState={!!errors.sellingPrice}
            />
          </FormField>
        </div>

        <div style={{ padding: "20px 24px", borderTop: "1px solid var(--neutral-line-separator-1)", display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
