import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { ChipTabs } from "../../../ce-ui";
import {
  clearNavigationGuard,
  setNavigationGuard,
} from "../../../utils/navigationGuard.js";
import {
  ALL_NOTIFICATION_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_GROUPS,
  PERSONAL_PREFERENCE_OPTIONS,
  REMINDER_SUPPORTED_RULE_IDS,
  buildDefaultCompanySettings,
  buildDefaultPersonalPreferences,
  clonePersonalPreferences,
  pickLocalized,
} from "../../../data/notification/notificationDefaults.js";
import { companyStatusOf, resolveEffectiveStatus } from "../../../utils/notification/notificationUtils.js";
import { Info } from "lucide-react";

// The demo user (Owner) can access every module, so no rows are hidden. In a
// real build this set would come from the user's sub-resource permissions and
// gate visibility per PRD AC #9.
const ACCESSIBLE_PERMISSIONS = null; // null = all accessible

const cardStyle = {
  border: "1px solid var(--neutral-line-separator-1)",
  borderRadius: "12px",
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
};
// Shared label style for small uppercase meta labels (Permission, In-app, Email).
const metaLabelStyle = {
  fontSize: "12px",
  color: "var(--neutral-on-surface-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

// Darker grey for a locked (disabled + on) toggle so it reads as "on but
// locked" — matches the treatment in NotificationSettingsPage.
const LOCKED_ON_TOGGLE_CLASS = "!bg-[#9AA0A6]";
// A disabled + off toggle (channel turned off at the company level) uses its
// own darker grey so it doesn't read the same as a regular, editable off
// toggle.
const DISABLED_OFF_TOGGLE_CLASS = "!bg-[#D0D3D8]";

// Collapse grouped admin toggles (e.g. "Receipt Status Updates") into one row.
const buildDisplayUnits = (items, language) => {
  const units = [];
  const seenGroups = new Set();
  items.forEach((rule) => {
    if (!rule.groupId) {
      units.push({ kind: "rule", key: rule.id, rule, memberIds: [rule.id] });
      return;
    }
    if (seenGroups.has(rule.groupId)) return;
    seenGroups.add(rule.groupId);
    const group = NOTIFICATION_GROUPS[rule.groupId];
    const memberIds = group?.memberIds || [rule.id];
    units.push({
      kind: "group",
      key: rule.groupId,
      memberIds,
      rule: {
        id: rule.groupId,
        name: group?.label ? pickLocalized(group.label, language) : rule.name,
        description: group?.description || {
          en: "Outsourced receipt recorded and fully received updates.",
          id: "Pembaruan saat penerimaan outsource dicatat dan telah diterima sepenuhnya.",
        },
        trigger: "Outsource receipt recorded / fully received",
        type: "configurable",
        recipient: rule.recipient,
        permission: rule.permission,
        todo: null,
      },
    });
  });
  return units;
};

const canAccess = (permission) =>
  ACCESSIBLE_PERMISSIONS === null ||
  permission === null ||
  ACCESSIBLE_PERMISSIONS.includes(permission);

// Rules the company has turned fully off (both In-app and Email disabled in
// Company Notification Settings) have nothing left to configure, so they're
// hidden from personal preferences entirely.
const isEnabledByCompany = (rule, company) =>
  companyStatusOf(rule, company) === "on";

const NotificationPreferencesPage = ({
  isSidebarCollapsed, // preserved for API compatibility with the shell
  companySettings,
  personalPreferences,
  onSavePersonalPreferences,
  language = "en",
}) => {
  const company = companySettings || buildDefaultCompanySettings();

  const [activeModule, setActiveModule] = useState(
    DEFAULT_NOTIFICATION_SETTINGS[0]?.id
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [prefs, setPrefs] = useState(() =>
    clonePersonalPreferences(personalPreferences || buildDefaultPersonalPreferences())
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    clonePersonalPreferences(personalPreferences || buildDefaultPersonalPreferences())
  );
  const [toastMessage, setToastMessage] = useState("");
  // Pending navigation awaiting discard confirmation: null | {type:"cancel"} |
  // {type:"module", id} | {type:"leave", proceed}
  const [pendingAction, setPendingAction] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const next = clonePersonalPreferences(
      personalPreferences || buildDefaultPersonalPreferences()
    );
    setPrefs(next);
    setSavedSnapshot(clonePersonalPreferences(next));
  }, [personalPreferences]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 3200);
  };

  const patchRules = (ids, patch) => {
    setPrefs((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...next[id], ...patch };
      });
      return next;
    });
  };

  // Clears the personal override for every rule in the unit, reverting each
  // channel to mirror the current company default (PRD "Use Company Default").
  const resetToCompanyDefault = (unit) => {
    setPrefs((prev) => {
      const next = { ...prev };
      unit.memberIds.forEach((id) => {
        const companyEntry = company[id] || { inApp: false, email: false };
        next[id] = {
          preference: PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault,
          inApp: companyEntry.inApp,
          email: companyEntry.email,
        };
      });
      return next;
    });
  };

  const ruleById = useMemo(
    () =>
      ALL_NOTIFICATION_RULES.reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {}),
    []
  );

  const handleSave = () => {
    const saved = clonePersonalPreferences(prefs);
    setSavedSnapshot(saved);
    onSavePersonalPreferences?.(saved);
    showToast("Notification preferences saved");
  };

  const isDirty = useMemo(
    () => JSON.stringify(prefs) !== JSON.stringify(savedSnapshot),
    [prefs, savedSnapshot]
  );

  // Register a navigation guard so leaving Notification Preferences with
  // unsaved changes prompts to discard (matches Company Notification Settings).
  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
  useEffect(() => {
    const guard = (proceed) => {
      if (!isDirtyRef.current) return true;
      setPendingAction({ type: "leave", proceed });
      return false;
    };
    setNavigationGuard(guard);
    return () => clearNavigationGuard(guard);
  }, []);

  const requestCancel = () => {
    if (!isDirty) return;
    setPendingAction({ type: "cancel" });
  };

  const confirmDiscard = () => {
    const action = pendingAction;
    setPrefs(clonePersonalPreferences(savedSnapshot));
    setPendingAction(null);
    if (action?.type === "leave") {
      clearNavigationGuard();
      action.proceed?.();
      return;
    }
    if (action?.type === "module") {
      setActiveModule(action.id);
      setSearchQuery("");
    }
    showToast("Changes discarded");
  };

  const chipTabs = DEFAULT_NOTIFICATION_SETTINGS.map((section) => ({
    id: section.id,
    label: pickLocalized(section.title, language),
    count: buildDisplayUnits(
      section.items.filter(
        (item) => canAccess(item.permission) && isEnabledByCompany(item, company)
      ),
      language
    ).length,
  }));

  const activeSection = useMemo(
    () =>
      DEFAULT_NOTIFICATION_SETTINGS.find((s) => s.id === activeModule) ||
      DEFAULT_NOTIFICATION_SETTINGS[0],
    [activeModule]
  );

  // Switching module tabs with unsaved changes prompts the same discard
  // confirmation as Cancel, instead of silently carrying the draft over.
  const requestModule = (id) => {
    if (id === activeModule) return;
    if (isDirty) {
      setPendingAction({ type: "module", id });
      return;
    }
    setActiveModule(id);
    setSearchQuery("");
  };

  const renderToggle = (unit, channel) => {
    const primaryId = unit.memberIds[0];
    const rule = ruleById[primaryId] || unit.rule;
    const pref = prefs[primaryId] || { inApp: false, email: false };
    const { status } = resolveEffectiveStatus(rule, company, prefs);
    const isRequired = rule.type === "required";
    // A channel the company has switched off has nothing to override — show
    // it as a disabled toggle rather than letting the user turn it on.
    const companyAllowsChannel = isRequired || !!company[primaryId]?.[channel];
    const channelDisabled = isRequired || status !== "on" || !companyAllowsChannel;
    const checked = isRequired ? true : pref[channel];
    const toggleClassName = isRequired
      ? LOCKED_ON_TOGGLE_CLASS
      : channelDisabled && !checked
        ? DISABLED_OFF_TOGGLE_CLASS
        : "";
    return (
      <ToggleSwitch
        checked={checked}
        disabled={channelDisabled}
        className={toggleClassName}
        onChange={(next) => patchRules(unit.memberIds, { [channel]: next })}
      />
    );
  };

  // Merged In-app/Email cell: two toggles side by side with a single
  // "Set to company default" link centered between them, so it's clear the
  // reset applies to both channels at once.
  const renderTogglePair = (unit) => {
    const primaryId = unit.memberIds[0];
    const rule = ruleById[primaryId] || unit.rule;
    const isRequired = rule.type === "required";
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <span style={metaLabelStyle}>In-app</span>
            {renderToggle(unit, "inApp")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <span style={metaLabelStyle}>Email</span>
            {renderToggle(unit, "email")}
          </div>
        </div>
        {!isRequired ? (
          <Button
            variant="tertiary"
            size="small"
            onClick={() => resetToCompanyDefault(unit)}
          >
            Set to company default
          </Button>
        ) : null}
      </div>
    );
  };

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return buildDisplayUnits(
      activeSection.items.filter(
        (item) => canAccess(item.permission) && isEnabledByCompany(item, company)
      ),
      language
    )
      .filter((unit) => {
        if (!q) return true;
        const r = unit.rule;
        return `${r.name} ${pickLocalized(r.description, language)} ${r.permission || "-"}`
          .toLowerCase()
          .includes(q);
      })
      .map((unit) => ({
        id: unit.key,
        unit,
        name: unit.rule.name,
        permission: unit.rule.permission,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, searchQuery, language, company]);


  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "24px 24px 0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        overflow: "visible",
      }}
    >
      {toastMessage ? (
        <div
          style={{
            position: "sticky",
            top: "16px",
            alignSelf: "flex-end",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 10,
            minWidth: "320px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--text-title-3)" }}>{toastMessage}</span>
          <span
            style={{
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
            onClick={() => setToastMessage("")}
          >
            Okay
          </span>
        </div>
      ) : null}

      <h1
        style={{
          margin: 0,
          fontSize: "var(--text-large-title)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        Notification Preferences
      </h1>

      {/* Module chip tabs — outside the content card, wrapping instead of scrolling */}
      <ChipTabs
        tabs={chipTabs}
        activeTab={activeModule}
        onChange={requestModule}
        className="flex-wrap"
      />

      {/* Content card — one card per notification instead of a table row,
          so each item's fields (name, permission, reminder, toggles) sit
          together without needing custom table-column plumbing. */}
      <div
        className="notif-card"
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 20px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)" }}>
            {pickLocalized(activeSection.title, language)}
          </span>
          <TableSearchField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notification, description, or permission"
            width="360px"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 20px 20px" }}>
          {rows.map((row) => {
            const isRequired =
              row.unit.kind === "rule" && row.unit.rule.type === "required";
            const primaryId = row.unit.memberIds[0];
            const showsReminder = REMINDER_SUPPORTED_RULE_IDS.has(primaryId);
            const days = company[primaryId]?.remindBefore;
            return (
              <div key={row.id} style={cardStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 320px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}>
                      {row.name}
                    </span>
                    {isRequired ? (
                      <StatusBadge variant="blue-light">Required</StatusBadge>
                    ) : null}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "18px",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {pickLocalized(row.unit.rule.description, language)}
                  </span>
                  {showsReminder ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "14px",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      <Info size={14} />
                      {`Reminder: ${days} ${days === 1 ? "day" : "days"} before`}
                    </span>
                  ) : null}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "140px" }}>
                  <span style={metaLabelStyle}>Permission</span>
                  <span style={{ fontSize: "var(--text-title-3)" }}>
                    {row.permission || "-"}
                  </span>
                </div>

                {renderTogglePair(row.unit)}
              </div>
            );
          })}
          {rows.length === 0 ? (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: "var(--neutral-on-surface-secondary)",
                fontSize: "var(--text-title-3)",
              }}
            >
              No notifications match this module.
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer action bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: "auto",
          marginLeft: "-24px",
          marginRight: "-24px",
          padding: "16px 24px",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          zIndex: 5,
        }}
      >
        <Button variant="outlined" size="large" onClick={requestCancel}>
          Cancel
        </Button>
        <Button variant="filled" size="large" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Discard-changes confirmation modal (matches Company Notification Settings). */}
      <GeneralModal
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title="Discard changes?"
        description="Your changes to the notification preferences will be lost if you leave this page."
        hideFooterDivider
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "24px" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setPendingAction(null)}
            >
              Keep Editing
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={confirmDiscard}
            >
              Yes, Discard
            </Button>
          </div>
        }
      />
    </div>
  );
};

export { NotificationPreferencesPage };
