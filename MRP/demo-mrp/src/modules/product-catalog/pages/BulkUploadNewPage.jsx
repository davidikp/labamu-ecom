import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, CheckIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { UploadStep, analyzeFile } from "../components/upload-steps/UploadStep.jsx";
import { MappingStep } from "../components/upload-steps/MappingStep.jsx";
import { ReviewStep } from "../components/upload-steps/ReviewStep.jsx";
import { addBulkUpload, updateBulkUpload, getBulkUpload, SYSTEM_ACTOR_NAME } from "../mock/bulkUploadsStore.js";
import { addProducts } from "../mock/productsMocks.js";
import {
  autoMatchHeaders,
  buildNormalizationResult,
  downloadProductTemplateCsv,
  REQUIRED_PRODUCT_FIELD_KEYS,
  NOT_MAPPED,
  isRowInvalid,
  withDefaultStatus,
  findDuplicateRowFields,
} from "../mock/productFieldsConfig.js";
import { BackgroundProcessingScreen } from "../components/BackgroundProcessingScreen.jsx";
import { CancelUploadConfirmModal } from "../components/CancelUploadConfirmModal.jsx";
import { DiscardChangesConfirmModal } from "../components/DiscardChangesConfirmModal.jsx";
import { InvalidDataConfirmModal } from "../components/InvalidDataConfirmModal.jsx";
import { NoDataToImportConfirmModal } from "../components/NoDataToImportConfirmModal.jsx";
import { InputDataConfirmModal } from "../components/InputDataConfirmModal.jsx";
import { SkipNormalizationConfirmModal } from "../components/SkipNormalizationConfirmModal.jsx";
import { UseTemplateSuggestionModal } from "../components/UseTemplateSuggestionModal.jsx";
import { AnalyzingFileBlockerModal } from "../components/AnalyzingFileBlockerModal.jsx";
import { setNavigationGuard, clearNavigationGuard } from "../../../utils/navigationGuard.js";

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "mapping", label: "Mapping" },
  { key: "review", label: "Review" },
];

const Stepper = ({ currentKey }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentKey);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-bold)",
                  background: isDone ? "var(--status-green-primary)" : isActive ? "var(--feature-brand-primary)" : "var(--neutral-surface-grey-lighter)",
                  color: isDone || isActive ? "#fff" : "var(--neutral-on-surface-tertiary)",
                }}
              >
                {isDone ? <CheckIcon size={14} color="#fff" /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                  color: isActive ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)",
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{ width: "40px", height: "1px", margin: "0 8px", background: isDone ? "var(--status-green-primary)" : "var(--neutral-line-separator-2)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const BulkUploadNewPage = ({ onNavigate, showSnackbar, initialData, isSidebarCollapsed }) => {
  const resumeDraftId = initialData?.resumeDraftId || null;
  const resumeRecord = resumeDraftId ? getBulkUpload(resumeDraftId) : null;
  const resumeAtMapping = resumeRecord?.status === "Mapping";
  const resumeAtNormalizing = resumeRecord?.status === "Normalizing Data";

  const [step, setStep] = useState(
    resumeRecord ? (resumeAtMapping ? "mapping" : resumeAtNormalizing ? "mapping-processing" : "review") : "upload"
  );
  const [fileName, setFileName] = useState(resumeRecord?.fileName || "");
  const [parsedHeaders, setParsedHeaders] = useState(resumeRecord?.sourceHeaders || []);
  const [parsedRows, setParsedRows] = useState(resumeRecord?.rawRows || []);
  const [normalizedRows, setNormalizedRows] = useState(withDefaultStatus(resumeRecord?.rows));
  // Result of the last save's duplicate SKU/Name scan ({ [rowId]: { sku, name } }).
  // Seeded from the resumed draft's own rows so reopening a saved draft shows
  // duplicates immediately, without requiring another save first. Cleared on
  // every row edit — stale until the next save.
  const [duplicates, setDuplicates] = useState(() => findDuplicateRowFields(resumeRecord?.rows));
  const handleReviewRowsChange = (nextRows) => {
    setNormalizedRows(nextRows);
    setDuplicates({});
  };
  const [fieldMapping, setFieldMapping] = useState(resumeRecord?.fieldMapping || {});
  const [sourceHeaders, setSourceHeaders] = useState(resumeRecord?.sourceHeaders || []);
  const [editingDraftId, setEditingDraftId] = useState(resumeRecord?.id || null);
  const [processingRecordId, setProcessingRecordId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [mapping, setMapping] = useState(() =>
    resumeAtMapping ? autoMatchHeaders(resumeRecord?.sourceHeaders || []) : {}
  );
  // Fixed snapshot of what the AI matched at analysis time — doesn't change
  // if the user later overrides a Source Column selection.
  const [recommendation, setRecommendation] = useState(() =>
    resumeAtMapping ? autoMatchHeaders(resumeRecord?.sourceHeaders || []) : {}
  );
  // Snapshots captured whenever the Mapping/Review step is (re)entered — used
  // to detect whether the user has actually changed anything on that step,
  // so the "Discard changes?" confirm only shows up when there's something
  // to lose.
  const [mappingSnapshot, setMappingSnapshot] = useState(() =>
    resumeAtMapping ? JSON.stringify(autoMatchHeaders(resumeRecord?.sourceHeaders || [])) : "{}"
  );
  const [rowsSnapshot, setRowsSnapshot] = useState(() => JSON.stringify(withDefaultStatus(resumeRecord?.rows)));
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showInvalidConfirm, setShowInvalidConfirm] = useState(false);
  const [showNoDataConfirm, setShowNoDataConfirm] = useState(false);
  const [showInputDataConfirm, setShowInputDataConfirm] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showTemplateSuggestion, setShowTemplateSuggestion] = useState(false);
  // "error" (analysis itself failed) vs "empty" (file read fine but had no
  // rows) — drives which copy/buttons UseTemplateSuggestionModal shows.
  const [templateSuggestionVariant, setTemplateSuggestionVariant] = useState("empty");
  const [showAnalyzingBlocker, setShowAnalyzingBlocker] = useState(false);
  const [normalizationStats, setNormalizationStats] = useState(() => {
    if (!resumeRecord || resumeRecord.status !== "Review") return null;
    // Fall back to "fully normalized" for records that already have saved
    // rows but no recorded stats (e.g. older/seeded drafts) so the counter
    // banner is always present on the Review step, not just right after a
    // live normalization run.
    const total = resumeRecord.normalizationTotal ?? resumeRecord.rows?.length ?? 0;
    return {
      total,
      normalized: resumeRecord.normalizationNormalized ?? resumeRecord.rows?.length ?? 0,
      skipped: resumeRecord.normalizationSkipped ?? 0,
    };
  });

  const missingRequired = REQUIRED_PRODUCT_FIELD_KEYS.filter(
    (key) => !mapping[key] || mapping[key] === NOT_MAPPED
  );

  const isStepDirty =
    step === "mapping"
      ? JSON.stringify(mapping) !== mappingSnapshot
      : step === "review"
      ? JSON.stringify(normalizedRows) !== rowsSnapshot
      : false;

  const analyzeCancelRef = useRef(null);

  // Blocks sidebar module navigation while the file is being analyzed —
  // there's no "leave anyway" here, just a modal telling the user to wait.
  const isAnalyzingRef = useRef(false);
  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);
  useEffect(() => {
    const guard = (proceed) => {
      if (!isAnalyzingRef.current) return true;
      setShowAnalyzingBlocker(true);
      return false;
    };
    setNavigationGuard(guard);
    return () => clearNavigationGuard(guard);
  }, []);

  const handleDownloadTemplate = () => downloadProductTemplateCsv();

  const handleAnalyzeClick = () => {
    if (!selectedFile) {
      setUploadError("Field cannot be empty");
      return;
    }
    setUploadError("");
    setIsAnalyzing(true);
    analyzeCancelRef.current = analyzeFile(
      selectedFile,
      (headers, rows, uploadedFileName) => {
        analyzeCancelRef.current = null;
        setIsAnalyzing(false);
        handleAnalyzed(headers, rows, uploadedFileName);
      },
      () => {
        // The selected file is left in place (not cleared) — the user
        // returns to the Upload step with it still preselected instead of
        // an empty picker.
        analyzeCancelRef.current = null;
        setIsAnalyzing(false);
        setTemplateSuggestionVariant("empty");
        showSnackbar?.("No data found in this file", "error");
        setShowTemplateSuggestion(true);
      }
    );
  };

  // Demo-only: lets the "Analyzing your file..." screen's Simulate controls
  // abandon the pending (fake) analysis and surface the failure snackbar
  // directly, since there's no real backend/network call to actually fail.
  const handleSimulateAnalyzeFailure = (type) => {
    analyzeCancelRef.current?.();
    analyzeCancelRef.current = null;
    setIsAnalyzing(false);
    if (type === "timeout") {
      setTemplateSuggestionVariant("error");
    } else {
      setTemplateSuggestionVariant("empty");
    }
    showSnackbar?.(type === "timeout" ? "Failed to analyze file" : "No data found in this file", "error");
    setShowTemplateSuggestion(true);
  };

  const handleAnalyzed = (headers, rows, uploadedFileName) => {
    const effectiveFileName = uploadedFileName || fileName || "untitled-upload.csv";
    if (uploadedFileName) setFileName(uploadedFileName);
    setParsedHeaders(headers);
    setParsedRows(rows);

    // "Mapping" now represents the batch while the user is actively on the
    // Mapping step (not a background job) — persist it as soon as analysis
    // finishes so it shows up in the Bulk Upload list even before the user
    // finishes mapping columns.
    const payload = {
      fileName: effectiveFileName,
      totalProducts: rows.length,
      status: "Mapping",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: effectiveFileName,
      rawRows: rows,
      sourceHeaders: headers,
      fieldMapping: {},
    };

    const record = editingDraftId
      ? updateBulkUpload(editingDraftId, payload)
      : addBulkUpload(payload);

    setEditingDraftId(record.id);

    const matched = autoMatchHeaders(headers);
    setMapping(matched);
    setRecommendation(matched);
    setMappingSnapshot(JSON.stringify(matched));
    setStep("mapping");
  };

  // The pending normalization's inputs (record id / rows / mapping) live in
  // a ref, not React state, so the "Skip Process" control and a resumed
  // "Normalizing Data" visit can both act on the exact same in-flight job
  // without depending on component state timing.
  const pendingNormalizationRef = useRef(null);
  const normalizeTimeoutRef = useRef(null);

  // `forceSkip` builds the "some rows left un-normalized" result (used by
  // the manual Skip Process action); otherwise a natural pass runs with the
  // small random chance of an interrupted-AI skip that already existed.
  // `advanceLocalStep` controls whether *this open page* jumps to the Review
  // step right away — true for a direct user action (Skip Process), false
  // for the background timer completing on its own: the store still gets
  // updated (so the batch is genuinely done), but the visible screen doesn't
  // auto-navigate out from under the user — they need to come back to it
  // (e.g. via the Bulk Upload list) to see the result.
  const finishNormalization = (recordId, rowsToNormalize, mappingUsed, { forceSkip = false, advanceLocalStep = true } = {}) => {
    let skipCount;
    if (forceSkip) {
      skipCount = Math.max(1, Math.round(rowsToNormalize.length * (0.3 + Math.random() * 0.4)));
    } else {
      const skipRoll = Math.random();
      skipCount = Math.min(rowsToNormalize.length, skipRoll < 0.15 ? 2 : skipRoll < 0.45 ? 1 : 0);
    }

    const { rows: finalRows, stats } = buildNormalizationResult(rowsToNormalize, mappingUsed, skipCount);

    updateBulkUpload(recordId, {
      status: "Review",
      rows: finalRows,
      totalProducts: finalRows.length,
      normalizationTotal: stats.total,
      normalizationNormalized: stats.normalized,
      normalizationSkipped: stats.skipped,
      // A natural completion is the background timer firing on its own —
      // the user may well have navigated away by then — so it's logged as a
      // System action. "Skip Process" is a direct user click, so that stays
      // attributed to whoever's logged in (the default actor) and gets its
      // own distinct log title instead of "Normalization finished".
      logActorName: forceSkip ? undefined : SYSTEM_ACTOR_NAME,
      logTitle: forceSkip ? "Normalization Skipped" : undefined,
      logDesc: forceSkip
        ? "AI normalization was skipped by the user — remaining rows need attention."
        : undefined,
    });

    if (advanceLocalStep) {
      setNormalizationStats(stats);
      setNormalizedRows(finalRows);
      setRowsSnapshot(JSON.stringify(finalRows));
      setFieldMapping(mappingUsed);
      setStep("review");
    }
    pendingNormalizationRef.current = null;
    normalizeTimeoutRef.current = null;
  };

  const startNormalizationTimer = (recordId, rowsToNormalize, mappingUsed) => {
    pendingNormalizationRef.current = { recordId, rows: rowsToNormalize, mapping: mappingUsed };
    normalizeTimeoutRef.current = setTimeout(() => {
      finishNormalization(recordId, rowsToNormalize, mappingUsed, { forceSkip: false, advanceLocalStep: false });
    }, 5000);
  };

  const handleSkipProcess = () => {
    const pending = pendingNormalizationRef.current;
    if (!pending) return;
    clearTimeout(normalizeTimeoutRef.current);
    finishNormalization(pending.recordId, pending.rows, pending.mapping, { forceSkip: true, advanceLocalStep: true });
    setShowSkipConfirm(false);
  };

  const handleNormalizeAndReview = () => {
    if (missingRequired.length > 0) return;
    const effectiveMapping = mapping;
    const effectiveHeaders = parsedHeaders;
    setFieldMapping(effectiveMapping);
    setSourceHeaders(effectiveHeaders);

    // Flip the same record (already persisted with status "Mapping" once the
    // Mapping step was reached) to "Normalizing Data" and show the shared
    // background-processing interstitial. After the simulated delay the
    // normalized rows are built and the record flips to "Review".
    const payload = {
      fileName: fileName || "untitled-upload.csv",
      totalProducts: parsedRows.length,
      status: "Normalizing Data",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: fileName || "untitled-upload.csv",
      rawRows: parsedRows,
      fieldMapping: effectiveMapping,
      sourceHeaders: effectiveHeaders,
    };

    const record = editingDraftId
      ? updateBulkUpload(editingDraftId, payload)
      : addBulkUpload(payload);

    setEditingDraftId(record.id);
    setStep("mapping-processing");
    startNormalizationTimer(record.id, parsedRows, effectiveMapping);
  };

  // Resuming a draft that's still "Normalizing Data" (e.g. clicked from the
  // Bulk Upload list) restarts the simulated countdown from scratch — there's
  // no real backend tracking actual elapsed progress to resume from.
  //
  // Deliberately no cleanup here: normalizeTimeoutRef is shared with
  // handleNormalizeAndReview's own call to startNormalizationTimer, so a
  // blanket clearTimeout-on-unmount would cancel that pending job the moment
  // the user navigates away — defeating the "you can leave this page, we'll
  // notify you by email" promise shown on the interstitial. The timer is
  // meant to keep running via the module-level store regardless of whether
  // this page is mounted, exactly like the Processing→Completed timer in
  // handleStartUpload below.
  useEffect(() => {
    if (resumeAtNormalizing && resumeRecord) {
      startNormalizationTimer(resumeRecord.id, resumeRecord.rawRows || [], resumeRecord.fieldMapping || {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelUpload = (reason) => {
    if (editingDraftId) {
      updateBulkUpload(editingDraftId, { status: "Cancelled", logDesc: reason });
    }
    showSnackbar?.("Upload cancelled", "info");
    onNavigate("product_catalog_bulk-upload-list");
  };

  // Writes the current Review rows to the draft record (creating it on
  // first save) without deciding what happens afterward.
  const persistDraftRows = () => {
    const payload = {
      fileName: fileName || "untitled-upload.csv",
      totalProducts: normalizedRows.length,
      status: "Review",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: fileName || "untitled-upload.csv",
      rows: normalizedRows,
      fieldMapping,
      sourceHeaders,
    };

    if (editingDraftId) {
      updateBulkUpload(editingDraftId, payload);
    } else {
      const record = addBulkUpload(payload);
      setEditingDraftId(record.id);
    }
    setDuplicates(findDuplicateRowFields(normalizedRows));
  };

  const handleSaveDraft = () => {
    persistDraftRows();
    showSnackbar?.("Upload saved as draft", "success");
    onNavigate("product_catalog_bulk-upload-list");
  };


  const handleStartUpload = () => {
    const validRows = normalizedRows.filter((r) => !isRowInvalid(r));
    const invalidRows = normalizedRows.filter(isRowInvalid);

    const payload = {
      fileName: fileName || "untitled-upload.csv",
      totalProducts: normalizedRows.length,
      status: "Processing",
      successCount: 0,
      failedCount: 0,
      sourceDocumentName: fileName || "untitled-upload.csv",
      rows: normalizedRows,
      fieldMapping,
      sourceHeaders,
    };

    const record = editingDraftId
      ? updateBulkUpload(editingDraftId, payload)
      : addBulkUpload(payload);

    setProcessingRecordId(record.id);
    setStep("processing");

    // The completion timer lives independently of this page/component — it
    // keeps running via the module-level store even after the user navigates
    // away using the interstitial's "Back to list" button. Notifying is
    // handled separately by BulkUploadNotifier, which watches the store for
    // status transitions regardless of which page is mounted. Invalid rows
    // (if the user chose "Continue Anyway") are skipped from the catalog and
    // reported back as failed items in the batch detail.
    setTimeout(() => {
      updateBulkUpload(record.id, {
        status: "Completed",
        successCount: validRows.length,
        failedCount: invalidRows.length,
        failedRows: invalidRows,
        // Always a background completion — there's no user-driven "instant
        // complete" path for the import step (unlike normalization's Skip
        // Process), so this is always System.
        logActorName: SYSTEM_ACTOR_NAME,
      });
      addProducts(validRows);
    }, 5000);
  };

  const handleInputDataClick = () => {
    if (normalizedRows.length === 0) {
      setShowNoDataConfirm(true);
    } else if (normalizedRows.some(isRowInvalid)) {
      setShowInvalidConfirm(true);
    } else {
      setShowInputDataConfirm(true);
    }
  };

  return (
    <div style={{ height: "calc(100vh - 64px)", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", paddingBottom: (step === "upload" || step === "mapping" || step === "review") ? "96px" : "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              marginLeft: "-4px",
              opacity: isAnalyzing ? 0.5 : 1,
            }}
            onClick={() => {
              if (isAnalyzing) return;
              if (step === "mapping" || step === "review") {
                if (isStepDirty) {
                  setShowDiscardConfirm(true);
                } else {
                  onNavigate("product_catalog_bulk-upload-list");
                }
              } else {
                onNavigate("product_catalog_bulk-upload-list");
              }
            }}
          >
            <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Add New Upload
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={() => onNavigate("product_catalog_list")}
            >
              Product Catalog
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
              onClick={() => onNavigate("product_catalog_bulk-upload-list")}
            >
              Bulk Upload
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Add New Upload</span>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <Stepper currentKey={step === "mapping-processing" ? "mapping" : step === "processing" ? "review" : step} />
        {fileName && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", minWidth: 0 }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
                maxWidth: "260px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fileName}
            </span>
            {editingDraftId && (
              <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>{editingDraftId}</span>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          ...(step === "mapping" || step === "review" ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}),
        }}
      >
        {step === "upload" && (
          <UploadStep
            selectedFile={selectedFile}
            onFileSelected={(file) => {
              setSelectedFile(file);
              if (file) setUploadError("");
            }}
            isAnalyzing={isAnalyzing}
            error={uploadError}
            onSimulateAnalyzeFailure={handleSimulateAnalyzeFailure}
            onDownloadTemplate={handleDownloadTemplate}
          />
        )}
        {step === "mapping" && (
          <MappingStep
            headers={parsedHeaders}
            rows={parsedRows}
            mapping={mapping}
            recommendation={recommendation}
            onMappingChange={(key, val) => setMapping((prev) => ({ ...prev, [key]: val }))}
            missingRequired={missingRequired}
          />
        )}
        {step === "review" && (
          <ReviewStep
            rows={normalizedRows}
            onRowsChange={handleReviewRowsChange}
            normalizationStats={normalizationStats}
            duplicates={duplicates}
          />
        )}
        {step === "mapping-processing" && (
          <BackgroundProcessingScreen
            title="Your file is being normalized"
            message="AI is normalizing and validating your data to prepare it for review. You can leave this page and we’ll email you when it’s ready."
            buttonLabel="Back to Bulk Upload"
            onBackToList={() => onNavigate("product_catalog_bulk-upload-list")}
            secondaryActionLabel="Skip Process"
            onSecondaryAction={() => setShowSkipConfirm(true)}
          />
        )}
        {step === "processing" && (
          <BackgroundProcessingScreen
            title="Your products are being imported"
            message={`We’re adding the reviewed data from “${fileName || "your file"}” to your product catalog. You can leave this page and we’ll notify you by email when it’s ready.`}
            buttonLabel="Back to Bulk Upload"
            onBackToList={() => onNavigate("product_catalog_bulk-upload-list")}
          />
        )}
      </div>

      {(step === "upload" || step === "mapping" || step === "review") && (
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
            justifyContent: step === "upload" ? "flex-end" : "space-between",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          {step === "upload" && (
            <Button variant="filled" size="large" disabled={isAnalyzing} onClick={handleAnalyzeClick}>
              {isAnalyzing ? "Analyzing..." : "Analyze File"}
            </Button>
          )}
          {step === "mapping" && (
            <>
              <Button size="large" variant="tertiary" onClick={() => setShowCancelConfirm(true)} style={{ color: "var(--status-red-primary)" }}>
                Cancel
              </Button>
              <Button variant="filled" size="large" disabled={missingRequired.length > 0} onClick={handleNormalizeAndReview}>
                Normalize and Review
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              <Button size="large" variant="tertiary" onClick={() => setShowCancelConfirm(true)} style={{ color: "var(--status-red-primary)" }}>
                Cancel
              </Button>
              <div style={{ display: "flex", gap: "12px" }}>
                <Button variant="outlined" size="large" onClick={handleSaveDraft}>Save as Draft</Button>
                <Button variant="filled" size="large" onClick={handleInputDataClick}>
                  Import Data
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <CancelUploadConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelUpload}
      />

      <DiscardChangesConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => onNavigate("product_catalog_bulk-upload-list")}
      />

      <AnalyzingFileBlockerModal
        isOpen={showAnalyzingBlocker}
        onClose={() => setShowAnalyzingBlocker(false)}
      />

      <InvalidDataConfirmModal
        isOpen={showInvalidConfirm}
        onClose={() => setShowInvalidConfirm(false)}
        onContinue={handleStartUpload}
        invalidCount={normalizedRows.filter(isRowInvalid).length}
      />

      <NoDataToImportConfirmModal
        isOpen={showNoDataConfirm}
        onClose={() => setShowNoDataConfirm(false)}
      />

      <InputDataConfirmModal
        isOpen={showInputDataConfirm}
        onClose={() => setShowInputDataConfirm(false)}
        onConfirm={handleStartUpload}
        productCount={normalizedRows.length}
      />

      <SkipNormalizationConfirmModal
        isOpen={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        onConfirm={handleSkipProcess}
      />

      <UseTemplateSuggestionModal
        isOpen={showTemplateSuggestion}
        onClose={() => setShowTemplateSuggestion(false)}
        onDownloadTemplate={handleDownloadTemplate}
        variant={templateSuggestionVariant}
      />
    </div>
  );
};
