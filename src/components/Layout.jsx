import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ExternalLink, Bell, Pencil,
  LayoutDashboard, BookOpen, Store, ShoppingCart, FileText, Calendar,
  MessageSquare, Truck, Globe, UserCog, ChevronDown, ChevronLeft, ChevronRight, Check, Folder,
  Settings,
} from 'lucide-react';
import Button from './ui/Button';
import labamuMark from '../assets/labamu-mark.svg';

const LANG_OPTIONS = [
  { id: 'id', flag: '🇮🇩', shortLabel: 'ID', labelKey: 'common:layout.langIndonesia', label: 'Indonesia' },
  { id: 'en', flag: '🇬🇧', shortLabel: 'EN', labelKey: 'common:layout.langEnglish', label: 'English' },
];

const MENU_ITEMS = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard:sidebar.dashboard', label: 'Dashboard' },
  {
    id: 'manage-catalog', icon: BookOpen, labelKey: 'dashboard:sidebar.manageCatalog', label: 'Manage Catalog',
    children: [
      { id: 'catalog', path: '/catalog', labelKey: 'dashboard:sidebar.catalog', label: 'Catalog' },
      { id: 'package', path: '/catalog/package', labelKey: 'dashboard:sidebar.package', label: 'Package' },
      { id: 'modifier', path: '/catalog/modifier', labelKey: 'dashboard:sidebar.modifier', label: 'Modifier' },
    ],
  },
  {
    id: 'content', icon: Folder, labelKey: 'dashboard:sidebar.content', label: 'Content',
    children: [
      { id: 'files', path: '/content/files', labelKey: 'dashboard:sidebar.files', label: 'Files' },
      { id: 'menus', path: '/content/menus', labelKey: 'dashboard:sidebar.menus', label: 'Menus' },
    ],
  },
  {
    id: 'website-studio', icon: Store, labelKey: 'dashboard:sidebar.websiteStudio', label: 'Website Studio',
    children: [
      { id: 'site-builder', path: '/online-store/theme', labelKey: 'dashboard:sidebar.siteBuilder', label: 'Theme' },
      { id: 'page-list', path: '/online-store/pages', labelKey: 'dashboard:sidebar.pageList', label: 'Pages' },
      { id: 'preferences', path: '/online-store/preferences', labelKey: 'dashboard:sidebar.preferences', label: 'Preferences' },
    ],
  },
  { id: 'orders', path: '/orders', icon: ShoppingCart, labelKey: 'dashboard:sidebar.orders', label: 'Orders' },
  { id: 'rfq', path: '/rfq', icon: FileText, labelKey: 'dashboard:sidebar.rfq', label: 'Request for Quotes' },
  { id: 'bookings', path: '/bookings', icon: Calendar, labelKey: 'dashboard:sidebar.bookings', label: 'Bookings' },
  { id: 'reviews', path: '/reviews', icon: MessageSquare, labelKey: 'dashboard:sidebar.reviews', label: 'Reviews' },
  { id: 'delivery-settings', path: '/delivery-settings', icon: Truck, labelKey: 'dashboard:sidebar.deliverySettings', label: 'Delivery Settings' },
  {
    id: 'domain-setup', icon: Globe, labelKey: 'dashboard:sidebar.domainSetup', label: 'Domain Setup',
    children: [
      { id: 'customize-domain', path: '/domain/customize', labelKey: 'dashboard:sidebar.customizeDomain', label: 'Customize Domain' },
      { id: 'website-tracking', path: '/domain/tracking', labelKey: 'dashboard:sidebar.websiteTracking', label: 'Website Tracking' },
    ],
  },
  { id: 'role-management', path: '/role-management', icon: UserCog, labelKey: 'dashboard:sidebar.roleManagement', label: 'Role Management' },
  {
    // Settings hub (docs/plans/09-settings-policies.md) — deliberately
    // minimal: Policies is the only child for now, matching SettingsIndex.jsx.
    id: 'settings', icon: Settings, labelKey: 'dashboard:sidebar.settings', label: 'Settings',
    children: [
      { id: 'settings-policies', path: '/settings/policies', labelKey: 'settings:sidebar.policies', label: 'Policies' },
    ],
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // At most one entry — same accordion rule toggleGroup enforces below —
  // so seeding this from whichever group contains the current route never
  // starts with more than one group already open.
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const match = MENU_ITEMS.find((item) => item.children?.some((c) => location.pathname.startsWith(c.path)));
    return match ? [match.id] : [];
  });
  const [hoveredMenuItemId, setHoveredMenuItemId] = useState(null);
  const [hoveredItemRect, setHoveredItemRect] = useState(null);

  const lang = i18n.language;
  const activeLanguage = LANG_OPTIONS.find((option) => option.id === lang) || LANG_OPTIONS[1];
  const languageMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isLanguageMenuOpen]);

  // Accordion — only one top-level group open at a time, so expanding
  // Website Studio while Content is already open closes Content instead of
  // stacking both. Clicking the currently-open group still just collapses
  // it (back to `[]`), same toggle-off behavior as before.
  const toggleGroup = (id) => {
    setExpandedGroups((prev) => (prev.includes(id) ? [] : [id]));
  };

  function handleLogout() {
    sessionStorage.removeItem('lb_mock_auth');
    navigate('/login', { replace: true });
  }

  function handleLangChange(newLang) {
    i18n.changeLanguage(newLang);
    localStorage.setItem('lb_lang', newLang);
  }

  // Active menu helper — a menu item is active when its path is the *most
  // specific* (longest) leaf path that matches the current URL. This keeps the
  // right submenu highlighted on nested/detail routes (e.g. /catalog/:id →
  // Catalog, /catalog/package/:id → Package, /catalog/modifier/:id → Modifier).
  const leafPaths = MENU_ITEMS.flatMap((item) =>
    item.children ? item.children.map((c) => c.path) : (item.path ? [item.path] : [])
  );
  const activePath = leafPaths
    .filter((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0] || null;
  const isActive = (path) => path === activePath;

  const navigateToProfile = () => {
    navigate('/profile');
    setUserMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neutral-background)', fontFamily: 'var(--font-family)' }}>
      {/* Sidebar - Unified at 260px, collapsible to 80px */}
      <aside style={{
        width: isSidebarCollapsed ? '80px' : '260px',
        transition: 'width 0.2s ease',
        background: 'var(--neutral-surface-primary)',
        borderRight: '1px solid var(--neutral-line-separator-1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 200,
        overflowX: 'hidden',
      }}>
        {/* Re-themes the nav item rows (top-level + children + the
            collapsed-state flyout rows below) onto ce-ui SideTabs'
            (src/ce-ui/ui/side-tabs.tsx) own active/hover tokens —
            var(--lb-brand), var(--lb-brand-dark), var(--lb-on-surface),
            var(--lb-surface-grey), the same tokens IconBtn/MainBtn/etc.
            already use elsewhere — instead of this file's separate
            feature-brand and neutral variables. Scoped to just the item
            rows: the header, collapse toggle, and language footer below
            keep their existing neutral/feature-brand styling.
            A plain CSS rule (not inline style) since hover has no
            per-row state to drive it otherwise. */}
        <style>{`
          .sidebar-nav-item:not(.sidebar-nav-item--active):hover {
            background: var(--lb-surface-grey) !important;
          }
        `}</style>
        {/* Sidebar Header */}
        <div style={{
          height: '56px',
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: isSidebarCollapsed ? '0' : '0 24px',
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--neutral-line-separator-1)'
        }}>
          <img src={labamuMark} alt="Labamu" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', lineHeight: 1 }}>
              <span style={{ fontSize: '17px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                <span style={{ color: '#006BFF' }}>Labamu</span>
                <span style={{ color: '#9CA3AF' }}>{t('common:layout.brandSuffix')}</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                {t('common:layout.byLabamu')}
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Nav */}
        <div style={{ flex: 1, padding: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {MENU_ITEMS.map((item) => {
            const hasChildren = !!item.children;
            const isChildActive = hasChildren && item.children.some((c) => isActive(c.path));
            const isParentActive = hasChildren ? isChildActive : isActive(item.path);
            const isExpanded = hasChildren && !isSidebarCollapsed && expandedGroups.includes(item.id);
            const Icon = item.icon;
            const rowColor = isParentActive ? 'var(--lb-brand)' : 'var(--lb-on-surface)';

            return (
              <div
                key={item.id}
                onMouseEnter={(e) => {
                  if (isSidebarCollapsed) {
                    setHoveredMenuItemId(item.id);
                    setHoveredItemRect(e.currentTarget.getBoundingClientRect());
                  }
                }}
                onMouseLeave={() => {
                  if (isSidebarCollapsed) setHoveredMenuItemId(null);
                }}
              >
                <div style={{ padding: isSidebarCollapsed ? '0' : '0 16px' }}>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'stretch' }}>
                    {isParentActive && (
                      <div style={{ position: 'absolute', left: isSidebarCollapsed ? 0 : -16, top: '6px', bottom: '6px', width: '5px', borderRadius: '0 999px 999px 0', background: 'var(--lb-brand)' }} />
                    )}
                    <button
                      type="button"
                      className={`sidebar-nav-item${isParentActive ? ' sidebar-nav-item--active' : ''}`}
                      onClick={() => {
                        if (isSidebarCollapsed) {
                          if (!hasChildren) navigate(item.path);
                          return;
                        }
                        if (!hasChildren) {
                          navigate(item.path);
                          return;
                        }
                        // Opening a still-collapsed group also navigates to
                        // its first submenu — clicking "Website Studio"
                        // lands on Theme rather than just revealing the
                        // list with nothing selected yet. Collapsing an
                        // already-open group (the toggle-off case) stays a
                        // pure expand/collapse with no navigation.
                        const wasExpanded = expandedGroups.includes(item.id);
                        toggleGroup(item.id);
                        if (!wasExpanded && item.children[0]) navigate(item.children[0].path);
                      }}
                      style={{
                        width: isSidebarCollapsed ? '44px' : '100%',
                        height: '44px',
                        padding: isSidebarCollapsed ? '0' : '0 16px',
                        border: 'none',
                        borderRadius: isParentActive ? '14px' : '12px',
                        // A parent with children only ever counts as
                        // "active" because one of its submenu rows is the
                        // current route (see isParentActive above) — the
                        // fill belongs on that actual active child row
                        // (below), not here too, or both read as "active"
                        // with no visual distinction between the group and
                        // the specific page within it. The bold/brand-color
                        // text and left accent bar still mark the parent as
                        // "this group is open/current".
                        background: isParentActive && !hasChildren ? 'var(--lb-brand-dark)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        gap: isSidebarCollapsed ? '0' : '14px',
                        cursor: 'pointer',
                        color: rowColor,
                        textAlign: 'left',
                      }}
                    >
                      <Icon size={21} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                      {!isSidebarCollapsed && (
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: isParentActive ? 700 : 500, whiteSpace: 'nowrap' }}>
                          {t(item.labelKey, item.label)}
                        </span>
                      )}
                      {!isSidebarCollapsed && hasChildren && (
                        <ChevronDown
                          size={20}
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {hasChildren && isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px 16px 16px' }}>
                    {item.children.map((child) => {
                      const childActive = isActive(child.path);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          className={`sidebar-nav-item${childActive ? ' sidebar-nav-item--active' : ''}`}
                          onClick={() => navigate(child.path)}
                          style={{
                            minHeight: '40px',
                            padding: '8px 16px 8px 56px',
                            margin: 0,
                            border: 'none',
                            borderRadius: '14px',
                            background: childActive ? 'var(--lb-brand-dark)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: childActive ? 'var(--lb-brand)' : 'var(--lb-on-surface)',
                            fontSize: '14px',
                            fontWeight: childActive ? 700 : 500,
                            textAlign: 'left',
                          }}
                        >
                          {t(child.labelKey, child.label)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Collapsed-state flyout for items with children */}
        {isSidebarCollapsed && hoveredMenuItemId && (
          <div
            style={{
              position: 'fixed',
              left: '80px',
              top: hoveredItemRect ? hoveredItemRect.top : 0,
              minWidth: '200px',
              background: 'var(--neutral-surface-primary)',
              border: '1px solid var(--neutral-line-separator-1)',
              borderRadius: '12px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onMouseEnter={() => setHoveredMenuItemId(hoveredMenuItemId)}
            onMouseLeave={() => setHoveredMenuItemId(null)}
          >
            {(() => {
              const item = MENU_ITEMS.find((m) => m.id === hoveredMenuItemId);
              if (!item) return null;
              return (
                <>
                  <div
                    onClick={() => {
                      if (!item.children) {
                        navigate(item.path);
                        setHoveredMenuItemId(null);
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: 'var(--neutral-on-surface-primary)',
                      background: 'var(--neutral-surface-grey-lighter)',
                      borderBottom: item.children ? '1px solid var(--neutral-line-separator-1)' : 'none',
                      cursor: item.children ? 'default' : 'pointer',
                    }}
                  >
                    {t(item.labelKey, item.label)}
                  </div>
                  {item.children && item.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`sidebar-nav-item${isActive(child.path) ? ' sidebar-nav-item--active' : ''}`}
                      onClick={() => {
                        navigate(child.path);
                        setHoveredMenuItemId(null);
                      }}
                      style={{
                        padding: '12px 16px',
                        border: 'none',
                        background: isActive(child.path) ? 'var(--lb-brand-dark)' : 'transparent',
                        color: isActive(child.path) ? 'var(--lb-brand)' : 'var(--lb-on-surface)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      {t(child.labelKey, child.label)}
                    </button>
                  ))}
                </>
              );
            })()}
          </div>
        )}

        {/* Sidebar Footer (Collapse Toggle + Language Switcher) */}
        <div style={{
          padding: isSidebarCollapsed ? '16px 10px' : '16px 24px',
          borderTop: '1px solid var(--neutral-line-separator-1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-label={isSidebarCollapsed ? t('common:layout.expandSidebar') : t('common:layout.collapseSidebar')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--feature-brand-container-lighter)',
                border: '1px solid var(--neutral-line-separator-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {isSidebarCollapsed
                ? <ChevronRight size={18} color="var(--neutral-on-surface-primary)" />
                : <ChevronLeft size={18} color="var(--neutral-on-surface-primary)" />}
            </button>
          </div>

          <div ref={languageMenuRef} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
            {isLanguageMenuOpen && (
              <div style={{
                position: isSidebarCollapsed ? 'fixed' : 'absolute',
                bottom: isSidebarCollapsed ? '16px' : '58px',
                left: isSidebarCollapsed ? '80px' : 0,
                right: isSidebarCollapsed ? 'auto' : 0,
                width: isSidebarCollapsed ? '220px' : 'auto',
                background: 'var(--neutral-surface-primary)',
                border: '1px solid var(--neutral-line-separator-1)',
                borderRadius: '12px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                padding: '4px 8px 6px',
                zIndex: 80,
              }}>
                {LANG_OPTIONS.map((option, index) => {
                  const isActiveLanguage = option.id === lang;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        handleLangChange(option.id);
                        setIsLanguageMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        minHeight: '40px',
                        border: 'none',
                        background: isActiveLanguage ? 'var(--feature-brand-container-lighter)' : 'var(--neutral-surface-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        borderBottom: index === LANG_OPTIONS.length - 1 ? 'none' : '1px solid var(--neutral-line-separator-1)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                        {option.flag}
                      </div>
                      <span style={{
                        flex: 1, textAlign: 'left', fontSize: '14px',
                        fontWeight: isActiveLanguage ? 700 : 500,
                        color: isActiveLanguage ? 'var(--feature-brand-primary)' : 'var(--neutral-on-surface-primary)',
                      }}>
                        {t(option.labelKey, option.label)}
                      </span>
                      {isActiveLanguage && <Check size={14} color="var(--feature-brand-primary)" />}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
              style={{
                height: '46px',
                width: isSidebarCollapsed ? '46px' : '100%',
                border: `1px solid ${isLanguageMenuOpen ? 'var(--feature-brand-primary)' : '#E9E9E9'}`,
                borderRadius: '10px',
                padding: isSidebarCollapsed ? '0' : '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                background: 'var(--neutral-surface-primary)',
                boxShadow: isLanguageMenuOpen ? '0 0 0 3px rgba(0, 104, 255, 0.08)' : 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {activeLanguage.flag}
              </div>
              {!isSidebarCollapsed && (
                <>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)' }}>
                    {activeLanguage.shortLabel}
                  </span>
                  <ChevronDown
                    size={20}
                    color="var(--neutral-on-surface-primary)"
                    style={{ marginLeft: 'auto', transform: isLanguageMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar - Unified at 56px */}
        <header style={{
          height: '56px',
          background: 'var(--neutral-surface-primary)',
          borderBottom: '1px solid var(--neutral-line-separator-1)',
          boxShadow: 'var(--elevation-sticky-header)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
          gap: '20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* Edit Website Button — jumps straight into the section-builder
              editor for the store's live draft, from anywhere in the app. */}
          <Button
            variant="secondary"
            size="small"
            leftIcon={<Pencil size={16} />}
            onClick={() => navigate('/section-builder/demo')}
          >
            {t('dashboard:header.editWebsite', 'Edit website')}
          </Button>

          {/* View Website Button */}
          <Button
            variant="secondary"
            size="small"
            leftIcon={<ExternalLink size={16} />}
            onClick={() => window.open('/storefront', '_blank')}
          >
            {t('dashboard:header.viewStorefront')}
          </Button>

          <div style={{ width: '1px', height: '32px', background: '#E9E9E9' }} />

          {/* Notification Bell */}
          <button
            aria-label={t('dashboard:header.notifications')}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#4B5563' }}
          >
            <Bell size={20} />
          </button>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', outline: 'none' }}
              aria-label={t('common:layout.userMenuAriaLabel')}
              aria-expanded={userMenuOpen}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#1B1B1B', fontFamily: "'Inter', 'Lato', sans-serif", letterSpacing: '-0.3px', lineHeight: '18px' }}>{t('common:layout.userNamePlaceholder')}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6A7282', fontFamily: "'Inter', 'Lato', sans-serif" }}>{t('common:layout.userRolePlaceholder')}</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '4px', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#1B1B1B' }}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {userMenuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: '200px', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden', zIndex: 150 }}>
                <button 
                  onClick={navigateToProfile} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '15px', fontWeight: 500, color: '#1B1B1B', textAlign: 'left', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F4F8FF'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {t('common:layout.companyProfile')}
                </button>
                <div style={{ height: '1px', background: '#F3F4F6' }} />
                <button 
                  onClick={handleLogout} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '15px', fontWeight: 500, color: '#D0021B', textAlign: 'left', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#FFF0F0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('dashboard:sidebar.logout')}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
           <Outlet />
        </div>
      </div>
    </div>
  );
}
