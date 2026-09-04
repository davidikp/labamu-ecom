import React, { useState } from "react";
import { 
  CloseIcon,
  CloudUploadIcon,
  DeleteIcon,
  Box,
  AddIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { FormField, InputField, ImageUpload } from "../../../components/index.js";


export const MaterialCreateDrawer = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    image: initialData?.image || null,
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "",
    abcClassification: initialData?.abcClassification || "",
    materialType: initialData?.type || "", // Mapping 'type' from data to 'materialType' in form
    uom: initialData?.unit || "",
    stockRisk: initialData?.stockRisk?.toString() || "0",
    description: initialData?.description || ""
  });

  // Re-initialize form when initialData changes or drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        image: initialData?.image || null,
        name: initialData?.name || "",
        sku: initialData?.sku || "",
        category: initialData?.category || "",
        abcClassification: initialData?.abcClassification || "",
        materialType: initialData?.type || "",
        uom: initialData?.unit || "",
        stockRisk: initialData?.stockRisk?.toString() || "0",
        description: initialData?.description || ""
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const [errors, setErrors] = useState({});

  // Dynamic options
  const [categories, setCategories] = useState(["Raw Material", "Chemicals", "Electronics", "Fasteners"]);
  const [uoms, setUoms] = useState(["pcs", "kg", "grams", "liters", "meters"]);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUomModalOpen, setIsUomModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [uomForm, setUomForm] = useState({ name: "", alias: "" });
  const [categoryErrors, setCategoryErrors] = useState({});
  const [uomErrors, setUomErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Field cannot be empty";
    if (!formData.category) newErrors.category = "Field cannot be empty";
    if (!formData.abcClassification) newErrors.abcClassification = "Field cannot be empty";
    if (!formData.materialType) newErrors.materialType = "Field cannot be empty";
    if (!formData.uom) newErrors.uom = "Field cannot be empty";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave?.(formData);
      onClose();
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSaveCategory = () => {
    const newName = categoryForm.name.trim();
    if (!newName) {
      setCategoryErrors({ name: "Field cannot be empty" });
      return;
    }
    
    if (!categories.includes(newName)) {
      setCategories(prev => [newName, ...prev]);
    }
    
    handleFieldChange("category", newName);
    setIsCategoryModalOpen(false);
    setCategoryForm({ name: "", description: "" });
    setCategoryErrors({});
  };

  const handleSaveUom = () => {
    const newName = uomForm.name.trim();
    if (!newName) {
      setUomErrors({ name: "Field cannot be empty" });
      return;
    }

    if (!uoms.includes(newName)) {
      setUoms(prev => [newName, ...prev]);
    }

    handleFieldChange("uom", newName);
    setIsUomModalOpen(false);
    setUomForm({ name: "", alias: "" });
    setUomErrors({});
  };

  const formatNumber = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const num = val.toString().replace(/[^0-9]/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleNumberInput = (val, field) => {
    const numericValue = val.replace(/,/g, "").replace(/[^0-9]/g, "");
    handleFieldChange(field, numericValue);
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 13000,
      }}>
        <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />
        <div style={{
          position: "relative",
          width: "520px",
          maxWidth: "calc(100vw - 24px)",
          height: "100vh",
          background: "var(--neutral-surface-primary)",
          boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Drawer Header */}
          <div style={{ 
            padding: "20px 24px", 
            borderBottom: "1px solid var(--neutral-line-separator-1)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            background: "var(--neutral-surface-primary)" 
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: "var(--text-title-1)", 
              fontWeight: "var(--font-weight-bold)", 
              color: "var(--neutral-on-surface-primary)" 
            }}>
              {initialData ? "Edit Material" : "Add New Material"}
            </h2>
            <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <FormField label="Material Image">
              <ImageUpload value={formData.image} onChange={(val) => handleFieldChange("image", val)} />
            </FormField>

            <FormField 
              label="Material Name" 
              required 
              error={errors.name}
              headerRight={`${String(formData.name || "").length}/100`}
            >
              <InputField 
                value={formData.name} 
                onChange={(e) => handleFieldChange("name", e.target.value)} 
                placeholder="Input material name"
                maxLength={100}
                error={errors.name}
              />
            </FormField>

            <FormField label="SKU" helperText="Auto-generated if empty">
              <InputField 
                value={formData.sku} 
                onChange={(e) => handleFieldChange("sku", e.target.value)} 
                placeholder="Input SKU"
              />
            </FormField>

            <FormField label="Category" required error={errors.category}>
              <DropdownSelect 
                searchable 
                showDivider
                maxOptionsVisible={3}
                value={formData.category}
                onChange={(val) => handleFieldChange("category", val)}
                options={categories}
                placeholder="Select category"
                hasError={!!errors.category}
                footer={
                  <Button 
                    variant="tertiary" 
                    leftIcon={AddIcon} 
                    onClick={() => setIsCategoryModalOpen(true)}
                    style={{ width: "100%", justifyContent: "flex-start", height: "32px" }}
                  >
                    Add Category
                  </Button>
                }
              />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FormField label="ABC Classification" required error={errors.abcClassification}>
                <DropdownSelect 
                  showDivider
                  value={formData.abcClassification}
                  onChange={(val) => handleFieldChange("abcClassification", val)}
                  options={[
                    { value: "A", label: "A - High Value" },
                    { value: "B", label: "B - Medium Value" },
                    { value: "C", label: "C - Low Value" }
                  ]}
                  placeholder="Select classification"
                  hasError={!!errors.abcClassification}
                />
              </FormField>

              <FormField label="Material Type" required error={errors.materialType}>
                <DropdownSelect 
                  showDivider
                  value={formData.materialType}
                  onChange={(val) => handleFieldChange("materialType", val)}
                  options={[
                    { value: "Raw", label: "Raw Material" },
                    { value: "Component", label: "Semi-Finished Material" },
                    { value: "Consumable", label: "Finished Material" }
                  ]}
                  placeholder="Select material type"
                  hasError={!!errors.materialType}
                />
              </FormField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FormField label="Unit of Measurement (UOM)" required error={errors.uom}>
                <DropdownSelect 
                  searchable
                  showDivider
                  maxOptionsVisible={3}
                  value={formData.uom}
                  onChange={(val) => handleFieldChange("uom", val)}
                  options={uoms}
                  placeholder="Select UOM"
                  hasError={!!errors.uom}
                  footer={
                    <Button 
                      variant="tertiary" 
                      leftIcon={AddIcon} 
                      onClick={() => setIsUomModalOpen(true)}
                      style={{ width: "100%", justifyContent: "flex-start", height: "32px" }}
                    >
                      Add Unit of Measurement
                    </Button>
                  }
                />
              </FormField>

              <FormField label="Stock Risk" helperText="Enter running low threshold value">
                <InputField 
                  value={formatNumber(formData.stockRisk)}
                  onChange={(e) => handleNumberInput(e.target.value, "stockRisk")}
                  placeholder="0"
                />
              </FormField>
            </div>

            <FormField 
              label="Description"
              headerRight={`${String(formData.description || "").length}/1000`}
            >
              <InputField multiline={true} 
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Input material description"
                maxLength={1000}
              />
            </FormField>
          </div>

          {/* Drawer Footer */}
          <div style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            background: "var(--neutral-surface-primary)"
          }}>
            <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>Save</Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GeneralModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Category"
        width="480px"
        zIndex={16000}
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="filled" size="large" onClick={handleSaveCategory} style={{ flex: 1 }}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <FormField label="Name" required headerRight={`${categoryForm.name.length}/100`} error={categoryErrors.name}>
            <InputField 
              value={categoryForm.name}
              onChange={(e) => {
                setCategoryForm({ ...categoryForm, name: e.target.value });
                if (e.target.value.trim()) setCategoryErrors({});
              }}
              placeholder="Enter category name"
              maxLength={100}
              error={categoryErrors.name}
            />
          </FormField>
          <FormField label="Description" headerRight={`${categoryForm.description.length}/1000`}>
            <InputField multiline={true} 
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Enter category description"
              maxLength={1000}
            />
          </FormField>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={isUomModalOpen}
        onClose={() => setIsUomModalOpen(false)}
        title="Add Unit of Measurement"
        width="480px"
        zIndex={16000}
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsUomModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="filled" size="large" onClick={handleSaveUom} style={{ flex: 1 }}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <FormField label="Name" required headerRight={`${uomForm.name.length}/100`} error={uomErrors.name}>
            <InputField 
              value={uomForm.name}
              onChange={(e) => {
                setUomForm({ ...uomForm, name: e.target.value });
                if (e.target.value.trim()) setUomErrors({});
              }}
              placeholder="e.g. Kilogram, Piece, Meter"
              maxLength={100}
              error={uomErrors.name}
            />
          </FormField>
          <FormField label="UOM Alias" headerRight={`${uomForm.alias.length}/100`}>
            <InputField 
              value={uomForm.alias}
              onChange={(e) => setUomForm({ ...uomForm, alias: e.target.value })}
              placeholder="e.g. kg, pcs, m"
              maxLength={100}
            />
          </FormField>
        </div>
      </GeneralModal>
    </>
  );
};
