import React, { useRef, useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";

const radioCardStyle = (checked) => ({
  flex: 1,
  minWidth: "220px",
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "16px",
  borderRadius: "12px",
  border: checked
    ? "1.5px solid var(--feature-brand-primary)"
    : "1px solid var(--neutral-line-separator-1)",
  background: checked
    ? "var(--feature-brand-surface, rgba(59,89,255,0.06))"
    : "var(--neutral-surface-primary)",
  cursor: "pointer",
  textAlign: "left",
});

const RadioDot = ({ checked }) => (
  <span
    style={{
      marginTop: "2px",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      border: checked
        ? "2px solid var(--feature-brand-primary)"
        : "2px solid var(--neutral-line-separator-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: "var(--neutral-surface-primary)",
    }}
  >
    {checked ? (
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "var(--feature-brand-primary)",
        }}
      />
    ) : null}
  </span>
);

const RadioOptionCard = ({ option, checked, onSelect, disabled }) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onSelect(option.value)}
    style={{
      ...radioCardStyle(checked),
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit",
    }}
  >
    <RadioDot checked={checked} />
    <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span
        style={{
          fontSize: "14px",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--neutral-on-surface-primary)",
        }}
      >
        {option.label}
      </span>
      <span
        style={{
          fontSize: "14px",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {option.description}
      </span>
    </span>
  </button>
);

const SettingsSectionCard = ({ title, children }) => (
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
        padding: "16px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "4px",
            height: "24px",
            borderRadius: "0 4px 4px 0",
            background: "var(--feature-brand-primary)",
          }}
        />
        <span
          style={{
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ paddingRight: "16px" }}>
        <ChevronDownIcon size={20} color="var(--neutral-on-surface-secondary)" />
      </div>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px 24px 24px 24px",
      }}
    >
      {children}
    </div>
  </div>
);

const ISSUE_METHOD_OPTIONS = [
  {
    value: "automatic_deduction",
    label: "Automatic Deduction",
    description: "Automatically allocate needed materials and auto-deduct the stock.",
  },
  {
    value: "request_based",
    label: "Request-Based Issuing",
    description: "Users are required to request the needed materials, either partially or fully.",
  },
];

export const WorkOrderSettingsPage = ({
  onNavigate,
  isSidebarCollapsed,
  woSettings,
  onSaveSettings,
}) => {
  const [issueMethod, setIssueMethod] = useState(
    woSettings?.issueMethod || "request_based"
  );
  const [actualCogsEnabled, setActualCogsEnabled] = useState(
    (woSettings?.actualCogsMode || "disabled") === "enabled"
  );
  const [showToast, setShowToast] = useState(false);
  const [showDiscardChangesModal, setShowDiscardChangesModal] = useState(false);

  const initialSnapshotRef = useRef(
    JSON.stringify({
      issueMethod: woSettings?.issueMethod || "request_based",
      actualCogsEnabled: (woSettings?.actualCogsMode || "disabled") === "enabled",
    })
  );

  const isSettingsDirty =
    initialSnapshotRef.current !==
    JSON.stringify({ issueMethod, actualCogsEnabled });

  const handleBackNavigation = () => {
    if (isSettingsDirty) {
      setShowDiscardChangesModal(true);
    } else {
      onNavigate("list");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        position: "relative",
      }}
    >
      {showToast ? (
        <div
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            minWidth: "320px",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 9999,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "var(--text-body)", lineHeight: "1.5" }}>
              Work order settings successfully saved
            </span>
          </div>
          <button
            type="button"
            data-no-localize
            translate="no"
            style={{
              border: "none",
              background: "transparent",
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-body)",
              fontFamily: "inherit",
              lineHeight: "1.5",
              color: "var(--status-green-on-primary)",
              padding: 0,
            }}
            onClick={() => setShowToast(false)}
          >
            Okay
          </button>
        </div>
      ) : null}

      <div
        style={{
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: "100px",
          background: "#F5F5F7",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Settings
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
              onClick={handleBackNavigation}
            >
              Work Orders
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Settings</span>
          </div>
        </div>

        <SettingsSectionCard title="Material Issue Method">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: "0 0 260px",
                minWidth: "220px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-2)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Issue Method
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                Choose what method you want to use for every Work Order.
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                flex: "1 1 480px",
              }}
            >
              {ISSUE_METHOD_OPTIONS.map((option) => (
                <RadioOptionCard
                  key={option.value}
                  option={option}
                  checked={issueMethod === option.value}
                  onSelect={setIssueMethod}
                />
              ))}
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Actual COGS Configuration">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span
                style={{
                  fontSize: "var(--text-title-2)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Require Actual COGS Review
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                Require an authorized user to review and confirm Actual COGS
                before the Work Order can be completed.
              </span>
            </div>
            <ToggleSwitch
              checked={actualCogsEnabled}
              onChange={(next) => setActualCogsEnabled(next)}
            />
          </div>
        </SettingsSectionCard>
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
          padding: "12px 24px",
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
        <Button
          size="medium"
          variant="filled"
          onClick={() => {
            onSaveSettings?.({
              issueMethod,
              actualCogsMode: actualCogsEnabled ? "enabled" : "disabled",
            });
            setShowToast(true);
          }}
        >
          Save
        </Button>
      </div>

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
                onNavigate("list");
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
      />
    </div>
  );
};
