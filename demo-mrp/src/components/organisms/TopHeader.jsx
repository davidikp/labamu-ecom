import React, { useEffect, useRef, useState } from "react";
import {
  Button,
} from "../common/Button.jsx";
import { IconButton } from "../atoms/IconButton.jsx";
import { GeneralModal } from "../molecules/GeneralModal.jsx";
import {
  Bell,
  CheckIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
  NotificationCenterIcon,
  Settings,
} from "../icons/Icons.jsx";
import {
  DEFAULT_NOTIFICATION_CENTER_PREFERENCES,
} from "../../data/notification/notificationDefaults.js";
import {
  NOTIFICATION_CATEGORY_OPTIONS,
} from "../../data/notification/notificationOptions.js";
import { getEnabledNotificationRuleIds } from "../../utils/notification/notificationUtils.js";

const notificationPopoverChipStyle = (isActive) => ({
  height: "36px",
  padding: "0 14px",
  borderRadius: "999px",
  border: `1px solid ${
    isActive
      ? "var(--feature-brand-primary)"
      : "var(--neutral-line-separator-2)"
  }`,
  background: isActive
    ? "var(--feature-brand-container-lighter)"
    : "var(--neutral-surface-primary)",
  color: isActive
    ? "var(--feature-brand-primary)"
    : "var(--neutral-on-surface-secondary)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  cursor: "pointer",
  fontSize: "var(--text-title-3)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  whiteSpace: "nowrap",
  flexShrink: 0,
});

const NOTIFICATION_TIME_GROUP_ORDER = [
  "Today",
  "This Week",
  "Older Than Week",
];

const NotificationPreferenceCheckbox = ({
  checked = false,
  onChange,
  disabled = false,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => {
      if (!disabled) onChange?.(!checked);
    }}
    style={{
      width: "28px",
      height: "28px",
      borderRadius: "4px",
      border: `1px solid ${
        checked
          ? "var(--feature-brand-primary)"
          : "var(--neutral-line-separator-2)"
      }`,
      background: checked
        ? "var(--feature-brand-primary)"
        : "var(--neutral-surface-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      padding: 0,
    }}
  >
    {checked ? <CheckIcon size={16} color="#fff" /> : null}
  </button>
);

const TopHeader = ({
  t,
  isSidebarCollapsed,
  notificationSettings,
  notifications,
  onNotificationsChange,
  onOpenNotificationSettings,
}) => {
  const bellButtonRef = useRef(null);
  const popoverRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const quickMenuRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState("all");
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [centerPreferences, setCenterPreferences] = useState(
    DEFAULT_NOTIFICATION_CENTER_PREFERENCES
  );
  const [draftSelectedCategories, setDraftSelectedCategories] = useState(
    DEFAULT_NOTIFICATION_CENTER_PREFERENCES.selectedCategories
  );
  const [popoverPosition, setPopoverPosition] = useState({
    top: 76,
    left: 0,
  });
  const [quickMenuPosition, setQuickMenuPosition] = useState({
    top: 120,
    left: 0,
  });

  const updatePopoverPosition = () => {
    if (!bellButtonRef.current || typeof window === "undefined") return;
    const rect = bellButtonRef.current.getBoundingClientRect();
    const width = Math.min(640, window.innerWidth - 32);
    const nextLeft = Math.min(
      Math.max(16, rect.right - width),
      window.innerWidth - width - 16
    );

    setPopoverPosition({
      top: rect.bottom + 12,
      left: nextLeft,
    });
  };

  const updateQuickMenuPosition = () => {
    if (!settingsButtonRef.current || typeof window === "undefined") return;
    const rect = settingsButtonRef.current.getBoundingClientRect();
    const width = 260;
    const nextLeft = Math.min(
      Math.max(16, rect.right - width),
      window.innerWidth - width - 16
    );

    setQuickMenuPosition({
      top: rect.bottom + 8,
      left: nextLeft,
    });
  };

  useEffect(() => {
    if (!isPopoverOpen && !isQuickMenuOpen) return undefined;

    updatePopoverPosition();
    updateQuickMenuPosition();

    const handlePointerDown = (event) => {
      if (
        bellButtonRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target) ||
        settingsButtonRef.current?.contains(event.target) ||
        quickMenuRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsPopoverOpen(false);
      setIsQuickMenuOpen(false);
    };

    const handleViewportChange = () => {
      updatePopoverPosition();
      updateQuickMenuPosition();
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isPopoverOpen, isQuickMenuOpen]);

  useEffect(() => {
    setShowAllNotifications(false);
  }, [
    activeNotificationTab,
    centerPreferences.hideRead,
    centerPreferences.pushNotifications,
    centerPreferences.selectedCategories.join("|"),
  ]);

  const enabledRuleIds = getEnabledNotificationRuleIds(notificationSettings);
  const settingsFilteredNotifications = (notifications || []).filter((item) =>
    enabledRuleIds.has(item.ruleId)
  );
  const deliveryFilteredNotifications = centerPreferences.pushNotifications
    ? settingsFilteredNotifications
    : settingsFilteredNotifications.filter((item) => item.channel !== "push");
  const baseVisibleNotifications = deliveryFilteredNotifications.filter(
    (item) => !centerPreferences.hideRead || item.unread
  );
  const categoryFilteredNotifications = baseVisibleNotifications.filter(
    (item) =>
      centerPreferences.selectedCategories.includes(item.category) &&
      (activeNotificationTab === "all" || item.category === activeNotificationTab)
  );
  const visibleNotifications = showAllNotifications
    ? categoryFilteredNotifications
    : categoryFilteredNotifications.slice(0, 5);

  const unreadCount = deliveryFilteredNotifications.filter(
    (item) => item.unread
  ).length;

  const chipOptions = [
    { id: "all", label: "All" },
    ...NOTIFICATION_CATEGORY_OPTIONS.filter((option) =>
      centerPreferences.selectedCategories.includes(option.id)
    ),
  ];

  const chipCountMap = chipOptions.reduce((acc, option) => {
    acc[option.id] =
      option.id === "all"
        ? baseVisibleNotifications.length
        : baseVisibleNotifications.filter(
            (item) => item.category === option.id
          ).length;
    return acc;
  }, {});

  const groupedVisibleNotifications = NOTIFICATION_TIME_GROUP_ORDER.map(
    (timeGroup) => ({
      timeGroup,
      items: visibleNotifications.filter((item) => item.timeGroup === timeGroup),
    })
  ).filter((group) => group.items.length > 0);

  const selectedCategoryCount = centerPreferences.selectedCategories.length;
  const isAllCategorySelected =
    selectedCategoryCount === NOTIFICATION_CATEGORY_OPTIONS.length;

  const markAllAsRead = () => {
    const targetIds = new Set(deliveryFilteredNotifications.map((item) => item.id));
    onNotificationsChange?.((prev) =>
      prev.map((item) =>
        targetIds.has(item.id) ? { ...item, unread: false } : item
      )
    );
  };

  const toggleNotificationRead = (notificationId) => {
    onNotificationsChange?.((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, unread: !item.unread } : item
      )
    );
  };

  const saveFilterPreferences = () => {
    setCenterPreferences((prev) => ({
      ...prev,
      selectedCategories: [...draftSelectedCategories],
    }));
    setActiveNotificationTab("all");
    setIsFilterModalOpen(false);
  };

  const hasNotifications = categoryFilteredNotifications.length > 0;
  const footerSummary = `Showing ${visibleNotifications.length} out of ${categoryFilteredNotifications.length} notification${
    categoryFilteredNotifications.length === 1 ? "" : "s"
  }`;

  return (
    <>
      <div
        style={{
          height: "64px",
          padding: "0 24px",
          background: "var(--neutral-surface-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottom: "1px solid var(--neutral-line-separator-1)",
          position: "fixed",
          top: 0,
          left: isSidebarCollapsed ? "82px" : "286px",
          right: 0,
          zIndex: 40,
          transition: "left 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ position: "relative", display: "inline-flex" }}>
            <IconButton
              ref={bellButtonRef}
              icon={Bell}
              size="small"
              title="Notifications"
              color="var(--neutral-on-surface-primary)"
              onClick={() => {
                setIsQuickMenuOpen(false);
                setIsPopoverOpen((prev) => !prev);
              }}
              style={{ position: "relative" }}
            />
            {unreadCount > 0 ? (
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-6px",
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 6px",
                  borderRadius: "999px",
                  background: "var(--status-red-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "var(--font-weight-bold)",
                  border: "2px solid var(--neutral-surface-primary)",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              >
                {unreadCount}
              </div>
            ) : null}
          </div>
          <div
            ref={settingsButtonRef}
            onClick={() => {
              setIsPopoverOpen(false);
              setIsQuickMenuOpen((prev) => !prev);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Natasha Smith
              </span>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                {t("role.owner")}
              </span>
            </div>
            <ChevronDownIcon
              size={16}
              color="var(--neutral-on-surface-tertiary)"
            />
          </div>
        </div>
      </div>

      {isPopoverOpen ? (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
            width: "640px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "80vh",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "20px",
            boxShadow: "0px 16px 40px rgba(17, 24, 39, 0.18)",
            zIndex: 120,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 28px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
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
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Notification
                </span>
                {unreadCount > 0 ? (
                  <div
                    style={{
                      minWidth: "32px",
                      height: "32px",
                      padding: "0 10px",
                      borderRadius: "10px",
                      background: "#D6001C",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {unreadCount}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All as Read
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftSelectedCategories([
                      ...centerPreferences.selectedCategories,
                    ]);
                    setIsFilterModalOpen(true);
                  }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "12px",
                    border: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Settings size={16} color="var(--neutral-on-surface-secondary)" />
                </button>
              </div>
            </div>

            <div
              className="no-scrollbar"
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "nowrap",
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: "2px",
                whiteSpace: "nowrap",
              }}
            >
              {chipOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveNotificationTab(option.id)}
                  style={notificationPopoverChipStyle(
                    activeNotificationTab === option.id
                  )}
                >
                  <span>{option.label}</span>
                  <span
                    style={{
                      fontSize: "inherit",
                      fontWeight: "inherit",
                      color: "inherit",
                    }}
                  >
                    {chipCountMap[option.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: "1 1 auto",
              padding: "0 28px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              minHeight: 0,
            }}
          >
            {hasNotifications ? (
              groupedVisibleNotifications.map((group) => (
                <div
                  key={group.timeGroup}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      paddingTop: group.timeGroup === "Today" ? "12px" : 0,
                    }}
                  >
                    {group.timeGroup}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderTop: "1px solid var(--neutral-line-separator-1)",
                    }}
                  >
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleNotificationRead(item.id)}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background =
                            "var(--neutral-surface-grey-lighter)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = "transparent";
                        }}
                      style={{
                        width: "100%",
                        border: "none",
                        borderBottom:
                          "1px solid var(--neutral-line-separator-1)",
                        background: "transparent",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "16px 0",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      >
                        <NotificationCenterIcon
                          kind={item.category}
                          unread={item.unread}
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              lineHeight: "20px",
                              fontWeight: item.unread
                                ? "var(--font-weight-bold)"
                                : "var(--font-weight-regular)",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {item.headline}
                          </span>
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--neutral-on-surface-secondary)",
                              lineHeight: "1.4",
                            }}
                          >
                            {item.detail}
                          </span>
                          <span
                            style={{
                              fontSize: "var(--text-desc)",
                              color: "var(--neutral-on-surface-tertiary)",
                              lineHeight: "1.35",
                            }}
                          >
                            {item.meta}
                          </span>
                        </div>
                        <div
                          style={{
                            paddingTop: "6px",
                            color: "var(--neutral-on-surface-tertiary)",
                            flexShrink: 0,
                          }}
                        >
                          <MoreVerticalIcon size={18} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "40px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  No new notifications
                </span>
                <span
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  You're all caught up.
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              padding: "18px 28px 24px",
              borderTop: "1px solid var(--neutral-line-separator-1)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {hasNotifications ? (
              <>
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-secondary)",
                    textAlign: "center",
                  }}
                >
                  {footerSummary}
                </span>
                <Button
                  variant="outlined"
                  size="large"
                  style={{ width: "100%" }}
                  onClick={() => setShowAllNotifications((prev) => !prev)}
                >
                  {showAllNotifications ? "Show Less" : "View All Notifications"}
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                size="large"
                style={{ width: "100%" }}
                onClick={() => {
                  setIsPopoverOpen(false);
                  onOpenNotificationSettings?.();
                }}
              >
                Notification Settings
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {isQuickMenuOpen ? (
        <div
          ref={quickMenuRef}
          style={{
            position: "fixed",
            top: `${quickMenuPosition.top}px`,
            left: `${quickMenuPosition.left}px`,
            width: "260px",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "20px",
            boxShadow: "0px 16px 40px rgba(17, 24, 39, 0.16)",
            zIndex: 120,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Natasha Smith
            </span>
            <span
              style={{
                fontSize: "var(--text-body)",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              {t("role.owner")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsQuickMenuOpen(false);
              onOpenNotificationSettings?.();
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--neutral-surface-grey-lighter)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            style={{
              width: "100%",
              padding: "14px 20px",
              border: "none",
              background: "transparent",
              textAlign: "left",
              fontSize: "var(--text-title-3)",
              color: "var(--neutral-on-surface-primary)",
              cursor: "pointer",
            }}
          >
            Notification Settings
          </button>
        </div>
      ) : null}

      <GeneralModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Notification Filters"
        width="420px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => setIsFilterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={saveFilterPreferences}
            >
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <button
            type="button"
            onClick={() =>
              setCenterPreferences((prev) => ({
                ...prev,
                hideRead: !prev.hideRead,
              }))
            }
            style={{
              border: "1px solid var(--neutral-line-separator-1)",
              borderRadius: "16px",
              padding: "14px 16px",
              background: "var(--neutral-surface-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Hide All Read
            </span>
            <div style={{ pointerEvents: "none" }}>
              <NotificationPreferenceCheckbox
                checked={centerPreferences.hideRead}
              />
            </div>
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Filter Preferences
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {NOTIFICATION_CATEGORY_OPTIONS.map((option) => {
                const isSelected = draftSelectedCategories.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setDraftSelectedCategories((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== option.id)
                          : [...prev, option.id]
                      )
                    }
                    style={{
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "14px",
                      padding: "12px 14px",
                      background: "var(--neutral-surface-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {option.label}
                    </span>
                    <div style={{ pointerEvents: "none" }}>
                      <NotificationPreferenceCheckbox checked={isSelected} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GeneralModal>
    </>
  );
};

export { TopHeader };
