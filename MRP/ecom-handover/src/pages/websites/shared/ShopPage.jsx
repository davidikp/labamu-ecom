import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 16;

const SORT_OPTION_IDS = ['newest', 'oldest', 'price_asc', 'price_desc'];
const SORT_LABEL_KEYS = {
  newest: 'website:shop.sort.newest',
  oldest: 'website:shop.sort.oldest',
  price_asc: 'website:shop.sort.priceAsc',
  price_desc: 'website:shop.sort.priceDesc',
};

function getSortOptions(t) {
  return SORT_OPTION_IDS.map(id => ({ id, label: t(SORT_LABEL_KEYS[id]) }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(value) {
  if (value == null || value === '') return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

function buildPages(current, total) {
  if (total <= 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set(
    [1, total, current - 1, current, current + 1].filter(p => p >= 1 && p <= total)
  );
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}

// ─── CategorySidebar ──────────────────────────────────────────────────────────

function CategorySidebar({
  categories, selected, onSelect, accentColor,
  priceMin, priceMax, onPriceChange,
  priceFilterOpen, onTogglePriceFilter,
}) {
  const { t } = useTranslation();
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const chevron = (open) => (
    <svg
      width="12" height="7" viewBox="0 0 12 7" fill="none"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', flexShrink: 0 }}
    >
      <path d="M1.2 6L6 1.2L10.8 6" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const accentBar = (
    <div style={{
      position: 'absolute', left: 0, top: '6px', bottom: '6px',
      width: '4px', background: accentColor, borderRadius: '0 4px 4px 0',
    }} />
  );

  return (
    <div style={{ width: '220px', flexShrink: 0, fontFamily: "'Lato', sans-serif" }}>

      {/* All Categories collapsible header */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px 10px 20px',
        fontSize: '14px', fontWeight: 700, color: '#111827',
        userSelect: 'none',
      }}>
        {accentBar}
        <span
          onClick={() => onSelect('all')}
          style={{ cursor: 'pointer', fontWeight: String(selected) === 'all' ? 700 : 400 }}
        >
          {t('website:shop.allCategories')}
        </span>
        <span onClick={() => setCategoriesOpen(o => !o)} style={{ cursor: 'pointer', display: 'flex' }}>
          {chevron(categoriesOpen)}
        </span>
      </div>

      {/* Expandable category list — indented */}
      {categoriesOpen && (
        <div style={{ paddingBottom: '8px' }}>
          {[{ id: 'all', name: t('website:shop.all') }, ...categories].map(cat => {
            const active = String(selected) === String(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                style={{
                  padding: '7px 16px 7px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: active ? 700 : 400,
                  color: active ? '#111827' : '#6B7280',
                  background: 'transparent',
                  transition: 'background 0.15s',
                  userSelect: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {cat.name}
              </div>
            );
          })}
        </div>
      )}

      {/* Price Filter section */}
      <div>
        <div
          onClick={onTogglePriceFilter}
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px 12px 20px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 700, color: '#111827',
            userSelect: 'none',
          }}
        >
          {accentBar}
          <span>{t('website:shop.priceFilter.label')}</span>
          {chevron(priceFilterOpen)}
        </div>

        {priceFilterOpen && (
          <div style={{ padding: '4px 16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PriceInput
              placeholder={t('website:shop.priceFilter.lowest')}
              value={priceMin}
              onChange={v => onPriceChange({ min: v, max: priceMax })}
            />
            <PriceInput
              placeholder={t('website:shop.priceFilter.highest')}
              value={priceMax}
              onChange={v => onPriceChange({ min: priceMin, max: v })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PriceInput({ placeholder, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid #E5E7EB',
      overflow: 'hidden', height: '40px',
    }}>
      <span style={{
        padding: '0 10px', color: '#9CA3AF', fontSize: '13px',
        borderRight: '1px solid #E5E7EB', height: '100%',
        display: 'flex', alignItems: 'center',
        background: '#F9FAFB', flexShrink: 0,
        fontFamily: "'Lato', sans-serif",
      }}>
        Rp
      </span>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          border: 'none', outline: 'none', flex: 1,
          padding: '0 10px', fontSize: '13px', color: '#111827',
          fontFamily: "'Lato', sans-serif", background: 'transparent',
        }}
      />
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onAction, onOpenDetail, enableCheckout, accentColor = '#006BFF' }) {
  const { t } = useTranslation();
  return (
    <div
      onClick={onOpenDetail ? () => onOpenDetail(product) : undefined}
      style={{ cursor: onOpenDetail ? 'pointer' : 'default', fontFamily: "'Lato', sans-serif" }}
    >
      {/* Image — 1:1 square, no rounded corners */}
      <div style={{
        width: '100%', aspectRatio: '1/1',
        background: '#F3F4F6',
        overflow: 'hidden', marginBottom: '10px',
        position: 'relative',
      }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Quick add to cart — only shown when online checkout is enabled */}
        {enableCheckout && onAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(product); }}
            style={{
              position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px',
              borderRadius: '50%', border: '1px solid #E5E7EB', background: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}
            aria-label={t('website:shop.addToCart')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontSize: '14px', color: '#111827', marginBottom: '4px',
        lineHeight: 1.4, overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {product.name}
      </div>

      {/* Price */}
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
        {formatRp(product.price)}
      </div>
    </div>
  );
}

// ─── MobileShopHeader ────────────────────────────────────────────────────────

function MobileShopHeader({
  from, to, total,
  categories, selectedCategory, onCategorySelect,
  sortKey, onSortChange, accentColor,
  priceMin, priceMax, onPriceChange,
}) {
  const { t } = useTranslation();
  const [catOpen,   setCatOpen]   = useState(false);
  const [sortOpen,  setSortOpen]  = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const catRef  = useRef(null);
  const sortRef = useRef(null);

  const sortOptions = getSortOptions(t);
  const allWithAll = [{ id: 'all', name: t('website:shop.all') }, ...categories];
  const activeCat  = allWithAll.find(c => String(c.id) === String(selectedCategory));
  const catLabel   = activeCat?.name || t('website:shop.all');
  const activeSort = sortOptions.find(o => o.id === sortKey) || sortOptions[0];

  useEffect(() => {
    function handler(e) {
      if (catRef.current  && !catRef.current.contains(e.target))  setCatOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const chevronSvg = (open) => (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
      <path d="M1 1L5 5L9 1" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const dropdownBase = {
    position: 'absolute', top: 'calc(100% + 4px)',
    background: '#FFFFFF', border: '1px solid #E5E7EB',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 200,
    minWidth: '180px', padding: '4px 0',
    fontFamily: "'Lato', sans-serif",
  };

  const dropItem = (active) => ({
    padding: '10px 16px', fontSize: '14px', cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    color: active ? '#111827' : '#374151',
    background: 'transparent',
  });

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>

      {/* Count */}
      <div style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
        {total === 0 ? t('website:shop.noProductsFound') : t('website:shop.countSummary', { from, to, total })}
      </div>

      {/* Category selector row */}
      <div ref={catRef} style={{ position: 'relative', textAlign: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', color: '#374151' }}>{t('website:shop.category')} </span>
        <span
          onClick={() => { setCatOpen(o => !o); setSortOpen(false); setPriceOpen(false); }}
          style={{ fontSize: '14px', fontWeight: 700, color: '#111827', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {catLabel}
          {chevronSvg(catOpen)}
        </span>

        {catOpen && (
          <div style={{ ...dropdownBase, left: '50%', transform: 'translateX(-50%)' }}>
            {allWithAll.map(cat => (
              <div
                key={cat.id}
                onClick={() => { onCategorySelect(cat.id); setCatOpen(false); }}
                style={dropItem(String(selectedCategory) === String(cat.id))}
                onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {cat.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <div style={{ borderTop: '1px solid #E5E7EB', margin: '0 -12px 12px' }} />

      {/* Filter chips row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>

        {/* Sort chip */}
        <div ref={sortRef} style={{ position: 'relative' }}>
          <div
            onClick={() => { setSortOpen(o => !o); setPriceOpen(false); setCatOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: '20px',
              cursor: 'pointer', fontSize: '13px', color: '#111827',
              background: '#FFFFFF', userSelect: 'none' }}
          >
            {activeSort.label}
            {chevronSvg(sortOpen)}
          </div>

          {sortOpen && (
            <div style={{ ...dropdownBase, left: 0 }}>
              {sortOptions.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => { onSortChange(opt.id); setSortOpen(false); }}
                  style={{ ...dropItem(opt.id === sortKey), color: opt.id === sortKey ? accentColor : '#374151' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter chip */}
        <div
          onClick={() => { setPriceOpen(o => !o); setSortOpen(false); setCatOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: '20px',
            cursor: 'pointer', fontSize: '13px', color: '#111827',
            background: '#FFFFFF', userSelect: 'none' }}
        >
          {t('website:shop.priceFilter.label')}
          {chevronSvg(priceOpen)}
        </div>
      </div>

      {/* Price filter inline expansion */}
      {priceOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <PriceInput placeholder={t('website:shop.priceFilter.lowest')}  value={priceMin}
            onChange={v => onPriceChange({ min: v, max: priceMax })} />
          <PriceInput placeholder={t('website:shop.priceFilter.highest')} value={priceMax}
            onChange={v => onPriceChange({ min: priceMin, max: v })} />
        </div>
      )}
    </div>
  );
}

// ─── ShopTopBar ───────────────────────────────────────────────────────────────

function ShopTopBar({ from, to, total, sortKey, onSortChange, accentColor = '#006BFF' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const sortOptions = getSortOptions(t);
  const activeSort = sortOptions.find(o => o.id === sortKey) || sortOptions[0];

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '16px', fontFamily: "'Lato', sans-serif",
    }}>
      <span style={{ fontSize: '13px', color: '#6B7280' }}>
        {total === 0
          ? t('website:shop.noProductsFound')
          : t('website:shop.countSummary', { from, to, total })}
      </span>

      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: '14px', fontWeight: 600, color: '#111827',
            fontFamily: "'Lato', sans-serif",
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <span style={{ color: '#6B7280', fontWeight: 400 }}>{t('website:shop.sortBy')}</span>
          {activeSort.label}
          <svg
            width="10" height="6" viewBox="0 0 10 6" fill="none"
            style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
          >
            <path d="M1 1L5 5L9 1" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 100,
            minWidth: '200px', padding: '4px 0',
            fontFamily: "'Lato', sans-serif",
          }}>
            {sortOptions.map(opt => (
              <div
                key={opt.id}
                onClick={() => { onSortChange(opt.id); setOpen(false); }}
                style={{
                  padding: '10px 16px', fontSize: '14px', cursor: 'pointer',
                  color: opt.id === sortKey ? accentColor : '#111827',
                  fontWeight: opt.id === sortKey ? 700 : 400,
                  background: 'transparent', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ShopPagination ───────────────────────────────────────────────────────────

function ShopPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = buildPages(currentPage, totalPages);

  const btnBase = {
    width: '36px', height: '36px', border: 'none', background: 'none',
    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Lato', sans-serif", fontSize: '14px',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '4px', marginTop: '40px',
    }}>
      {/* Prev */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          ...btnBase,
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          color: currentPage <= 1 ? '#D1D5DB' : '#374151',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`el-${i}`} style={{ width: '36px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              ...btnBase,
              border: p === currentPage ? '1px solid #111827' : 'none',
              fontWeight: p === currentPage ? 700 : 400,
              color: p === currentPage ? '#111827' : '#6B7280',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { if (p !== currentPage) e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          ...btnBase,
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          color: currentPage >= totalPages ? '#D1D5DB' : '#374151',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

// ─── ShopPage ─────────────────────────────────────────────────────────────────

export default function ShopPage({
  products = [],
  categories = [],
  totalCount,
  currentPage: currentPageProp = 1,
  pageSize = PAGE_SIZE,
  onCategoryChange,
  onPriceChange,
  onSortChange,
  onPageChange,
  accentColor = '#006BFF',
  isMobile = false,
  handleDemoAction,
  onOpenDetail,
  enableCheckout = false,
  sortKey: sortKeyProp,
  initialCategory = 'all',
}) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceMin, setPriceMin]       = useState('');
  const [priceMax, setPriceMax]       = useState('');
  const [sortKey, setSortKey]         = useState('newest');
  const [priceFilterOpen, setPriceFilterOpen] = useState(true);
  const [internalPage, setInternalPage] = useState(1);

  // Strip 'all' sentinel — CategorySidebar prepends it internally; avoid duplication
  const cleanCategories = categories.filter(c => c.id !== 'all');

  // Uncontrolled when no callbacks provided — filter/sort/paginate client-side
  const uncontrolled = !onCategoryChange && !onSortChange && !onPageChange;

  const filteredSorted = useMemo(() => {
    let result = [...products];
    if (uncontrolled && selectedCategory !== 'all')
      result = result.filter(p => String(p.category_id) === selectedCategory);
    // Price filter is always client-side (no API support for price range)
    if (priceMin !== '')
      result = result.filter(p => p.price >= Number(priceMin));
    if (priceMax !== '')
      result = result.filter(p => p.price <= Number(priceMax));
    if (uncontrolled) {
      result.sort((a, b) => {
        if (sortKey === 'price_asc')  return a.price - b.price;
        if (sortKey === 'price_desc') return b.price - a.price;
        if (sortKey === 'oldest')     return new Date(a.updated_at) - new Date(b.updated_at);
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
    }
    return result;
  }, [uncontrolled, products, selectedCategory, priceMin, priceMax, sortKey]);

  const effectiveTotal = uncontrolled ? filteredSorted.length : (totalCount ?? products.length);
  const effectivePage  = uncontrolled ? internalPage : currentPageProp;
  const totalPages     = Math.max(1, Math.ceil(effectiveTotal / pageSize));
  const pagedProducts  = uncontrolled
    ? filteredSorted.slice((effectivePage - 1) * pageSize, effectivePage * pageSize)
    : filteredSorted;

  const from = effectiveTotal === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const to   = Math.min(effectivePage * pageSize, effectiveTotal);

  function handleCategorySelect(id) {
    setSelectedCategory(String(id));
    setInternalPage(1);
    if (onCategoryChange) onCategoryChange(id);
  }
  function handlePriceChange({ min, max }) {
    setPriceMin(min); setPriceMax(max);
    setInternalPage(1);
    if (onPriceChange) onPriceChange({ min, max });
  }
  function handleSortChange(key) {
    setSortKey(key);
    setInternalPage(1);
    if (onSortChange) onSortChange(key);
  }
  function handlePageChange(page) {
    setInternalPage(page);
    if (onPageChange) onPageChange(page);
  }

  const cols = isMobile ? 2 : 4;

  return (
    <div style={{
      display: 'flex', fontFamily: "'Lato', sans-serif",
      minHeight: '100vh', background: '#FFFFFF',
    }}>
      {/* Sidebar — hidden on mobile (MVP1: column count only) */}
      {!isMobile && (
        <div style={{
          width: '240px', flexShrink: 0,
          padding: '32px 0',
        }}>
          <CategorySidebar
            categories={cleanCategories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
            accentColor={accentColor}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceChange={handlePriceChange}
            priceFilterOpen={priceFilterOpen}
            onTogglePriceFilter={() => setPriceFilterOpen(o => !o)}
          />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, padding: isMobile ? '16px 12px' : '32px 0 32px 32px' }}>
        {isMobile ? (
          <MobileShopHeader
            from={from} to={to} total={effectiveTotal}
            categories={cleanCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            sortKey={sortKeyProp || sortKey}
            onSortChange={handleSortChange}
            accentColor={accentColor}
            priceMin={priceMin} priceMax={priceMax}
            onPriceChange={handlePriceChange}
          />
        ) : (
          <>
            <ShopTopBar
              from={from} to={to} total={effectiveTotal}
              sortKey={sortKeyProp || sortKey}
              onSortChange={handleSortChange}
              accentColor={accentColor}
            />
            {/* Separator between top bar and grid */}
            <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '24px' }} />
          </>
        )}

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: isMobile ? '12px' : '24px',
        }}>
          {pagedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              enableCheckout={enableCheckout}
              accentColor={accentColor}
              onAction={handleDemoAction || undefined}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>

        {pagedProducts.length === 0 && (
          selectedCategory === 'all' && priceMin === '' && priceMax === ''
            ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 16px' }}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  {t('website:shop.catalogNotAvailable')}
                </div>
                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  {t('website:shop.catalogNotAvailableDesc')}
                </div>
              </div>
            )
            : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF', fontSize: '14px' }}>
                {t('website:shop.noProductsFoundPeriod')}
              </div>
            )
        )}

        <ShopPagination
          currentPage={effectivePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
