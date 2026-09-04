import React, { useEffect, useRef, useState } from "react";
import {
  AnalyticsIcon,
  BrandLogoIcon,
  BrandLogoLockup,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FinancingIcon,
  ManufacturingIcon,
  ProcurementIcon,
  ProductIcon,
  ResourcesIcon,
  SalesIcon,
  Settings,
  UserGuideIcon,
  WorkOrderIcon,
  DashboardIcon,
} from "../icons/Icons.jsx";
import { TableSearchField } from "../table/TableSearchField.jsx";
import { LANGUAGE_OPTIONS } from "../../constants/appConstants.js";

const baseInputBorderColor = "#e9e9e9";

const Sidebar = ({
  isCollapsed,
  onToggleCollapse,
  activeModule,
  viewState,
  onModuleChange,
  language,
  onLanguageChange,
  t,
}) => {
  const menuItems = [
    {
      icon: DashboardIcon,
      id: "dashboard",
      label: t("sidebar.dashboard"),
      hasChildren: false,
    },
    {
      icon: ResourcesIcon,
      id: "resources",
      label: t("sidebar.resources"),
      hasChildren: true,
      children: [
        { id: "materials", label: t("sidebar.materials") },
        { id: "vendors", label: t("sidebar.vendors") },
        { id: "customers", label: t("sidebar.customers") },
        { id: "material_request", label: t("sidebar.material_request") },
      ],
    },
    {
      icon: ManufacturingIcon,
      id: "manufacturing",
      label: t("sidebar.manufacturing"),
      hasChildren: true,
      children: [
        { id: "bill_of_materials", label: t("sidebar.bill_of_materials") },
        { id: "routing", label: t("sidebar.routing") },
        { id: "work_order", label: t("sidebar.work_order") },
      ],
    },
    {
      icon: ProductIcon,
      id: "product",
      label: t("sidebar.product"),
      hasChildren: true,
      children: [
        { id: "product_catalog", label: t("sidebar.product_catalog") },
        {
          id: "custom_product_request",
          label: t("sidebar.custom_product_request"),
        },
      ],
    },
    {
      icon: SalesIcon,
      id: "sales",
      label: t("sidebar.sales"),
      hasChildren: true,
      children: [
        { id: "request_for_quotes", label: t("sidebar.request_for_quotes") },
        { id: "quotes", label: t("sidebar.quotes") },
        { id: "orders", label: t("sidebar.orders") },
        { id: "invoices", label: t("sidebar.invoices") },
      ],
    },
    {
      icon: ProcurementIcon,
      id: "procurement",
      label: t("sidebar.procurement"),
      hasChildren: true,
      children: [
        { id: "purchase_order", label: t("sidebar.purchase_order") },
        { id: "material_forecast", label: t("sidebar.material_forecast") },
      ],
    },
    {
      icon: AnalyticsIcon,
      id: "analytics",
      label: t("sidebar.analytics"),
      hasChildren: true,
      children: [
        { id: "analytics_financial_report", label: t("sidebar.financial_report") },
        { id: "analytics_inventory_report", label: t("sidebar.inventory_report") },
        { id: "analytics_sales_funnel_report", label: t("sidebar.sales_funnel_report") },
        { id: "analytics_work_order_monitoring", label: t("sidebar.work_order_monitoring") },
        { id: "analytics_procurement_ap_report", label: t("sidebar.procurement_ap_report") },
      ],
    },
    { icon: FinancingIcon, id: "financing", label: t("sidebar.financing") },
    {
      icon: Settings,
      id: "administration",
      label: t("sidebar.administration"),
      hasChildren: true,
      children: [
        { id: "user_management", label: t("sidebar.user_management") },
        {
          id: "notification_settings",
          label: t("sidebar.notification_settings"),
        },
        { id: "email_outbox", label: t("sidebar.email_outbox") },
        { id: "fx_management", label: t("sidebar.fx_management") },
        { id: "company_settings", label: t("sidebar.company_settings") },
        { id: "labamu_staff", label: t("sidebar.labamu_staff") },
      ],
    },
    {
      icon: UserGuideIcon,
      id: "user_guide",
      label: t("sidebar.user_guide"),
      hasChildren: false,
    },
  ];

  const parentByModuleId = menuItems.reduce((acc, item) => {
    if (item.children?.length) {
      item.children.forEach((child) => {
        acc[child.id] = item.id;
      });
    }
    return acc;
  }, {});

  const activeParentId = parentByModuleId[activeModule] || null;
  const [expandedMenus, setExpandedMenus] = useState(() =>
    activeParentId ? [activeParentId] : []
  );
  const [hoveredMenuItemId, setHoveredMenuItemId] = useState(null);
  const [hoveredItemRect, setHoveredItemRect] = useState(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const languageMenuRef = useRef(null);

  const toggleMenu = (id) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((menuId) => menuId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!activeParentId) return;
    setExpandedMenus((prev) =>
      prev.includes(activeParentId) ? prev : [...prev, activeParentId]
    );
  }, [activeParentId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setIsLanguageMenuOpen(false);
      }
    };

    if (isLanguageMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isLanguageMenuOpen]);

  const activeLanguage =
    LANGUAGE_OPTIONS.find((option) => option.id === language) ||
    LANGUAGE_OPTIONS[0];
  const expandedWidth = "286px";
  const collapsedWidth = "82px";
  const expandedHeaderHeight = "64px";
  const collapsedHeaderHeight = "64px";

  return (
    <div
      style={{
        width: isCollapsed ? collapsedWidth : expandedWidth,
        transition: "width 0.2s ease",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "var(--neutral-surface-primary)",
        borderRight: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          height: isCollapsed ? collapsedHeaderHeight : expandedHeaderHeight,
          padding: isCollapsed ? "0" : "0 24px",
          borderBottom: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        {isCollapsed ? (
          <BrandLogoIcon size={30} title="Labamu" />
        ) : (
          <BrandLogoLockup width={172} title="Labamu Manufacturing" />
        )}
      </div>

      {!isCollapsed && (
        <div
          style={{
            padding: "10px 16px 12px 16px",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            flexShrink: 0,
          }}
        >
          <TableSearchField
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder="Search menu..."
            width="100%"
            minWidth="0"
          />
        </div>
      )}

      <div
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          padding: "0",
          overflowX: "hidden",
        }}
      >
        {menuItems.filter((item) => {
          if (!menuSearch.trim()) return true;
          const q = menuSearch.toLowerCase();
          const labelMatch = item.label.toLowerCase().includes(q);
          const childMatch = item.children?.some(c => c.label.toLowerCase().includes(q));
          return labelMatch || childMatch;
        }).map((item) => {
          const hasChildRows = !!item.children?.length;
          const isChildSelected = item.children?.some(
            (child) => activeModule === child.id || (activeModule === "analytics" && child.id === `analytics_${viewState?.view}`)
          );
          const isParentSelected = activeModule === item.id || isChildSelected;
          const isSearchExpanded = menuSearch.trim()
            ? item.children?.some(c => c.label.toLowerCase().includes(menuSearch.toLowerCase()))
            : false;
          const isExpanded = hasChildRows
            ? (expandedMenus.includes(item.id) || isSearchExpanded)
            : false;
          const rowColor = isParentSelected
            ? "var(--feature-brand-primary)"
            : "var(--neutral-on-surface-primary)";

          return (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  minHeight: "56px",
                  padding: isCollapsed ? "6px 0" : "6px 16px",
                }}
                onMouseEnter={(e) => {
                  if (isCollapsed) {
                    setHoveredMenuItemId(item.id);
                    setHoveredItemRect(e.currentTarget.getBoundingClientRect());
                  }
                }}
                onMouseLeave={() => {
                  if (isCollapsed) {
                    setHoveredMenuItemId(null);
                  }
                }}
              >
                <div
                  style={{
                    position: "relative",
                    minHeight: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isCollapsed ? "center" : "stretch",
                  }}
                >
                  {isParentSelected ? (
                    <div
                      style={{
                        position: "absolute",
                        left: isCollapsed ? 0 : -16,
                        top: "6px",
                        bottom: "6px",
                        width: "5px",
                        borderRadius: "0 999px 999px 0",
                        background: "var(--feature-brand-primary)",
                      }}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      if (item.hasChildren) {
                        if (!isCollapsed) toggleMenu(item.id);
                        return;
                      }
                      onModuleChange(item.id);
                    }}
                    style={{
                      width: isCollapsed ? "44px" : "100%",
                      height: "44px",
                      padding: isCollapsed ? "0" : "0 16px",
                      border: "none",
                      borderRadius: isParentSelected ? "14px" : "12px",
                      background: isParentSelected
                        ? "var(--feature-brand-container-lighter)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      gap: isCollapsed ? "0" : "14px",
                      cursor: "pointer",
                      color: rowColor,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: isCollapsed ? "20px" : "24px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {React.createElement(item.icon, {
                        size: isCollapsed ? 20 : 21,
                        color: rowColor,
                        strokeWidth: 1.8,
                        style: { flexShrink: 0 },
                      })}
                    </span>
                    {!isCollapsed ? (
                      <span
                        style={{
                          flex: 1,
                          fontSize: "var(--text-title-2)",
                          lineHeight: 1.2,
                          fontWeight: isParentSelected
                            ? "var(--font-weight-bold)"
                            : "var(--font-weight-regular)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>
                    ) : null}
                    {!isCollapsed && item.hasChildren ? (
                      <span
                        style={{
                          width: "20px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ChevronDownIcon
                          size={20}
                          color={
                            isParentSelected
                              ? "var(--feature-brand-primary)"
                              : "var(--neutral-on-surface-primary)"
                          }
                          style={{
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>

              {hasChildRows && !isCollapsed && isExpanded ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "0 16px 16px 16px",
                  }}
                >
                  {item.children.filter(c => !menuSearch.trim() || c.label.toLowerCase().includes(menuSearch.toLowerCase())).map((child) => {
                    const isChildActive = activeModule === child.id || (activeModule === "analytics" && child.id === `analytics_${viewState.view}`);
                    return (
                      <button
                        key={child.id}
                        type="button"
                        className="sidebar-flyout-item"
                        onClick={() => onModuleChange(child.id)}
                        style={{
                          minHeight: "40px",
                          padding: "8px 16px 8px 56px",
                          margin: 0,
                          border: "none",
                          borderRadius: "14px",
                          background: isChildActive
                            ? "var(--feature-brand-container-lighter)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          cursor: "pointer",
                          color: isChildActive
                            ? "var(--feature-brand-primary)"
                            : "var(--neutral-on-surface-primary)",
                          fontSize: "var(--text-title-3)",
                          fontWeight: isChildActive
                            ? "var(--font-weight-bold)"
                            : "var(--font-weight-regular)",
                          textAlign: "left",
                        }}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {isCollapsed && hoveredMenuItemId && (
        <div
          style={{
            position: "fixed",
            left: "82px",
            top: hoveredItemRect ? hoveredItemRect.top : 0,
            minWidth: "200px",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          onMouseEnter={() => setHoveredMenuItemId(hoveredMenuItemId)}
          onMouseLeave={() => setHoveredMenuItemId(null)}
        >
          {(() => {
            const item = menuItems.find((m) => m.id === hoveredMenuItemId);
            if (!item) return null;
            return (
              <>
                <div
                  style={{
                    padding: "12px 16px",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-primary)",
                    background: "var(--neutral-surface-grey-lighter)",
                    borderBottom: item.hasChildren
                      ? "1px solid var(--neutral-line-separator-1)"
                      : "none",
                  }}
                >
                  {item.label}
                </div>
                {item.hasChildren &&
                  item.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className="sidebar-flyout-item"
                      onClick={() => {
                        onModuleChange(child.id);
                        setHoveredMenuItemId(null);
                      }}
                      style={{
                        padding: "12px 16px",
                        border: "none",
                        background:
                          activeModule === child.id
                            ? "var(--feature-brand-container-lighter)"
                            : "transparent",
                        color:
                          activeModule === child.id
                            ? "var(--feature-brand-primary)"
                            : "var(--neutral-on-surface-primary)",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      {child.label}
                    </button>
                  ))}
              </>
            );
          })()}
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid var(--neutral-line-separator-1)",
          padding: isCollapsed ? "20px 10px" : "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
        >
          <div
            onClick={onToggleCollapse}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--feature-brand-container-lighter)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              border: "1px solid var(--feature-brand-container)",
            }}
          >
            {isCollapsed ? (
              <ChevronRightIcon
                size={20}
                color="var(--neutral-on-surface-primary)"
              />
            ) : (
              <ChevronLeftIcon
                size={22}
                color="var(--neutral-on-surface-primary)"
              />
            )}
          </div>
        </div>

        <div
          ref={languageMenuRef}
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {isLanguageMenuOpen ? (
            <div
              style={{
                position: isCollapsed ? "fixed" : "absolute",
                bottom: isCollapsed ? "16px" : "58px",
                left: isCollapsed ? "82px" : 0,
                right: isCollapsed ? "auto" : 0,
                width: isCollapsed ? "260px" : "100%",
                maxWidth: "100%",
                background: "var(--neutral-surface-primary)",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                padding: "4px 8px 6px",
                zIndex: 80,
              }}
            >
              {LANGUAGE_OPTIONS.map((option, index) => {
                const isActiveLanguage = option.id === language;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onLanguageChange(option.id);
                      setIsLanguageMenuOpen(false);
                    }}
                    onMouseEnter={(event) => {
                      if (isActiveLanguage) {
                        event.currentTarget.style.background =
                          "var(--feature-brand-container-lighter)";
                        return;
                      }
                      event.currentTarget.style.background =
                        "var(--neutral-surface-grey-lighter)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = isActiveLanguage
                        ? "var(--feature-brand-container-lighter)"
                        : "var(--neutral-surface-primary)";
                    }}
                    style={{
                      width: "100%",
                      minHeight: "40px",
                      border: "none",
                      background: isActiveLanguage
                        ? "var(--feature-brand-container-lighter)"
                        : "var(--neutral-surface-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 10px",
                      cursor: "pointer",
                      borderBottom:
                        index === LANGUAGE_OPTIONS.length - 1
                          ? "none"
                          : "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "8px",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--neutral-surface-primary)",
                        fontSize: "14px",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                      }}
                    >
                      {option.flag}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontSize: "var(--text-body)",
                        fontWeight: isActiveLanguage
                          ? "var(--font-weight-bold)"
                          : "var(--font-weight-regular)",
                        color: isActiveLanguage
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {option.label}
                    </span>
                    {isActiveLanguage ? (
                      <CheckIcon
                        size={14}
                        color="var(--feature-brand-primary)"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
            style={{
              height: "46px",
              minHeight: "46px",
              width: isCollapsed ? "46px" : "100%",
              border: `1px solid ${
                isLanguageMenuOpen
                  ? "var(--feature-brand-primary)"
                  : baseInputBorderColor
              }`,
              borderRadius: "10px",
              padding: isCollapsed ? "0" : "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: "12px",
              cursor: "pointer",
              background: "var(--neutral-surface-primary)",
              boxShadow: isLanguageMenuOpen
                ? "0 0 0 3px rgba(0, 104, 255, 0.08)"
                : "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--neutral-surface-primary)",
                fontSize: "20px",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            >
              {activeLanguage.flag}
            </div>
            {!isCollapsed ? (
              <span
                style={{
                  fontSize: "var(--text-subtitle-1)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                {activeLanguage.shortLabel}
              </span>
            ) : null}
            {!isCollapsed ? (
              <ChevronDownIcon
                size={20}
                color="var(--neutral-on-surface-primary)"
                style={{
                  marginLeft: "auto",
                  transform: isLanguageMenuOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
