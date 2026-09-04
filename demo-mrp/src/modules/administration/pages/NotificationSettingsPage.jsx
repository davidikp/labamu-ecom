import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import {
  Bell,
  FileText,
  Info,
  LayoutGrid,
  Settings,
} from "../../../components/icons/Icons.jsx";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  cloneNotificationSettings,
} from "../../../data/notification/notificationDefaults.js";
import { NOTIFICATION_DELIVERY_OPTIONS } from "../../../data/notification/notificationOptions.js";
import { getEnabledNotificationRuleIds } from "../../../utils/notification/notificationUtils.js";

const notificationChannelTabStyle = (isActive) => ({
  height: "40px",
  padding: "0 18px",
  borderRadius: "999px",
  border: `1px solid ${
    isActive
      ? "var(--feature-brand-primary)"
      : "var(--neutral-line-separator-1)"
  }`,
  background: isActive
    ? "var(--feature-brand-container-lighter)"
    : "var(--neutral-surface-primary)",
  color: isActive
    ? "var(--feature-brand-primary)"
    : "var(--neutral-on-surface-secondary)",
  fontSize: "var(--text-title-3)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
});

const notificationSummaryCardStyle = {
  minHeight: "96px",
  padding: "18px 20px",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  boxSizing: "border-box",
};

const NotificationSettingsPage = ({
  isSidebarCollapsed, // preserved for API compatibility with the shell
  notificationSettings,
  onSaveNotificationSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannel, setActiveChannel] = useState("all");
  const [settings, setSettings] = useState(() =>
    cloneNotificationSettings(
      notificationSettings || DEFAULT_NOTIFICATION_SETTINGS
    )
  );
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);

  useEffect(() => {
    setSettings(
      cloneNotificationSettings(
        notificationSettings || DEFAULT_NOTIFICATION_SETTINGS
      )
    );
  }, [notificationSettings]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    []
  );

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  const updateNotificationItem = (sectionId, itemId, patch) => {
    setSettings((prev) =>
      prev.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item
              ),
            }
      )
    );
  };

  const restoreDefaults = () => {
    setSettings(cloneNotificationSettings());
    showToast("Notification settings restored");
  };

  const handleSave = () => {
    onSaveNotificationSettings?.(cloneNotificationSettings(settings));
    showToast("Notification settings saved");
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const channelOptions = [
    { id: "all", label: "All Channels" },
    ...settings.map((section) => ({
      id: section.id,
      label: section.title,
    })),
  ];

  const filteredSections = settings
    .filter((section) => activeChannel === "all" || section.id === activeChannel)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!normalizedSearch) return true;
        return `${item.title} ${item.description} ${item.module} ${item.delivery}`
          .toLowerCase()
          .includes(normalizedSearch);
      }),
    }))
    .filter((section) => section.items.length > 0);

  const allItems = settings.flatMap((section) =>
    section.items.map((item) => ({ ...item, channelId: section.id }))
  );
  const enabledRuleCount = allItems.filter((item) => item.enabled).length;
  const criticalAlertCount = allItems.filter((item) =>
    ["Only Critical", "Only High Priority"].includes(item.delivery)
  ).length;
  const digestRuleCount = allItems.filter((item) =>
    item.delivery.includes("Digest")
  ).length;
  const liveAlertCount =
    settings.find((section) => section.id === "realtime")?.items.filter(
      (item) => item.enabled
    ).length || 0;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "24px",
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "var(--text-large-title)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Notification Settings
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: "760px",
              fontSize: "var(--text-title-3)",
              lineHeight: "22px",
              color: "var(--neutral-on-surface-secondary)",
            }}
          >
            Operational approvals and execution alerts across procurement,
            manufacturing, sales, and administration.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Button variant="outlined" size="small" onClick={restoreDefaults}>
            Restore Defaults
          </Button>
          <Button variant="filled" size="small" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {[
          {
            title: "Active Rules",
            value: `${enabledRuleCount}/${allItems.length}`,
            hint: "Enabled notification automations",
            Icon: Bell,
          },
          {
            title: "Critical Alerts",
            value: criticalAlertCount,
            hint: "Escalation-focused rules",
            Icon: Info,
          },
          {
            title: "Digest Rules",
            value: digestRuleCount,
            hint: "Hourly or daily summary delivery",
            Icon: FileText,
          },
          {
            title: "Live Alerts",
            value: liveAlertCount,
            hint: "Real-time toasts, sound, and badges",
            Icon: LayoutGrid,
          },
        ].map(({ title, value, hint, Icon }) => (
          <div key={title} style={notificationSummaryCardStyle}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "var(--feature-brand-container-lighter)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={20} color="var(--feature-brand-primary)" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                {title}
              </span>
              <span
                style={{
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                {hint}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "var(--neutral-surface-primary)",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {channelOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveChannel(option.id)}
                  style={notificationChannelTabStyle(
                    activeChannel === option.id
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <TableSearchField
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notification, module, or rule"
              width="360px"
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px 0 0",
            overflow: "visible",
          }}
        >
          {filteredSections.length === 0 ? (
            <div
              style={{
                padding: "56px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                No notification rules found.
              </span>
              <span
                style={{
                  maxWidth: "420px",
                  textAlign: "center",
                  fontSize: "var(--text-title-3)",
                  lineHeight: "22px",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                Adjust the search or channel filter to see more notification
                configurations.
              </span>
            </div>
          ) : (
            filteredSections.map((section, sectionIndex) => (
              <div
                key={section.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px minmax(0, 1fr)",
                  gap: "24px",
                  padding: "24px 24px 28px",
                  borderTop:
                    sectionIndex === 0
                      ? "none"
                      : "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "var(--text-headline)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {section.title}
                    </h2>
                    <StatusBadge variant="blue-light">
                      {section.items.length} Rules
                    </StatusBadge>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-3)",
                      lineHeight: "22px",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {section.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  {section.items.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 1fr) 220px",
                        gap: "16px",
                        alignItems: "center",
                        padding: "18px 20px",
                        borderTop:
                          index === 0
                            ? "none"
                            : "1px solid var(--neutral-line-separator-1)",
                        background: item.enabled
                          ? "var(--neutral-surface-primary)"
                          : "#FCFCFC",
                      }}
                    >
                      <ToggleSwitch
                        checked={item.enabled}
                        onChange={(checked) =>
                          updateNotificationItem(section.id, item.id, {
                            enabled: checked,
                          })
                        }
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-title-2)",
                              fontWeight: "var(--font-weight-bold)",
                              minWidth: 0,
                            }}
                          >
                            {item.title}
                          </span>
                          <StatusBadge variant="grey-light">
                            {item.module}
                          </StatusBadge>
                        </div>
                        <span
                          style={{
                            fontSize: "var(--text-title-3)",
                            lineHeight: "22px",
                            color: "var(--neutral-on-surface-secondary)",
                          }}
                        >
                          {item.description}
                        </span>
                      </div>
                      <DropdownSelect
                        value={item.delivery}
                        onChange={(nextValue) =>
                          updateNotificationItem(section.id, item.id, {
                            delivery: nextValue,
                          })
                        }
                        options={NOTIFICATION_DELIVERY_OPTIONS}
                        fieldHeight="42px"
                        borderRadius="12px"
                        fontSize="var(--text-title-3)"
                        optionFontSize="var(--text-title-3)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export { NotificationSettingsPage };
