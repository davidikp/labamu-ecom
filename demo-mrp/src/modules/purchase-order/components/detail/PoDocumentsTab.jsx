import React from "react";
import {
  ListViewIcon,
  GridViewIcon,
  UploadIcon,
  DownloadIcon,
  EditIcon,
  DeleteIcon,
  MoreVerticalIcon,
  FileIcon,
  FileImage,
  FileText,
  ImageAssetIcon,
} from "../../../../components/icons/Icons.jsx";
import {
  getDocumentPrimaryLabel,
  getDocumentSecondaryLabel,
} from "../../../../utils/upload/uploadUtils.js";
import { IconButton } from "../../../../components/common/IconButton.jsx";
import { FilterPill } from "../../../../components/common/FilterPill.jsx";
import { Checkbox } from "../../../../components/common/Checkbox.jsx";
import { DocumentTypeBadge } from "../DocumentTypeBadge.jsx";
import {
  TableSearchField,
  Button,
  Tooltip,
  poReferenceTableFrameStyle,
  poReferenceTableScrollerStyle,
  poReferenceTableInnerStyle,
  poReferenceTableHeaderRowStyle,
  poReferenceTableRowStyle,
  poReferenceTableHeaderCellStyle,
  poReferenceTableCellStyle,
} from "./shared/PoDetailSharedComponents.jsx";

const PoDocumentsTab = ({
  // Refs
  documentFilterTriggerRef,
  // State / Data
  showDocumentFilterMenu,
  setShowDocumentFilterMenu,
  documentTypeFilters,
  setDocumentTypeFilters,
  documentFilterMenuPosition,
  documentTypeFilterOptions,
  documentSearch,
  setDocumentSearch,
  documentView,
  setDocumentView,
  currentStatus,
  documents,
  filteredDocuments,
  openDocumentMenuId,
  setOpenDocumentMenuId,
  documentMenuPosition,
  // Handlers
  updateDocumentFilterMenuPosition,
  toggleDocumentTypeFilter,
  resetDocumentUploadState,
  setShowUploadDocumentModal,
  handleDocumentAction,
  openDocumentActionMenu,
  // Helper Functions
  getDocumentTypeLabel,
}) => {
  
  const getDocumentPreview = (doc, compact = false) => {
    const radius = compact ? "12px" : "0px";
    if (doc.type === "image" && doc.previewUrl) {
      return (
        <img
          src={doc.previewUrl}
          alt={doc.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: radius,
            display: "block",
          }}
        />
      );
    }
    if (doc.type === "video" && doc.previewUrl) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            borderRadius: radius,
            overflow: "hidden",
            background: "#111",
          }}
        >
          <video
            src={doc.previewUrl}
            muted
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.22) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: compact ? "22px" : "54px",
              height: compact ? "22px" : "54px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderBottom: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderLeft: compact ? "10px solid white" : "16px solid white",
                marginLeft: compact ? "2px" : "4px",
              }}
            />
          </div>
        </div>
      );
    }
    if (doc.type === "image") {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, #CFE1FF 0%, #F6E6C9 100%)",
            borderRadius: radius,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 36%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: compact ? "5px" : "18px",
              right: compact ? "5px" : "18px",
              bottom: compact ? "5px" : "18px",
              height: compact ? "13px" : "38px",
              background: "#7DB06E",
              borderRadius: compact ? "8px" : "14px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: compact ? "8px" : "24px",
              bottom: compact ? "11px" : "34px",
              width: compact ? "14px" : "34px",
              height: compact ? "10px" : "24px",
              background: "#89B97A",
              transform: "skewX(-18deg)",
              borderRadius: "3px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: compact ? "18px" : "56px",
              bottom: compact ? "11px" : "34px",
              width: compact ? "18px" : "50px",
              height: compact ? "14px" : "34px",
              background: "#6E9FD8",
              transform: "skewX(-18deg)",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: compact ? "6px" : "20px",
              top: compact ? "6px" : "16px",
              width: compact ? "7px" : "18px",
              height: compact ? "7px" : "18px",
              borderRadius: "50%",
              background: "#FFD66B",
            }}
          />
        </div>
      );
    }
    if (doc.type === "video") {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #252525 0%, #4C4C4C 52%, #2D2D2D 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: compact ? "12px" : "30px",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
            }}
          />
          <div
            style={{
              width: compact ? "22px" : "54px",
              height: compact ? "22px" : "54px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderBottom: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderLeft: compact ? "10px solid white" : "16px solid white",
                marginLeft: compact ? "2px" : "4px",
              }}
            />
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
        }}
      >
        <DocumentTypeBadge
          fileName={doc.name}
          type={doc.type}
          size={compact ? "preview" : "preview"}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        borderRadius: "16px",
        border: "1px solid var(--neutral-line-separator-1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                ref={documentFilterTriggerRef}
                onClick={() => {
                  if (showDocumentFilterMenu) {
                    setShowDocumentFilterMenu(false);
                    return;
                  }
                  updateDocumentFilterMenuPosition();
                  setShowDocumentFilterMenu(true);
                }}
              >
                <FilterPill
                  label="Document Type"
                  active={documentTypeFilters.length > 0}
                  isOpen={showDocumentFilterMenu}
                  count={documentTypeFilters.length}
                />
              </div>

              {showDocumentFilterMenu ? (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 999 }}
                    onClick={() => setShowDocumentFilterMenu(false)}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: `${documentFilterMenuPosition.top}px`,
                      left: `${documentFilterMenuPosition.left}px`,
                      transform:
                        documentFilterMenuPosition.placement === "top"
                          ? "translateY(-100%)"
                          : "none",
                      width: "360px",
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-card)",
                      boxShadow: "var(--elevation-sm)",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-title-2)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                        }}
                      >
                        Document Type
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDocumentTypeFilters([]);
                          setShowDocumentFilterMenu(false);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "var(--status-red-primary)",
                          cursor: "pointer",
                          fontSize: "var(--text-body)",
                          fontWeight: "var(--font-weight-bold)",
                        }}
                      >
                        Remove Filter
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {documentTypeFilterOptions.map((opt) => {
                        const isSelected = documentTypeFilters.includes(
                          opt.value
                        );
                        return (
                          <label
                            key={opt.value}
                            onClick={() => toggleDocumentTypeFilter(opt.value)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              cursor: "pointer",
                              fontSize: "var(--text-title-3)",
                              color: "var(--neutral-on-surface-primary)",
                              textAlign: "left",
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() =>
                                toggleDocumentTypeFilter(opt.value)
                              }
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <TableSearchField
              value={documentSearch}
              onChange={(e) => setDocumentSearch(e.target.value)}
              placeholder="Search documents"
              width="320px"
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "12px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenDocumentMenuId(null);
                  setDocumentView("list");
                }}
                style={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  background:
                    documentView === "list"
                      ? "var(--feature-brand-container-darker)"
                      : "var(--neutral-surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ListViewIcon
                  size={18}
                  color={
                    documentView === "list"
                      ? "var(--feature-brand-primary)"
                      : "var(--neutral-on-surface-secondary)"
                  }
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenDocumentMenuId(null);
                  setDocumentView("grid");
                }}
                style={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderLeft: "1px solid var(--neutral-line-separator-2)",
                  background:
                    documentView === "grid"
                      ? "var(--feature-brand-container-darker)"
                      : "var(--neutral-surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <GridViewIcon
                  size={18}
                  color={
                    documentView === "grid"
                      ? "var(--feature-brand-primary)"
                      : "var(--neutral-on-surface-secondary)"
                  }
                />
              </button>
            </div>
            <Button
              variant="filled"
              leftIcon={UploadIcon}
              disabled={currentStatus === "Canceled"}
              onClick={() => {
                resetDocumentUploadState();
                setShowUploadDocumentModal(true);
              }}
            >
              Upload
            </Button>
          </div>
        </div>

        <div style={{ padding: "0 24px 24px 24px" }}>

          {documentView === "list" ? (
            <div style={poReferenceTableFrameStyle}>
              <div style={{ ...poReferenceTableScrollerStyle, overflowX: filteredDocuments.length > 0 ? "auto" : "hidden" }}>
                <div style={poReferenceTableInnerStyle(filteredDocuments.length > 0 ? "1080px" : "100%")}>
                  {filteredDocuments.length > 0 && (
                    <div
                      style={poReferenceTableHeaderRowStyle(
                        "2.2fr 1fr 1.2fr 1fr 0.9fr 132px",
                        "0"
                      )}
                    >
                      <div style={poReferenceTableHeaderCellStyle()}>Name</div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Document Type
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Uploaded By
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Date Modified
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        File Size
                      </div>
                      <div
                        style={poReferenceTableHeaderCellStyle({
                          justifyContent: "flex-end",
                        })}
                      >
                        Action
                      </div>
                    </div>
                  )}

                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc, idx) => {
                      const metaText = doc.meta || "";
                      const uploadedBy =
                        metaText.indexOf("Uploaded by ") === 0
                          ? metaText.slice(12).split(" on ")[0]
                          : "-";
                      const modifiedDate =
                        doc.modifiedDate ||
                        (metaText.indexOf(" on ") > -1
                          ? metaText.split(" on ")[1]
                          : "-");
                      const primaryLabel = getDocumentPrimaryLabel(doc);
                      const secondaryLabel = getDocumentSecondaryLabel(doc);
                      return (
                        <div
                          key={doc.id}
                          style={poReferenceTableRowStyle(
                            "2.2fr 1fr 1.2fr 1fr 0.9fr 132px",
                            idx === filteredDocuments.length - 1
                          )}
                        >
                          <div
                            style={poReferenceTableCellStyle({
                              gap: "12px",
                              minWidth: 0,
                            })}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                flexShrink: 0,
                                overflow: "hidden",
                              }}
                            >
                              {getDocumentPreview(doc, true)}
                            </div>
                            <div
                              style={{
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "block",
                                }}
                              >
                                {primaryLabel}
                              </span>
                              {secondaryLabel ? (
                                <span
                                  style={{
                                    fontSize: "var(--text-body)",
                                    color:
                                      "var(--neutral-on-surface-secondary)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "block",
                                  }}
                                >
                                  {secondaryLabel}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              color: "var(--neutral-on-surface-secondary)",
                            })}
                          >
                            {getDocumentTypeLabel(doc.documentType)}
                          </div>
                          <div style={poReferenceTableCellStyle()}>
                            {uploadedBy}
                          </div>
                          <div style={poReferenceTableCellStyle()}>
                            {modifiedDate}
                          </div>
                          <div style={poReferenceTableCellStyle()}>
                            {doc.size || "-"}
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              justifyContent: "flex-end",
                            })}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <Tooltip content="Download">
                                <IconButton
                                  icon={DownloadIcon}
                                  size="small"
                                  title="Download"
                                  onClick={() =>
                                    handleDocumentAction(
                                      "Document successfully downloaded"
                                    )
                                  }
                                />
                              </Tooltip>
                              <Tooltip content="Edit">
                                <IconButton
                                  icon={EditIcon}
                                  size="small"
                                  title="Edit"
                                  onClick={() =>
                                    handleDocumentAction("rename", doc.id)
                                  }
                                />
                              </Tooltip>
                              <Tooltip content="Delete">
                                <IconButton
                                  icon={DeleteIcon}
                                  size="small"
                                  title="Delete"
                                  color="var(--status-red-primary)"
                                  hoverBackground="#FAE6E8"
                                  onClick={() =>
                                    handleDocumentAction("delete", doc.id)
                                  }
                                />
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "var(--neutral-on-surface-tertiary)",
                        fontSize: "var(--text-title-3)",
                        background: "var(--neutral-surface-primary)",
                        border: "1.5px dashed var(--neutral-line-separator-1)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "120px",
                        margin: "0 24px"
                      }}
                    >
                      No documents added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "16px",
                padding: "20px 24px 0 24px",
              }}
            >
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => {
                  const metaText = doc.meta || "";
                  const uploadedBy =
                    metaText.indexOf("Uploaded by ") === 0
                      ? metaText.slice(12).split(" on ")[0]
                      : "-";
                  const modifiedDate =
                    doc.modifiedDate ||
                    (metaText.indexOf(" on ") > -1
                      ? metaText.split(" on ")[1]
                      : "-");
                  const primaryLabel = getDocumentPrimaryLabel(doc);
                  const secondaryLabel = getDocumentSecondaryLabel(doc);
                  return (
                    <div
                      key={doc.id}
                      style={{
                        border: "1px solid var(--neutral-line-separator-1)",
                        borderRadius: "16px",
                        background: "var(--neutral-surface-primary)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ height: "152px", overflow: "hidden" }}>
                        {getDocumentPreview(doc, false)}
                      </div>
                      <div
                        style={{
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "8px",
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "var(--text-title-3)",
                                fontWeight: "var(--font-weight-bold)",
                                color: "var(--neutral-on-surface-primary)",
                                lineHeight: "1.5",
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {primaryLabel}
                            </span>
                            {secondaryLabel ? (
                              <span
                                style={{
                                  fontSize: "var(--text-body)",
                                  color:
                                    "var(--neutral-on-surface-secondary)",
                                  lineHeight: "1.4",
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {secondaryLabel}
                              </span>
                            ) : null}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            <IconButton
                              icon={MoreVerticalIcon}
                              size="small"
                              title="More actions"
                              style={{
                                width: "28px",
                                height: "28px",
                              }}
                              color="var(--neutral-on-surface-secondary)"
                              onClick={(event) =>
                                openDocumentActionMenu(event, doc.id)
                              }
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--neutral-on-surface-secondary)",
                            }}
                          >
                            Document Type:{" "}
                            {getDocumentTypeLabel(doc.documentType)}
                          </span>
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--neutral-on-surface-secondary)",
                            }}
                          >
                            Uploaded by: {uploadedBy}
                          </span>
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--neutral-on-surface-secondary)",
                            }}
                          >
                            Date modified: {modifiedDate}
                          </span>
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--neutral-on-surface-secondary)",
                            }}
                          >
                            File size: {doc.size || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-tertiary)",
                    fontSize: "var(--text-title-3)",
                    background: "var(--neutral-surface-primary)",
                    border: "1.5px dashed var(--neutral-line-separator-1)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                  }}
                >
                  No documents added yet.
                </div>
              )}
            </div>
          )}
          {openDocumentMenuId ? (
            <>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 998,
                }}
                onClick={() => setOpenDocumentMenuId(null)}
              />
              <div
                style={{
                  position: "fixed",
                  top: `${documentMenuPosition.top}px`,
                  left: `${documentMenuPosition.left}px`,
                  transform:
                    documentMenuPosition.placement === "top"
                      ? "translateY(-100%)"
                      : "none",
                  width: "220px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--elevation-sm)",
                  padding: "4px 8px 8px",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 999,
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    label: "Download",
                    icon: DownloadIcon,
                    action: () =>
                      handleDocumentAction(
                        "Document successfully downloaded"
                      ),
                  },
                  {
                    label: "Edit",
                    icon: EditIcon,
                    action: () =>
                      handleDocumentAction("rename", openDocumentMenuId),
                  },
                  {
                    label: "Delete",
                    icon: DeleteIcon,
                    action: () =>
                      handleDocumentAction("delete", openDocumentMenuId),
                    destructive: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderTop:
                        item.label === "Download"
                          ? "none"
                          : "1px solid var(--neutral-line-separator-1)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={item.action}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          "var(--neutral-surface-grey-lighter)";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          "transparent";
                      }}
                      style={{
                        width: "100%",
                        minHeight: "40px",
                        border: "none",
                        background: "transparent",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        color: item.destructive
                          ? "var(--status-red-primary)"
                          : "var(--neutral-on-surface-primary)",
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-regular)",
                        textAlign: "left",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <item.icon
                        size={16}
                        color={
                          item.destructive
                            ? "var(--status-red-primary)"
                            : "var(--neutral-on-surface-secondary)"
                        }
                      />
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PoDocumentsTab;
