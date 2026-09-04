import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AddIcon, ChevronDownIcon, CloseIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { FormField, InputField } from "../../../components/index.js";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { Table } from "../../../ce-ui";
import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";
import { getBomLinkedToMaterial } from "../../bill-of-materials/mock/bomMocks.js";
import { createWorkOrder } from "../mock/workOrderMocks.js";

export const PRIORITY_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const EMPTY_FORM = {
  materialId: "",
  materialSearchText: "",
  quantity: "",
  priority: "Medium",
  notes: "",
  enableMultipleOutput: false,
  additionalOutputs: [],
};

let additionalOutputRowSeq = 0;
const nextOutputRowId = () => `output-row-${++additionalOutputRowSeq}`;

// Searchable select — text typed directly into the field itself filters the
// options below (rather than a separate search box inside a dropdown menu,
// like DropdownSelect uses). Mirrors the Vendor Name field pattern from
// PurchaseOrderCreatePage.jsx: a right-side chevron toggle instead of a left
// search icon. Options show the material name as the primary label and its
// SKU as the description underneath.
const MENU_MAX_HEIGHT = 260;

export const MaterialComboBox = ({ value, searchText, options, onSelect, onSearchChange, placeholder, hasError, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  // Render the options panel in a portal (positioned via getBoundingClientRect)
  // instead of as an absolutely-positioned child, so it isn't clipped by the
  // drawer body's `overflow: auto` or painted under the sticky footer.
  useEffect(() => {
    if (!isOpen) return undefined;
    const updateRect = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Flip above the field when there isn't enough room below but there is
      // above, so the option list stays fully visible on screen.
      const openAbove = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;
      setMenuRect(
        openAbove
          ? { bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width }
          : { top: rect.bottom + 4, left: rect.left, width: rect.width }
      );
    };
    updateRect();
    // Clicks land in the portal-rendered menu (a separate DOM subtree from
    // containerRef), so it must be checked separately or every option click
    // would be treated as "outside" and close the menu before onSelect fires.
    const handlePointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updateRect);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    const term = searchText.trim().toLowerCase();
    if (!term) return true;
    return opt.name.toLowerCase().includes(term) || opt.sku.toLowerCase().includes(term);
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          value={searchText}
          disabled={disabled}
          onFocus={() => !disabled && setIsOpen(true)}
          onClick={() => !disabled && setIsOpen(true)}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: "46px",
            padding: "0 40px 0 16px",
            borderRadius: "8px",
            border: `1px solid ${
              hasError
                ? "var(--status-red-primary)"
                : disabled
                  ? "var(--neutral-line-outline)"
                  : isOpen
                    ? "var(--feature-brand-primary)"
                    : "#e9e9e9"
            }`,
            outline: "none",
            fontSize: "var(--text-subtitle-1)",
            fontFamily: "inherit",
            boxSizing: "border-box",
            background: disabled ? "var(--neutral-surface-grey-lighter)" : "var(--neutral-surface-primary)",
            color: disabled ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-primary)",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        <ChevronDownIcon
          size={20}
          color={disabled ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-secondary)"}
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
            transition: "transform 0.2s ease",
            pointerEvents: "none",
          }}
        />
      </div>

      {isOpen && menuRect && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            ...(menuRect.top != null ? { top: `${menuRect.top}px` } : { bottom: `${menuRect.bottom}px` }),
            left: `${menuRect.left}px`,
            width: `${menuRect.width}px`,
            maxHeight: `${MENU_MAX_HEIGHT}px`,
            overflowY: "auto",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "12px",
            boxShadow: "var(--elevation-lg)",
            zIndex: 13500,
            padding: "6px",
          }}
        >
          {filteredOptions.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
              No materials found.
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const selected = opt.id === value;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: selected ? "var(--feature-brand-container-lighter)" : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    fontSize: "var(--text-title-3)",
                    fontWeight: selected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                    color: selected ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                  }}>
                    {opt.name}
                  </span>
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                    {opt.sku}
                  </span>
                </div>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

// Standalone Work Order creation entry point for producing a Material into
// stock (a "Stock Build" work order) — separate from the existing Product /
// Customer Order work order creation flow (which still goes through
// PurchaseOrderCreatePage). Only Materials that already have a linked BOM
// are eligible targets, since the Materials table on the WO Detail page is
// BOM-driven. Mirrors the right-side drawer pattern used by
// StockBatchesTab.jsx's "Add Stock Batch" drawer.
export const WorkOrderCreateDrawer = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen]);

  const eligibleMaterials = MOCK_MATERIALS_DATA.filter(
    (m) => !!getBomLinkedToMaterial(m.id)
  );

  const materialOptions = eligibleMaterials.map((m) => ({
    id: m.id,
    name: m.name,
    sku: m.sku,
    bomName: getBomLinkedToMaterial(m.id)?.name || "-",
  }));

  // Additional (secondary/co-produced) outputs aren't restricted to
  // BOM-linked materials — only the primary Main Output needs a BOM to drive
  // the Materials-consumption table.
  const allMaterialOptions = MOCK_MATERIALS_DATA.map((m) => ({
    id: m.id,
    name: m.name,
    sku: m.sku,
    bomName: getBomLinkedToMaterial(m.id)?.name || "-",
  }));

  const linkedBom = getBomLinkedToMaterial(formData.materialId);
  const mainMaterialUnit = eligibleMaterials.find((m) => m.id === formData.materialId)?.unit || "";

  const addOutputRow = () => {
    setFormData((prev) => ({
      ...prev,
      additionalOutputs: [
        ...prev.additionalOutputs,
        { id: nextOutputRowId(), materialId: "", materialSearchText: "", quantity: "" },
      ],
    }));
  };

  const updateOutputRow = (rowId, patch) => {
    setFormData((prev) => ({
      ...prev,
      additionalOutputs: prev.additionalOutputs.map((row) =>
        row.id === rowId ? { ...row, ...patch } : row
      ),
    }));
  };

  const removeOutputRow = (rowId) => {
    setFormData((prev) => ({
      ...prev,
      additionalOutputs: prev.additionalOutputs.filter((row) => row.id !== rowId),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.materialId) newErrors.materialId = "Field cannot be empty";
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = "Field cannot be empty";
    formData.additionalOutputs.forEach((row) => {
      if (!row.materialId) newErrors[`additionalOutputMaterial_${row.id}`] = "Field cannot be empty";
      if (!row.quantity || Number(row.quantity) <= 0) newErrors[`additionalOutputQty_${row.id}`] = "Field cannot be empty";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const material = eligibleMaterials.find((m) => m.id === formData.materialId);

    const outputs = [
      {
        materialId: material?.id,
        name: material?.name,
        sku: material?.sku,
        unit: material?.unit,
        qty: Number(formData.quantity),
        isMain: true,
      },
      ...formData.additionalOutputs.map((row) => {
        const rowMaterial = MOCK_MATERIALS_DATA.find((m) => m.id === row.materialId);
        return {
          materialId: rowMaterial?.id,
          name: rowMaterial?.name,
          sku: rowMaterial?.sku,
          unit: rowMaterial?.unit,
          qty: Number(row.quantity),
          isMain: false,
        };
      }),
    ];

    const record = createWorkOrder({
      product: material?.name,
      sku: material?.sku,
      materialId: material?.id,
      qty: Number(formData.quantity),
      priority: formData.priority,
      notes: formData.notes,
      bomId: linkedBom?.id || null,
      outputs,
    });

    onClose();
    onCreated?.(record);
  };

  if (!isOpen) return null;

  return (
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
        width: "640px",
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
            Add New Work Order
          </h2>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <InputField label="Target Type" value="Material" disabled />
            </div>
            <div style={{ flex: 1 }}>
              <InputField label="Fulfillment Type" value="Stock Build" disabled />
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <FormField label="Main Output" required error={errors.materialId}>
                <MaterialComboBox
                  value={formData.materialId}
                  searchText={formData.materialSearchText}
                  options={materialOptions}
                  hasError={!!errors.materialId}
                  placeholder={
                    materialOptions.length === 0
                      ? "No materials with a linked BOM available"
                      : "Search material name"
                  }
                  onSearchChange={(text) =>
                    setFormData((prev) => ({ ...prev, materialSearchText: text, materialId: "" }))
                  }
                  onSelect={(opt) =>
                    setFormData((prev) => ({ ...prev, materialId: opt.id, materialSearchText: opt.name }))
                  }
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Quantity" required error={errors.quantity}>
                <InputField
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  errorState={!!errors.quantity}
                  suffix={mainMaterialUnit}
                />
              </FormField>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <FormField label="Bill of Materials Used" required>
                <InputField
                  value={linkedBom?.name || ""}
                  disabled
                  placeholder="Select a main output first"
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Priority" required>
                <DropdownSelect
                  showDivider
                  value={formData.priority}
                  onChange={(val) => setFormData({ ...formData, priority: val })}
                  options={PRIORITY_OPTIONS}
                  placeholder="Select priority"
                />
              </FormField>
            </div>
          </div>

          <InputField
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add notes (optional)"
            multiline
            maxLength={400}
            showCounter
          />

          <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />

          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "16px",
            background: "var(--feature-brand-container-lighter)",
            borderRadius: "16px",
            gap: "12px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--neutral-on-surface-primary)" }}>
                Enable Multiple Output
              </span>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)", lineHeight: "18px" }}>
                Activate this feature to add more than one output to this work order.
              </span>
            </div>
            <div style={{ marginTop: "2px" }}>
              <ToggleSwitch
                checked={formData.enableMultipleOutput}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    enableMultipleOutput: val,
                    additionalOutputs: val ? prev.additionalOutputs : [],
                  }))
                }
              />
            </div>
          </div>

          {formData.enableMultipleOutput && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "var(--text-subtitle-1)", fontWeight: "var(--font-weight-bold)" }}>
              List of Work Order Output
            </span>

            <style>{`
              .wo-output-table table td { height: auto; vertical-align: middle; padding-top: 12px; padding-bottom: 12px; }
              .wo-output-table div[class*="min-h-[60px]"] { display: none; }
            `}</style>
            <div className="wo-output-table">
              <Table
                columns={[
                  {
                    key: "output",
                    header: "Output",
                    width: 280,
                    render: (_value, row) =>
                      row.isMain ? (
                        <div
                          style={{
                            height: "46px",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 16px",
                            borderRadius: "8px",
                            border: "1px solid var(--neutral-line-separator-1)",
                            background: "var(--neutral-surface-grey-lighter)",
                            color: "var(--neutral-on-surface-tertiary)",
                            fontSize: "var(--text-subtitle-1)",
                            boxSizing: "border-box",
                          }}
                        >
                          {formData.materialSearchText || "Select a main output first"}
                        </div>
                      ) : (
                        <div>
                          <MaterialComboBox
                            value={row.materialId}
                            searchText={row.materialSearchText}
                            options={allMaterialOptions.filter(
                              (opt) =>
                                opt.id === row.materialId ||
                                (opt.id !== formData.materialId &&
                                  !formData.additionalOutputs.some(
                                    (other) => other.id !== row.id && other.materialId === opt.id
                                  ))
                            )}
                            hasError={!!errors[`additionalOutputMaterial_${row.id}`]}
                            placeholder="Search material name"
                            onSearchChange={(text) =>
                              updateOutputRow(row.id, { materialSearchText: text, materialId: "" })
                            }
                            onSelect={(opt) =>
                              updateOutputRow(row.id, { materialId: opt.id, materialSearchText: opt.name })
                            }
                          />
                          {errors[`additionalOutputMaterial_${row.id}`] ? (
                            <span style={{ fontSize: "11px", color: "var(--status-red-primary)" }}>
                              {errors[`additionalOutputMaterial_${row.id}`]}
                            </span>
                          ) : null}
                        </div>
                      ),
                  },
                  {
                    key: "quantity",
                    header: "Quantity",
                    width: 220,
                    render: (_value, row) => {
                      if (row.isMain) {
                        return (
                          <div
                            style={{
                              height: "46px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0 16px",
                              borderRadius: "8px",
                              border: "1px solid var(--neutral-line-separator-1)",
                              background: "var(--neutral-surface-grey-lighter)",
                              color: "var(--neutral-on-surface-tertiary)",
                              fontSize: "var(--text-subtitle-1)",
                              boxSizing: "border-box",
                            }}
                          >
                            <span>{formData.quantity || "-"}</span>
                            {mainMaterialUnit ? <span>{mainMaterialUnit}</span> : null}
                          </div>
                        );
                      }
                      const rowMaterial = MOCK_MATERIALS_DATA.find((m) => m.id === row.materialId);
                      return (
                        <InputField
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateOutputRow(row.id, { quantity: e.target.value })}
                          placeholder="Enter quantity"
                          errorState={!!errors[`additionalOutputQty_${row.id}`]}
                          suffix={rowMaterial?.unit || ""}
                        />
                      );
                    },
                  },
                  {
                    key: "actions",
                    header: "",
                    align: "center",
                    width: 140,
                    render: (_value, row) =>
                      row.isMain ? (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <StatusBadge variant="blue-light">Main Output</StatusBadge>
                        </div>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => removeOutputRow(row.id)}
                            style={{ borderColor: "var(--status-red-primary)" }}
                          >
                            <DeleteIcon size={16} color="var(--status-red-primary)" />
                          </Button>
                        </div>
                      ),
                  },
                ]}
                data={[{ id: "main-output", isMain: true }, ...formData.additionalOutputs]}
                totalRows={1 + formData.additionalOutputs.length}
                showPagination={false}
                footerTotal=""
                className="!h-auto"
                selectedRowId={null}
              />
            </div>

            <Button
              variant="outlined"
              size="small"
              leftIcon={AddIcon}
              onClick={addOutputRow}
              style={{ alignSelf: "flex-start" }}
            >
              Additional Output
            </Button>
          </div>
          )}
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
  );
};
