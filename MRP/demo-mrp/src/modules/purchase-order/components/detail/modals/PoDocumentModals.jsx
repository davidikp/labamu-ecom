import React from "react";
import { GeneralModal } from "../../../../../components/modal/GeneralModal.jsx";
import { DropdownSelect } from "../../../../../components/common/DropdownSelect.jsx";
import {
  Button,
  UploadDropzone,
  InputField,
  UploadDescriptionCard,
} from "../shared/PoDetailSharedComponents.jsx";

const PoDocumentModals = ({
  // Upload Modal Props
  showUploadDocumentModal,
  setShowUploadDocumentModal,
  resetDocumentUploadState,
  handleUploadDocument,
  documentUploadDocumentType,
  setDocumentUploadDocumentType,
  documentUploadTypeError,
  handleDocumentUploadFileSelection,
  documentUploadFileObject,
  documentUploadError,
  documentUploadCardFile,
  documentUploadDescription,
  setDocumentUploadDescription,
  documentUploadDescriptionError,

  // Rename/Edit Modal Props
  showRenameDocumentModal,
  setShowRenameDocumentModal,
  setSelectedDocumentId,
  setRenameDocumentValue,
  setRenameDocumentError,
  setEditDocumentDescriptionValue,
  setEditDocumentTypeValue,
  handleConfirmRenameDocument,
  renameDocumentValue,
  renameDocumentError,
  editDocumentDescriptionValue,
  editDocumentDescriptionError,
  editDocumentTypeValue,
  FILE_DESCRIPTION_MAX_LENGTH,

  // Delete Modal Props
  showDeleteDocumentModal,
  setShowDeleteDocumentModal,
  handleConfirmDeleteDocument,
}) => {
  return (
    <>
      {/* Upload Document Modal */}
      <GeneralModal
        isOpen={showUploadDocumentModal}
        onClose={() => {
          setShowUploadDocumentModal(false);
          resetDocumentUploadState();
        }}
        title="Upload Document"
        width="640px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setShowUploadDocumentModal(false);
                resetDocumentUploadState();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={handleUploadDocument}
            >
              Upload
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Document Type
              </span>
            </div>
            <DropdownSelect
              value={documentUploadDocumentType}
              onChange={(nextValue) => setDocumentUploadDocumentType(nextValue)}
              options={[
                { value: "invoice", label: "Invoice" },
                { value: "invoice_payment", label: "Invoice Payment" },
                { value: "delivery_note", label: "Delivery Note" },
                { value: "packing_list", label: "Packing List" },
                { value: "quotation_vendor", label: "Quotation (Vendor)" },
                { value: "contract_agreement", label: "Contract / Agreement" },
                { value: "other", label: "Other" },
              ]}
              borderRadius="12px"
              hasError={!!documentUploadTypeError}
            />
            {documentUploadTypeError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                  marginTop: "2px",
                }}
              >
                {documentUploadTypeError}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Document Upload
              </span>
            </div>
            <UploadDropzone
              onFilesSelected={handleDocumentUploadFileSelection}
              maxFiles={1}
              disabled={!!documentUploadFileObject}
              error={documentUploadError}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              allowedText="Allowed formats (PDF, JPG, JPEG, PNG, WebP)"
            />
            {documentUploadError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                  marginTop: "2px",
                }}
              >
                {documentUploadError}
              </span>
            )}
          </div>

          {documentUploadFileObject ? (
            <UploadDescriptionCard
              file={documentUploadCardFile}
              description={documentUploadDescription || ""}
              onRemove={resetDocumentUploadState}
              onDescriptionChange={setDocumentUploadDescription}
              descriptionRequired={true}
              descriptionError={documentUploadDescriptionError}
            />
          ) : null}
        </div>
      </GeneralModal>

      {/* Rename/Edit Document Modal */}
      <GeneralModal
        isOpen={showRenameDocumentModal}
        onClose={() => {
          setShowRenameDocumentModal(false);
          setSelectedDocumentId(null);
          setRenameDocumentValue("");
          setRenameDocumentError("");
          setEditDocumentDescriptionValue("");
          setEditDocumentTypeValue("other");
        }}
        title="Edit Document"
        width="640px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setShowRenameDocumentModal(false);
                setSelectedDocumentId(null);
                setRenameDocumentValue("");
                setRenameDocumentError("");
                setEditDocumentDescriptionValue("");
                setEditDocumentTypeValue("other");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={handleConfirmRenameDocument}
            >
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InputField
            label="Document Name"
            required={true}
            value={renameDocumentValue}
            onChange={(e) => {
              setRenameDocumentValue(e.target.value);
              if (renameDocumentError) setRenameDocumentError("");
            }}
            placeholder="Enter document name"
            error={renameDocumentError}
          />
          <InputField
            label="File Description"
            required={true}
            value={editDocumentDescriptionValue}
            onChange={(e) => setEditDocumentDescriptionValue(e.target.value)}
            placeholder="Enter File Description"
            maxLength={FILE_DESCRIPTION_MAX_LENGTH}
            headerRight={`${editDocumentDescriptionValue.length}/${FILE_DESCRIPTION_MAX_LENGTH}`}
            error={editDocumentDescriptionError}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Document Type
              </span>
            </div>
            <DropdownSelect
              value={editDocumentTypeValue}
              onChange={(nextValue) => setEditDocumentTypeValue(nextValue)}
              options={[
                { value: "invoice", label: "Invoice" },
                { value: "invoice_payment", label: "Invoice Payment" },
                { value: "delivery_note", label: "Delivery Note" },
                { value: "packing_list", label: "Packing List" },
                { value: "quotation_vendor", label: "Quotation (Vendor)" },
                { value: "contract_agreement", label: "Contract / Agreement" },
                { value: "other", label: "Other" },
              ]}
              borderRadius="12px"
            />
          </div>
        </div>
      </GeneralModal>

      {/* Delete Document Modal */}
      <GeneralModal
        isOpen={showDeleteDocumentModal}
        onClose={() => {
          setShowDeleteDocumentModal(false);
          setSelectedDocumentId(null);
          setRenameDocumentValue("");
        }}
        title="Delete Document?"
        width="376px"
        centeredHeader
        description="This document will be permanently removed from the purchase order."
        footer={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}
          >
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={handleConfirmDeleteDocument}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowDeleteDocumentModal(false);
                setSelectedDocumentId(null);
                setRenameDocumentValue("");
              }}
            >
              Cancel
            </Button>
          </div>
        }
      />
    </>
  );
};

export default PoDocumentModals;
