import React from "react";
import { GeneralModal } from "../../../../../components/modal/GeneralModal.jsx";
import { IconButton } from "../../../../../components/common/IconButton.jsx";
import {
  ChevronLeft,
  CloseIcon,
  Calendar,
  Trash2,
  Plus,
} from "../../../../../components/icons/Icons.jsx";
import { Checkbox } from "../../../../../components/common/Checkbox.jsx";
import { DropdownSelect } from "../../../../../components/common/DropdownSelect.jsx";
import { ToggleSwitch } from "../../../../../components/common/ToggleSwitch.jsx";
import { DocumentTypeBadge } from "../../DocumentTypeBadge.jsx";
import {
  Button,
  FormField,
  UploadDropzone,
  InputField,
  DateInputControl,
} from "../shared/PoDetailSharedComponents.jsx";

const PoInvoicePaymentManagementModals = ({
  // Add Invoice Props
  showAddInvoiceDrawer,
  setShowAddInvoiceDrawer,
  isEditingInvoice,
  setIsEditingInvoice,
  setShowInvoiceDetailDrawer,
  setFormErrors,
  formErrors,
  autoPrefillInvoice,
  setAutoPrefillInvoice,
  addInvoiceFormData,
  setAddInvoiceFormData,
  simulateInvoiceOcr,
  calculatedDueDate,
  currency,
  formatNumberWithCommas,
  parseNumberFromCommas,
  mockLines,
  handleAddInvoice,

  // Add Payment Props
  showAddPaymentDrawer,
  setShowAddPaymentDrawer,
  selectedInvoiceForPayment,
  paymentFormErrors,
  setPaymentFormErrors,
  autoPrefillPayment,
  setAutoPrefillPayment,
  paymentFormData,
  setPaymentFormData,
  simulatePaymentOcr,
  getInvoiceMetrics,
  handleAddPayment,

  // Other Modals Props
  showDeleteInvoiceConfirm,
  setShowDeleteInvoiceConfirm,
  handleDeleteInvoice,
  showVoidConfirmModal,
  setShowVoidConfirmModal,
  paymentToVoid,
  formatCurrency,
  handleVoidPayment,
  showExceedConfirmModal,
  setShowExceedConfirmModal,
  showItemQtyExceedConfirmModal,
  setShowItemQtyExceedConfirmModal,
  showZeroAmountConfirmModal,
  setShowZeroAmountConfirmModal,
  exceededItems,
  saveInvoice,
  checkPoValueAndSave,
  proceedAfterQtyExceed,
  deleteInvoiceReason,
  setDeleteInvoiceReason,
  deleteInvoiceReasonError,
  setDeleteInvoiceReasonError,
  voidPaymentReason,
  setVoidPaymentReason,
  voidPaymentReasonError,
  setVoidPaymentReasonError,
}) => {
  return (
    <>
      {/* Add Invoice Drawer */}
      {showAddInvoiceDrawer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.28)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 13000,
          }}
        >
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setShowAddInvoiceDrawer(false)}
          />
          <div
            style={{
              position: "relative",
              width: "520px",
              maxWidth: "calc(100vw - 24px)",
              height: "100vh",
              background: "var(--neutral-surface-primary)",
              boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "var(--neutral-surface-primary)",
              }}
            >
              {isEditingInvoice ? (
                <IconButton
                  icon={ChevronLeft}
                  onClick={() => {
                    setShowAddInvoiceDrawer(false);
                    setShowInvoiceDetailDrawer(true);
                    setIsEditingInvoice(false);
                    setFormErrors({});
                  }}
                  size="small"
                  color="var(--neutral-on-surface-primary)"
                />
              ) : null}
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {isEditingInvoice ? "Edit Invoice" : "Add Invoice"}
              </h2>
              {!isEditingInvoice && (
                <IconButton
                  icon={CloseIcon}
                  onClick={() => {
                    setShowAddInvoiceDrawer(false);
                    setFormErrors({});
                  }}
                  size="small"
                  color="var(--neutral-on-surface-primary)"
                />
              )}
            </div>

            {/* Drawer Body */}
            <div
              style={{
                padding: "24px",
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* Auto Prefill Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "0px",
                  padding: "16px",
                  background: "var(--feature-brand-container-lighter)",
                  borderRadius: "16px",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Auto Prefill Form
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--neutral-on-surface-secondary)",
                      lineHeight: "18px",
                    }}
                  >
                    Activate this feature to automatically prefill form fields
                    based on your uploaded document.
                  </span>
                </div>
                <div style={{ marginTop: "2px" }}>
                  <ToggleSwitch
                    checked={autoPrefillInvoice}
                    onChange={(val) => setAutoPrefillInvoice(val)}
                  />
                </div>
              </div>

              <FormField
                label="Invoice File"
                required
                error={formErrors.attachments}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <UploadDropzone
                    maxFiles={1}
                    disabled={addInvoiceFormData.attachments.length > 0}
                    error={formErrors.attachments}
                    accept=".doc,.docx,.xls,.xlsx,.pdf,.jpg,.jpeg,.png,.webp"
                    allowedText="Allowed formats (Word, Excel, PDF, JPG, JPEG, PNG, WEBP)"
                    onFilesSelected={(files) => {
                      const file = files[0];
                      if (file) {
                        setAddInvoiceFormData({
                          ...addInvoiceFormData,
                          attachments: [{ file, name: file.name }],
                        });
                        simulateInvoiceOcr(file);
                      }
                    }}
                  />
                  {addInvoiceFormData.attachments.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {addInvoiceFormData.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "16px",
                            borderRadius: "16px",
                            background: "var(--neutral-surface-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            border: "1px solid var(--neutral-line-separator-1)",
                          }}
                        >
                          <DocumentTypeBadge fileName={att.name} />
                          <span
                            style={{
                              flex: 1,
                              fontSize: "14px",
                              color: "var(--neutral-on-surface-primary)",
                              fontWeight: "var(--font-weight-regular)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {att.name}
                          </span>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() =>
                              setAddInvoiceFormData({
                                ...addInvoiceFormData,
                                attachments:
                                  addInvoiceFormData.attachments.filter(
                                    (_, i) => i !== idx
                                  ),
                              })
                            }
                            style={{
                              borderColor: "var(--status-red-primary)",
                              color: "var(--status-red-primary)",
                              minWidth: "80px",
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>

              <InputField
                label="Invoice Number"
                required
                placeholder="Enter invoice number..."
                value={addInvoiceFormData.number}
                onChange={(e) =>
                  setAddInvoiceFormData({
                    ...addInvoiceFormData,
                    number: e.target.value.slice(0, 40),
                  })
                }
                error={formErrors.number}
                maxLength={40}
                headerRight={`${(addInvoiceFormData.number || "").length}/40`}
                headerRightColor="var(--neutral-on-surface-tertiary)"
              />

              <InputField
                label="Invoice Date"
                required
                type="date"
                value={addInvoiceFormData.date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setAddInvoiceFormData({
                    ...addInvoiceFormData,
                    date: e.target.value,
                  })
                }
                suffix={<Calendar size={18} />}
                error={formErrors.date}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <InputField
                  label="Payment Terms"
                  required
                  placeholder="30"
                  value={addInvoiceFormData.termsValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setAddInvoiceFormData({
                      ...addInvoiceFormData,
                      termsValue: val,
                    });
                  }}
                  error={formErrors.termsValue}
                />
                <FormField label="Unit">
                  <DropdownSelect
                    value={addInvoiceFormData.termsUnit}
                    onChange={(val) =>
                      setAddInvoiceFormData({
                        ...addInvoiceFormData,
                        termsUnit: val,
                      })
                    }
                    options={[
                      { value: "Days", label: "Days" },
                      { value: "Weeks", label: "Weeks" },
                      { value: "Months", label: "Months" },
                    ]}
                  />
                </FormField>
              </div>

              <InputField
                label="Due Date"
                disabled
                value={calculatedDueDate}
                suffix={<Calendar size={18} />}
                helperText={
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--neutral-on-surface-tertiary)",
                    }}
                  >
                    Automatically filled based on invoice date and payment terms
                  </span>
                }
              />

              <InputField
                label="Invoice Amount"
                required
                placeholder="0"
                prefix={currency}
                value={formatNumberWithCommas(addInvoiceFormData.amount)}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setAddInvoiceFormData({
                    ...addInvoiceFormData,
                    amount: val,
                  });
                }}
                error={formErrors.amount}
              />

              <div
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {addInvoiceFormData.itemLines.map((itemObj, idx) => {
                  const itemError = formErrors.itemLines
                    ? formErrors.itemLines[idx]
                    : null;
                  const selectedPoName =
                    (mockLines || []).find(
                      (it) => String(it.id ?? it.item) === String(itemObj.id)
                    )?.item || "";
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        background: "var(--neutral-surface-primary)",
                        border: "1px solid var(--neutral-line-separator-1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--neutral-on-surface-primary)",
                          }}
                        >
                          <span style={{ color: "var(--status-red-primary)" }}>
                            *
                          </span>{" "}
                          Item Line {idx + 1}
                        </span>
                        {addInvoiceFormData.itemLines.length > 1 && (
                          <IconButton
                            icon={Trash2}
                            size="small"
                            color="var(--status-red-primary)"
                            onClick={() => {
                              const next = addInvoiceFormData.itemLines.filter(
                                (_, i) => i !== idx
                              );
                              setAddInvoiceFormData({
                                ...addInvoiceFormData,
                                itemLines: next,
                              });
                            }}
                          />
                        )}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.5fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <FormField
                          label="PO Item Line"
                          required
                          error={itemError?.id}
                        >
                          <DropdownSelect
                            fieldHeight="48px"
                            placeholder="Select item line..."
                            hasError={!!itemError?.id}
                            options={(mockLines || [])
                              .filter((it) => {
                                const itemValue = it.id || it.item;
                                return !addInvoiceFormData.itemLines.some(
                                  (il, i) => i !== idx && il.id === itemValue
                                );
                              })
                              .map((it) => ({
                                label: it.item,
                                value: it.id || it.item,
                              }))}
                            value={itemObj.id}
                            onChange={(val) => {
                              const next = [...addInvoiceFormData.itemLines];
                              const selectedPoItem = (mockLines || []).find(
                                (it) => String(it.id ?? it.item) === String(val)
                              );
                              const newOcrRef =
                                next[idx].sameAsPo && selectedPoItem
                                  ? selectedPoItem.item
                                  : next[idx].ocrRef;
                              next[idx] = {
                                ...next[idx],
                                id: val,
                                ocrRef: newOcrRef,
                              };
                              setAddInvoiceFormData({
                                ...addInvoiceFormData,
                                itemLines: next,
                              });
                            }}
                          />
                        </FormField>
                        <InputField
                          label="Item Quantity"
                          required
                          placeholder="0"
                          value={
                            itemObj.qty === ""
                              ? ""
                              : formatNumberWithCommas(itemObj.qty)
                          }
                          onChange={(e) => {
                            const raw = parseNumberFromCommas(e.target.value);
                            const next = [...addInvoiceFormData.itemLines];
                            next[idx] = {
                              ...next[idx],
                              qty:
                                raw === 0 && e.target.value === ""
                                  ? ""
                                  : String(raw),
                            };
                            setAddInvoiceFormData({
                              ...addInvoiceFormData,
                              itemLines: next,
                            });
                          }}
                          error={itemError?.qty}
                        />
                      </div>

                      <InputField
                        label="Item Name in Document"
                        required
                        labelFontSize="var(--text-body)"
                        headerRightFontSize="var(--text-body)"
                        headerRightColor="var(--neutral-on-surface-primary)"
                        headerRight={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Checkbox
                              id={`sameAsPo-${idx}`}
                              checked={!!itemObj.sameAsPo}
                              onChange={(val) => {
                                const next = [...addInvoiceFormData.itemLines];
                                next[idx] = {
                                  ...next[idx],
                                  sameAsPo: val,
                                  ocrRef: val ? selectedPoName : next[idx].ocrRef,
                                };
                                setAddInvoiceFormData({
                                  ...addInvoiceFormData,
                                  itemLines: next,
                                });
                              }}
                            />
                            <label
                              htmlFor={`sameAsPo-${idx}`}
                              style={{ cursor: "pointer" }}
                            >
                              Same with PO Item
                            </label>
                          </div>
                        }
                        placeholder="Enter item name..."
                        value={itemObj.ocrRef || ""}
                        onChange={(e) => {
                          const next = [...addInvoiceFormData.itemLines];
                          next[idx] = {
                            ...next[idx],
                            ocrRef: e.target.value,
                            sameAsPo: false,
                          };
                          setAddInvoiceFormData({
                            ...addInvoiceFormData,
                            itemLines: next,
                          });
                        }}
                        error={itemError?.ocrRef}
                      />
                    </div>
                  );
                })}
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={Plus}
                  disabled={
                    addInvoiceFormData.itemLines.length >= (mockLines || []).length
                  }
                  onClick={() => {
                    setAddInvoiceFormData({
                      ...addInvoiceFormData,
                      itemLines: [
                        ...addInvoiceFormData.itemLines,
                        { id: "", qty: "", ocrRef: "" },
                      ],
                    });
                  }}
                  style={{ alignSelf: "flex-start" }}
                >
                  Add Item Line
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  padding: "20px",
                  background: "var(--neutral-surface-grey-lighter)",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Payment Information
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <InputField
                    label="Bank Name"
                    placeholder="Enter bank name..."
                    value={addInvoiceFormData.bankName}
                    onChange={(e) =>
                      setAddInvoiceFormData({
                        ...addInvoiceFormData,
                        bankName: e.target.value,
                      })
                    }
                  />
                  <InputField
                    label="Account Number"
                    placeholder="Enter account number..."
                    value={addInvoiceFormData.accountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setAddInvoiceFormData({
                        ...addInvoiceFormData,
                        accountNumber: val,
                      });
                    }}
                  />
                </div>
                <InputField
                  label="Account Name"
                  placeholder="Enter account name..."
                  value={addInvoiceFormData.accountName}
                  onChange={(e) =>
                    setAddInvoiceFormData({
                      ...addInvoiceFormData,
                      accountName: e.target.value,
                    })
                  }
                />
              </div>

              <InputField
                label="Notes"
                multiline
                placeholder="Enter notes..."
                value={addInvoiceFormData.notes}
                maxLength={1000}
                headerRight={`${(addInvoiceFormData.notes || "").length}/1000`}
                onChange={(e) =>
                  setAddInvoiceFormData({
                    ...addInvoiceFormData,
                    notes: e.target.value.slice(0, 1000),
                  })
                }
              />
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: "20px 24px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                gap: "12px",
                background: "var(--neutral-surface-primary)",
              }}
            >
              <Button
                variant="secondary"
                size="large"
                onClick={() => {
                  setShowAddInvoiceDrawer(false);
                  setFormErrors({});
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                onClick={handleAddInvoice}
                style={{ flex: 1 }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Drawer */}
      {showAddPaymentDrawer && selectedInvoiceForPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.28)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 13000,
          }}
        >
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => {
              setShowAddPaymentDrawer(false);
              setPaymentFormErrors({});
            }}
          />
          <div
            style={{
              width: "520px",
              height: "100%",
              background: "var(--neutral-surface-primary)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <IconButton
                icon={ChevronLeft}
                onClick={() => {
                  setShowAddPaymentDrawer(false);
                  setShowInvoiceDetailDrawer(true);
                  setPaymentFormErrors({});
                }}
                size="small"
                color="var(--neutral-on-surface-primary)"
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Add Payment
              </h2>
            </div>

            {/* Drawer Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* Auto Prefill Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "0px",
                  padding: "16px",
                  background: "var(--feature-brand-container-lighter)",
                  borderRadius: "16px",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Auto Prefill Form
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--neutral-on-surface-secondary)",
                      lineHeight: "18px",
                    }}
                  >
                    Activate this feature to automatically prefill form fields
                    based on your uploaded document.
                  </span>
                </div>
                <div style={{ marginTop: "2px" }}>
                  <ToggleSwitch
                    checked={autoPrefillPayment}
                    onChange={(val) => setAutoPrefillPayment(val)}
                  />
                </div>
              </div>

              <FormField
                label="Payment Proof"
                required
                error={paymentFormErrors.attachments}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <UploadDropzone
                    maxFiles={1}
                    disabled={paymentFormData.attachments.length > 0}
                    error={paymentFormErrors.attachments}
                    accept=".doc,.docx,.xls,.xlsx,.pdf,.jpg,.jpeg,.png,.webp"
                    allowedText="Allowed formats (Word, Excel, PDF, JPG, JPEG, PNG, WEBP)"
                    onFilesSelected={(files) => {
                      const file = files[0];
                      if (file) {
                        setPaymentFormData({
                          ...paymentFormData,
                          attachments: [{ file, name: file.name }],
                        });
                        simulatePaymentOcr(file);
                      }
                    }}
                  />

                  {paymentFormData.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        background: "var(--neutral-surface-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        border: "1px solid var(--neutral-line-separator-1)",
                      }}
                    >
                      <DocumentTypeBadge fileName={att.name} />
                      <span
                        style={{
                          flex: 1,
                          fontSize: "14px",
                          color: "var(--neutral-on-surface-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {att.name}
                      </span>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() =>
                          setPaymentFormData({
                            ...paymentFormData,
                            attachments: [],
                          })
                        }
                        style={{
                          borderColor: "var(--status-red-primary)",
                          color: "var(--status-red-primary)",
                          minWidth: "80px",
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </FormField>

              <div
                style={{
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--neutral-on-surface-tertiary)",
                      marginBottom: "4px",
                    }}
                  >
                    Invoice Number
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-primary)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {selectedInvoiceForPayment?.number || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--neutral-on-surface-tertiary)",
                      marginBottom: "4px",
                    }}
                  >
                    Outstanding Amount
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-primary)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {currency}{" "}
                    {selectedInvoiceForPayment
                      ? formatNumberWithCommas(
                          getInvoiceMetrics(selectedInvoiceForPayment)
                            .outstanding
                        )
                      : "0"}
                  </div>
                </div>
              </div>

              <FormField
                label="Payment Date"
                required
                error={paymentFormErrors.date}
              >
                <DateInputControl
                  value={paymentFormData.date}
                  onChange={(e) =>
                    setPaymentFormData({
                      ...paymentFormData,
                      date: e.target.value,
                    })
                  }
                  hasError={!!paymentFormErrors.date}
                  maxDate={new Date().toISOString().split("T")[0]}
                />
              </FormField>

              <InputField
                label="Payment Amount"
                required
                prefix={currency}
                placeholder="0"
                value={
                  paymentFormData.amount === ""
                    ? ""
                    : formatNumberWithCommas(paymentFormData.amount)
                }
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPaymentFormData({ ...paymentFormData, amount: val });
                }}
                error={paymentFormErrors.amount}
              />

              <FormField
                label="Payment Method"
                required
                error={paymentFormErrors.method}
              >
                <DropdownSelect
                  value={paymentFormData.method}
                  onChange={(val) =>
                    setPaymentFormData({ ...paymentFormData, method: val })
                  }
                  options={[
                    { value: "Bank Transfer", label: "Bank Transfer" },
                    { value: "Cash", label: "Cash" },
                    { value: "Giro", label: "Giro" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </FormField>

              <InputField
                label="Notes"
                multiline
                placeholder="Enter notes..."
                value={paymentFormData.notes}
                maxLength={1000}
                headerRight={`${(paymentFormData.notes || "").length}/1000`}
                onChange={(e) =>
                  setPaymentFormData({
                    ...paymentFormData,
                    notes: e.target.value.slice(0, 1000),
                  })
                }
              />
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: "20px 24px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                gap: "12px",
                background: "var(--neutral-surface-primary)",
              }}
            >
              <Button
                variant="outline"
                size="large"
                onClick={() => {
                  setShowAddPaymentDrawer(false);
                  setPaymentFormErrors({});
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                onClick={handleAddPayment}
                style={{ flex: 1 }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      <GeneralModal
        isOpen={showDeleteInvoiceConfirm}
        onClose={() => {
          setShowDeleteInvoiceConfirm(false);
          setDeleteInvoiceReason("");
          setDeleteInvoiceReasonError("");
        }}
        title="Delete Invoice?"
        width="400px"
        centeredHeader
        description="This invoice and all its payment history will be permanently removed."
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              <label style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", display: "flex", gap: "2px" }}>
                <span style={{ color: "var(--status-red-primary)" }}>*</span>Reason
              </label>
              <textarea
                value={deleteInvoiceReason}
                onChange={(e) => {
                  setDeleteInvoiceReason(e.target.value);
                  if (deleteInvoiceReasonError) setDeleteInvoiceReasonError("");
                }}
                placeholder="Enter reason for deletion..."
                rows={3}
                maxLength={500}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "12px",
                  border: `1px solid ${deleteInvoiceReasonError ? "var(--status-red-primary)" : "var(--neutral-line-separator-1)"}`,
                  fontSize: "var(--text-title-3)",
                  color: "var(--neutral-on-surface-primary)",
                  resize: "vertical",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              {deleteInvoiceReasonError && (
                <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
                  {deleteInvoiceReasonError}
                </span>
              )}
            </div>
            <Button
              variant="danger-filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                if (!deleteInvoiceReason.trim()) {
                  setDeleteInvoiceReasonError("Field cannot be empty");
                  return;
                }
                handleDeleteInvoice();
              }}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowDeleteInvoiceConfirm(false);
                setDeleteInvoiceReason("");
                setDeleteInvoiceReasonError("");
              }}
            >
              Cancel
            </Button>
          </div>
        }
      />

      {/* Void Payment Confirmation Modal */}
      <GeneralModal
        isOpen={showVoidConfirmModal}
        onClose={() => {
          setShowVoidConfirmModal(false);
          setVoidPaymentReason("");
          setVoidPaymentReasonError("");
        }}
        title="Void Payment?"
        width="400px"
        centeredHeader
        description={`This payment will be voided, and the settlement progress will decrease by ${
          paymentToVoid ? formatCurrency(paymentToVoid.amount, currency) : ""
        }. This action cannot be undone.`}
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              <label style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", display: "flex", gap: "2px" }}>
                <span style={{ color: "var(--status-red-primary)" }}>*</span>Reason
              </label>
              <textarea
                value={voidPaymentReason}
                onChange={(e) => {
                  setVoidPaymentReason(e.target.value);
                  if (voidPaymentReasonError) setVoidPaymentReasonError("");
                }}
                placeholder="Enter reason for voiding payment..."
                rows={3}
                maxLength={500}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "12px",
                  border: `1px solid ${voidPaymentReasonError ? "var(--status-red-primary)" : "var(--neutral-line-separator-1)"}`,
                  fontSize: "var(--text-title-3)",
                  color: "var(--neutral-on-surface-primary)",
                  resize: "vertical",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              {voidPaymentReasonError && (
                <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
                  {voidPaymentReasonError}
                </span>
              )}
            </div>
            <Button
              variant="danger-filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                if (!voidPaymentReason.trim()) {
                  setVoidPaymentReasonError("Field cannot be empty");
                  return;
                }
                handleVoidPayment();
              }}
            >
              Yes, Confirm
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowVoidConfirmModal(false);
                setVoidPaymentReason("");
                setVoidPaymentReasonError("");
              }}
            >
              Cancel
            </Button>
          </div>
        }
      />

      {/* Exceed PO Value Confirmation Modal */}
      <GeneralModal
        isOpen={showExceedConfirmModal}
        onClose={() => setShowExceedConfirmModal(false)}
        title="Invoice Exceeds PO Value"
        width="400px"
        centeredHeader
        zIndex={15000}
        description="This invoice amount exceeds the purchase order value. Do you want to continue?"
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowExceedConfirmModal(false);
                saveInvoice();
              }}
            >
              Yes, Confirm
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowExceedConfirmModal(false)}
            >
              Cancel
            </Button>
          </div>
        }
      />

      {/* Item Quantity Exceeds Remaining PO Quantity Confirmation Modal */}
      <GeneralModal
        isOpen={showItemQtyExceedConfirmModal}
        onClose={() => setShowItemQtyExceedConfirmModal(false)}
        title="Item Quantity Exceeds PO Quantity"
        width="400px"
        centeredHeader
        zIndex={15000}
        description={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center" }}>
            <span>
              The following items exceed their remaining PO quantity. Continuing will result in quantities exceeding the purchase order.
            </span>
            <ul style={{ textAlign: "left", margin: "0", paddingLeft: "24px", fontSize: "14px", listStyleType: "disc" }}>
              {(exceededItems || []).map((item, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>
                  <strong>{item.name}</strong><br />
                  <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
                    (Entered: {item.entered}, Remaining: {item.remaining})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        }
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowItemQtyExceedConfirmModal(false);
                proceedAfterQtyExceed();
              }}
            >
              Yes, Confirm
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowItemQtyExceedConfirmModal(false)}
            >
              Cancel
            </Button>
          </div>
        }
      />

      {/* Zero Invoice Amount Confirmation Modal */}
      <GeneralModal
        isOpen={showZeroAmountConfirmModal}
        onClose={() => setShowZeroAmountConfirmModal(false)}
        title="Zero Invoice Amount Detected"
        width="420px"
        centeredHeader
        zIndex={15000}
        description="This invoice has a total amount of 0. Please review them before saving, or continue if this is intentional."
        descriptionStyle={{ fontSize: "14px" }}
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowZeroAmountConfirmModal(false);
                checkPoValueAndSave();
              }}
            >
              Continue to Save
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowZeroAmountConfirmModal(false)}
            >
              Go Back to Edit
            </Button>
          </div>
        }
      />
    </>
  );
};

export default PoInvoicePaymentManagementModals;
