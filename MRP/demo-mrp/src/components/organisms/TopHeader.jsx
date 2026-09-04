import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "../icons/Icons.jsx";
import { NotificationBell } from "../notification/NotificationBell.jsx";

const TopHeader = ({
  t,
  isSidebarCollapsed,
  onOpenNotificationPreferences,
}) => {
  const settingsButtonRef = useRef(null);
  const quickMenuRef = useRef(null);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [quickMenuPosition, setQuickMenuPosition] = useState({ top: 120, left: 0 });

  const updateQuickMenuPosition = () => {
    if (!settingsButtonRef.current || typeof window === "undefined") return;
    const rect = settingsButtonRef.current.getBoundingClientRect();
    const width = 260;
    const nextLeft = Math.min(
      Math.max(16, rect.right - width),
      window.innerWidth - width - 16
    );
    setQuickMenuPosition({ top: rect.bottom + 8, left: nextLeft });
  };

  useEffect(() => {
    if (!isQuickMenuOpen) return undefined;
    updateQuickMenuPosition();
    const handlePointerDown = (event) => {
      if (
        settingsButtonRef.current?.contains(event.target) ||
        quickMenuRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsQuickMenuOpen(false);
    };
    const handleViewportChange = () => updateQuickMenuPosition();
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isQuickMenuOpen]);

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
          <NotificationBell />
          <div
            ref={settingsButtonRef}
            onClick={() => setIsQuickMenuOpen((prev) => !prev)}
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span
                data-no-localize
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
            <ChevronDownIcon size={16} color="var(--neutral-on-surface-tertiary)" />
          </div>
        </div>
      </div>

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
              data-no-localize
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Natasha Smith
            </span>
            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
              {t("role.owner")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsQuickMenuOpen(false);
              onOpenNotificationPreferences?.();
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
            Notification Preferences
          </button>
        </div>
      ) : null}
    </>
  );
};

export { TopHeader };
