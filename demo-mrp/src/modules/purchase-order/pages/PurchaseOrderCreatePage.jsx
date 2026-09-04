import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Box,
  BrandLogoIcon,
  BrandLogoLockup,
  Building2,
  Calendar,
  CalendarIcon,
  Check,
  CheckIcon,
  ChevronDown,
  ChevronDownIcon,
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronRightIcon,
  CloudUploadIcon,
  CreditCard,
  DashboardIcon,
  DeleteIcon,
  Download,
  DownloadIcon,
  EditIcon,
  File,
  FileIcon,
  FileImage,
  FileText,
  FinancingIcon,
  GridViewIcon,
  HelpCircle,
  ImageAssetIcon,
  Info,
  LayoutGrid,
  List,
  ListViewIcon,
  ManufacturingIcon,
  Minus,
  MoreVertical,
  MoreVerticalIcon,
  NotificationIcon,
  Pencil,
  Pickaxe,
  Plus,
  ProductIcon,
  ResourcesIcon,
  RoleIcon,
  RoutingIcon,
  SalesIcon,
  Search,
  SearchIcon,
  Settings,
  TeamIcon,
  Trash2,
  Upload,
  UploadIcon,
  User,
  UserGuideIcon,
  UserIcon,
  Users,
  WorkOrderIcon,
  Wrench,
  X,
  AddIcon,
  AnalyticsIcon,
  BillOfMaterialsIcon,
  DocumentIcon,
  CloseIcon,
} from "../../../components/icons/Icons.jsx";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  COUNTRY_CODE_OPTIONS,
  DATE_PICKER_MONTHS,
  DATE_PICKER_POPOVER_WIDTH,
  DATE_PICKER_WEEKDAYS,
  FILE_DESCRIPTION_MAX_LENGTH,
  LANGUAGE_OPTIONS,
  MAX_PROOF_UPLOAD_FILES,
  UPLOAD_MAX_FILE_SIZE_BYTES,
} from "../../../constants/appConstants.js";
import {
  DEFAULT_NOTIFICATION_CENTER_PREFERENCES,
  DEFAULT_NOTIFICATION_SETTINGS,
  cloneNotificationSettings,
} from "../../../data/notification/notificationDefaults.js";
import {
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_DELIVERY_OPTIONS,
} from "../../../data/notification/notificationOptions.js";
import { DEFAULT_SYSTEM_NOTIFICATIONS } from "../../../data/notification/systemNotifications.js";
import { MOCK_COMPANY } from "../../../data/company.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import {
  MOCK_ADMIN_GROUPS,
  MOCK_ADMIN_ROLES,
  MOCK_ADMIN_USERS,
} from "../../../modules/administration/mock/adminUsers.js";
import {
  MOCK_WO_LINES,
  MOCK_WO_TABLE_DATA,
} from "../../../modules/work-order/mock/workOrderMocks.js";
import { MOCK_MATERIALS_DATA } from "../../../modules/materials/mock/materialsMocks.js";
import {
  MOCK_ACTIVITIES,
  MOCK_PO_DOCUMENTS,
  MOCK_PO_TABLE_DATA,
} from "../../../modules/purchase-order/mock/purchaseOrderMocks.js";
import { MOCK_STOCK_BATCHES } from "../../../modules/materials/mock/batchesMocks.js";
import { addWoActivityLog } from "../../work-order/pages/WorkOrderDetailPage.jsx";
import { PurchaseOrderListPage } from "../../../modules/purchase-order/pages/PurchaseOrderListPage.jsx";
import { PurchaseOrderSettingsPage } from "../../../modules/purchase-order/pages/PurchaseOrderSettingsPage.jsx";
import {
  baseInputBorderColor,
  blurInputFrame,
  fieldStyle,
  focusInputFrame,
  inputControlStyle,
  inputFrameStyle,
} from "../../../modules/purchase-order/styles/purchaseOrderInputStyles.js";
import { DocumentTypeBadge } from "../../../modules/purchase-order/components/DocumentTypeBadge.jsx";
import { buildPoLinkSnapshot } from "../../../modules/purchase-order/utils/purchaseOrderDetailUtils.js";
import {
  formatCurrency,
  formatNumberWithCommas,
  parseNumberFromCommas,
} from "../../../utils/format/formatUtils.js";
import {
  buildCalendarDays,
  formatIsoDateString,
  padDateUnit,
  parseIsoDateString,
} from "../../../utils/date/dateUtils.js";
import {
  createImageUploadRecord,
  createSyntheticInputEvent,
  createUploadDocumentRecord,
  formatUploadFileSize,
  getDocumentPrimaryLabel,
  getDocumentSecondaryLabel,
  getFileExtension,
  getImageUploadName,
  getImageUploadPreviewUrl,
  getUploadDocumentKind,
  normalizeProofDocuments,
  validateUploadFile,
} from "../../../utils/upload/uploadUtils.js";
import { getEnabledNotificationRuleIds } from "../../../utils/notification/notificationUtils.js";
import {
  applyDomLocalization,
  getTranslation,
  LOCALIZABLE_ATTRIBUTES,
} from "../../../utils/localization/localizationUtils.js";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Sidebar } from "../../../components/layout/Sidebar.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { Tooltip, UnifiedInputShell, FormField, LabelValue, PhoneInputField, DateInputControl, InputField, UploadDropzone } from "../../../components/index.js";







const DateRangeInputControl = ({
  value = { start: "", end: "" },
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd - yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const startObj = value.start ? parseIsoDateString(value.start) : null;
  const [viewDate, setViewDate] = useState(startObj || new Date());
  const [selecting, setSelecting] = useState("start");

  const [popoverPos, setPopoverPos] = useState({
    top: 0, left: 0, width: 660, placement: "bottom",
  });

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 660;
    const estimatedHeight = 360;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(8, centeredLeft), maxLeft);
    setPopoverPos({
      left,
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: openAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();
    const handlePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    const handleViewportChange = () => updatePopoverPosition();
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  const nextMonthView = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  const calendars = [
    { date: viewDate, days: buildCalendarDays(viewDate) },
    { date: nextMonthView, days: buildCalendarDays(nextMonthView) }
  ];

  const displayValue = value.start && value.end ? `${value.start} - ${value.end}` : value.start ? `${value.start} - ...` : "";

  const renderMonth = (monthDate, days, isFirst) => {
    const monthLabel = DATE_PICKER_MONTHS[monthDate.getMonth()];
    const yearLabel = monthDate.getFullYear();

    return (
      <div style={{ flex: 1, minWidth: "280px" }}>
        <div className="flex justify-between items-center" style={{ marginBottom: "16px", padding: "0 4px" }}>
          {isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronLeftIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
          <span style={{ fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{monthLabel} {yearLabel}</span>
          {!isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronRightIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0", textAlign: "center", fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "8px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ paddingBottom: "8px" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0" }}>
          {days.map(day => {
            const inMonth = day.isCurrentMonth;
            const isStart = inMonth && day.iso === value.start;
            const isEnd = inMonth && day.iso === value.end;
            const inRange = inMonth && value.start && value.end && day.iso > value.start && day.iso < value.end;
            
            let borderRadiusStyle = "0";
            if (isStart && isEnd) borderRadiusStyle = "99px";
            else if (isStart) borderRadiusStyle = "99px 0 0 99px";
            else if (isEnd) borderRadiusStyle = "0 99px 99px 0";
            else if (!inRange) borderRadiusStyle = "99px";

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  if (!inMonth) return;
                  if (selecting === "start") {
                    onChange?.({ target: { value: { start: day.iso, end: "" } } });
                    setSelecting("end");
                  } else {
                    const range = day.iso < value.start ? { start: day.iso, end: value.start } : { start: value.start, end: day.iso };
                    onChange?.({ target: { value: range } });
                    setIsOpen(false);
                  }
                }}
                style={{
                  height: "40px",
                  border: "none",
                  borderRadius: borderRadiusStyle,
                  background: (isStart || isEnd) ? "var(--feature-brand-primary)" : inRange ? "var(--feature-brand-container-lighter)" : "transparent",
                  color: (isStart || isEnd) ? "#fff" : inMonth ? (inRange ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)") : "var(--neutral-line-separator-2)",
                  cursor: inMonth ? "pointer" : "default",
                  fontSize: "14px",
                  position: "relative",
                  fontWeight: (isStart || isEnd) ? "bold" : "normal",
                  transition: "background 0.2s"
                }}
              >
                {day.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
          setSelecting("start");
        }}
        style={{
          width: "100%",
          height: fieldHeight,
          border: `1px solid ${hasError ? "var(--status-red-primary)" : isOpen ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
          borderRadius,
          background: "var(--neutral-surface-primary)",
          padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          cursor: "pointer", textAlign: "left",
          ...style,
        }}
      >
        <span style={{ fontSize, color: value.start ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)" }}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={18} color="var(--neutral-on-surface-secondary)" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            transform: popoverPos.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "16px",
            boxShadow: "var(--elevation-lg)",
            padding: "24px",
            zIndex: 10020,
            display: "flex",
            gap: "24px"
          }}
        >
          {calendars.map((cal, idx) => (
            <React.Fragment key={idx}>
              {renderMonth(cal.date, cal.days, idx === 0)}
              {idx === 0 && <div style={{ width: "1px", background: "var(--neutral-line-separator-2)", margin: "0 8px" }} />}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

function isRangePart(s, e) { return s || e; }


const openDocumentLink = (doc, fallbackHandler) => {
  if (doc?.previewUrl && typeof window !== "undefined") {
    window.open(doc.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }
  fallbackHandler?.(doc);
};



const UploadDescriptionCard = ({
  file,
  onRemove,
  onDescriptionChange,
  descriptionRequired = false,
  descriptionError = "",
  hideDescriptionField = false,
}) => (
  <div
    style={{
      border: "1px solid var(--neutral-line-separator-1)",
      borderRadius: "24px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      background: "var(--neutral-surface-primary)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minWidth: 0,
        }}
      >
        <DocumentTypeBadge fileName={file?.name} type={file?.type} />
        <span
          style={{
            fontSize: "var(--text-title-3)",
            lineHeight: "20px",
            letterSpacing: "0.09625px",
            fontWeight: "var(--font-weight-regular)",
            color: "var(--neutral-on-surface-primary)",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file?.name || "-"}
        </span>
      </div>
      {onRemove ? (
        <Button variant="danger" size="small" onClick={onRemove}>
          Remove
        </Button>
      ) : null}
    </div>

    {!hideDescriptionField ? (
      <div className="flex flex-col gap-x-sm">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              fontSize: "var(--text-title-2)",
            }}
          >
            {descriptionRequired ? (
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
            ) : null}
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              File Description
            </span>
          </div>
          <span
            style={{
              fontSize: "var(--text-title-2)",
              color: "var(--neutral-on-surface-tertiary)",
            }}
          >
            {(file?.description || "").length}/{FILE_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <input
          type="text"
          value={file?.description || ""}
          maxLength={FILE_DESCRIPTION_MAX_LENGTH}
          placeholder="Enter File Description"
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          style={{
            height: "48px",
            padding: "0 16px",
            width: "100%",
            ...inputFrameStyle(false, !!descriptionError),
            ...inputControlStyle(false, !!file?.description),
            background: "var(--neutral-surface-primary)",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) =>
            blurInputFrame(e.currentTarget, false, !!descriptionError)
          }
        />
        {descriptionError ? (
          <span
            style={{
              fontSize: "var(--text-body)",
              color: "var(--status-red-primary)",
            }}
          >
            {descriptionError}
          </span>
        ) : null}
      </div>
    ) : null}
  </div>
);

const ImageUploadField = ({
  label = "Images",
  images = [],
  maxFiles = 1,
  disabled = false,
  error = "",
  helperText = "",
  onFilesSelected,
  onRemove,
}) => {
  const normalizedImages = images
    .map((image) => createImageUploadRecord(image))
    .filter(Boolean)
    .slice(0, maxFiles);
  const canAddMore = !disabled && normalizedImages.length < maxFiles;

  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []).slice(
      0,
      Math.max(0, maxFiles - normalizedImages.length)
    );
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  const renderDisabledEmptyTile = () => (
    <div
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: "1px dashed var(--neutral-line-separator-2)",
        background: "var(--neutral-surface-grey-lighter)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "not-allowed",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--neutral-line-separator-1)",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" style={{ opacity: 0.5 }} />
      </div>
      <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
        No Image
      </span>
    </div>
  );

  const renderEmptyTile = () => (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        handleIncomingFiles(e.dataTransfer?.files);
      }}
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: `1px dashed ${error ? "var(--status-red-primary)" : "#A9A9A9"}`,
        background: "var(--neutral-surface-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-grey-lighter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" />
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple={maxFiles > 1}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-sm">
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>

      <div className="flex gap-md" style={{ flexWrap: "wrap" }}>
        {normalizedImages.map((image, index) => {
          const previewUrl = getImageUploadPreviewUrl(image);
          const imageName = getImageUploadName(image);
          return (
            <div
              key={image.id || `${imageName}-${index}`}
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "12px",
                border:
                  index === 0
                    ? "2px solid var(--feature-brand-primary)"
                    : "1px solid var(--neutral-line-separator-2)",
                padding: "4px",
                background: "var(--neutral-surface-primary)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-grey-lighter)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={imageName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      padding: "0 10px",
                      textAlign: "center",
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                      lineHeight: "18px",
                      wordBreak: "break-word",
                    }}
                  >
                    {imageName || "Image"}
                  </span>
                )}
              </div>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => onRemove?.(image)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    border: "1px solid var(--status-red-primary)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <CloseIcon size={14} color="var(--status-red-primary)" />
                </button>
              ) : null}
            </div>
          );
        })}

        {canAddMore ? renderEmptyTile() : null}
        {disabled && normalizedImages.length === 0 ? renderDisabledEmptyTile() : null}
      </div>

      {error ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--status-red-primary)",
          }}
        >
          {error}
        </span>
      ) : null}

      {helperText ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

const ProofDocumentList = ({ documents = [], onDocumentClick }) => {
  const normalizedDocuments = normalizeProofDocuments(documents);

  if (normalizedDocuments.length === 0) {
    return (
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        -
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "8px",
      }}
    >
      {normalizedDocuments.map((doc, index) => (
        <div
          key={doc.id || `${doc.name}-${index}`}
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <DocumentTypeBadge
            fileName={doc.name}
            type={doc.type}
            size="compact"
          />
          <button
            type="button"
            onClick={() => openDocumentLink(doc, onDocumentClick)}
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "flex-start",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-title-3)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--feature-brand-primary)",
                lineHeight: "20px",
                letterSpacing: "0.09625px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {getDocumentPrimaryLabel(doc)}
            </span>
            <span
              style={{
                fontSize: "var(--text-body)",
                color: "var(--feature-brand-primary)",
                lineHeight: "18px",
                letterSpacing: "0.0825px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {doc.name}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
};

const InputGroup = ({
  label,
  required = false,
  prefix,
  suffix,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  hasError = false,
  error,
  helperText,
  inputStyle = {},
  containerStyle = {},
  prefixStyle = {},
  suffixStyle = {},
  ...rest
}) => {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <UnifiedInputShell
        disabled={disabled}
        hasError={hasError || !!error}
        style={containerStyle}
        onFocus={(e) => focusInputFrame(e.currentTarget)}
        onBlur={(e) =>
          blurInputFrame(e.currentTarget, disabled, hasError || !!error)
        }
      >
        {prefix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...prefixStyle,
            }}
          >
            {prefix}
          </span>
        ) : null}

        <input
          type={type === "number" ? "text" : type}
          value={type === "number" ? formatNumberWithCommas(value) : value}
          onChange={(e) => {
            if (type === "number") {
              const rawValue = parseNumberFromCommas(e.target.value);
              if (rawValue === "" || !isNaN(rawValue) || rawValue === "-") {
                onChange({ ...e, target: { ...e.target, value: rawValue } });
              }
            } else {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            fontSize: "var(--text-subtitle-1)",
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : (value !== "" && value !== null && value !== undefined)
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            fontFamily: "Lato, sans-serif",
            boxSizing: "border-box",
            ...inputStyle,
          }}
        />

        {suffix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...suffixStyle,
            }}
          >
            {suffix}
          </span>
        ) : null}
      </UnifiedInputShell>
    </FormField>
  );
};

const SectionCard = ({ title, children, rightAction }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="flex items-center gap-x-sm">
        <div
          style={{
            width: "4px",
            height: "20px",
            background: "var(--feature-brand-primary)",
            borderRadius: "2px",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      {rightAction ? <div>{rightAction}</div> : null}
    </div>
    {children}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      ...style,
    }}
  >
    {children}
  </div>
);

const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const systemTableShellStyle = {
  display: "flex",
  flexDirection: "column",
  border: "1px solid var(--neutral-line-separator-1)",
  borderRadius: "12px",
  overflow: "hidden",
  background: "var(--neutral-surface-primary)",
};

const systemTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  height: "49px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

const systemTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  minHeight: "56px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

const systemTableEmptyStateStyle = {
  padding: "32px 24px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
};

const poReferenceTableFrameStyle = {
  border: "none",
  borderRadius: "0",
  overflow: "hidden",
  width: "100%",
};

const poReferenceTableScrollerStyle = {
  overflowX: "auto",
  width: "100%",
};

const poReferenceTableInnerStyle = (minWidth = "100%") => ({
  minWidth,
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const poReferenceTableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "0",
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
});

const poReferenceTableRowStyle = (
  gridTemplateColumns,
  isLast = false,
  overrides = {}
) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "0",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  ...overrides,
});

const poReferenceTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  ...overrides,
});

const poReferenceTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const poReferenceTableEmptyStateStyle = {
  padding: "32px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
  background: "var(--neutral-surface-primary)",
};

const tabButtonStyle = (isActive) => ({
  height: "40px",
  padding: "0 18px",
  borderRadius: "100px",
  border: isActive
    ? "1px solid var(--feature-brand-primary)"
    : "1px solid transparent",
  background: isActive
    ? "var(--neutral-surface-primary)"
    : "rgba(255,255,255,0.56)",
  color: isActive
    ? "var(--feature-brand-primary)"
    : "var(--neutral-on-surface-secondary)",
  fontSize: "var(--text-title-3)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
});

const summaryMetricLabelStyle = {
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-secondary)",
};

const summaryMetricValueStyle = {
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-secondary)",
};

const summaryTotalLabelStyle = {
  fontSize: "var(--text-title-1)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
};

const summaryTotalValueStyle = {
  fontSize: "var(--text-title-1)",
  fontWeight: "var(--font-weight-black)",
  color: "var(--neutral-on-surface-primary)",
};


export const PurchaseOrderCreatePage = ({
  onNavigate,
  isSidebarCollapsed = false,
  initialData,
  poApprovalSettings,
  showPoSnackbar,
}) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const navigateWithReset = (cb, ...args) => {
    scrollToTop();
    cb(...args);
  };
  const pageTopRef = useRef(null);
  const isFromWorkOrderAssignment =
    initialData?.source === "work_order_vendor_assignment";
  const isEditMode = initialData?.source === "edit_purchase_order";
  const isReviseMode = initialData?.source === "revise_purchase_order";
  const editFormData = initialData?.formData || null;
  const editPoNumber = initialData?.poNumber || editFormData?.poNumber || null;

  const navigateBackWithoutPrompt = () => {
    if (isFromWorkOrderAssignment) {
      if (initialData?.returnTo) {
        onNavigate(
          initialData.returnTo.view || "detail",
          initialData.returnTo.data
        );
        return;
      }
      onNavigate("list");
      return;
    }
    if (
      initialData?.source === "order_detail_material_add" &&
      initialData?.returnTo
    ) {
      onNavigate(
        initialData.returnTo.view || "detail",
        initialData.returnTo.data
      );
      return;
    }
    
    if (isEditMode || isReviseMode) {
      if (editPoNumber) {
        onNavigate("po_detail", {
          poNumber: editPoNumber,
          formData: editFormData,
          ...(initialData?.from ? { from: initialData.from } : {}),
          ...(initialData?.returnTo ? { returnTo: initialData.returnTo } : {})
        });
        return;
      }
    }
    onNavigate("list");
  };

  const handleBackNavigation = () => {
    if (isFormDirty) {
      setShowDiscardChangesModal(true);
      return;
    }
    navigateBackWithoutPrompt();
  };


  const prefilledVendor = initialData?.vendorData || null;
  const linkedWorkOrder =
    initialData?.workOrder ||
    (initialData?.returnTo?.data
      ? {
        wo: initialData.returnTo.data.wo,
        product: initialData.returnTo.data.product,
        sku: initialData.returnTo.data.sku,
        image: initialData.returnTo.data.image || "",
      }
      : null);
  const linkedOutsourceSteps =
    initialData?.outsourceSteps ||
    initialData?.returnTo?.data?.outsourceSteps ||
    [];
  const linkedRoutingStages =
    initialData?.routingStages ||
    initialData?.returnTo?.data?.routingStages ||
    [
      { step: 1, op: "Cutting" },
      { step: 2, op: "Furniture Making" },
      { step: 3, op: "Assemble" },
      { step: 4, op: "Paint" },
      { step: 5, op: "Polish" },
      { step: 6, op: "Packing" },
    ];
    const buildLinkedWorkOrderDescription = (
      workOrderNo,
      steps = [],
      stageRows = [],
      assignmentId = ""
    ) => {
      const normalizedSteps = Array.from(
        new Set(
          (steps || [])
            .map((step) => Number(step))
            .filter((step) => Number.isFinite(step))
        )
      ).sort((a, b) => a - b);
      const baseDescription = `Generated from ${workOrderNo || "work order"}${assignmentId ? ` with assignment ${assignmentId}` : ""}. It covers these routing stages:`;

      if (normalizedSteps.length === 0) return `Generated from ${workOrderNo || "work order"}${assignmentId ? ` with assignment ${assignmentId}` : ""}.`;

      const stageLabels = normalizedSteps.map((step) => {
        const matchedStage = (stageRows || []).find(
          (stage) => Number(stage.step) === step
        );
        const operationName = matchedStage?.op || matchedStage?.operation;
        return operationName ? `Step ${step}: ${operationName}` : `Step ${step}`;
      });
      const stackedLabels = stageLabels.map((label) => `- ${label}`).join("\n");
      return `${baseDescription}\n${stackedLabels}`;
    };
  const generatedWorkOrderDescription = buildLinkedWorkOrderDescription(
    linkedWorkOrder?.wo,
    linkedOutsourceSteps,
    linkedRoutingStages,
    linkedWorkOrder?.assignmentId
  );
  const getWorkOrderSourceId = (line) =>
    line?.sourceWorkOrderLineId || line?.id || "";
  const linkedAssignedOutput =
    parseInt(
      initialData?.assignedOutput ||
      editFormData?.lines?.find((line) => line.type === "wo")?.qty ||
      0,
      10
    ) || 0;

  const [vendorSearch, setVendorSearch] = useState(
    editFormData?.vendorName || prefilledVendor?.name || ""
  );
  const [lastConfirmedVendorName, setLastConfirmedVendorName] = useState(
    editFormData?.vendorName || prefilledVendor?.name || ""
  );
  const [lastConfirmedVendorLocked, setLastConfirmedVendorLocked] = useState(
    (!!prefilledVendor && isFromWorkOrderAssignment) ||
    ((isEditMode || isReviseMode) && MOCK_VENDORS.some((v) => v.name === editFormData?.vendorName))
  );
  const [vendorDetails, setVendorDetails] = useState({
    phone: editFormData?.vendorDetails?.phone || prefilledVendor?.phone || "",
    email: editFormData?.vendorDetails?.email || prefilledVendor?.email || "",
    address:
      editFormData?.vendorDetails?.address || prefilledVendor?.address || "",
  });
  const [lastConfirmedVendorDetails, setLastConfirmedVendorDetails] = useState({
    phone: editFormData?.vendorDetails?.phone || prefilledVendor?.phone || "",
    email: editFormData?.vendorDetails?.email || prefilledVendor?.email || "",
    address:
      editFormData?.vendorDetails?.address || prefilledVendor?.address || "",
  });
  const [isVendorLocked, setIsVendorLocked] = useState(
    (!!prefilledVendor && isFromWorkOrderAssignment) ||
    ((isEditMode || isReviseMode) && MOCK_VENDORS.some((v) => v.name === editFormData?.vendorName))
  );
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
  const [isVendorFieldFocused, setIsVendorFieldFocused] = useState(false);
  const [productModalImages, setProductModalImages] = useState([]);
  const [shipToInfo, setShipToInfo] = useState(
    editFormData?.shipTo || {
      name: "",
      phone: "",
      email: "",
      address: "",
    }
  );
  const [poDate, setPoDate] = useState(() => {
    let val = editFormData && editFormData.poDate !== undefined
      ? editFormData.poDate
      : initialData && initialData.createdDate !== undefined
      ? initialData.createdDate
      : new Date().toISOString().split("T")[0];
    return val === "-" ? "" : val;
  });
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const val = editFormData?.deliveryDate || initialData?.expectedDeliveryDate || "";
    return val === "-" ? "" : val;
  });
  const [currency, setCurrency] = useState(editFormData?.currency || "IDR");
  const [notes, setNotes] = useState(editFormData?.notes || "");
  const [terms, setTerms] = useState(editFormData?.terms || "");
  const [tax, setTax] = useState(String(editFormData?.tax ?? 11));
  const [showCanceledWOBlocker, setShowCanceledWOBlocker] = useState(false);
  const [canceledWOsFound, setCanceledWOsFound] = useState([]);
  const [feeLines, setFeeLines] = useState(
    editFormData?.feeLines?.length
      ? editFormData.feeLines
      : [{ id: "fee-1", name: "", amount: "" }]
  );
  const [formErrors, setFormErrors] = useState({});
  const [showEmptyDraftModal, setShowEmptyDraftModal] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showZeroPriceWarningModal, setShowZeroPriceWarningModal] = useState(false);
  const [showNoChangesModal, setShowNoChangesModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionReasonError, setRevisionReasonError] = useState("");
  const [showDiscardChangesModal, setShowDiscardChangesModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isVendorEditingEnabled, setIsVendorEditingEnabled] = useState(false);
  const [showVendorEditConfirm, setShowVendorEditConfirm] = useState(false);
  const [pendingVendorAction, setPendingVendorAction] = useState(null);
  const [productLineType, setProductLineType] = useState("manual");
  const [productModalForm, setProductModalForm] = useState({
    manualName: "",
    manualCode: "",
    manualDesc: "",
    manualQty: "",
    manualPrice: "",
    selectedWorkOrderLineId: "",
    selectedMaterialLineId: "",
  });
  const [productModalFieldErrors, setProductModalFieldErrors] = useState({});
  const [productModalError, setProductModalError] = useState("");
  const [editingLineId, setEditingLineId] = useState(null);
  const [lineToDelete, setLineToDelete] = useState(null);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [deleteConfirmationInvoiceIds, setDeleteConfirmationInvoiceIds] = useState("");

  const [lines, setLines] = useState(() => {
    if (editFormData?.lines?.length) return editFormData.lines;
    if (initialData?.materials?.length) {
      return initialData.materials.map((m, idx) => ({
        id: `mat-${Date.now()}-${idx}`,
        type: "material",
        item: m.name || m.item || "Unknown Material",
        code: m.sku || m.code || "-",
        desc: m.description || m.desc || "",
        qty: m.purchaseQty || 1,
        price: m.price || m.averageCost || 0,
        uom: m.unit || m.uom || "pcs",
        image: m.image || null,
        sourceMaterialLineId: m.id
      }));
    }
    if (isFromWorkOrderAssignment) {
      return [
        {
          id: 1,
          type: "wo",
          item: `Outsourced - ${linkedWorkOrder?.product || "Cabinet Premium"}`,
          code: linkedWorkOrder?.sku || "-",
          desc: generatedWorkOrderDescription,
          qty: linkedAssignedOutput,
          price: 0,
          woRef: linkedWorkOrder?.wo || "-",
          assignmentId: linkedWorkOrder?.assignmentId || "-",
          outsourceSteps: linkedOutsourceSteps,
          lockedFromWorkOrder: true,
          sourceWorkOrderLineId: "generated-work-order-line",
        },
      ];
    }
    return [];
  });

  const editingLine = editingLineId
    ? lines.find((line) => line.id === editingLineId) || null
    : null;
  const isEditingLockedWorkOrderLine = !!editingLine?.lockedFromWorkOrder;

  const vendorSuggestions = MOCK_VENDORS.filter((vendor) =>
    vendor.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );
  const vendorHasExactMatch = MOCK_VENDORS.some(
    (vendor) => vendor.name.toLowerCase() === vendorSearch.trim().toLowerCase()
  );
  const selectedVendorRecord =
    MOCK_VENDORS.find(
      (vendor) =>
        vendor.name.toLowerCase() === vendorSearch.trim().toLowerCase()
    ) ||
    prefilledVendor ||
    null;
  const hasLinkedWorkOrder = !!(
    linkedWorkOrder?.wo || linkedWorkOrder?.product
  );
  const generatedWorkOrderLine = hasLinkedWorkOrder
    ? {
      id: "generated-work-order-line",
      sourceWorkOrderLineId: "generated-work-order-line",
      vendorId:
        selectedVendorRecord?.id || prefilledVendor?.id || "generated-vendor",
      item: linkedWorkOrder?.product || "Cabinet Premium",
      code: linkedWorkOrder?.sku || "-",
      desc: generatedWorkOrderDescription,
      woRef: linkedWorkOrder?.wo || "-",
      qty: linkedAssignedOutput,
      price: 250000,
      image: linkedWorkOrder?.image || null,
      assignmentId: linkedWorkOrder?.assignmentId || "-",
      outsourceSteps: linkedOutsourceSteps,
    }
    : null;
  const vendorSpecificWorkOrderLines = selectedVendorRecord
    ? MOCK_WO_LINES.filter((line) => line.vendorId === selectedVendorRecord.id)
    : [];
  const preservedWorkOrderLines = lines
    .filter((line) => line.type === "wo")
    .map((line) => ({
      ...line,
      sourceWorkOrderLineId: getWorkOrderSourceId(line),
      vendorId:
        selectedVendorRecord?.id || prefilledVendor?.id || "preserved-vendor",
      image:
        line.image ||
        linkedWorkOrder?.image ||
        null,
    }));
  const availableWorkOrderLines = [];
  [
    ...(generatedWorkOrderLine ? [generatedWorkOrderLine] : []),
    ...vendorSpecificWorkOrderLines,
    ...preservedWorkOrderLines,
  ].forEach((line) => {
    const sourceId = getWorkOrderSourceId(line);
    if (
      !sourceId ||
      availableWorkOrderLines.some(
        (entry) => getWorkOrderSourceId(entry) === sourceId
      )
    )
      return;
    availableWorkOrderLines.push({
      ...line,
      sourceWorkOrderLineId: sourceId,
    });
  });
  const availableMaterialLines = MOCK_MATERIALS_DATA.map((m) => ({
    id: m.id,
    item: m.name,
    code: m.sku,
    price: m.averageCost,
    uom: m.unit,
    desc: m.description,
    image: m.image,
  }));

  lines.forEach((line) => {
    if (
      line.type === "material" &&
      !availableMaterialLines.some(
        (m) => m.code === line.code || m.item === line.item
      )
    ) {
      availableMaterialLines.push({
        id: line.sourceMaterialLineId || `temp-mat-${line.id}`,
        item: line.item,
        code: line.code,
        price: line.price,
        uom: line.uom || "Pcs",
        desc: line.desc || "",
        image: line.image || null,
      });
    }
  });

  const selectedMaterialLine = productModalForm.selectedMaterialLineId
    ? availableMaterialLines.find(
      (line) => line.id === productModalForm.selectedMaterialLineId
    ) || null
    : null;

  const subtotal = lines.reduce(
    (acc, line) =>
      acc + (parseFloat(line.qty) || 0) * (parseFloat(line.price) || 0),
    0
  );
  const hasPrefilledDraftContent =
    isFromWorkOrderAssignment &&
    (!!vendorSearch.trim() ||
      !!deliveryDate ||
      !!poDate ||
      lines.length > 0 ||
      !!vendorDetails.phone.trim() ||
      !!vendorDetails.email.trim() ||
      !!vendorDetails.address.trim());
  const taxAmount = subtotal * ((parseFloat(tax) || 0) / 100);
  const activeFeeLines = feeLines.filter(
    (fee) => fee.name.trim() || (parseFloat(fee.amount) || 0) > 0
  );
  const feesAmount = feeLines.reduce(
    (acc, fee) => acc + (parseFloat(fee.amount) || 0),
    0
  );
  const total = subtotal + taxAmount + feesAmount;

  const buildFormDirtySnapshot = () => ({
    vendorSearch: vendorSearch.trim(),
    vendorDetails: {
      phone: vendorDetails.phone.trim(),
      email: vendorDetails.email.trim(),
      address: vendorDetails.address.trim(),
    },
    shipToInfo: {
      name: shipToInfo.name.trim(),
      phone: shipToInfo.phone.trim(),
      email: shipToInfo.email.trim(),
      address: shipToInfo.address.trim(),
    },
    poDate: poDate || "",
    deliveryDate: deliveryDate || "",
    currency: currency || "",
    notes: notes.trim(),
    terms: terms.trim(),
    tax: String(tax || ""),
    feeLines: feeLines.map((fee) => ({
      id: fee.id,
      name: fee.name.trim(),
      amount: String(fee.amount || ""),
    })),
    lines: lines.map((line) => ({
      id: line.id,
      type: line.type,
      item: line.item || "",
      code: line.code || "",
      desc: line.desc || "",
      woRef: line.woRef || "-",
      qty: Number(line.qty) || 0,
      price: Number(line.price) || 0,
      image: line.image || "",
      uom: line.uom || "",
      lockedFromWorkOrder: !!line.lockedFromWorkOrder,
      sourceWorkOrderLineId: line.sourceWorkOrderLineId || "",
      sourceMaterialLineId: line.sourceMaterialLineId || "",
    })),
  });

  const initialDirtySnapshotRef = React.useRef(null);
  if (initialDirtySnapshotRef.current === null) {
    initialDirtySnapshotRef.current = JSON.stringify(buildFormDirtySnapshot());
  }

  const isFormDirty =
    JSON.stringify(buildFormDirtySnapshot()) !==
    initialDirtySnapshotRef.current;

  const validateMandatoryFields = () => {
    const nextErrors = {};
    if (!vendorSearch.trim()) nextErrors.vendor = "Field cannot be empty";
    if (!poDate) nextErrors.poDate = "Field cannot be empty";
    if (!currency) nextErrors.currency = "Field cannot be empty";
    if (!lines.length) nextErrors.lines = "Add at least one product line";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPoPayload = (status, badge) => ({
    poNumber:
      (initialData?.poNumber && initialData.poNumber.startsWith("PO-")) ? 
      initialData.poNumber : 
      `PO-202603-${String(Math.floor(1000 + Math.random() * 9000))}`,
    vendorName: vendorSearch || "-",
    amount: formatCurrency(total),
    createdDate: poDate,
    status,
    statusKey:
      status === "Draft"
        ? "draft"
        : status === "Waiting for Approval"
          ? "ready_to_send"
          : "issued",
    sBadge: badge,
    invoices: initialData?.formData?.invoices || initialData?.invoices || [],
    payments: initialData?.formData?.payments || initialData?.payments || [],
    invoicePaymentLogs: initialData?.formData?.invoicePaymentLogs || initialData?.invoicePaymentLogs || [],
    ...(initialData?.from ? { from: initialData.from } : {}),
    ...(initialData?.returnTo ? { returnTo: initialData.returnTo } : {}),
    formData: {
      vendorName: vendorSearch,
      vendorDetails,
      poDate,
      deliveryDate,
      currency,
      lines,
      tax: parseFloat(tax) || 0,
      feeLines,
      notes,
      terms,
      shipTo: shipToInfo,
      documents: initialData?.formData?.documents || initialData?.documents || [],
      invoices: initialData?.formData?.invoices || initialData?.invoices || [],
      payments: initialData?.formData?.payments || initialData?.payments || [],
      invoicePaymentLogs: initialData?.formData?.invoicePaymentLogs || initialData?.invoicePaymentLogs || [],
      receiptLogs: initialData?.formData?.receiptLogs || initialData?.receiptLogs || [],
    },
  });

  const handleVendorInputChange = (value) => {
    setVendorSearch(value);
    setShowVendorSuggestions(true);

    const trimmedValue = value.trim();
    const exactMatch = MOCK_VENDORS.find(
      (vendor) => vendor.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (!trimmedValue) {
      setVendorDetails({ phone: "", email: "", address: "" });
      setIsVendorLocked(false);
      return;
    }

    if (exactMatch) {
      setVendorDetails({
        phone: exactMatch.phone,
        email: exactMatch.email,
        address: exactMatch.address,
      });
      setIsVendorLocked(true);
      setIsVendorEditingEnabled(false);
      return;
    }

    setVendorDetails((prev) => {
      const hasLockedVendorData = prev.phone || prev.email || prev.address;
      return hasLockedVendorData ? { phone: "", email: "", address: "" } : prev;
    });
    setIsVendorLocked(false);
  };

  const handleAddNewVendorOption = () => {
    const trimmedValue = vendorSearch.trim();
    if (!trimmedValue) return;

    const hasWoLines = lines.some((line) => line.type === "wo");
    if (hasWoLines) {
      setPendingVendorAction({ type: "add_new", value: trimmedValue });
      setShowVendorEditConfirm(true);
      return;
    }

    setVendorSearch(trimmedValue);
    setLastConfirmedVendorName(trimmedValue);
    const emptyDetails = { phone: "", email: "", address: "" };
    setVendorDetails(emptyDetails);
    setLastConfirmedVendorDetails(emptyDetails);
    setIsVendorLocked(false);
    setLastConfirmedVendorLocked(false);
    setIsVendorFieldFocused(false);
    setShowVendorSuggestions(false);
  };

  const handleSelectVendorSuggestion = (vendor) => {
    const hasWoLines = lines.some((line) => line.type === "wo");
    if (hasWoLines) {
      setPendingVendorAction({ type: "select", vendor });
      setShowVendorEditConfirm(true);
      return;
    }

    setVendorSearch(vendor.name);
    setLastConfirmedVendorName(vendor.name);
    const details = {
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
    };
    setVendorDetails(details);
    setLastConfirmedVendorDetails(details);
    setIsVendorLocked(true);
    setLastConfirmedVendorLocked(true);
    setIsVendorEditingEnabled(false);
    setIsVendorFieldFocused(false);
    setShowVendorSuggestions(false);
  };

  const handleUseCompanyDetail = () => {
    setShipToInfo({
      name: MOCK_COMPANY.name,
      phone: MOCK_COMPANY.phone,
      email: MOCK_COMPANY.email,
      address: MOCK_COMPANY.address,
    });
  };

  const handleAddFeeLine = () => {
    if (feeLines.length < 5) {
      setFeeLines((prev) => [
        ...prev,
        { id: `fee-${Date.now()}`, name: "", amount: "" },
      ]);
    }
  };
  const handleFeeChange = (feeId, key, value) =>
    setFeeLines((prev) =>
      prev.map((fee) => (fee.id === feeId ? { ...fee, [key]: value } : fee))
    );
  const handleRemoveFeeLine = (feeId) =>
    setFeeLines((prev) =>
      prev.length === 1
        ? [{ id: "fee-1", name: "", amount: "" }]
        : prev.filter((fee) => fee.id !== feeId)
    );

  const openAddProductModal = () => {
    setEditingLineId(null);
    setProductLineType("manual");
    setProductModalForm({
      manualName: "",
      manualCode: "",
      manualDesc: "",
      manualQty: "",
      manualPrice: "",
      selectedWorkOrderLineId: "",
      selectedMaterialLineId: "",
    });
    setProductModalImages([]);
    setProductModalFieldErrors({});
    setProductModalError("");
    setShowAddProductModal(true);
  };

  const handleEditVendorClick = () => {
    const hasWoLines = lines.some((line) => line.type === "wo");
    if (hasWoLines) {
      setShowVendorEditConfirm(true);
    } else {
      setIsVendorEditingEnabled(true);
    }
  };

  const handleConfirmVendorEdit = () => {
    setLines(lines.filter((line) => line.type !== "wo"));

    if (pendingVendorAction) {
      if (pendingVendorAction.type === "select") {
        const { vendor } = pendingVendorAction;
        setVendorSearch(vendor.name);
        setLastConfirmedVendorName(vendor.name);
        const details = {
          phone: vendor.phone,
          email: vendor.email,
          address: vendor.address,
        };
        setVendorDetails(details);
        setLastConfirmedVendorDetails(details);
        setIsVendorLocked(true);
        setLastConfirmedVendorLocked(true);
        setIsVendorEditingEnabled(false);
        setIsVendorFieldFocused(false);
        setShowVendorSuggestions(false);
      } else if (pendingVendorAction.type === "add_new") {
        setVendorSearch(pendingVendorAction.value);
        setLastConfirmedVendorName(pendingVendorAction.value);
        const emptyDetails = { phone: "", email: "", address: "" };
        setVendorDetails(emptyDetails);
        setLastConfirmedVendorDetails(emptyDetails);
        setIsVendorLocked(false);
        setLastConfirmedVendorLocked(false);
        setIsVendorFieldFocused(false);
        setShowVendorSuggestions(false);
      }
      setPendingVendorAction(null);
    } else {
      setIsVendorEditingEnabled(true);
    }
    setShowVendorEditConfirm(false);
  };

  const handleEditLine = (line) => {
    setEditingLineId(line.id);
    const isWo = line.type === "wo";
    const isMaterial = line.type === "material";
    const matchedWorkOrderLine = isWo
      ? availableWorkOrderLines.find(
        (wo) =>
          (line.sourceWorkOrderLineId &&
            getWorkOrderSourceId(wo) === line.sourceWorkOrderLineId) ||
          (wo.item === line.item && wo.woRef === line.woRef)
      )
      : null;
    const matchedMaterialLine = isMaterial
      ? availableMaterialLines.find(
        (material) =>
          (line.sourceMaterialLineId && material.id === line.sourceMaterialLineId) ||
          material.code === line.code ||
          material.item === line.item
      )
      : null;
    const fallbackGeneratedLineId =
      line.lockedFromWorkOrder && generatedWorkOrderLine
        ? getWorkOrderSourceId(generatedWorkOrderLine)
        : "";

    setProductLineType(isWo ? "wo" : isMaterial ? "material" : "manual");
    setProductModalForm({
      manualName: line.item || "",
      manualCode: line.code || "",
      manualDesc: line.desc || "",
      manualQty: line.qty ? String(line.qty) : "",
      manualPrice: (line.price !== undefined && line.price !== null && line.price !== "") ? String(line.price) : "",
      selectedWorkOrderLineId: isWo
        ? getWorkOrderSourceId(matchedWorkOrderLine) ||
        line.sourceWorkOrderLineId ||
        fallbackGeneratedLineId
        : "",
      selectedMaterialLineId: isMaterial
        ? matchedMaterialLine?.id || line.sourceMaterialLineId || ""
        : "",
    });
    setProductModalImages(
      line.image
        ? [createImageUploadRecord(line.image)]
        : line.lockedFromWorkOrder && generatedWorkOrderLine?.image
          ? [createImageUploadRecord(generatedWorkOrderLine.image)]
          : matchedMaterialLine?.image
            ? [createImageUploadRecord(matchedMaterialLine.image)]
          : []
    );
    setProductModalFieldErrors({});
    setProductModalError("");
    setShowAddProductModal(true);
  };

  const scrollToProductModalField = (fieldKey) => {
    setTimeout(() => {
      const el = document.getElementById(`modal-field-${fieldKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleSaveProductLine = () => {
    if (productLineType === "manual") {
      const nextErrors = {};
      if (!productModalForm.manualName.trim())
        nextErrors.manualName = "Field cannot be empty";
      if (productModalForm.manualQty === "") {
        nextErrors.manualQty = "Field cannot be empty";
      } else if (parseInt(productModalForm.manualQty, 10) <= 0) {
        nextErrors.manualQty = "Quantity must be greater than 0";
      }
      if (productModalForm.manualPrice === "")
        nextErrors.manualPrice = "Field cannot be empty";
      setProductModalFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        scrollToProductModalField(Object.keys(nextErrors)[0]);
        return;
      }

      const nextLine = {
        id: editingLineId || `manual-${Date.now()}`,
        type: "manual",
        item: productModalForm.manualName,
        code: productModalForm.manualCode || "-",
        desc: productModalForm.manualDesc || "-",
        woRef: "-",
        qty: parseInt(productModalForm.manualQty, 10) || 0,
        price: parseInt(productModalForm.manualPrice, 10) || 0,
        image: productModalImages[0] || null,
        uom: "",
        lockedFromWorkOrder: false,
        sourceWorkOrderLineId: "",
        sourceMaterialLineId: "",
      };

      setLines((prev) =>
        editingLineId
          ? prev.map((line) =>
            line.id === editingLineId ? { ...line, ...nextLine } : line
          )
          : [...prev, nextLine]
      );
      setShowAddProductModal(false);
      setEditingLineId(null);
      setProductModalFieldErrors({});
      return;
    }

    if (productLineType === "material") {
      const targetLine = availableMaterialLines.find(
        (line) => line.id === productModalForm.selectedMaterialLineId
      );
      const nextErrors = {};
      if (!productModalForm.selectedMaterialLineId)
        nextErrors.selectedMaterialLineId = "Field cannot be empty";
      if (productModalForm.manualQty === "") {
        nextErrors.manualQty = "Field cannot be empty";
      } else if (parseInt(productModalForm.manualQty, 10) <= 0) {
        nextErrors.manualQty = "Quantity must be greater than 0";
      }
      if (productModalForm.manualPrice === "")
        nextErrors.manualPrice = "Field cannot be empty";
      setProductModalFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        scrollToProductModalField(Object.keys(nextErrors)[0]);
        return;
      }
      if (!targetLine) return;

      const nextLine = {
        id: editingLineId || `material-${Date.now()}`,
        type: "material",
        item: targetLine.item,
        code: targetLine.code,
        desc: productModalForm.manualDesc || targetLine.desc,
        woRef: "-",
        qty: productModalForm.manualQty !== "" ? parseInt(productModalForm.manualQty, 10) : targetLine.qty,
        price: productModalForm.manualPrice !== "" ? parseInt(productModalForm.manualPrice, 10) : targetLine.price,
        image: productModalImages[0] || (targetLine.image ? createImageUploadRecord(targetLine.image) : null),
        uom: targetLine.uom || "",
        lockedFromWorkOrder: false,
        sourceWorkOrderLineId: "",
        sourceMaterialLineId: targetLine.id,
      };

      setLines((prev) =>
        editingLineId
          ? prev.map((line) =>
            line.id === editingLineId ? { ...line, ...nextLine } : line
          )
          : [...prev, nextLine]
      );
      setShowAddProductModal(false);
      setEditingLineId(null);
      setProductModalFieldErrors({});
      return;
    }


    const targetLine = availableWorkOrderLines.find(
      (line) =>
        getWorkOrderSourceId(line) === productModalForm.selectedWorkOrderLineId
    );
    const nextErrors = {};
    if (!productModalForm.selectedWorkOrderLineId)
      nextErrors.selectedWorkOrderLineId = "Field cannot be empty";
    if (productModalForm.manualQty === "") {
      nextErrors.manualQty = "Field cannot be empty";
    } else if (parseInt(productModalForm.manualQty, 10) <= 0) {
      nextErrors.manualQty = "Quantity must be greater than 0";
    }
    if (productModalForm.manualPrice === "")
      nextErrors.manualPrice = "Field cannot be empty";
    setProductModalFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      scrollToProductModalField(Object.keys(nextErrors)[0]);
      return;
    }
    if (!targetLine) return;

    const nextLine = {
      id: editingLineId || `wo-${Date.now()}`,
      type: "wo",
      item: `Outsourced - ${targetLine.item}`,
      code: targetLine.code,
      desc: productModalForm.manualDesc || targetLine.desc,
      woRef: targetLine.woRef,
      qty: productModalForm.manualQty !== "" ? parseInt(productModalForm.manualQty, 10) : targetLine.qty,
      price: productModalForm.manualPrice !== "" ? parseInt(productModalForm.manualPrice, 10) : targetLine.price,
      image: productModalImages[0] || (targetLine.image ? createImageUploadRecord(targetLine.image) : null),
      uom: "",
      lockedFromWorkOrder: editingLineId
        ? lines.find((line) => line.id === editingLineId)?.lockedFromWorkOrder
        : false,
      sourceWorkOrderLineId: getWorkOrderSourceId(targetLine),
      sourceMaterialLineId: "",
      assignmentId: targetLine.assignmentId,
      outsourceSteps: targetLine.outsourceSteps,
    };

    setLines((prev) =>
      editingLineId
        ? prev.map((line) =>
          line.id === editingLineId ? { ...line, ...nextLine } : line
        )
        : [...prev, nextLine]
    );
    setShowAddProductModal(false);
    setEditingLineId(null);
    setProductModalFieldErrors({});
  };

  const handleRemoveLine = (line) => {
    if (isReviseMode) {
      let allInvoices = initialData?.formData?.invoices || initialData?.invoices || [];
      if (!allInvoices.length && initialData?.poNumber) {
        const mockPo = MOCK_PO_TABLE_DATA.find(p => p.poNumber === initialData.poNumber);
        if (mockPo) allInvoices = mockPo.invoices || [];
      }
      const linkedInvoices = allInvoices.filter(inv => inv.itemLines?.some(il => String(il.id) === String(line.id) || String(il.id) === `l${line.id}`));
      if (linkedInvoices && linkedInvoices.length > 0) {
        setLineToDelete(line);
        setDeleteConfirmationInvoiceIds(linkedInvoices.map(inv => inv.number).join(", "));
        setShowDeleteConfirmationModal(true);
        return;
      }
    }
    setLines((prev) =>
      prev.filter((l) => l.id !== line.id || l.lockedFromWorkOrder)
    );
  };

  const updateMockWoTableData = (targetPoNumber, payload, targetAssignmentId, poLinkSnapshot) => {
    if (initialData?.workOrder?.wo && targetAssignmentId) {
      const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === initialData.workOrder.wo);
      if (woData && woData.vendors) {
        const vendorIndex = woData.vendors.findIndex(v => v.assignmentId === targetAssignmentId);
        if (vendorIndex !== -1) {
          woData.vendors[vendorIndex] = {
            ...woData.vendors[vendorIndex],
            poNumber: targetPoNumber,
            isPoApproved: payload.status === "Issued" || payload.status === "Approved",
            poStatus: payload.status,
            poBadge: payload.sBadge,
            poStatusKey: payload.statusKey,
            poDetailData: poLinkSnapshot,
          };
        }
      }
    }
  };

  const handleSaveDraft = () => {
    if (!vendorSearch.trim()) {
      setShowEmptyDraftModal(true);
      return;
    }

    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: "auto", block: "start" });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    const payload = {
      ...buildPoPayload(
        isEditMode || isReviseMode ? (initialData?.status || "Draft") : "Draft",
        isEditMode || isReviseMode ? (initialData?.sBadge || "grey") : "grey"
      ),
    };
    const poLinkSnapshot = buildPoLinkSnapshot(payload);

    // Persist to global mock data (WITHOUT the toast flag)
    const existingIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === payload.poNumber);
    if (existingIndex !== -1) {
      MOCK_PO_TABLE_DATA[existingIndex] = payload;
    } else {
      MOCK_PO_TABLE_DATA.push(payload);
    }

    // Use a separate payload for navigation that includes the toast flag
    const navigationPayload = {
      ...payload,
      showDraftToast: true,
    };

    if (
      (initialData?.source === "work_order_vendor_assignment" || initialData?.source === "order_detail_material_add") &&
      initialData?.returnTo?.data
    ) {
      const targetPoNumber = payload.poNumber;
      const targetAssignmentId = initialData?.workOrder?.assignmentId;
      const updatedReturnData = {
        ...initialData.returnTo.data,
        vendors: (initialData.returnTo.data.vendors || []).map((vendor) => {
          // For work order source: match ONLY the specific assignment ID
          // For order detail source: match by vendor name/id
          const isTargetVendor = initialData?.source === "work_order_vendor_assignment"
            ? targetAssignmentId
              ? vendor.assignmentId === targetAssignmentId
              : (vendor.name === (initialData?.vendorData?.name || vendorSearch?.trim()) &&
                 vendor.poNumber === (initialData?.poNumber || ""))
            : (vendor.name === (initialData?.vendorData?.name || vendorSearch?.trim()) ||
               vendor.id === initialData?.vendorData?.id ||
               vendor.poNumber === initialData?.poNumber);
          if (!isTargetVendor) return vendor;
          return {
            ...vendor,
            poNumber: targetPoNumber,
            isPoApproved: payload.status === "Issued" || payload.status === "Approved",
            poStatus: payload.status,
            poBadge: payload.sBadge,
            poStatusKey: payload.statusKey,
            poDetailData: poLinkSnapshot,
          };
        }),
      };

      updateMockWoTableData(targetPoNumber, payload, targetAssignmentId, poLinkSnapshot);

      if (initialData?.workOrder?.wo && targetAssignmentId) {
        addWoActivityLog(
          initialData.workOrder.wo,
          "Purchase Order Linked",
          `${targetPoNumber} linked to assignment ${targetAssignmentId}`
        );
      }

      navigationPayload.from = initialData?.source === "order_detail_material_add" ? "order_detail" : "work_order_detail";
      navigationPayload.returnTo = {
        ...initialData.returnTo,
        data: updatedReturnData,
      };
    }

    showPoSnackbar("Purchase order successfully saved", "success");
    onNavigate("po_detail", navigationPayload, { replace: true });
  };

  const handleSubmitClick = () => {
    if (!validateMandatoryFields()) return;

    // Check for canceled work orders
    const canceledWOLines = lines.filter((line) => {
      if (line.type !== "wo") return false;
      const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === line.woRef);
      return woData && woData.status === "Canceled";
    });

    if (canceledWOLines.length > 0) {
      const canceledWoNumbers = Array.from(
        new Set(canceledWOLines.map((l) => l.woRef))
      );
      setCanceledWOsFound(canceledWoNumbers);
      setShowCanceledWOBlocker(true);
      return;
    }

    // Check if PO date is in the future
    const today = new Date();
    // Format today as YYYY-MM-DD in local time
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (poDate > todayString) {
      setFormErrors((prev) => ({
        ...prev,
        poDate: "Purchase order date cannot be later than today",
      }));
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (isReviseMode && editFormData) {
      const normalizeLine = (line) => ({
        type: line.type || "manual",
        item: (line.item || "").trim(),
        code: (line.code || "").trim(),
        desc: (line.desc || "").trim(),
        qty: Number(line.qty) || 0,
        price: Number(line.price) || 0,
        uom: (line.uom || "").trim(),
        woRef: (line.woRef || "").trim(),
      });

      const currentFormSnapshot = {
        vendorName: vendorSearch.trim(),
        vendorDetails: {
          phone: (vendorDetails.phone || "").trim(),
          email: (vendorDetails.email || "").trim(),
          address: (vendorDetails.address || "").trim(),
        },
        poDate,
        deliveryDate: deliveryDate || "",
        currency: currency || "IDR",
        shipTo: {
          name: (shipToInfo.name || "").trim(),
          phone: (shipToInfo.phone || "").trim(),
          email: (shipToInfo.email || "").trim(),
          address: (shipToInfo.address || "").trim(),
        },
        lines: lines.map(normalizeLine),
        tax: Number(tax) || 0,
        feeLines: (feeLines || [])
          .filter(f => (f.name || "").trim() || (Number(f.amount) || 0) > 0)
          .map(f => ({
            name: (f.name || "").trim(),
            amount: Number(f.amount) || 0,
          })),
        notes: notes.trim(),
        terms: terms.trim(),
      };

      const originalFormSnapshot = {
        vendorName: editFormData.vendorName.trim(),
        vendorDetails: {
          phone: (editFormData.vendorDetails?.phone || "").trim(),
          email: (editFormData.vendorDetails?.email || "").trim(),
          address: (editFormData.vendorDetails?.address || "").trim(),
        },
        poDate: editFormData.poDate,
        deliveryDate: editFormData.deliveryDate || "",
        currency: editFormData.currency || "IDR",
        shipTo: {
          name: (editFormData.shipTo?.name || "").trim(),
          phone: (editFormData.shipTo?.phone || "").trim(),
          email: (editFormData.shipTo?.email || "").trim(),
          address: (editFormData.shipTo?.address || "").trim(),
        },
        lines: (editFormData.lines || []).map(normalizeLine),
        tax: Number(editFormData.tax ?? 11),
        feeLines: (editFormData.feeLines || [])
          .filter(f => (f.name || "").trim() || (Number(f.amount) || 0) > 0)
          .map(f => ({
            name: (f.name || "").trim(),
            amount: Number(f.amount) || 0,
          })),
        notes: (editFormData.notes || "").trim(),
        terms: (editFormData.terms || "").trim(),
      };

      if (JSON.stringify(currentFormSnapshot) === JSON.stringify(originalFormSnapshot)) {
        setShowNoChangesModal(true);
        return;
      }
    }

    if (isReviseMode) {
      setRevisionReason("");
      setRevisionReasonError("");
    }

    const hasZeroPriceItem = lines.some(
      (line) => (parseFloat(line.price) || 0) === 0
    );
    if (hasZeroPriceItem) {
      setShowZeroPriceWarningModal(true);
    } else {
      setShowSubmitConfirmModal(true);
    }
  };

  const syncPoToStockBatches = (poPayload) => {
    const { formData, poNumber } = poPayload;
    const { lines, vendorName, poDate, deliveryDate } = formData;

    lines.forEach((line) => {
      // Find matching material
      const material = MOCK_MATERIALS_DATA.find(
        (m) => m.sku === line.code || m.name === line.item
      );
      if (!material) return;

      const batchId = `batch-${poNumber}-${line.id}`;
      // Create new batch (action is always 'issue' for direct submit)
      const newBatch = {
        id: batchId,
        materialId: material.id,
        batchNo: `BN-${poNumber.replace("PO-", "")}-${line.id}`,
        initialQty: Number(line.qty) || 0,
        currentQty: 0,
        reservedQty: 0,
        costPerUnit: Number(line.price) || 0,
        purchaseDate: poDate,
        expectedDate: deliveryDate,
        receivedDate: "",
        storageLocation: "",
        vendor: vendorName,
        status: "Requested",
        poRef: poNumber,
        attachments: 0,
      };
      const existing = MOCK_STOCK_BATCHES.find((b) => b.id === batchId);
      if (!existing) {
        MOCK_STOCK_BATCHES.push(newBatch);
      } else {
        existing.initialQty = Number(line.qty) || 0;
        existing.costPerUnit = Number(line.price) || 0;
        existing.vendor = vendorName;
        existing.purchaseDate = poDate;
        existing.expectedDate = deliveryDate;
      }
    });
  };

  const handleConfirmSubmit = () => {
    const approvalOn = !!poApprovalSettings?.isApprovalActive;
    const nextStatus = approvalOn ? "Waiting for Approval" : "Issued";
    const nextBadge = approvalOn ? "orange" : "blue";
    const payload = buildPoPayload(nextStatus, nextBadge);
    const poLinkSnapshot = buildPoLinkSnapshot(payload);

    if (nextStatus === "Issued") {
      syncPoToStockBatches(payload);
    }

    if (isReviseMode) {
      const existingPo = MOCK_PO_TABLE_DATA.find(p => p.poNumber === payload.poNumber);
      if (existingPo) {
        if (!existingPo.versions) {
          existingPo.versions = [
            { 
              version: 1, 
              date: existingPo.createdDate || existingPo.poDate || new Date().toISOString().split("T")[0],
              data: { ...existingPo, versions: undefined } 
            }
          ];
        }
        const nextVersionNumber = existingPo.versions.length + 1;
        const newVersionEntry = {
          version: nextVersionNumber,
          date: new Date().toISOString().split("T")[0],
          data: { ...payload }
        };
        existingPo.versions.push(newVersionEntry);
        payload.currentVersion = nextVersionNumber;
        payload.versions = existingPo.versions;
        payload.revisionReason = revisionReason;

        // Add to activity log
        if (!payload.formData.receiptLogs) payload.formData.receiptLogs = [];
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const formattedTimestamp = `${yyyy}-${mm}-${dd} at ${hh}:${min}`;

        const logTitle = approvalOn 
          ? "Revise Requested" 
          : `Revised to Version ${nextVersionNumber}.0`;

        payload.formData.receiptLogs.unshift({
          name: "Joko",
          email: "joko@company.com",
          title: logTitle,
          desc: revisionReason,
          timestamp: formattedTimestamp
        });
      }
      if (showPoSnackbar) {
        showPoSnackbar("Purchase order successfully submitted", "success");
      }
    }

    // Persist to global mock data
    const existingIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === payload.poNumber);
    if (existingIndex !== -1) {
      MOCK_PO_TABLE_DATA[existingIndex] = payload;
    } else {
      MOCK_PO_TABLE_DATA.push(payload);
    }

    if (
      (initialData?.source === "work_order_vendor_assignment" || initialData?.source === "order_detail_material_add") &&
      initialData?.returnTo?.data
    ) {
      const targetPoNumber = payload.poNumber;
      const targetAssignmentId = initialData?.workOrder?.assignmentId;
      const updatedReturnData = {
        ...initialData.returnTo.data,
        vendors: (initialData.returnTo.data.vendors || []).map((vendor) => {
          // For work order source: match ONLY the specific assignment ID
          // For order detail source: match by vendor name/id
          const isTargetVendor = initialData?.source === "work_order_vendor_assignment"
            ? targetAssignmentId
              ? vendor.assignmentId === targetAssignmentId
              : (vendor.name === (initialData?.vendorData?.name || vendorSearch?.trim()) &&
                 vendor.poNumber === (initialData?.poNumber || ""))
            : (vendor.name === (initialData?.vendorData?.name || vendorSearch?.trim()) ||
               vendor.id === initialData?.vendorData?.id ||
               vendor.poNumber === initialData?.poNumber);
          if (!isTargetVendor) return vendor;
          return {
            ...vendor,
            poNumber: targetPoNumber,
            isPoApproved: !approvalOn,
            poStatus: payload.status,
            poBadge: payload.sBadge,
            poStatusKey: payload.statusKey,
            poDetailData: poLinkSnapshot,
          };
        }),
      };

      updateMockWoTableData(targetPoNumber, payload, targetAssignmentId, poLinkSnapshot);

      if (initialData?.workOrder?.wo && targetAssignmentId) {
        addWoActivityLog(
          initialData.workOrder.wo,
          "Purchase Order Linked",
          `${targetPoNumber} linked to assignment ${targetAssignmentId}`
        );
      }

      payload.from = initialData?.source === "order_detail_material_add" ? "order_detail" : "work_order_detail";
      payload.returnTo = {
        ...initialData.returnTo,
        data: updatedReturnData,
      };
    }

    scrollToTop();
    onNavigate("po_detail", payload, { replace: true });
  };

  const pageSectionStyle = {
    background: "var(--neutral-surface-primary)",
    borderRadius: "16px",
    border: "1px solid var(--neutral-line-separator-1)",
    overflow: "hidden",
  };

  const sectionHeader = (title, right) => (
    <div
      style={{
        padding: "18px 20px 0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "6px",
            height: "24px",
            borderRadius: "0 4px 4px 0",
            background: "var(--feature-brand-primary)",
            position: "absolute",
            left: 0,
            top: "18px",
          }}
        />
        <span
          style={{
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {title}
        </span>
      </div>
      {right || null}
    </div>
  );

  const fieldLabelCol = (label, desc, required = false) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        paddingTop: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
        {required ? (
          <span
            style={{
              color: "var(--status-red-primary)",
              fontSize: "var(--text-title-3)",
            }}
          >
            *
          </span>
        ) : null}
        <span
          style={{
            fontSize: "var(--text-title-3)",
            color: "var(--neutral-on-surface-primary)",
            fontWeight: "var(--font-weight-regular)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );

  const rowWrapStyle = {
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr)",
    gap: "20px",
    alignItems: "start",
  };
  const compactGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  };
  const currencyPrefixLabel = currency === "USD" ? "USD" : "IDR";

  const handleAddProductImages = (files) => {
    const nextFile = Array.from(files || [])[0];
    if (!nextFile) return;
    const validationMessage = validateUploadFile(
      nextFile,
      ALLOWED_IMAGE_EXTENSIONS,
      UPLOAD_MAX_FILE_SIZE_BYTES,
      "Allowed formats (JPG, JPEG, PNG, WebP)"
    );
    if (validationMessage) {
      setProductModalError(validationMessage);
      return;
    }
    setProductModalError("");
    setProductModalImages([createImageUploadRecord(nextFile)]);
  };

  const handleRemoveProductImage = (imageToRemove) => {
    const imageName = getImageUploadName(imageToRemove);
    setProductModalImages((prev) =>
      prev.filter((item) => getImageUploadName(item) !== imageName)
    );
    setProductModalError("");
  };

  const renderProductImageUploader = (disabled = false, helperTextOverride = "") => {
    const defaultDisabledHelperText = productLineType === "wo"
      ? "Image is taken from the selected work order."
      : "Allowed formats (JPG, JPEG, PNG, WebP), Max size 25MB per file";

    const helperText = helperTextOverride || (disabled
      ? defaultDisabledHelperText
      : "Allowed formats (JPG, JPEG, PNG, WebP), Max size 25MB per file");

    return (
      <ImageUploadField
        label="Images"
        images={productModalImages}
        maxFiles={1}
        disabled={disabled}
        error={productModalError}
        helperText={helperText}
        onFilesSelected={handleAddProductImages}
        onRemove={handleRemoveProductImage}
      />
    );
  };

  return (
    <div
      ref={pageTopRef}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        background: "#F5F5F7",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: "108px",
          background: "#F5F5F7",
        }}
      >
        <div className="flex flex-col gap-x-sm">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              marginLeft: "-4px",
            }}
            onClick={handleBackNavigation}
          >
            <ChevronLeftIcon
              size={28}
              color="var(--neutral-on-surface-primary)"
            />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              {isReviseMode ? "Revise Purchase Order" : isEditMode ? "Edit Purchase Order" : "Add New Purchase Order"}
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--text-title-3)",
            }}
          >
            <span
              style={{
                color: "var(--neutral-on-surface-secondary)",
                cursor: "pointer",
              }}
              onClick={() => onNavigate("list")}
            >
              Purchase Order
            </span>
            {(isEditMode || isReviseMode) && (
              <>
                <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
                  /
                </span>
                <span
                  style={{
                    color: "var(--neutral-on-surface-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={handleBackNavigation}
                >
                  Purchase Order Detail
                </span>
              </>
            )}
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              /
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              {isReviseMode ? "Revise Purchase Order" : isEditMode ? "Edit Purchase Order" : "Add New Purchase Order"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={pageSectionStyle}>
            {sectionHeader(
              "Vendor Information",
              (isEditMode || isReviseMode) && initialData?.status === "Draft" && !isVendorEditingEnabled && (
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={handleEditVendorClick}
                  leftIcon={EditIcon}
                  style={{ padding: "0 8px", height: "32px", fontWeight: "var(--font-weight-bold)" }}
                >
                  Edit
                </Button>
              )
            )}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Vendor Name",
                  "Select an existing vendor or add a new one.",
                  true
                )}
                <div className="relative">
                  <div className="relative">
                    <input
                      value={vendorSearch}
                      onChange={(e) => handleVendorInputChange(e.target.value)}
                      onFocus={() => {
                        if (!isFromWorkOrderAssignment) {
                          setIsVendorFieldFocused(true);
                          setShowVendorSuggestions(true);
                        }
                      }}
                      onClick={() => {
                        if (!isFromWorkOrderAssignment) {
                          setIsVendorFieldFocused(true);
                          setShowVendorSuggestions(true);
                        }
                      }}
                      disabled={isFromWorkOrderAssignment || isEditMode || isReviseMode ? !isVendorEditingEnabled : false}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsVendorFieldFocused(false);
                        }, 120);
                      }}
                      placeholder="Type to search or add vendor"
                      maxLength={40}
                      style={{
                        ...fieldStyle(
                          (isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled,
                          !!vendorSearch,
                          false
                        ),
                        borderColor: formErrors.vendor
                          ? "var(--status-red-primary)"
                          : isVendorFieldFocused
                            ? "var(--feature-brand-primary)"
                            : baseInputBorderColor,
                        padding: "0 80px 0 16px",
                        background: (isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled
                          ? "var(--neutral-surface-grey-lighter)"
                          : "var(--neutral-surface-primary)",
                        cursor: (isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled
                          ? "not-allowed"
                          : "text",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "48px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        pointerEvents: "none",
                      }}
                    >
                      {vendorSearch.length}/40
                    </div>
                    <ChevronDownIcon
                      size={20}
                      color="var(--neutral-on-surface-secondary)"
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: `translateY(-50%) ${showVendorSuggestions
                            ? "rotate(180deg)"
                            : "rotate(0deg)"
                          }`,
                        transition: "transform 0.2s ease",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                  {showVendorSuggestions && !isFromWorkOrderAssignment ? (
                    <>
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 29 }}
                        onClick={() => {
                          setVendorSearch(lastConfirmedVendorName);
                          setVendorDetails(lastConfirmedVendorDetails);
                          setIsVendorLocked(lastConfirmedVendorLocked);
                          setIsVendorEditingEnabled(false);
                          setShowVendorSuggestions(false);
                          setIsVendorFieldFocused(false);
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "52px",
                          left: 0,
                          right: 0,
                          background: "var(--neutral-surface-primary)",
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "16px",
                          boxShadow: "0px 8px 20px rgba(27, 27, 27, 0.12)",
                          overflow: "hidden",
                          zIndex: 30,
                        }}
                      >
                        {vendorSuggestions.length > 0
                          ? vendorSuggestions.map((vendor, index) => (
                            <div
                              key={vendor.id}
                              onClick={() =>
                                handleSelectVendorSuggestion(vendor)
                              }
                              style={{
                                minHeight: "56px",
                                padding: "0 18px",
                                cursor: "pointer",
                                borderBottom:
                                  "1px solid var(--neutral-line-separator-1)",
                                display: "flex",
                                alignItems: "center",
                                fontSize: "var(--text-title-2)",
                                color: "var(--neutral-on-surface-primary)",
                                background: "var(--neutral-surface-primary)",
                              }}
                              onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--neutral-surface-grey-lighter)")
                              }
                              onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "var(--neutral-surface-primary)")
                              }
                            >
                              {vendor.name}
                            </div>
                          ))
                          : null}
                        {!vendorHasExactMatch && vendorSearch.trim() ? (
                          <div
                            onClick={handleAddNewVendorOption}
                            style={{
                              minHeight: "48px",
                              padding: "0 18px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: "var(--text-title-2)",
                              color: "var(--feature-brand-primary)",
                              cursor: "pointer",
                              background: "var(--neutral-surface-primary)",
                            }}
                            onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--feature-brand-container-lighter)")
                            }
                            onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "var(--neutral-surface-primary)")
                            }
                          >
                            + Add "{vendorSearch.trim()}" as new vendor
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  {formErrors.vendor ? (
                    <span
                      style={{
                        marginTop: "2px",
                        display: "block",
                        fontSize: "var(--text-body)",
                        color: "var(--status-red-primary)",
                      }}
                    >
                      {formErrors.vendor}
                    </span>
                  ) : null}
                </div>
              </div>

              <div style={rowWrapStyle}>
                {fieldLabelCol("Phone Number")}
                <PhoneInputField
                  value={vendorDetails.phone}
                  onChange={(nextValue) =>
                    setVendorDetails({ ...vendorDetails, phone: nextValue })
                  }
                  disabled={((isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled) || isVendorLocked}
                />
              </div>

              <div style={rowWrapStyle}>
                {fieldLabelCol("Email")}
                <InputField
                  value={vendorDetails.email}
                  onChange={(e) =>
                    setVendorDetails({
                      ...vendorDetails,
                      email: e.target.value,
                    })
                  }
                  disabled={((isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled) || isVendorLocked}
                  placeholder="Input email"
                />
              </div>

              <div style={rowWrapStyle}>
                {fieldLabelCol("Address")}
                <InputField
                  multiline
                  value={vendorDetails.address}
                  maxLength={400}
                  showCounter
                  onChange={(e) =>
                    setVendorDetails({
                      ...vendorDetails,
                      address: e.target.value,
                    })
                  }
                  disabled={((isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled) || isVendorLocked}
                  placeholder="Input vendor address"
                />
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader("Purchase Order Information")}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Purchase Order Date",
                  "The date when this purchase order is created.",
                  true
                )}
                <div>
                  <InputField
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    error={formErrors.poDate}
                    disabled={isReviseMode}
                  />
                </div>
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Expected Delivery Date",
                  "Estimated receiving date from the vendor."
                )}
                <InputField
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  disabled={isReviseMode}
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Currency",
                  "Used for all prices in this purchase order.",
                  true
                )}
                <div>
                  <DropdownSelect
                    value={currency}
                    onChange={(nextValue) => setCurrency(nextValue)}
                    hasError={!!formErrors.currency}
                    options={[
                      { value: "IDR", label: "IDR - Indonesian Rupiah" },
                      { value: "USD", label: "USD - US Dollar" },
                    ]}
                    disabled={isReviseMode}
                  />
                  {formErrors.currency ? (
                    <span
                      style={{
                        marginTop: "2px",
                        display: "block",
                        fontSize: "var(--text-body)",
                        color: "var(--status-red-primary)",
                      }}
                    >
                      {formErrors.currency}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader(
              "Recipient Information",
              <Button
                variant="tertiary"
                size="small"
                onClick={handleUseCompanyDetail}
              >
                Use Company Detail
              </Button>
            )}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Recipient Name",
                  "The recipient name for this delivery."
                )}
                <InputField
                  value={shipToInfo.name}
                  maxLength={40}
                  showCounter
                  onChange={(e) =>
                    setShipToInfo({ ...shipToInfo, name: e.target.value })
                  }
                  placeholder="Input recipient name"
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol("Phone Number")}
                <PhoneInputField
                  value={shipToInfo.phone}
                  onChange={(nextValue) =>
                    setShipToInfo({ ...shipToInfo, phone: nextValue })
                  }
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol("Email")}
                <InputField
                  value={shipToInfo.email}
                  onChange={(e) =>
                    setShipToInfo({ ...shipToInfo, email: e.target.value })
                  }
                  placeholder="Input email"
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Address",
                  "The destination address for the order."
                )}
                <InputField
                  multiline
                  maxLength={400}
                  showCounter
                  value={shipToInfo.address}
                  onChange={(e) =>
                    setShipToInfo({ ...shipToInfo, address: e.target.value })
                  }
                  placeholder="Input address"
                />
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader(
              "Purchase Order Lines",
              <Button
                variant="tertiary"
                size="small"
                leftIcon={AddIcon}
                onClick={openAddProductModal}
                disabled={isReviseMode}
              >
                Add PO Line
              </Button>
            )}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  border: "none",
                  borderRadius: "0",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <div style={{ overflowX: lines.length > 0 ? "auto" : "hidden", width: "100%" }}>
                  <div
                    style={{
                      minWidth: lines.length > 0 ? "1466px" : "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {lines.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "84px 112px minmax(220px, 1.5fr) minmax(180px, 1fr) minmax(220px, 1.4fr) 110px 160px 200px 180px",
                          gap: "0",
                          width: "100%",
                          minWidth: "1466px",
                          height: "49px",
                          alignItems: "center",
                          background: "var(--neutral-surface-primary)",
                          borderBottom:
                            "1px solid var(--neutral-line-separator-1)",
                          fontSize: "var(--text-title-3)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                        }}
                      >
                        <span style={{ paddingLeft: "16px" }}>Type</span>
                        <span>Image</span>
                        <span>Name</span>
                        <span>SKU</span>
                        <span style={{ paddingRight: "24px" }}>Description</span>
                        <span style={{ textAlign: "left" }}>Qty</span>
                        <span style={{ textAlign: "right" }}>Unit Price</span>
                        <span style={{ textAlign: "right" }}>Subtotal</span>
                        <span style={{ textAlign: "right", paddingRight: "16px" }}>Action</span>
                      </div>
                    )}

                      {lines.length > 0 ? (
                      [...lines].sort((a, b) => {
                        const typeWeight = { wo: 1, material: 2, manual: 3 };
                        const aType = typeWeight[a.type] || 99;
                        const bType = typeWeight[b.type] || 99;
                        if (aType !== bType) return aType - bType;

                        const aRef = a.woRef && a.woRef !== "-" ? a.woRef : "";
                        const bRef = b.woRef && b.woRef !== "-" ? b.woRef : "";
                        if (aRef < bRef) return -1;
                        if (aRef > bRef) return 1;
                        return 0;
                      }).map((line, idx) => {
                        const isLockedWorkOrderLine =
                          !!line.lockedFromWorkOrder;
                        const lineSubtotal =
                          (parseFloat(line.qty) || 0) *
                          (parseFloat(line.price) || 0);
                        const quantityLabel =
                          line.type === "material" && line.uom
                            ? `${formatNumberWithCommas(line.qty) || 0} ${line.uom}`
                            : `${formatNumberWithCommas(line.qty) || 0}`;
                        return (
                          <div
                            key={line.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "84px 112px minmax(220px, 1.5fr) minmax(180px, 1fr) minmax(220px, 1.4fr) 110px 160px 200px 180px",
                              gap: "0",
                              width: "100%",
                              minWidth: "1466px",
                              minHeight: "64px",
                              alignItems: "center",
                              borderBottom:
                                idx === lines.length - 1
                                  ? "none"
                                  : "1px solid var(--neutral-line-separator-1)",
                              background: "var(--neutral-surface-primary)",
                            }}
                          >
                            <div style={{ paddingLeft: "16px" }}>
                              <StatusBadge
                                variant={
                                  line.type === "wo"
                                    ? "blue-light"
                                    : line.type === "material"
                                      ? "yellow-light"
                                      : "grey-light"
                                }
                              >
                                {line.type === "wo"
                                  ? "WO"
                                  : line.type === "material"
                                    ? "Material"
                                    : "Manual"}
                              </StatusBadge>
                            </div>
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                style={{
                                  width: "56px",
                                  height: "56px",
                                  borderRadius: "12px",
                                  background:
                                    "var(--neutral-surface-grey-lighter)",
                                  border:
                                    "1px solid var(--neutral-line-separator-1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  overflow: "hidden",
                                }}
                              >
                                {line.image && getImageUploadPreviewUrl(line.image) ? (
                                  <img
                                    src={getImageUploadPreviewUrl(line.image)}
                                    alt={line.item}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <ImageAssetIcon
                                    size={20}
                                    color="var(--neutral-on-surface-tertiary)"
                                  />
                                )}
                              </div>
                            </div>
                            <div style={{ minWidth: 0, padding: "12px 0" }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                  wordBreak: "break-word"
                                }}
                              >
                                {line.item}
                              </span>
                            </div>
                            <div style={{ minWidth: 0, padding: "12px 0" }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-secondary)",
                                  wordBreak: "break-word"
                                }}
                              >
                                {line.code}
                              </span>
                            </div>
                            <div style={{ minWidth: 0, padding: "12px 0", paddingRight: "24px" }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-secondary)",
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap"
                                }}
                              >
                                {line.desc || "-"}
                              </span>
                            </div>
                            <span
                              style={{
                                textAlign: "left",
                                fontSize: "var(--text-title-3)",
                                color: "var(--neutral-on-surface-primary)",
                              }}
                              title={quantityLabel}
                            >
                              {quantityLabel}
                            </span>
                            <span
                              style={{
                                textAlign: "right",
                                fontSize: "var(--text-title-3)",
                                color: "var(--neutral-on-surface-primary)",
                              }}
                            >
                              {formatCurrency(line.price, currency)}
                            </span>
                            <span
                              style={{
                                textAlign: "right",
                                fontSize: "var(--text-title-3)",
                                fontWeight: "var(--font-weight-bold)",
                                color: "var(--neutral-on-surface-primary)",
                              }}
                            >
                              {formatCurrency(lineSubtotal, currency)}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                                paddingRight: "16px",
                              }}
                            >
                              <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => handleEditLine(line)}
                                disabled={isReviseMode && line.type === "wo"}
                                style={{ 
                                  color: (isReviseMode && line.type === "wo") 
                                    ? "var(--neutral-on-surface-tertiary)" 
                                    : "var(--feature-brand-primary)", 
                                  padding: "0 4px" 
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => handleRemoveLine(line)}
                                disabled={isLockedWorkOrderLine || (isReviseMode && line.type === "wo")}
                                style={{ 
                                  color: (isLockedWorkOrderLine || (isReviseMode && line.type === "wo")) 
                                    ? "var(--neutral-on-surface-tertiary)" 
                                    : "var(--status-red-primary)",
                                  padding: "0 4px"
                                }}
                              >
                                Delete
                              </Button>
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
                        }}
                      >
                        No purchase order lines added yet. Click “Add PO Line” to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {formErrors.lines ? (
                <span
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--status-red-primary)",
                  }}
                >
                  {formErrors.lines}
                </span>
              ) : null}
            </div>
          </div>

          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              border: "1px solid var(--neutral-line-separator-1)",
              overflow: "hidden",
            }}
          >
            {sectionHeader(
              "Summary",
              <ChevronDownIcon
                size={20}
                color="var(--neutral-on-surface-primary)"
                style={{ transform: "rotate(180deg)" }}
              />
            )}

            <div
              style={{
                padding: "20px 20px 24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span style={summaryMetricLabelStyle}>Subtotal</span>
                <span style={summaryMetricValueStyle}>
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span style={summaryMetricLabelStyle}>Tax</span>
                  <div style={{ width: "170px", flexShrink: 0 }}>
                    <InputGroup
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      placeholder="11"
                      suffix="%"
                      containerStyle={{ width: "100%" }}
                    />
                  </div>
                </div>
                <span style={summaryMetricValueStyle}>
                  {formatCurrency(taxAmount, currency)}
                </span>
              </div>

              <div className="flex flex-col gap-md">
                {feeLines.map((fee) => (
                  <div
                    key={fee.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 320px 32px",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <InputField
                      placeholder="Fee Name"
                      value={fee.name}
                      maxLength={40}
                      showCounter
                      onChange={(e) =>
                        handleFeeChange(
                          fee.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <InputGroup
                      type="number"
                      value={fee.amount}
                      onChange={(e) =>
                        handleFeeChange(fee.id, "amount", e.target.value)
                      }
                      placeholder="Enter amount"
                      prefix={currencyPrefixLabel}
                      inputStyle={{ textAlign: "right" }}
                      containerStyle={{ width: "100%" }}
                      style={{ width: "100%" }}
                    />
                    {feeLines.length === 1 ? (
                      <IconButton
                        icon={DeleteIcon}
                        size="small"
                        disabled
                        color="var(--status-red-primary)"
                        style={{ justifySelf: "end" }}
                        aria-label="Remove Fee"
                      />
                    ) : (
                      <Tooltip content="Remove Fee">
                        <IconButton
                          icon={DeleteIcon}
                          size="small"
                          onClick={() => handleRemoveFeeLine(fee.id)}
                          color="var(--status-red-primary)"
                          hoverBackground="#FAE6E8"
                          style={{ justifySelf: "end" }}
                          aria-label="Remove Fee"
                        />
                      </Tooltip>
                    )}
                  </div>
                ))}

                {feeLines.length < 5 && (
                  <Button
                    variant="tertiary"
                    size="small"
                    leftIcon={AddIcon}
                    onClick={handleAddFeeLine}
                    style={{ alignSelf: "flex-start", padding: 0 }}
                  >
                    Add Fee
                  </Button>
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--neutral-line-separator-1)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span style={summaryTotalLabelStyle}>Total</span>
                <span style={summaryTotalValueStyle}>
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader("Notes & Terms")}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol("Notes", "Additional notes for the vendor.")}
                <InputField
                  multiline
                  value={notes}
                  maxLength={1000}
                  showCounter
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Input notes"
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Terms",
                  "Terms and conditions related to this order."
                )}
                <InputField
                  multiline
                  value={terms}
                  maxLength={5000}
                  showCounter
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Input terms"
                />
              </div>
            </div>
          </div>
        </div>
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
        <Button
          size="medium"
          variant="tertiary"
          onClick={handleBackNavigation}
          style={{ color: "var(--status-red-primary)" }}
        >
          Cancel
        </Button>
        <div className="flex gap-sm">
          {!isReviseMode && (
            <Button size="medium" variant="outlined" onClick={handleSaveDraft}>
              {isEditMode ? "Save Changes" : "Save as Draft"}
            </Button>
          )}
          <Button size="medium" variant="filled" onClick={handleSubmitClick}>
            Submit PO
          </Button>
        </div>
      </div>

      {showDeleteConfirmationModal ? (
        <GeneralModal
          isOpen={showDeleteConfirmationModal}
          onClose={() => {
            setShowDeleteConfirmationModal(false);
            setLineToDelete(null);
            setDeleteConfirmationInvoiceIds("");
          }}
          title="Delete Item?"
          description={`This item is linked to invoice ${deleteConfirmationInvoiceIds}. Are you sure you want to delete it?`}
          size="small"
          centeredHeader={true}
          footer={
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              <Button
                variant="danger-filled"
                size="large"
                style={{ width: "100%" }}
                onClick={() => {
                  setLines((prev) =>
                    prev.filter((l) => l.id !== lineToDelete.id || l.lockedFromWorkOrder)
                  );
                  setShowDeleteConfirmationModal(false);
                  setLineToDelete(null);
                  setDeleteConfirmationInvoiceIds("");
                }}
              >
                Delete Item
              </Button>
              <Button
                variant="outlined"
                size="large"
                style={{ width: "100%" }}
                onClick={() => {
                  setShowDeleteConfirmationModal(false);
                  setLineToDelete(null);
                  setDeleteConfirmationInvoiceIds("");
                }}
              >
                Cancel
              </Button>
            </div>
          }
        />
      ) : null}

      {showAddProductModal ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "800px",
              maxWidth: "100vw",
              height: "100%",
              background: "var(--neutral-surface-primary)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.08)",
              animation: "slideInRight 0.3s ease-out forwards",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                background: "var(--neutral-surface-primary)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                {editingLineId
                  ? "Edit Purchase Order Line"
                  : "Add Purchase Order Line"}
              </h2>
              <IconButton
                icon={CloseIcon}
                size="small"
                onClick={() => setShowAddProductModal(false)}
                color="var(--neutral-on-surface-secondary)"
              />
            </div>

            <div
              id="drawer-scroll-body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                overflowY: "auto",
                padding: "24px",
                minHeight: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      color: "var(--status-red-primary)",
                      fontSize: "var(--text-title-3)",
                    }}
                  >
                    *
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-regular)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Purchase Order Line Type
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "16px",
                  }}
                >
                  {[
                    {
                      key: "manual",
                      title: "Manual",
                      desc: "Add a product line manually by filling in the product details.",
                    },
                    {
                      key: "material",
                      title: "Material",
                      desc: "Select a material and adjust the editable fields as needed.",
                    },
                    {
                      key: "wo",
                      title: "Work Order",
                      desc: "Use an available work order line and adjust the editable fields as needed.",
                    },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        if (!isEditingLockedWorkOrderLine) {
                          setProductLineType(option.key);
                          setProductModalForm({
                            manualName: "",
                            manualCode: "",
                            manualDesc: "",
                            manualQty: "",
                            manualPrice: "",
                            selectedWorkOrderLineId: "",
                            selectedMaterialLineId: "",
                          });
                          setProductModalImages([]);
                          setProductModalFieldErrors({});
                          setProductModalError("");
                        }
                      }}
                      disabled={isEditingLockedWorkOrderLine || isReviseMode}
                      style={{
                        border:
                          productLineType === option.key
                            ? "2px solid var(--feature-brand-primary)"
                            : (isReviseMode || isEditingLockedWorkOrderLine)
                              ? "1px solid var(--neutral-line-outline)"
                              : "1px solid var(--neutral-line-separator-2)",
                        borderRadius: "24px",
                        background:
                          productLineType === option.key
                            ? "var(--feature-brand-container-lighter)"
                            : (isReviseMode || isEditingLockedWorkOrderLine)
                              ? "var(--neutral-surface-grey-lighter)"
                              : "var(--neutral-surface-primary)",
                        padding: "22px 24px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        cursor: (isEditingLockedWorkOrderLine || isReviseMode)
                          ? "not-allowed"
                          : "pointer",
                        textAlign: "left",
                        opacity: ((isReviseMode || isEditingLockedWorkOrderLine) && productLineType !== option.key) ? 0.6 : 1,
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border:
                            productLineType === option.key
                              ? "2px solid var(--feature-brand-primary)"
                              : "2px solid var(--neutral-line-separator-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                          opacity: ((isReviseMode || isEditingLockedWorkOrderLine) && productLineType !== option.key) ? 0.5 : 1,
                        }}
                      >
                        {productLineType === option.key ? (
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: "var(--feature-brand-primary)",
                            }}
                          />
                        ) : null}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "var(--font-weight-bold)",
                            color: ((isReviseMode || isEditingLockedWorkOrderLine) && productLineType !== option.key)
                              ? "var(--neutral-on-surface-tertiary)"
                              : "var(--neutral-on-surface-primary)",
                          }}
                        >
                          {option.title}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            color: ((isReviseMode || isEditingLockedWorkOrderLine) && productLineType !== option.key)
                              ? "var(--neutral-on-surface-tertiary)"
                              : "var(--neutral-on-surface-secondary)",
                            lineHeight: "1.5",
                          }}
                        >
                          {option.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {productLineType === "manual" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    {renderProductImageUploader(isReviseMode)}
                  </div>
                  <div id="modal-field-manualName" style={{ gridColumn: "1 / -1" }}>
                    <InputField
                      label="Name"
                      required
                      value={productModalForm.manualName}
                      maxLength={100}
                      headerRight={`${String(productModalForm.manualName || "").length}/100`}
                      onChange={(e) => {
                        setProductModalForm({
                          ...productModalForm,
                          manualName: e.target.value,
                        });
                        if (productModalFieldErrors.manualName)
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            manualName: "",
                          }));
                      }}
                      placeholder="Enter name"
                      error={!!productModalFieldErrors.manualName}
                      disabled={isReviseMode}
                    />
                    {productModalFieldErrors.manualName ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.manualName}
                      </span>
                    ) : null}
                  </div>
                  <InputField
                    label="SKU / Code"
                    value={productModalForm.manualCode}
                    onChange={(e) =>
                      setProductModalForm({
                        ...productModalForm,
                        manualCode: e.target.value,
                      })
                    }
                    placeholder="Enter code"
                    disabled={isReviseMode}
                  />
                  <div id="modal-field-manualQty">
                    <InputField
                      label="Quantity"
                      required
                      type="number"
                      value={productModalForm.manualQty}
                      onChange={(e) => {
                        setProductModalForm({
                          ...productModalForm,
                          manualQty: e.target.value,
                        });
                        if (productModalFieldErrors.manualQty)
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            manualQty: "",
                          }));
                      }}
                      placeholder="Enter quantity"
                      error={!!productModalFieldErrors.manualQty}
                    />
                    {productModalFieldErrors.manualQty ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.manualQty}
                      </span>
                    ) : null}
                  </div>
                  <div
                    id="modal-field-manualPrice"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "var(--text-body)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span>Unit Price</span>
                    </div>
                    <InputGroup
                      type="number"
                      value={productModalForm.manualPrice}
                      onChange={(e) => {
                        setProductModalForm({
                          ...productModalForm,
                          manualPrice: e.target.value,
                        });
                        if (productModalFieldErrors.manualPrice)
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            manualPrice: "",
                          }));
                      }}
                      placeholder="Enter unit price"
                      prefix={currencyPrefixLabel}
                      error={!!productModalFieldErrors.manualPrice}
                      disabled={isReviseMode}
                    />
                    {productModalFieldErrors.manualPrice ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.manualPrice}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <InputField
                      label="Description"
                      multiline
                      value={productModalForm.manualDesc}
                      maxLength={1000}
                      headerRight={`${String(productModalForm.manualDesc || "").length}/1000`}
                      onChange={(e) =>
                        setProductModalForm({
                          ...productModalForm,
                          manualDesc: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                      disabled={isReviseMode}
                    />
                  </div>
                </div>
              ) : productLineType === "material" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    id="modal-field-selectedMaterialLineId"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "var(--text-body)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span>Material</span>
                    </div>
                    <DropdownSelect
                      value={productModalForm.selectedMaterialLineId}
                      hasError={!!productModalFieldErrors.selectedMaterialLineId}
                      onChange={(selectedId) => {
                        const targetLine = availableMaterialLines.find(
                          (line) => line.id === selectedId
                        );
                        setProductModalForm({
                          ...productModalForm,
                          selectedMaterialLineId: selectedId,
                          manualName: targetLine?.item || "",
                          manualCode: targetLine?.code || "",
                          manualDesc: targetLine?.desc || "",
                          manualQty: "",
                              manualPrice: (() => {
                            if (!selectedVendorRecord) return "";
                            const vp = selectedVendorRecord?.vendorPrices?.find(
                              (vpr) => vpr.materialCode === targetLine?.code
                            );
                            return vp ? String(vp.latestPrice) : "";
                          })(),
                        });
                        setProductModalImages(
                          targetLine?.image
                            ? [createImageUploadRecord(targetLine.image)]
                            : []
                        );
                        if (
                          productModalFieldErrors.selectedMaterialLineId ||
                          productModalFieldErrors.manualPrice
                        ) {
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            selectedMaterialLineId: "",
                            manualPrice: "",
                          }));
                        }
                      }}
                      searchable
                      searchPlaceholder="Search material..."
                      placeholder="Select material"
                      showDivider
                      disabled={isReviseMode}
                      options={availableMaterialLines.map((line) => ({
                        value: line.id,
                        label: line.item,
                        code: line.code
                      }))}
                      renderOption={(option) => (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{option.label}</span>
                          <span style={{ color: "var(--neutral-on-surface-tertiary)", flexShrink: 0 }}>·</span>
                          <span style={{ color: "var(--neutral-on-surface-tertiary)", flexShrink: 0, fontStyle: "italic" }}>{option.code}</span>
                        </div>
                      )}
                    />
                    {productModalFieldErrors.selectedMaterialLineId ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.selectedMaterialLineId}
                      </span>
                    ) : null}
                  </div>
                  {availableMaterialLines.length === 0 ? (
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      No materials available.
                    </span>
                  ) : null}
                  {productModalForm.selectedMaterialLineId ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <div style={{ gridColumn: "1 / -1" }}>
                        {renderProductImageUploader(
                          isReviseMode
                        )}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Name"
                          value={productModalForm.manualName}
                          maxLength={100}
                          showCounter
                          disabled
                        />
                      </div>
                      <InputField
                        label="SKU / Code"
                        value={productModalForm.manualCode}
                        disabled
                      />
                      <div id="modal-field-manualQty">
                        <InputGroup
                          label="Quantity"
                          required
                          type="number"
                          value={productModalForm.manualQty}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualQty: e.target.value,
                            });
                            if (productModalFieldErrors.manualQty)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualQty: "",
                              }));
                          }}
                          placeholder="Enter quantity"
                          suffix={selectedMaterialLine?.uom || ""}
                          hasError={!!productModalFieldErrors.manualQty}
                        />
                        {productModalFieldErrors.manualQty ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualQty}
                          </span>
                        ) : null}
                      </div>
                      <div id="modal-field-manualPrice"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "var(--text-body)",
                          }}
                        >
                          <span style={{ color: "var(--status-red-primary)" }}>
                            *
                          </span>
                          <span>Unit Price</span>
                        </div>
                        <InputGroup
                          type="number"
                          value={productModalForm.manualPrice}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualPrice: e.target.value,
                            });
                            if (productModalFieldErrors.manualPrice)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualPrice: "",
                              }));
                          }}
                          placeholder="Enter unit price"
                          prefix={currencyPrefixLabel}
                          hasError={!!productModalFieldErrors.manualPrice}
                          disabled={isReviseMode}
                        />
                        {productModalFieldErrors.manualPrice ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualPrice}
                          </span>
                        ) : null}
                        {selectedVendorRecord && productModalForm.selectedMaterialLineId ? (() => {
                          const selMat = availableMaterialLines.find(l => l.id === productModalForm.selectedMaterialLineId);
                          const vp = selectedVendorRecord.vendorPrices?.find(vpr => vpr.materialCode === selMat?.code);
                          return (
                            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                              {selectedVendorRecord.name}'s latest price for this material: {vp ? formatCurrency(vp.latestPrice, currency) : "-"}
                            </span>
                          );
                        })() : null}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Description"
                          multiline
                          value={productModalForm.manualDesc}
                          maxLength={1000}
                          showCounter
                          onChange={(e) =>
                            setProductModalForm({
                              ...productModalForm,
                              manualDesc: e.target.value,
                            })
                          }
                          placeholder="Enter description"
                          disabled={isReviseMode}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    id="modal-field-selectedWorkOrderLineId"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "var(--text-body)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span>Work Order</span>
                    </div>
                    {(() => {
                      const selectedWoIds = lines
                        .filter((l) => l.type === "wo" && l.id !== editingLineId)
                        .map((l) => l.sourceWorkOrderLineId);
                      const filteredWoOptions = availableWorkOrderLines.filter(
                        (line) => !selectedWoIds.includes(getWorkOrderSourceId(line))
                      );

                      return (
                        <DropdownSelect
                          value={productModalForm.selectedWorkOrderLineId}
                          disabled={isEditingLockedWorkOrderLine}
                          hasError={!!productModalFieldErrors.selectedWorkOrderLineId}
                          onChange={(selectedId) => {
                            const targetLine = availableWorkOrderLines.find(
                              (line) => getWorkOrderSourceId(line) === selectedId
                            );
                            setProductModalForm({
                              ...productModalForm,
                              selectedWorkOrderLineId: selectedId,
                              manualName: targetLine?.item || "",
                              manualCode: targetLine?.code || "",
                              manualDesc: targetLine?.outsourceSteps?.length
                                ? buildLinkedWorkOrderDescription(
                                  targetLine.woRef,
                                  targetLine.outsourceSteps,
                                  linkedRoutingStages,
                                  targetLine.assignmentId
                                )
                                : targetLine?.desc || "",
                              manualQty: targetLine ? String(targetLine.qty) : "",
                              manualPrice: "",
                            });
                            setProductModalImages(
                              targetLine?.image
                                ? [createImageUploadRecord(targetLine.image)]
                                : []
                            );
                            if (productModalFieldErrors.selectedWorkOrderLineId)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                selectedWorkOrderLineId: "",
                              }));
                          }}
                          searchable
                          searchPlaceholder="Search work order..."
                          placeholder="Select work order"
                          showDivider
                          options={filteredWoOptions.map((line) => ({
                            value: getWorkOrderSourceId(line),
                            label: line.item,
                            woRef: line.woRef,
                            assignmentId: line.assignmentId || "-",
                          }))}
                          renderValue={(option) => (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{option.label}</span>
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>·</span>
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>{option.woRef}</span>
                              {option.assignmentId && option.assignmentId !== "-" && (
                                <>
                                  <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>·</span>
                                  <span style={{ color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}>{option.assignmentId}</span>
                                </>
                              )}
                            </div>
                          )}
                          renderOption={(option) => (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                overflow: "hidden",
                              }}
                            >
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {option.label}
                              </span>
                              <span
                                style={{
                                  color: "var(--neutral-on-surface-tertiary)",
                                  flexShrink: 0,
                                }}
                              >
                                ·
                              </span>
                              <span
                                style={{
                                  color: "var(--neutral-on-surface-tertiary)",
                                  flexShrink: 0,
                                }}
                              >
                                {option.woRef}
                              </span>
                              {option.assignmentId && option.assignmentId !== "-" && (
                                <>
                                  <span
                                    style={{
                                      color: "var(--neutral-on-surface-tertiary)",
                                      flexShrink: 0,
                                    }}
                                  >
                                    ·
                                  </span>
                                  <span
                                    style={{
                                      color: "var(--neutral-on-surface-tertiary)",
                                      flexShrink: 0,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {option.assignmentId}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        />
                      );
                    })()}
                    {productModalFieldErrors.selectedWorkOrderLineId ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.selectedWorkOrderLineId}
                      </span>
                    ) : null}
                    {isEditingLockedWorkOrderLine ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--neutral-on-surface-secondary)",
                        }}
                      >
                        This item is linked to a work order and cannot be
                        changed.
                      </span>
                    ) : null}
                  </div>
                  {availableWorkOrderLines.length === 0 ? (
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      No work orders available for the selected vendor.
                    </span>
                  ) : null}
                  {productModalForm.selectedWorkOrderLineId ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <div style={{ gridColumn: "1 / -1" }}>
                        {renderProductImageUploader(false)}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Name"
                          value={productModalForm.manualName}
                          maxLength={100}
                          showCounter
                          disabled
                        />
                      </div>
                      <InputField
                        label="SKU / Code"
                        value={productModalForm.manualCode}
                        disabled
                      />
                      <div id="modal-field-manualQty">
                        <InputField
                          label="Quantity"
                          required
                          type="number"
                          value={productModalForm.manualQty}
                          disabled={productLineType === "wo"}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualQty: e.target.value,
                            });
                            if (productModalFieldErrors.manualQty)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualQty: "",
                              }));
                          }}
                          placeholder="Enter quantity"
                          hasError={!!productModalFieldErrors.manualQty}
                        />
                        {productModalFieldErrors.manualQty ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualQty}
                          </span>
                        ) : null}
                      </div>
                      <div id="modal-field-manualPrice"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "var(--text-body)",
                          }}
                        >
                          <span style={{ color: "var(--status-red-primary)" }}>
                            *
                          </span>
                          <span>Unit Price</span>
                        </div>
                        <InputGroup
                          type="number"
                          value={productModalForm.manualPrice}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualPrice: e.target.value,
                            });
                            if (productModalFieldErrors.manualPrice)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualPrice: "",
                              }));
                          }}
                          placeholder="Enter unit price"
                          prefix={currencyPrefixLabel}
                          hasError={!!productModalFieldErrors.manualPrice}
                        />
                        {productModalFieldErrors.manualPrice ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualPrice}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Description"
                          multiline
                          value={productModalForm.manualDesc}
                          maxLength={1000}
                          showCounter
                          onChange={(e) =>
                            setProductModalForm({
                              ...productModalForm,
                              manualDesc: e.target.value,
                            })
                          }
                          placeholder="Enter description"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {productModalError ? (
                <span
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--status-red-primary)",
                  }}
                >
                  {productModalError}
                </span>
              ) : null}
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "var(--neutral-surface-primary)",
                flexShrink: 0,
              }}
            >
              <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold" }}>
                Subtotal: {formatCurrency(Number(productModalForm.manualQty || 0) * Number(productModalForm.manualPrice || 0), currency)}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <Button
                  variant="outlined"
                  size="medium"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setShowAddProductModal(false);
                    setEditingLineId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  size="medium"
                  style={{ flex: 1 }}
                  onClick={handleSaveProductLine}
                >
                  {editingLineId ? "Save Changes" : "Add PO Line"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showEmptyDraftModal ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "420px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              padding: "64px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "var(--elevation-sm)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
              }}
            >
              <IconButton
                icon={CloseIcon}
                onClick={() => setShowEmptyDraftModal(false)}
                size="small"
                color="var(--neutral-on-surface-primary)"
              />
            </div>
            <h2
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Vendor Name Required
            </h2>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-secondary)",
                lineHeight: "1.6",
              }}
            >
              Fill in the vendor name before saving this purchase order as a
              draft.
            </p>
            <div style={{ marginTop: "8px" }}>
              <Button
                size="large"
                style={{ width: "100%" }}
                onClick={() => setShowEmptyDraftModal(false)}
              >
                Okay
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <GeneralModal
        isOpen={showZeroPriceWarningModal}
        onClose={() => setShowZeroPriceWarningModal(false)}
        title="Zero Unit Price Detected"
        width="420px"
        description="Some items have a unit price of 0. Please review them before submitting, or continue if this is intentional."
        descriptionStyle={{ fontSize: "14px" }}
        footer={
          <div className="flex flex-col gap-sm w-full" style={{ marginTop: "24px" }}>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowZeroPriceWarningModal(false);
                setShowSubmitConfirmModal(true);
              }}
            >
              Continue to Submit
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowZeroPriceWarningModal(false)}
            >
              Go Back to Edit
            </Button>
          </div>
        }
      />

      <GeneralModal
        isOpen={showSubmitConfirmModal}
        onClose={() => setShowSubmitConfirmModal(false)}
        title={isReviseMode ? "Confirm Revision" : "Submit PO?"}
        width={isReviseMode ? "480px" : "376px"}
        description={
          isReviseMode
            ? "Are you sure you want to revise this purchase order? Please provide a reason below."
            : poApprovalSettings?.isApprovalActive
              ? "This PO will be submitted for approval."
              : "This PO will be automatically approved upon submission."
        }
        footer={
          <>
            <Button
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                if (isReviseMode && !revisionReason.trim()) {
                  setRevisionReasonError("Field cannot be empty");
                  return;
                }
                handleConfirmSubmit();
              }}
            >
              {isReviseMode ? "Confirm Revision" : "Yes, Submit"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowSubmitConfirmModal(false)}
            >
              {isReviseMode ? "Cancel" : "Keep Editing"}
            </Button>
          </>
        }
      >
        {isReviseMode && (
          <div style={{ marginTop: "16px" }}>
            <FormField label="Reason" required error={revisionReasonError}>
              <textarea
                value={revisionReason}
                onChange={(e) => {
                  setRevisionReason(e.target.value);
                  if (e.target.value.trim()) setRevisionReasonError("");
                }}
                onFocus={(e) => focusInputFrame(e.currentTarget)}
                onBlur={(e) => blurInputFrame(e.currentTarget, false, !!revisionReasonError)}
                placeholder="Input revision reason"
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `1px solid ${revisionReasonError ? "var(--status-red-primary)" : "var(--neutral-line-outline)"}`,
                  outline: "none",
                  fontSize: "var(--text-subtitle-1)",
                  fontFamily: "Lato, sans-serif",
                  resize: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
              />
            </FormField>
          </div>
        )}
      </GeneralModal>

      <GeneralModal
        isOpen={showNoChangesModal}
        onClose={() => setShowNoChangesModal(false)}
        title="No Changes Made"
        description="Please update the purchase order before submitting the revision"
        width="376px"
        footer={
          <div className="flex flex-col gap-sm w-full">
            <Button
              variant="filled"
              size="medium"
              onClick={() => setShowNoChangesModal(false)}
              fullWidth
            >
              Okay
            </Button>
          </div>
        }
      />

      <GeneralModal
        isOpen={showDiscardChangesModal}
        onClose={() => setShowDiscardChangesModal(false)}
        title="Discard changes?"
        footer={
          <>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowDiscardChangesModal(false);
                navigateBackWithoutPrompt();
              }}
            >
              Yes, Discard
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowDiscardChangesModal(false)}
            >
              Keep Editing
            </Button>
          </>
        }
      ></GeneralModal>
      {showVendorEditConfirm && (
        <GeneralModal
          isOpen={showVendorEditConfirm}
          onClose={() => {
            setShowVendorEditConfirm(false);
            setPendingVendorAction(null);
          }}
          title="Confirm Edit Vendor"
          width="376px"
          description="Editing the vendor information will remove all linked work order lines in this purchase order. Are you sure you want to proceed?"
          footer={
            <>
              <Button
                size="large"
                style={{ width: "100%" }}
                onClick={handleConfirmVendorEdit}
              >
                Yes, Proceed
              </Button>
              <Button
                variant="outlined"
                size="large"
                style={{ width: "100%" }}
                onClick={() => {
                  setShowVendorEditConfirm(false);
                  setPendingVendorAction(null);
                }}
              >
                Cancel
              </Button>
            </>
          }
        />
      )}
      <CanceledWorkOrderBlockerModal
        isOpen={showCanceledWOBlocker}
        onClose={() => setShowCanceledWOBlocker(false)}
        canceledWOs={canceledWOsFound}
        mode="edit"
      />
    </div>
  );
};

const CanceledWorkOrderBlockerModal = ({
  isOpen,
  onClose,
  canceledWOs,
  mode = "edit",
  onEditPO,
}) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    width="520px"
    title="Canceled Work Orders Found"
    description="Some work orders in this purchase order have already been canceled."
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "var(--feature-brand-container-lighter)",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          textAlign: "left",
          marginBottom: "32px",
        }}
      >
        <div style={{ marginTop: "2px" }}>
          <Info size={20} color="var(--feature-brand-primary)" />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {canceledWOs.map((wo) => (
            <div
              key={wo}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--feature-brand-primary)",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--feature-brand-primary)",
                }}
              />
              {wo}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {mode === "detail" ? (
          <>
            <Button
              variant="filled"
              size="large"
              onClick={onEditPO}
              style={{ width: "100%", height: "56px", fontSize: "18px" }}
            >
              Edit PO
            </Button>
            <Button
              variant="outline"
              size="large"
              onClick={onClose}
              style={{ width: "100%", height: "56px", fontSize: "18px" }}
            >
              Close
            </Button>
          </>
        ) : (
          <Button
            variant="filled"
            size="large"
            onClick={onClose}
            style={{ width: "100%", height: "56px", fontSize: "18px" }}
          >
            Okay
          </Button>
        )}
      </div>
    </div>
  </GeneralModal>
);
