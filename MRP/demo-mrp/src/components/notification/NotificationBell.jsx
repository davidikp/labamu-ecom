import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "../atoms/IconButton.jsx";
import { Button } from "../common/Button.jsx";
import { Bell, Trash2 } from "../icons/Icons.jsx";
import { ChipTabs } from "../../ce-ui";
import { Tooltip } from "../atoms/Tooltip.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

export const timeAgo = (iso, language = "en") => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  const labels =
    language === "id"
      ? { now: "Baru saja", m: "mnt lalu", h: "jam lalu", d: "hari lalu" }
      : { now: "Just now", m: "m ago", h: "h ago", d: "d ago" };
  if (mins < 1) return labels.now;
  if (mins < 60) return `${mins}${language === "id" ? " " : ""}${labels.m}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${language === "id" ? " " : ""}${labels.h}`;
  const days = Math.floor(hrs / 24);
  return `${days}${language === "id" ? " " : ""}${labels.d}`;
};

// How many notifications are shown up front, and how many more load per
// "Load more" click.
const PAGE_SIZE = 10;

export const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    language,
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    t,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreTimerRef = useRef(null);
  const bellRef = useRef(null);
  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const [pos, setPos] = useState({ top: 72, left: 0 });

  const updatePos = () => {
    if (!bellRef.current || typeof window === "undefined") return;
    const rect = bellRef.current.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 32);
    setPos({
      top: rect.bottom + 12,
      left: Math.min(Math.max(16, rect.right - width), window.innerWidth - width - 16),
    });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePos();
    const onDown = (e) => {
      if (bellRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onMove = () => updatePos();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  // Reset back to the first page when the All/Unread tab changes. Reopening
  // the popover within the same session keeps whatever was already loaded —
  // only a fresh session (component mount) starts back at PAGE_SIZE.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setLoadingMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(
    () => () => {
      if (loadMoreTimerRef.current) window.clearTimeout(loadMoreTimerRef.current);
    },
    []
  );

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    // Simulated network delay so the skeleton state is visible in the demo.
    loadMoreTimerRef.current = window.setTimeout(() => {
      setVisibleCount((count) => count + PAGE_SIZE);
      setLoadingMore(false);
    }, 600);
  };

  const handleOpenItem = (item) => {
    markRead(item.id);
    if (item.entityRoute) navigate(item.entityRoute);
    setOpen(false);
  };

  const L = {
    en: { title: "Notification", markAll: "Mark all as read", empty: "You're all caught up.", emptyTitle: "No notifications", emptyUnreadTitle: "No unread notifications", emptyUnread: "You've read everything for now." },
    id: { title: "Notifikasi", markAll: "Tandai semua dibaca", empty: "Anda sudah selesai.", emptyTitle: "Tidak ada notifikasi", emptyUnreadTitle: "Tidak ada notifikasi belum dibaca", emptyUnread: "Anda sudah membaca semuanya." },
  }[language === "id" ? "id" : "en"];

  const allLabel = language === "id" ? "Semua" : "All";
  const unreadLabel = language === "id" ? "Belum Dibaca" : "Unread";
  const tabs = [
    { id: "all", label: allLabel, count: notifications.length },
    { id: "unread", label: unreadLabel, count: unreadCount },
  ];
  const effectiveTab = activeTab === "unread" ? "unread" : "all";
  const filteredNotifications =
    effectiveTab === "unread" ? notifications.filter((item) => item.unread) : notifications;
  // Default view shows PAGE_SIZE items; "Load more" reveals another page at
  // a time instead of rendering the whole (chip-filtered) list at once.
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);
  const hasMore = filteredNotifications.length > visibleNotifications.length;

  // Auto-load the next page once the sentinel at the bottom of the list
  // scrolls into view, instead of requiring a "Load more" click.
  useEffect(() => {
    if (!open || !hasMore || loadingMore) return undefined;
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: "48px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [open, hasMore, loadingMore, visibleCount, effectiveTab]);

  // Bucket the (chip-filtered) list by day: Today / Yesterday / This Week / Earlier.
  const dayLabels = {
    en: { today: "Today", yesterday: "Yesterday", week: "This Week", earlier: "Earlier" },
    id: { today: "Hari Ini", yesterday: "Kemarin", week: "Minggu Ini", earlier: "Sebelumnya" },
  }[language === "id" ? "id" : "en"];
  const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const todayStart = startOfDay(Date.now());
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;
  const bucketOf = (iso) => {
    const ts = new Date(iso).getTime();
    if (ts >= todayStart) return "today";
    if (ts >= yesterdayStart) return "yesterday";
    if (ts >= weekStart) return "week";
    return "earlier";
  };
  const dayBuckets = [];
  const bucketIndex = new Map();
  visibleNotifications.forEach((item) => {
    const key = bucketOf(item.createdAt);
    let b = bucketIndex.get(key);
    if (!b) {
      b = { key, label: dayLabels[key], items: [] };
      bucketIndex.set(key, b);
    }
    b.items.push(item);
  });
  const orderedBuckets = ["today", "yesterday", "week", "earlier"]
    .map((k) => bucketIndex.get(k))
    .filter(Boolean);

  // Placeholder row shown while the next page is "loading" (simulated delay).
  const renderSkeletonRow = (key) => (
    <div
      key={`skeleton-${key}`}
      style={{
        display: "flex",
        gap: "10px",
        padding: "14px 18px",
        borderBottom: "1px solid var(--neutral-line-separator-1)",
      }}
    >
      <span style={{ width: "8px", flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <span className="notif-skeleton-block" style={{ width: "70%", height: "12px" }} />
        <span className="notif-skeleton-block" style={{ width: "90%", height: "11px" }} />
      </div>
    </div>
  );

  const renderItem = (item) => (
    <div
      key={item.id}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)";
        const del = e.currentTarget.querySelector(".notif-delete-btn");
        if (del) del.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = item.unread ? "var(--feature-brand-container-lighter)" : "transparent";
        const del = e.currentTarget.querySelector(".notif-delete-btn");
        if (del) del.style.opacity = "0";
      }}
      style={{
        display: "flex",
        gap: "10px",
        padding: "14px 18px",
        borderBottom: "1px solid var(--neutral-line-separator-1)",
        background: item.unread ? "var(--feature-brand-container-lighter)" : "transparent",
        cursor: "pointer",
      }}
      onClick={() => handleOpenItem(item)}
    >
      {item.unread ? (
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--feature-brand-primary)", marginTop: "6px", flexShrink: 0 }} />
      ) : (
        <span style={{ width: "8px", flexShrink: 0 }} />
      )}
      <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "13px", fontWeight: item.unread ? 700 : 600, color: "var(--neutral-on-surface-primary)", lineHeight: 1.35 }}>
            {t(item.title)}
          </span>
          <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.4 }}>
            {t(item.body)}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
          <span data-no-localize style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)", whiteSpace: "nowrap" }}>
            {timeAgo(item.createdAt, language)}
          </span>
          <Tooltip content="Delete">
            <button
              type="button"
              className="notif-delete-btn"
              onClick={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--status-red-container-lighter, rgba(220, 38, 38, 0.1))")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "var(--status-red-primary)",
                padding: "4px",
                borderRadius: "6px",
                display: "inline-flex",
                opacity: 0,
                transition: "opacity 0.15s ease, background 0.15s ease",
              }}
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes notifSkeletonPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.8; }
        }
        .notif-skeleton-block {
          display: inline-block;
          border-radius: 4px;
          background: var(--neutral-line-separator-1);
          animation: notifSkeletonPulse 1.2s ease-in-out infinite;
        }
      `}</style>
      <div style={{ position: "relative", display: "inline-flex" }}>
        <IconButton
          ref={bellRef}
          icon={Bell}
          size="small"
          title={L.title}
          color="var(--neutral-on-surface-primary)"
          onClick={() => setOpen((p) => !p)}
        />
        {unreadCount > 0 ? (
          <div
            data-no-localize
            style={{
              position: "absolute",
              top: "-4px",
              right: "-6px",
              minWidth: "20px",
              height: "20px",
              padding: "0 6px",
              borderRadius: "999px",
              background: "var(--status-orange-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 700,
              border: "2px solid var(--neutral-surface-primary)",
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        ) : null}
      </div>

      {open ? (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            width: "420px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "78vh",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "16px",
            boxShadow: "0px 16px 40px rgba(17, 24, 39, 0.18)",
            zIndex: 120,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 20px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--neutral-on-surface-primary)" }}>
                  {L.title}
                </span>
                {unreadCount > 0 ? (
                  <span
                    data-no-localize
                    style={{
                      minWidth: "24px",
                      height: "24px",
                      padding: "0 8px",
                      borderRadius: "8px",
                      background: "var(--status-orange-primary)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </div>
              <Button variant="tertiary" size="small" onClick={markAllRead} disabled={unreadCount === 0}>
                {L.markAll}
              </Button>
            </div>
            {notifications.length > 0 ? (
              <ChipTabs tabs={tabs} activeTab={effectiveTab} onChange={setActiveTab} size="sm" />
            ) : null}
          </div>

          <div ref={scrollRef} style={{ flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
            {visibleNotifications.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--neutral-on-surface-primary)" }}>
                  {effectiveTab === "unread" ? L.emptyUnreadTitle : L.emptyTitle}
                </span>
                <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-secondary)" }}>
                  {effectiveTab === "unread" ? L.emptyUnread : L.empty}
                </span>
              </div>
            ) : (
              orderedBuckets.map((bucket) => (
                <div key={bucket.key}>
                  <div
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      padding: "10px 18px 6px",
                      background: "var(--neutral-surface-primary)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {bucket.label}
                  </div>
                  {bucket.items.map((item) => renderItem(item))}
                </div>
              ))
            )}

            {loadingMore ? (
              <div>
                {[0, 1, 2].map((i) => renderSkeletonRow(i))}
              </div>
            ) : null}

            {/* Invisible sentinel — scrolling it into view auto-loads the
                next page instead of requiring a "Load more" click. */}
            {hasMore ? <div ref={sentinelRef} style={{ height: "1px" }} /> : null}
          </div>
        </div>
      ) : null}
    </>
  );
};
