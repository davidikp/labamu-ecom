import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge, FilterPill, SearchBar, LocaleProvider } from "../../ce-ui";
import { Button } from "../common/Button.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { timeAgo } from "./NotificationBell.jsx";
import { SalesIcon, ProcurementIcon, ProductIcon, ResourcesIcon, DocumentIcon } from "../icons/Icons.jsx";
import { Clock } from "lucide-react";

// How many to-do cards are shown up front; more load per page as the
// sentinel at the bottom of the list scrolls into view.
const PAGE_SIZE = 10;

const STATUS_COLOR = {
  approval: "orange",
  revision: "yellow",
  proof: "blue",
  receipt: "green",
};

const MODULE_ICON = {
  rfq: SalesIcon,
  quote: SalesIcon,
  order: SalesIcon,
  invoice: SalesIcon,
  purchase_order: ProcurementIcon,
  custom_product_request: ProductIcon,
  material_request: ResourcesIcon,
};

export const TodoPanel = () => {
  const navigate = useNavigate();
  const { todoItems, language, t } = useNotifications();

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState([]); // empty = all
  const [statusFilter, setStatusFilter] = useState([]); // empty = all
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreTimerRef = useRef(null);
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  const L = {
    en: { title: "Need To Do", module: "Module", status: "Status", allModule: "All Modules", allStatus: "All Status", search: "Search to-do", empty: "You are all caught up — no actions needed right now.", seeDetail: "See Detail" },
    id: { title: "Perlu Dikerjakan", module: "Modul", status: "Status", allModule: "Semua Modul", allStatus: "Semua Status", search: "Cari tugas", empty: "Anda sudah selesai — tidak ada tindakan yang diperlukan saat ini.", seeDetail: "Lihat Detail" },
  }[language === "id" ? "id" : "en"];

  // Filter option lists (multi-select; empty selection = all).
  const moduleOptions = [];
  const statusOptions = [];
  const seenMod = new Set();
  const seenStatus = new Set();
  todoItems.forEach((i) => {
    if (!seenMod.has(i.module)) { seenMod.add(i.module); moduleOptions.push({ value: i.module, label: t(i.moduleLabel) }); }
    if (i.todo && !seenStatus.has(i.todo.type)) { seenStatus.add(i.todo.type); statusOptions.push({ value: i.todo.type, label: t(i.todo.tag) }); }
  });
  moduleOptions.sort((a, b) => a.label.localeCompare(b.label));
  statusOptions.sort((a, b) => a.label.localeCompare(b.label));

  const q = search.trim().toLowerCase();
  const filteredRows = todoItems
    .filter((i) => moduleFilter.length === 0 || moduleFilter.includes(i.module))
    .filter((i) => statusFilter.length === 0 || statusFilter.includes(i.todo?.type))
    .filter((i) => !q || `${i.entityId} ${t(i.title)} ${t(i.body)}`.toLowerCase().includes(q));
  // Default view shows PAGE_SIZE cards; more load as the sentinel scrolls
  // into view instead of rendering the whole filtered list at once.
  const rows = filteredRows.slice(0, visibleCount);
  const hasMore = filteredRows.length > rows.length;

  // Reset back to the first page whenever the filters/search change the
  // underlying result set, so pagination matches what's actually visible.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setLoadingMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, moduleFilter, statusFilter]);

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

  // Auto-load the next page once the sentinel at the bottom of the list
  // scrolls into view, instead of requiring a "Load more" click.
  useEffect(() => {
    if (!hasMore || loadingMore) return undefined;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, visibleCount]);

  // Placeholder card shown while the next page is "loading" (simulated delay).
  const renderSkeletonCard = (key) => (
    <div
      key={`skeleton-${key}`}
      style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", border: "1px solid #E5E7EB", borderRadius: "12px" }}
    >
      <div style={{ flexShrink: 0, width: "44px", height: "44px", borderRadius: "10px" }} className="todo-skeleton-block" />
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <span className="todo-skeleton-block" style={{ width: "40%", height: "13px" }} />
        <span className="todo-skeleton-block" style={{ width: "70%", height: "12px" }} />
        <span className="todo-skeleton-block" style={{ width: "30%", height: "18px", borderRadius: "999px" }} />
      </div>
      <div style={{ flexShrink: 0, width: "88px", height: "32px" }} className="todo-skeleton-block" />
    </div>
  );

  return (
    <LocaleProvider locale={language === "id" ? "id" : "en"}>
      <style>{`
        @keyframes todoSkeletonPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.8; }
        }
        .todo-skeleton-block {
          display: inline-block;
          border-radius: 4px;
          background: #E5E7EB;
          animation: todoSkeletonPulse 1.2s ease-in-out infinite;
        }
      `}</style>
      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", flex: 1, width: "100%", height: "100%", minHeight: 0 }}>
        {/* Title */}
        <div style={{ flexShrink: 0, padding: "20px 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#1A1D23" }}>{L.title}</span>
          {todoItems.length > 0 ? (
            <span
              data-no-localize
              style={{
                minWidth: "24px", height: "24px", padding: "0 8px", borderRadius: "999px",
                background: "var(--status-orange-primary)", color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700,
              }}
            >
              {todoItems.length}
            </span>
          ) : null}
        </div>

        {/* Search & filter */}
        <div style={{ flexShrink: 0, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FilterPill label={L.module} options={moduleOptions} multiple searchable={false} values={moduleFilter} onChangeMultiple={setModuleFilter} size="sm" />
            <FilterPill label={L.status} options={statusOptions} multiple searchable={false} values={statusFilter} onChangeMultiple={setStatusFilter} size="sm" />
          </div>
          <div style={{ width: "320px", maxWidth: "100%" }}>
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder={L.search} onClear={() => setSearch("")} />
          </div>
        </div>

        {/* Cards — scrolls internally once the section is pinned to the top */}
        <div ref={scrollRef} style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto" }}>
          {rows.length === 0 ? (
            <div style={{ padding: "36px 24px", textAlign: "center", color: "#6B7280", fontSize: "14px" }}>{L.empty}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px 24px" }}>
              {rows.map((i) => {
                const ModuleIcon = MODULE_ICON[i.module] || DocumentIcon;
                return (
                <div
                  key={i.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "var(--feature-brand-container-lighter)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ModuleIcon size={20} color="var(--feature-brand-primary)" />
                  </div>
                  <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#1A1D23" }}>{t(i.title)}</span>
                    <span style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.4 }}>
                      <span data-no-localize>{i.entityId}</span> · {t(i.body)}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <StatusBadge color={STATUS_COLOR[i.todo.type] || "blue"} tone="soft" label={t(i.todo.tag)} />
                      <span data-no-localize style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#9CA3AF" }}>
                        <Clock size={13} />
                        {timeAgo(i.createdAt, language)}
                      </span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <Button variant="outlined" size="small" onClick={() => i.entityRoute && navigate(i.entityRoute)}>
                      {L.seeDetail}
                    </Button>
                  </div>
                </div>
                );
              })}
              {loadingMore ? [0, 1, 2].map((i) => renderSkeletonCard(i)) : null}
            </div>
          )}

          {/* Invisible sentinel — scrolling it into view auto-loads the
              next page instead of requiring a "Load more" click. */}
          {hasMore ? <div ref={sentinelRef} style={{ height: "1px" }} /> : null}
        </div>

      </div>
    </LocaleProvider>
  );
};
