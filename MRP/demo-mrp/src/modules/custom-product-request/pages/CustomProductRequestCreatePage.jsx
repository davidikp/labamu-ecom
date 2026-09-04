import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AddIcon,
  Box,
  Building2,
  CheckIcon,
  ChevronLeftIcon,
  CircleDollarSign,
  FileText,
  MoreVerticalIcon,
  Upload,
  Users,
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { ImageUploadField } from "../../../components/molecules/ImageUploadField.jsx";
import { Dropdown as CeDropdown, RadioButton } from "../../../ce-ui";
import { resolveMaterialOption, DEFAULT_COGS, getBoms } from "../../bill-of-materials/mock/bomMocks.js";
import { computeMaterialCost, fieldTotal, formatIDR } from "../../bill-of-materials/utils/bomUtils.js";
import { CostFieldAccordion } from "../../bill-of-materials/components/CostFieldAccordion.jsx";
import { MaterialLineModal } from "../../bill-of-materials/components/MaterialLineModal.jsx";
import { RoutingLineModal } from "../../bill-of-materials/components/RoutingLineModal.jsx";
import { getCpr, saveCprProductDetail } from "../mock/customProductRequestMocks.js";
import { createImageUploadRecord } from "../../../utils/upload/uploadUtils.js";

const DEFAULT_CATEGORY_OPTIONS = ["Furniture", "Cabinet", "Table", "Chair"];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const LEAD_TIME_UNITS = [
  { value: "Day", label: "Day" },
  { value: "Week", label: "Week" },
  { value: "Month", label: "Month" },
];

const CURRENCY_OPTIONS = [
  { value: "IDR", label: "IDR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "JPY", label: "JPY" },
  { value: "SGD", label: "SGD" },
  { value: "MYR", label: "MYR" },
  { value: "GBP", label: "GBP" },
  { value: "AUD", label: "AUD" },
  { value: "CNY", label: "CNY" },
];

const pageSectionStyle = {
  background: "var(--neutral-surface-primary)",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  overflow: "hidden",
};

const sectionHeader = (title, right) => (
  <div style={{ padding: "18px 20px 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", position: "relative" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "6px", height: "24px", borderRadius: "0 4px 4px 0", background: "var(--feature-brand-primary)", position: "absolute", left: 0, top: "18px" }} />
      <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{title}</span>
    </div>
    {right || null}
  </div>
);

const rowWrapStyle = { display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: "20px", alignItems: "start" };

const fieldLabelCol = (label, required = false, helper) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "8px" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
      {required ? <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-title-3)" }}>*</span> : null}
      <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{label}</span>
    </div>
    {helper ? <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{helper}</span> : null}
  </div>
);

const fieldErrorText = (message) =>
  message ? (
    <span style={{ display: "block", color: "var(--status-red-primary)", fontSize: "var(--text-body)", marginTop: "4px" }}>{message}</span>
  ) : null;

const MATERIALS_TABLE_COLUMNS = "minmax(160px, 1.6fr) 120px minmax(100px, 1fr) 100px 120px 90px 130px 120px";
const ROUTING_TABLE_COLUMNS = "40px 60px minmax(140px, 1.4fr) minmax(140px, 1.4fr) 100px 120px";

const tableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid", gridTemplateColumns, gap: "8px", padding: "0 16px", height: "49px", alignItems: "center",
  fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
});

const tableRowStyle = (gridTemplateColumns, isLast) => ({
  display: "grid", gridTemplateColumns, gap: "8px", padding: "0 16px", minHeight: "64px", alignItems: "center",
  fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
});

const rowActionButtonStyle = (color, disabled = false) => (disabled ? { padding: "0 4px" } : { color, padding: "0 4px" });

const emptyStateBoxStyle = {
  padding: "40px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)",
  background: "var(--neutral-surface-primary)", border: "1.5px dashed var(--neutral-line-separator-1)", borderRadius: "16px",
};

// Matches the Bill of Materials module's own create/edit form — see
// modules/bill-of-materials/pages/BomCreatePage.jsx.
const COGS_FIELDS = [
  { key: "labour", title: "Labour Cost", icon: Users, description: "Cost of human labour to produce one unit" },
  { key: "packing", title: "Packing Cost", icon: FileText, description: "Cost of packaging this product for delivery" },
  { key: "shipping", title: "Shipping Cost", icon: Upload, description: "Cost of moving goods" },
  { key: "overhead", title: "Overhead Cost", icon: Building2, description: "Indirect factory costs not tied to a task" },
  { key: "other", title: "Other Cost", icon: CircleDollarSign, description: "Additional production cost not covered above" },
];

let routingUidCounter = 1;
const nextRoutingUid = () => `routing-${routingUidCounter++}`;

const STEPS = [
  { key: "products", label: "Products" },
  { key: "bom", label: "Bill of Materials" },
  { key: "prices", label: "Prices" },
];

// Free-jump stepper: clicking any circle navigates there directly; Next/Submit
// are the only actions gated by per-step required-field validation.
const Stepper = ({ currentStep, onStepClick, isStepValid }) => (
  <div style={{ display: "flex", alignItems: "flex-start" }}>
    {STEPS.map((step, idx) => {
      const isActive = idx === currentStep;
      const isComplete = !isActive && isStepValid(idx);
      const circleColor = isActive ? "var(--feature-brand-primary)" : isComplete ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)";
      return (
        <React.Fragment key={step.key}>
          <div
            onClick={() => onStepClick(idx)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", flexShrink: 0 }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "var(--feature-brand-primary)" : isComplete ? "var(--feature-brand-container-lighter)" : "var(--neutral-surface-primary)",
                border: `1.5px solid ${circleColor}`,
                color: isActive ? "#fff" : isComplete ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--text-title-3)",
                boxSizing: "border-box",
              }}
            >
              {isComplete ? <CheckIcon size={16} color="var(--feature-brand-primary)" /> : idx + 1}
            </div>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-medium)",
                color: isActive ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 ? (
            <div
              style={{
                flex: 1,
                height: "1.5px",
                marginTop: "15px",
                marginLeft: "8px",
                marginRight: "8px",
                background: isComplete ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)",
              }}
            />
          ) : null}
        </React.Fragment>
      );
    })}
  </div>
);

export const CustomProductRequestCreatePage = ({ onNavigate, initialData, isSidebarCollapsed }) => {
  const cpr = getCpr(initialData?.cprNumber) || initialData;
  const detail = cpr?.productDetail || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState({});
  const initialSnapshotRef = useRef(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingDiscardAction, setPendingDiscardAction] = useState(null);

  const [productName, setProductName] = useState(detail.productName || cpr?.requestedProductName || "");
  const [sku, setSku] = useState(detail.sku || "");
  const [category, setCategory] = useState(detail.category || "");
  const [categories, setCategories] = useState(
    detail.category && !DEFAULT_CATEGORY_OPTIONS.includes(detail.category)
      ? [...DEFAULT_CATEGORY_OPTIONS, detail.category]
      : DEFAULT_CATEGORY_OPTIONS
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [status, setStatus] = useState(detail.status || "Active");
  const [description, setDescription] = useState(detail.description || "");
  const [productImages, setProductImages] = useState(() =>
    (detail.images || []).map((img) => createImageUploadRecord(img)).filter(Boolean)
  );

  const handleAddProductImages = (files) =>
    setProductImages((prev) => [...prev, ...Array.from(files).map((file) => createImageUploadRecord(file))]);
  const handleRemoveProductImage = (image) =>
    setProductImages((prev) => prev.filter((item) => item.id !== image.id));

  const handleSaveNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCategory(trimmed);
    setCategoryModalOpen(false);
    setNewCategoryName("");
    setNewCategoryDescription("");
  };

  const [primaryMaterial, setPrimaryMaterial] = useState(detail.specification?.primaryMaterial || "");
  const [finishing, setFinishing] = useState(detail.specification?.finishing || "");
  const [weight, setWeight] = useState(detail.specification?.weight || "");

  const [finishedDim, setFinishedDim] = useState(detail.finishedDimensions || { height: "", width: "", length: "" });
  const [packedDim, setPackedDim] = useState(detail.packedDimensions || { height: "", width: "", length: "" });
  const [containerCapacity, setContainerCapacity] = useState(
    detail.containerCapacity || { "20ft": "", "40ft": "", "40ftHc": "" }
  );

  const [bomName, setBomName] = useState(detail.bom?.name || "");
  // Selecting an existing BOM locks the rest of this step to that BOM's data;
  // typing a new name (via the "+ Add" row) re-enables manual editing.
  const [isExistingBomSelected, setIsExistingBomSelected] = useState(false);
  const [bomStatus, setBomStatus] = useState(detail.bom?.status || "Active");
  const [bomDescription, setBomDescription] = useState(detail.bom?.description || "");
  const [materials, setMaterials] = useState(detail.bom?.materials?.map((m) => ({ materialId: m.materialId, quantity: m.quantity })) || []);
  const [routing, setRouting] = useState(
    detail.bom?.routing?.length ? detail.bom.routing.map((r) => ({ ...r, _uid: nextRoutingUid() })) : []
  );
  const [materialModal, setMaterialModal] = useState(null);
  const [routingModal, setRoutingModal] = useState(null);
  const [invalidCogsLineIds, setInvalidCogsLineIds] = useState(new Set());

  // Custom (non-native) drag for Routing rows — mirrors BomCreatePage.jsx's
  // drag implementation exactly (native HTML5 drag can't render both a
  // floating card and a drop placeholder at once).
  const [dragState, setDragState] = useState(null); // { index, grabOffsetY, mouseY, left, width }
  const routingListRef = useRef(null);
  const ROUTING_ROW_HEIGHT = 65;

  const [cogs, setCogs] = useState(detail.cogs || DEFAULT_COGS());
  const updateCogsField = (key, nextField) => setCogs((prev) => ({ ...prev, [key]: nextField }));

  const [leadTimeValue, setLeadTimeValue] = useState(detail.leadTime?.value || "");
  const [leadTimeUnit, setLeadTimeUnit] = useState(detail.leadTime?.unit || "Day");
  const [sellingPrice, setSellingPrice] = useState(detail.sellingPrice || 0);
  // The IDR row always mirrors the Selling Price field above (rendered separately,
  // disabled) — this state only holds additional currency rows.
  const [salesPriceList, setSalesPriceList] = useState((detail.salesPriceList || []).filter((p) => p.currency !== "IDR"));

  if (!cpr) return null;

  const resolvedMaterials = materials
    .filter((line) => line.materialId)
    .map((line) => {
      const option = resolveMaterialOption(line.materialId);
      return {
        materialId: line.materialId,
        name: option?.name || "Unknown Material",
        sku: option?.sku || "-",
        category: option?.category || "-",
        abcClassification: option?.abcClassification || "-",
        type: option?.type || "-",
        unit: option?.unit || "-",
        quantity: Number(line.quantity) || 0,
      };
    });

  const materialCost = computeMaterialCost(resolvedMaterials);
  const basePrice = materialCost + COGS_FIELDS.reduce((sum, { key }) => sum + fieldTotal(cogs[key]), 0);

  const bomOptions = getBoms().map((b) => ({ value: b.id, label: b.name, record: b }));
  const bomDropdownOptions = !isExistingBomSelected && bomName
    ? [{ value: "__new_bom__", label: bomName }, ...bomOptions]
    : bomOptions;

  const handleSelectExistingBom = (bomId) => {
    const selected = bomOptions.find((o) => o.value === bomId)?.record;
    if (!selected) return;
    setIsExistingBomSelected(true);
    setBomName(selected.name || "");
    setBomStatus(selected.status || "Active");
    setBomDescription(selected.description || "");
    setMaterials((selected.materials || []).map((m) => ({ materialId: m.materialId, quantity: m.quantity })));
    setRouting((selected.routing || []).map((r) => ({ ...r, _uid: nextRoutingUid() })));
    setCogs(selected.cogs || DEFAULT_COGS());
  };

  const handleCreateNewBom = (typedName) => {
    setIsExistingBomSelected(false);
    setBomName(typedName);
  };

  const saveMaterialLine = (line) => {
    setMaterials((prev) => (materialModal.index == null ? [...prev, line] : prev.map((l, i) => (i === materialModal.index ? line : l))));
    setMaterialModal(null);
  };
  const removeMaterialLine = (idx) => setMaterials((prev) => prev.filter((_, i) => i !== idx));

  const saveRoutingLine = (line) => {
    setRouting((prev) =>
      routingModal.index == null
        ? [...prev, { ...line, _uid: nextRoutingUid() }]
        : prev.map((l, i) => (i === routingModal.index ? { ...line, _uid: l._uid } : l))
    );
    setRoutingModal(null);
  };
  const removeRoutingLine = (idx) => setRouting((prev) => prev.filter((_, i) => i !== idx));

  const reorderRouting = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setRouting((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const hoverIndexForMouseY = (mouseY) => {
    if (!routingListRef.current) return dragState?.index ?? 0;
    const top = routingListRef.current.getBoundingClientRect().top;
    const rawIndex = Math.round((mouseY - top) / ROUTING_ROW_HEIGHT);
    return Math.max(0, Math.min(routing.length - 1, rawIndex));
  };

  const handleRoutingDragHandleMouseDown = (e, idx) => {
    e.preventDefault();
    const rowEl = routingListRef.current?.children[idx];
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    setDragState({ index: idx, grabOffsetY: e.clientY - rect.top, mouseY: e.clientY, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!dragState) return undefined;
    const handleMouseMove = (e) => setDragState((prev) => (prev ? { ...prev, mouseY: e.clientY } : prev));
    const handleMouseUp = () => {
      setDragState((prev) => {
        if (prev) {
          const targetIndex = hoverIndexForMouseY(prev.mouseY);
          reorderRouting(prev.index, targetIndex);
        }
        return null;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragState?.index]);

  const dragHoverIndex = dragState ? hoverIndexForMouseY(dragState.mouseY) : null;
  const draggedRoutingLine = dragState ? routing[dragState.index] : null;

  // Required-field checks per step, keyed by field name for inline error text.
  const validateProductsStep = () => {
    const errors = {};
    if (!productName.trim()) errors.productName = "Field cannot be empty";
    if (!category.trim()) errors.category = "Field cannot be empty";
    if (!description.trim()) errors.description = "Field cannot be empty";
    return errors;
  };
  const validateBomStep = () => {
    const errors = {};
    if (!bomName.trim()) errors.bomName = "Field cannot be empty";
    return errors;
  };
  const validatePricesStep = () => {
    const errors = {};
    if (!String(leadTimeValue).trim()) errors.leadTimeValue = "Field cannot be empty";
    if (!Number(sellingPrice) || Number(sellingPrice) <= 0) errors.sellingPrice = "Field cannot be empty";
    return errors;
  };
  const stepValidators = [validateProductsStep, validateBomStep, validatePricesStep];
  const isStepValid = (idx) => Object.keys(stepValidators[idx]()).length === 0;

  const goToStep = (idx) => {
    setStepErrors({});
    setCurrentStep(idx);
  };

  const handleNext = () => {
    const errors = stepValidators[currentStep]();
    if (Object.keys(errors).length) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStepErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const buildProductDetail = () => ({
    productName,
    sku,
    category,
    status,
    description,
    images: productImages,
    specification: { primaryMaterial, finishing, weight },
    finishedDimensions: finishedDim,
    packedDimensions: packedDim,
    containerCapacity,
    bom: {
      name: bomName,
      status: bomStatus,
      description: bomDescription,
      materials: resolvedMaterials,
      routing: routing.map(({ _uid, ...r }, idx) => ({ ...r, step: idx + 1 })),
    },
    cogs,
    basePrice,
    leadTime: { value: leadTimeValue, unit: leadTimeUnit },
    sellingPrice: Number(sellingPrice) || 0,
    salesPriceList: [{ currency: "IDR", sellingPrice: Number(sellingPrice) || 0 }, ...salesPriceList],
  });

  useEffect(() => {
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify(buildProductDetail());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFormDirty = () => initialSnapshotRef.current !== null && JSON.stringify(buildProductDetail()) !== initialSnapshotRef.current;

  const guardedLeave = (action) => {
    if (isFormDirty()) {
      setPendingDiscardAction(() => action);
      setShowDiscardModal(true);
    } else {
      action();
    }
  };

  const handleCancel = () => onNavigate("detail", cpr);

  const handleSaveDraft = () => {
    const saved = saveCprProductDetail(cpr.cprNumber, { productDetail: buildProductDetail(), submit: false });
    onNavigate("detail", saved);
  };

  const handleSubmit = () => {
    for (let i = 0; i < STEPS.length; i += 1) {
      const errors = stepValidators[i]();
      if (Object.keys(errors).length) {
        setCurrentStep(i);
        setStepErrors(errors);
        return;
      }
    }
    setStepErrors({});
    const saved = saveCprProductDetail(cpr.cprNumber, { productDetail: buildProductDetail(), submit: true });
    onNavigate("detail", saved);
  };

  const pageTitle = cpr.status === "New" ? "Fill CPR Detail" : "Edit CPR";

  return (
    <div style={{ paddingBottom: "108px" }}>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }} onClick={() => guardedLeave(handleCancel)}>
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>{pageTitle}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => guardedLeave(() => onNavigate("list"))}>Custom Product Request</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => guardedLeave(handleCancel)}>CPR Detail</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>{pageTitle}</span>
          </div>
        </div>

        <div style={pageSectionStyle}>
          {sectionHeader("CPR Information")}
          <div style={{ padding: "18px 20px 20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", textTransform: "uppercase" }}>Requested Product Name</span>
              <span style={{ fontSize: "var(--text-title-3)" }}>{cpr.requestedProductName}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", textTransform: "uppercase" }}>Requested Quantity</span>
              <span style={{ fontSize: "var(--text-title-3)" }}>{cpr.requestedQuantity} units</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", textTransform: "uppercase" }}>Notes</span>
              <span style={{ fontSize: "var(--text-title-3)" }}>{cpr.productNotes || "-"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", textTransform: "uppercase" }}>Attachments</span>
              <span style={{ fontSize: "var(--text-title-3)" }}>
                {cpr.attachments?.length ? `${cpr.attachments.length} file(s)` : "No attachments"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ ...pageSectionStyle, padding: "20px 24px" }}>
          <Stepper currentStep={currentStep} onStepClick={goToStep} isStepValid={isStepValid} />
        </div>

        {currentStep === 0 ? (
          <>
            <div style={pageSectionStyle}>
              {sectionHeader("Basic Information")}
              <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Product Name", true)}
                  <div>
                    <InputField placeholder="Enter product name" value={productName} onChange={(e) => setProductName(e.target.value)} maxLength={100} showCounter errorState={!!stepErrors.productName} />
                    {fieldErrorText(stepErrors.productName)}
                  </div>
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("SKU", false, "If empty, the system will auto-generate the SKU")}
                  <InputField placeholder="Enter SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Category", true)}
                  <div>
                    <CeDropdown
                      searchable
                      size="lg"
                      placeholder="Select or search category"
                      options={categories.map((c) => ({ value: c, label: c }))}
                      value={category || undefined}
                      onChange={setCategory}
                      error={!!stepErrors.category}
                      footer={
                        <Button
                          variant="tertiary"
                          size="small"
                          leftIcon={AddIcon}
                          style={{ width: "100%", justifyContent: "flex-start" }}
                          onClick={() => setCategoryModalOpen(true)}
                        >
                          Add new category
                        </Button>
                      }
                    />
                    {fieldErrorText(stepErrors.category)}
                  </div>
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Status", true)}
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingTop: "8px" }}>
                    {STATUS_OPTIONS.map((opt) => (
                      <RadioButton key={opt.value} label={opt.label} checked={status === opt.value} onChange={() => setStatus(opt.value)} />
                    ))}
                  </div>
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Description", true)}
                  <div>
                    <InputField multiline placeholder="Enter product description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} showCounter errorState={!!stepErrors.description} />
                    {fieldErrorText(stepErrors.description)}
                  </div>
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Product Images", false, "Max 5MB per image, maximum 5 images")}
                  <ImageUploadField
                    label=""
                    images={productImages}
                    maxFiles={5}
                    onFilesSelected={handleAddProductImages}
                    onRemove={handleRemoveProductImage}
                  />
                </div>
              </div>
            </div>

            <div style={pageSectionStyle}>
              {sectionHeader("Product Specification")}
              <div style={{ padding: "18px 20px 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <InputField label="Primary Material" placeholder="Enter primary material" value={primaryMaterial} onChange={(e) => setPrimaryMaterial(e.target.value)} />
                <InputField label="Finishing" placeholder="Enter finishing" value={finishing} onChange={(e) => setFinishing(e.target.value)} />
                <InputField label="Weight" placeholder="Enter weight" suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </div>

            <div style={pageSectionStyle}>
              {sectionHeader("Finished Product Dimensions")}
              <div style={{ padding: "18px 20px 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <InputField label="Height" placeholder="Enter height" suffix="cm" value={finishedDim.height} onChange={(e) => setFinishedDim((p) => ({ ...p, height: e.target.value }))} />
                <InputField label="Width" placeholder="Enter width" suffix="cm" value={finishedDim.width} onChange={(e) => setFinishedDim((p) => ({ ...p, width: e.target.value }))} />
                <InputField label="Length" placeholder="Enter length" suffix="cm" value={finishedDim.length} onChange={(e) => setFinishedDim((p) => ({ ...p, length: e.target.value }))} />
              </div>
            </div>

            <div style={pageSectionStyle}>
              {sectionHeader("Packed Product Dimensions")}
              <div style={{ padding: "18px 20px 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <InputField label="Height" placeholder="Enter height" suffix="cm" value={packedDim.height} onChange={(e) => setPackedDim((p) => ({ ...p, height: e.target.value }))} />
                <InputField label="Width" placeholder="Enter width" suffix="cm" value={packedDim.width} onChange={(e) => setPackedDim((p) => ({ ...p, width: e.target.value }))} />
                <InputField label="Length" placeholder="Enter length" suffix="cm" value={packedDim.length} onChange={(e) => setPackedDim((p) => ({ ...p, length: e.target.value }))} />
              </div>
            </div>

            <div style={pageSectionStyle}>
              {sectionHeader("Container Capacity")}
              <div style={{ padding: "18px 20px 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <InputField label="20 ft Container" placeholder="Enter capacity" suffix="units" value={containerCapacity["20ft"]} onChange={(e) => setContainerCapacity((p) => ({ ...p, "20ft": e.target.value }))} />
                <InputField label="40 ft Container" placeholder="Enter capacity" suffix="units" value={containerCapacity["40ft"]} onChange={(e) => setContainerCapacity((p) => ({ ...p, "40ft": e.target.value }))} />
                <InputField label="40 ft High Cube Container" placeholder="Enter capacity" suffix="units" value={containerCapacity["40ftHc"]} onChange={(e) => setContainerCapacity((p) => ({ ...p, "40ftHc": e.target.value }))} />
              </div>
            </div>
          </>
        ) : null}

        {currentStep === 1 ? (
          <>
            <div style={pageSectionStyle}>
              {sectionHeader("Bills of Material Information")}
              <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("BOM Name", true, "Select an existing BOM or type to create a new one")}
                  <div>
                    <CeDropdown
                      searchable
                      size="lg"
                      customValueEnabled
                      customValueLabel="new BOM"
                      placeholder="Type to search or create a new BOM"
                      options={bomDropdownOptions}
                      value={isExistingBomSelected ? bomOptions.find((o) => o.label === bomName)?.value : bomName ? "__new_bom__" : undefined}
                      onChange={(v) => {
                        if (v === "__new_bom__") return;
                        handleSelectExistingBom(v);
                      }}
                      onAddNewOption={handleCreateNewBom}
                      error={!!stepErrors.bomName}
                    />
                    {fieldErrorText(stepErrors.bomName)}
                  </div>
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("BOM Description")}
                  <InputField
                    disabled={isExistingBomSelected}
                    multiline
                    placeholder={isExistingBomSelected ? undefined : "Enter description"}
                    value={isExistingBomSelected ? bomDescription || "-" : bomDescription}
                    onChange={(e) => setBomDescription(e.target.value)}
                    maxLength={1000}
                    showCounter={!isExistingBomSelected}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={pageSectionStyle}>
              {sectionHeader("Materials", <Button variant="tertiary" size="small" leftIcon={AddIcon} disabled={isExistingBomSelected} onClick={() => setMaterialModal({ index: null })}>Add Material</Button>)}
              <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {materials.length ? (
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ minWidth: "760px" }}>
                      <div style={tableHeaderRowStyle(MATERIALS_TABLE_COLUMNS)}>
                        <span>Material Name</span><span>SKU</span><span>Category</span><span>Type</span><span>Average Cost</span><span>Quantity</span><span>Subtotal</span><span style={{ textAlign: "right" }}>Actions</span>
                      </div>
                      {materials.map((line, idx) => {
                        const option = resolveMaterialOption(line.materialId);
                        const averageCost = option?.averageCost || 0;
                        const subtotal = averageCost * Number(line.quantity || 0);
                        return (
                          <div key={idx} style={tableRowStyle(MATERIALS_TABLE_COLUMNS, idx === materials.length - 1)}>
                            <span>{option?.name || "Unknown Material"}</span>
                            <span>{option?.sku || "-"}</span>
                            <span>{option?.category || "-"}</span>
                            <span>{option?.type || "-"}</span>
                            <span>{formatIDR(averageCost)}</span>
                            <span>{line.quantity}</span>
                            <span>{formatIDR(subtotal)}</span>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <Button variant="tertiary" size="small" disabled={isExistingBomSelected} style={rowActionButtonStyle("var(--feature-brand-primary)", isExistingBomSelected)} onClick={() => setMaterialModal({ index: idx })}>Edit</Button>
                              <Button variant="tertiary" size="small" disabled={isExistingBomSelected} style={rowActionButtonStyle("var(--status-red-primary)", isExistingBomSelected)} onClick={() => removeMaterialLine(idx)}>Delete</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={emptyStateBoxStyle}>No materials added yet. Click "Add Material" to get started.</div>
                )}
              </div>
            </div>

            <div style={pageSectionStyle}>
              {sectionHeader("Routing", <Button variant="tertiary" size="small" leftIcon={AddIcon} disabled={isExistingBomSelected} onClick={() => setRoutingModal({ index: null })}>Add Routing</Button>)}
              <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {routing.length ? (
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ minWidth: "700px" }}>
                      <div style={tableHeaderRowStyle(ROUTING_TABLE_COLUMNS)}>
                        <span /><span>Step</span><span>Routing Name</span><span>Operation Name</span><span>Hours</span><span style={{ textAlign: "right" }}>Actions</span>
                      </div>
                      <div ref={routingListRef}>
                        {(() => {
                          let displayRows = routing.map((line, idx) => ({ line, idx }));
                          if (dragState) {
                            displayRows = displayRows.filter((r) => r.idx !== dragState.index);
                            const insertAt = Math.min(dragHoverIndex, displayRows.length);
                            displayRows.splice(insertAt, 0, { placeholder: true });
                          }
                          return displayRows.map((row, displayIdx) => {
                            const isLastDisplayRow = displayIdx === displayRows.length - 1;
                            if (row.placeholder) {
                              return (
                                <div
                                  key="drop-placeholder"
                                  style={{
                                    ...tableRowStyle(ROUTING_TABLE_COLUMNS, isLastDisplayRow),
                                    background: "var(--neutral-surface-grey-lighter)",
                                    border: "1.5px dashed var(--neutral-line-separator-1)",
                                    borderRadius: "8px",
                                  }}
                                />
                              );
                            }
                            const { line, idx } = row;
                            return (
                              <div key={line._uid} style={{ ...tableRowStyle(ROUTING_TABLE_COLUMNS, isLastDisplayRow), transition: "background 0.15s ease" }}>
                                <div
                                  onMouseDown={(e) => !isExistingBomSelected && handleRoutingDragHandleMouseDown(e, idx)}
                                  style={{ cursor: isExistingBomSelected ? "default" : "grab", display: "flex", alignItems: "center" }}
                                >
                                  <MoreVerticalIcon size={16} color="var(--neutral-on-surface-tertiary)" />
                                </div>
                                <span>{idx + 1}</span>
                                <span>{line.name}</span>
                                <span>{line.operation}</span>
                                <span>{line.hours} hours</span>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                  <Button variant="tertiary" size="small" disabled={isExistingBomSelected} style={rowActionButtonStyle("var(--feature-brand-primary)", isExistingBomSelected)} onClick={() => setRoutingModal({ index: idx })}>Edit</Button>
                                  <Button variant="tertiary" size="small" disabled={isExistingBomSelected} style={rowActionButtonStyle("var(--status-red-primary)", isExistingBomSelected)} onClick={() => removeRoutingLine(idx)}>Delete</Button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={emptyStateBoxStyle}>No routing steps added yet. Click "Add Routing" to get started.</div>
                )}

                {dragState && draggedRoutingLine && typeof document !== "undefined"
                  ? createPortal(
                      <div
                        style={{
                          position: "fixed",
                          top: dragState.mouseY - dragState.grabOffsetY,
                          left: dragState.left + 16,
                          width: dragState.width - 16,
                          zIndex: 10000,
                          pointerEvents: "none",
                          ...tableRowStyle(ROUTING_TABLE_COLUMNS, true),
                          background: "var(--neutral-surface-primary)",
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "8px",
                          boxShadow: "0px 8px 20px rgba(0,0,0,0.18)",
                        }}
                      >
                        <MoreVerticalIcon size={16} color="var(--neutral-on-surface-tertiary)" />
                        <span>{dragState.index + 1}</span>
                        <span>{draggedRoutingLine.name}</span>
                        <span>{draggedRoutingLine.operation}</span>
                        <span>{draggedRoutingLine.hours} hours</span>
                        <div />
                      </div>,
                      document.body
                    )
                  : null}
              </div>
            </div>

            <div style={{ ...pageSectionStyle, borderRadius: "24px" }}>
              {sectionHeader("Forecasted Cost of Goods Sold")}
              <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Box size={16} color="var(--neutral-on-surface-secondary)" style={{ marginTop: "2px" }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>
                        Material Cost
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                        Sum of BOM qty × avg stock cost per material
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--neutral-on-surface-primary)" }}>
                    {formatIDR(materialCost)}
                  </span>
                </div>
                {COGS_FIELDS.map(({ key, title, icon, description: fieldDescription }) => (
                  <React.Fragment key={key}>
                    <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />
                    <CostFieldAccordion
                      icon={icon}
                      title={title}
                      description={fieldDescription}
                      field={cogs[key]}
                      onChange={(nextField) => updateCogsField(key, nextField)}
                      invalidLineIds={invalidCogsLineIds}
                      disabled={isExistingBomSelected}
                    />
                  </React.Fragment>
                ))}
                <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)" }}>Total Forecasted COGS (Base Price)</span>
                  <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-black)" }}>{formatIDR(basePrice)}</span>
                </div>
              </div>
            </div>
            </div>
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <div style={pageSectionStyle}>
              {sectionHeader("Price")}
              <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Base Price", true, "Base price is auto-filled based on BOM cost of goods sold")}
                  <InputField disabled type="number" prefix="IDR" value={basePrice} />
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Lead Time", true)}
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "12px" }}>
                      <InputField placeholder="Enter lead time" value={leadTimeValue} onChange={(e) => setLeadTimeValue(e.target.value)} errorState={!!stepErrors.leadTimeValue} />
                      <DropdownSelect options={LEAD_TIME_UNITS} value={leadTimeUnit} onChange={setLeadTimeUnit} style={{ minHeight: "46px" }} />
                    </div>
                    {fieldErrorText(stepErrors.leadTimeValue)}
                  </div>
                </div>
                <div style={rowWrapStyle}>
                  {fieldLabelCol("Selling Price", true)}
                  <div>
                    <InputField type="number" prefix="IDR" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} errorState={!!stepErrors.sellingPrice} />
                    {fieldErrorText(stepErrors.sellingPrice)}
                  </div>
                </div>
              </div>
            </div>

            <div style={pageSectionStyle}>
              {sectionHeader("Sales Price List", (
                <Button
                  variant="tertiary"
                  size="small"
                  leftIcon={AddIcon}
                  onClick={() => {
                    const usedCurrencies = new Set(["IDR", ...salesPriceList.map((p) => p.currency)]);
                    const nextCurrency = CURRENCY_OPTIONS.find((c) => !usedCurrencies.has(c.value))?.value || "USD";
                    setSalesPriceList((prev) => [...prev, { currency: nextCurrency, sellingPrice: 0 }]);
                  }}
                >
                  Add Price
                </Button>
              ))}
              <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "8px", padding: "0 16px", height: "49px", alignItems: "center", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", borderBottom: "1px solid var(--neutral-line-separator-1)" }}>
                    <span>Currency</span><span>Selling Price</span><span style={{ textAlign: "right" }}>Action</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "8px", padding: "0 16px", minHeight: "64px", alignItems: "center", borderBottom: salesPriceList.length ? "1px solid var(--neutral-line-separator-1)" : "none" }}>
                    <span>IDR</span>
                    <InputField type="number" disabled value={sellingPrice} />
                    <div />
                  </div>
                  {salesPriceList.map((p, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "8px", padding: "0 16px", minHeight: "64px", alignItems: "center", borderBottom: idx === salesPriceList.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)" }}>
                      <DropdownSelect
                        options={CURRENCY_OPTIONS.filter((c) => c.value === p.currency || c.value !== "IDR")}
                        value={p.currency}
                        onChange={(value) =>
                          setSalesPriceList((prev) => prev.map((row, i) => (i === idx ? { ...row, currency: value } : row)))
                        }
                      />
                      <InputField
                        type="number"
                        value={p.sellingPrice}
                        onChange={(e) =>
                          setSalesPriceList((prev) => prev.map((row, i) => (i === idx ? { ...row, sellingPrice: e.target.value } : row)))
                        }
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          variant="tertiary"
                          size="small"
                          style={rowActionButtonStyle("var(--status-red-primary)")}
                          onClick={() => setSalesPriceList((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
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
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <Button size="large" variant="tertiary" onClick={() => guardedLeave(handleCancel)} style={{ color: "var(--status-red-primary)" }}>Cancel</Button>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button size="large" variant="outlined" onClick={handleSaveDraft}>Save as Draft</Button>
          {currentStep > 0 ? (
            <Button size="large" variant="outlined" onClick={handleBack}>Previous Step</Button>
          ) : null}
          {currentStep < STEPS.length - 1 ? (
            <Button size="large" variant="filled" onClick={handleNext}>Next Step</Button>
          ) : (
            <Button size="large" variant="filled" onClick={handleSubmit}>Submit CPR</Button>
          )}
        </div>
      </div>

      {materialModal ? (
        <MaterialLineModal isOpen onClose={() => setMaterialModal(null)} onSave={saveMaterialLine} initialLine={materialModal.index != null ? materials[materialModal.index] : null} />
      ) : null}

      {routingModal ? (
        <RoutingLineModal isOpen onClose={() => setRoutingModal(null)} onSave={saveRoutingLine} initialLine={routingModal.index != null ? routing[routingModal.index] : null} />
      ) : null}

      {categoryModalOpen ? (
        <GeneralModal
          isOpen
          onClose={() => setCategoryModalOpen(false)}
          title="Add Category"
          width="480px"
          footer={
            <Button variant="filled" size="large" style={{ width: "100%" }} onClick={handleSaveNewCategory} disabled={!newCategoryName.trim()}>
              Save
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <InputField
                label="Category Name"
                required
                placeholder="Input Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                maxLength={100}
                showCounter
              />
            </div>
            <div>
              <InputField
                label="Description"
                multiline
                placeholder="Input Description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                maxLength={1000}
                showCounter
              />
            </div>
          </div>
        </GeneralModal>
      ) : null}

      {showDiscardModal ? (
        <GeneralModal
          isOpen
          onClose={() => setShowDiscardModal(false)}
          title="Discard changes?"
          footer={
            <>
              <Button
                variant="filled"
                size="large"
                style={{ width: "100%" }}
                onClick={() => {
                  setShowDiscardModal(false);
                  pendingDiscardAction?.();
                }}
              >
                Yes, Discard
              </Button>
              <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={() => setShowDiscardModal(false)}>
                Keep Editing
              </Button>
            </>
          }
        />
      ) : null}
    </div>
  );
};
