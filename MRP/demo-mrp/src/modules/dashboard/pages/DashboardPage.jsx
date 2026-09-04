import React from "react";
import { useNavigate } from "react-router-dom";
import { TodoPanel } from "../../../components/notification/TodoPanel.jsx";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { Plus } from "../../../components/icons/Icons.jsx";
import bannerArt from "../assets/homepage-afternoon.svg";

// Quick-action / counter cards. Clicking the card opens the list page; the
// "+" button opens the creation page. (Counts are illustrative demo values.)
const QUICK_ACTIONS = [
  { key: "products", label: "Products", count: 7, sub: "Total Products", add: "Add Product", listRoute: "/materials", createRoute: "/materials/create" },
  { key: "rfqs", label: "RFQs", count: 9, sub: "Total Requests", add: "Add RFQ", listRoute: "/request-for-quotes", createRoute: "/request-for-quotes/create" },
  { key: "quotes", label: "Quotes", count: 0, sub: "Total Quotes", add: "Add Quote", listRoute: "/quotes", createRoute: "/quotes/create" },
  { key: "orders", label: "Orders", count: 1, sub: "Total Orders", add: "Add Order", listRoute: "/orders", createRoute: "/orders/create" },
  { key: "invoices", label: "Invoices", count: 1, sub: "Total Invoices", add: "Add Invoice", listRoute: "/invoices", createRoute: "/invoices/create" },
];

const QuickActionCard = ({ data, onAdd, onViewList }) => (
  <div
    onClick={onViewList}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--feature-brand-primary)")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--neutral-line-separator-1, #E5E7EB)")}
    style={{
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid var(--neutral-line-separator-1, #E5E7EB)",
      padding: "20px 24px",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      cursor: "pointer",
      transition: "border-color 0.15s ease",
      minWidth: 0,
    }}
  >
    <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
      <span style={{ fontSize: "16px", fontWeight: 700, color: "#1A1D23", overflowWrap: "break-word" }}>{data.label}</span>
      <span style={{ fontSize: "14px", color: "#9CA3AF", overflowWrap: "break-word" }}>
        <b data-no-localize style={{ color: "#1A1D23", fontSize: "14px" }}>{data.count}</b> · {data.sub}
      </span>
    </div>
    <button
      type="button"
      title={data.add}
      onClick={(e) => { e.stopPropagation(); onAdd(); }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#DCE6FF")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#EFF3FF")}
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        border: "none",
        background: "#EFF3FF",
        color: "var(--feature-brand-primary, #4F70E2)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Plus size={18} />
    </button>
  </div>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, language } = useNotifications();

  const locale = language === "id" ? "id-ID" : "en-GB";
  const dateStr = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const L = {
    en: { welcome: `Welcome, ${currentUser.name}`, l1: "Ready to grow your business?", l2: "Let's make today productive" },
    id: { welcome: `Selamat datang, ${currentUser.name}`, l1: "Siap mengembangkan bisnis Anda?", l2: "Mari produktif hari ini" },
  }[language === "id" ? "id" : "en"];

  return (
    <div style={{ height: "calc(100vh - 64px)", background: "#F5F6FA", overflowY: "auto" }}>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", width: "100%", boxSizing: "border-box" }}>
        {/* Welcome banner */}
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span data-no-localize style={{ fontSize: "13px", fontWeight: 600, color: "#9CA3AF" }}>{dateStr}</span>
            <h1 data-no-localize style={{ fontSize: "28px", fontWeight: 800, color: "#1A1D23", margin: 0 }}>{L.welcome} 👋</h1>
            <div style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.5 }}>
              <div>{L.l1}</div>
              <div>{L.l2}</div>
            </div>
          </div>
          <img src={bannerArt} alt="" aria-hidden style={{ height: "140px", width: "auto", flexShrink: 0 }} />
        </div>

        {/* Quick actions / counters — single row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "16px", flexShrink: 0 }}>
          {QUICK_ACTIONS.map((a) => (
            <QuickActionCard
              key={a.key}
              data={a}
              onViewList={() => navigate(a.listRoute)}
              onAdd={() => navigate(a.createRoute)}
            />
          ))}
        </div>

        {/* Need To Do — sticks to the top once scrolled into view, then its rows
            scroll internally (fills the viewport height). */}
        <div style={{ flexShrink: 0, position: "sticky", top: "24px", height: "calc(100vh - 64px - 48px)", display: "flex" }}>
          <TodoPanel />
        </div>
      </div>
    </div>
  );
};
