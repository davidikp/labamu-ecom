import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, Search, Tag, ShoppingBag, FileText, ScrollText, ChevronRight, ArrowLeft } from 'lucide-react';
import { POLICY_SYSTEM_TYPES } from '../../state/defaultTheme';

/**
 * @module section-builder/ui/fields/PageLinkCombobox
 * @description A "search or paste a link" combobox for menu item URLs
 * (Content > Menus), mirroring Shopify's own link picker: a default view
 * grouped under one "Online store" heading — Home page/Search as direct
 * picks, then Collections/Products/Pages/Blogs/Blog posts/Policies as
 * drill-down rows (`>`) into that category's own list, with a back arrow to
 * return — plus free-text search across everything once the merchant types.
 * Anything that doesn't match a suggestion — a raw path or an external URL —
 * is still accepted as free text, exactly like the field it replaces.
 *
 * This app has no real product/collection/blog catalog behind it today —
 * only `pages` (via the `pages` prop, `state.pages`) is real data, and
 * Policies is derived from that same `pages` list (the five reserved
 * written-policy system pages — see POLICY_SYSTEM_TYPES in
 * state/defaultTheme.js). Pages and Policies are both built from `pages`;
 * Collections/Products/Blogs/Blog posts remain static placeholder catalogs
 * below (MOCK_COLLECTIONS/MOCK_PRODUCTS) so the picker's *shape* matches
 * Shopify's now, ready to swap each list for a real fetch later without
 * touching the picker itself.
 *
 * The suggestion list is rendered through a portal to `document.body`
 * (same technique as components/ui/Dropdown.jsx) rather than absolutely
 * positioned inside this field's own wrapper — MenuFormDrawer's item list
 * needs `overflow-y: auto` to scroll when there are many items, and an
 * in-flow absolutely-positioned list gets clipped by that same scroll
 * boundary (and by the Popup's own scrollable body) once it would render
 * near the bottom of either. Portaling escapes both.
 */

// Static placeholder catalogs for the categories this app doesn't otherwise
// model (see module doc above) — shaped so each entry's `url` is exactly
// what Shopify itself would generate for that kind of resource.
const MOCK_COLLECTIONS = [
  { id: 'col-all', name: 'All', url: '/collections/all' },
  { id: 'col-featured', name: 'Featured', url: '/collections/featured' },
  { id: 'col-new-arrivals', name: 'New arrivals', url: '/collections/new-arrivals' },
  { id: 'col-best-sellers', name: 'Best sellers', url: '/collections/best-sellers' },
  { id: 'col-sale', name: 'Sale', url: '/collections/sale' },
];

const MOCK_PRODUCTS = [
  { id: 'prod-classic-tee', name: 'Classic tee', url: '/products/classic-tee' },
  { id: 'prod-denim-jacket', name: 'Denim jacket', url: '/products/denim-jacket' },
  { id: 'prod-canvas-tote', name: 'Canvas tote', url: '/products/canvas-tote' },
  { id: 'prod-leather-wallet', name: 'Leather wallet', url: '/products/leather-wallet' },
  { id: 'prod-wool-scarf', name: 'Wool scarf', url: '/products/wool-scarf' },
];

// Real data — Shopify's own fixed set (five written policies), authored from
// Settings > Policies and seeded into `pages` as reserved system pages (see
// POLICY_SYSTEM_TYPES / createDefaultPages in state/defaultTheme.js), so
// every store gets exactly these five and their URLs always match what's
// actually routable in the storefront preview.

export default function PageLinkCombobox({ value, onChange, pages, placeholder, className = 'w-1/2', error = false }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ top: 0, left: 0, width: 0 });
  // null = top-level "Online store" view; otherwise the key of whichever
  // category the merchant drilled into (see CATEGORIES below).
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  const blurTimeout = useRef(null);
  const inputRef = useRef(null);

  const query = value ?? '';

  // Real data (`pages`) alongside the static placeholder catalogs — each
  // entry normalized to the same `{id, name, url}` shape so search/render
  // below don't need to special-case Pages.
  const pageEntries = useMemo(() => pages.map((p) => ({ id: p.id, name: p.name, url: p.slug ?? '/' })), [pages]);
  const policyEntries = useMemo(
    () => pages.filter((p) => POLICY_SYSTEM_TYPES.includes(p.systemType)).map((p) => ({ id: p.id, name: p.name, url: p.slug ?? '/' })),
    [pages]
  );

  const CATEGORIES = useMemo(
    () => [
      { key: 'collections', label: 'Collections', icon: Tag, entries: MOCK_COLLECTIONS },
      { key: 'products', label: 'Products', icon: ShoppingBag, entries: MOCK_PRODUCTS },
      { key: 'pages', label: 'Pages', icon: FileText, entries: pageEntries },
      // Both blog categories ("Blogs" the blog list, "Blog posts" the
      // individual posts) are hidden here — same idea as
      // InsertVideoModal.jsx's own "From your Files" pull-back: nothing
      // deleted, just not offered as a category for now.
      { key: 'policies', label: 'Policies', icon: ScrollText, entries: policyEntries },
    ],
    [pageEntries, policyEntries]
  );

  const activeCategory = CATEGORIES.find((c) => c.key === activeCategoryKey) ?? null;

  // Once the merchant types anything, search wins over drill-down — a flat,
  // grouped-by-category list of matches across every category (including
  // the two static "Home page"/"Search" entries), same as Shopify's own
  // picker falling back to search results once there's a query.
  const searchGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const staticMatches = [
      { id: 'home', name: 'Home page', url: '/' },
      { id: 'search', name: 'Search', url: '/search' },
    ].filter((entry) => entry.name.toLowerCase().includes(q));
    const groups = [];
    if (staticMatches.length) groups.push({ label: 'Online store', icon: Home, entries: staticMatches });
    CATEGORIES.forEach((cat) => {
      const matches = cat.entries.filter((entry) => entry.name?.toLowerCase().includes(q)).slice(0, 5);
      if (matches.length) groups.push({ label: cat.label, icon: cat.icon, entries: matches });
    });
    return groups;
  }, [query, CATEGORIES]);

  const updatePlacement = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPlacement({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, []);

  // Recomputed on scroll/resize (capture:true so it catches scrolling from
  // any ancestor, e.g. the menu items list or the modal body — not just
  // window-level scroll) so the portaled list tracks the input instead of
  // freezing at whatever position it had when it opened.
  useEffect(() => {
    if (!open) return undefined;
    updatePlacement();
    window.addEventListener('scroll', updatePlacement, true);
    window.addEventListener('resize', updatePlacement);
    return () => {
      window.removeEventListener('scroll', updatePlacement, true);
      window.removeEventListener('resize', updatePlacement);
    };
  }, [open, updatePlacement]);

  const selectEntry = (entry) => {
    onChange(entry.url ?? '/');
    setOpen(false);
    setActiveCategoryKey(null);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so a click on a suggestion registers before the list unmounts.
          blurTimeout.current = window.setTimeout(() => {
            setOpen(false);
            setActiveCategoryKey(null);
          }, 150);
        }}
        placeholder={placeholder}
        className={`w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
          error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
        }`}
      />
      {open &&
        createPortal(
          <div
            style={{ position: 'fixed', top: placement.top, left: placement.left, width: placement.width, zIndex: 9999 }}
            className="max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {searchGroups ? (
              searchGroups.length > 0 ? (
                searchGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold text-gray-400">{group.label}</p>
                    {group.entries.map((entry) => (
                      <SuggestionRow key={entry.id} icon={group.icon} label={entry.name} onSelect={() => selectEntry(entry)} />
                    ))}
                  </div>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-gray-400">No matches</p>
              )
            ) : activeCategory ? (
              <div>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setActiveCategoryKey(null)}
                  className="flex w-full items-center gap-1.5 border-b border-gray-100 px-3 py-2 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <ArrowLeft size={14} aria-hidden />
                  {activeCategory.label}
                </button>
                {activeCategory.entries.length > 0 ? (
                  activeCategory.entries.map((entry) => (
                    <SuggestionRow key={entry.id} label={entry.name} onSelect={() => selectEntry(entry)} />
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-400">No {activeCategory.label.toLowerCase()} yet</p>
                )}
              </div>
            ) : (
              <div>
                <p className="px-3 pb-1 pt-2 text-xs font-semibold text-gray-400">Online store</p>
                <SuggestionRow icon={Home} label="Home page" onSelect={() => selectEntry({ url: '/' })} />
                <SuggestionRow icon={Search} label="Search" onSelect={() => selectEntry({ url: '/search' })} />
                {CATEGORIES.map((cat) => (
                  <SuggestionRow
                    key={cat.key}
                    icon={cat.icon}
                    label={cat.label}
                    trailing={<ChevronRight size={14} aria-hidden className="text-gray-400" />}
                    onSelect={() => setActiveCategoryKey(cat.key)}
                  />
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

function SuggestionRow({ icon: Icon, label, trailing, onSelect }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
    >
      {Icon && <Icon size={16} aria-hidden className="shrink-0 text-gray-500" />}
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}
