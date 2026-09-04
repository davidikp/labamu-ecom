import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';
import { Dropdown as CeDropdown, SearchBar, Toggle, Pagination, Checkbox, Infobox, FilterPill, CTAButton } from '../ce-ui';
import { fetchProducts, fetchCategories, saveWebsiteVisibility } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';

// ─── Empty state illustration (magnifying glass + document) ─────────────────
function EmptyIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="46" y="30" width="108" height="130" rx="8" fill="#F4F4F4" stroke="#E0E0E0" strokeWidth="1.5"/>
      <rect x="62" y="57" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="73" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="89" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="105" width="50" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="121" width="62" height="8" rx="4" fill="#ECECEC"/>
      <circle cx="88" cy="108" r="38" fill="white" stroke="#D0D0D0" strokeWidth="3"/>
      <circle cx="88" cy="108" r="28" fill="#F9F9F9" stroke="#D0D0D0" strokeWidth="2"/>
      <line x1="110" y1="130" x2="130" y2="155" stroke="#C0C0C0" strokeWidth="6" strokeLinecap="round"/>
      <rect x="76" y="101" width="24" height="4" rx="2" fill="#D4D4D4"/>
      <rect x="76" y="110" width="18" height="4" rx="2" fill="#D4D4D4"/>
    </svg>
  );
}

function TableEmptyCell({ colSpan, title, subtitle }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '64px', paddingBottom: '72px', gap: '20px' }}>
          <EmptyIllustration />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '290px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#282828' }}>{title}</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 400, color: '#282828' }}>{subtitle}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

function TableLoadingCell({ colSpan, t }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '64px', paddingBottom: '72px', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '60px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#006BFF', animation: `loading-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '290px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#282828' }}>{t('catalog:products.loadingTitle')}</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 400, color: '#282828' }}>{t('catalog:products.loadingSubtitle')}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

function SortIcon({ column, sortKey, sortDir }) {
  const active = sortKey === column;
  const isAsc = active && sortDir === 'asc';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px', verticalAlign: 'middle', width: '17px', height: '17px', flexShrink: 0 }}>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: isAsc ? 'rotate(180deg)' : 'rotate(0deg)', color: active ? '#006BFF' : '#A9A9A9' }}>
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

function formatPrice(val) {
  if (val == null) return '-';
  const n = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  return `IDR ${n}`;
}

function formatWeight(p) {
  if (p.weight == null) return '-';
  return `${p.weight} gr`;
}

function formatVolume(p) {
  if (!p.length || !p.width || !p.height) return '-';
  return `${p.length} x ${p.width} x ${p.height} cm`;
}

const TD = {
  padding: '16px 12px',
  borderBottom: '1px solid #D4D4D4',
  fontSize: '14px',
  color: '#282828',
};

const SIZE_OPTIONS = [
  { id: '10', label: '10' },
  { id: '25', label: '25' },
  { id: '50', label: '50' },
];

const EMPTY_FILTERS = { categoryIds: [], keyword: '' };

export default function CatalogProducts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [products, setProducts]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [filters, setFilters]             = useState(EMPTY_FILTERS);
  const [draftKeyword, setDraftKeyword]   = useState('');
  const keywordTimer                      = useRef(null);
  const [sortKey, setSortKey]             = useState('updated_at');
  const [sortDir, setSortDir]             = useState('desc');
  const [page, setPage]                   = useState(1);
  const [size, setSize]                   = useState(25);
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [bulkLoading]                     = useState(false);
  const [categoryMap, setCategoryMap]     = useState({});

  useEffect(() => {
    fetchCategories({ size: 100 })
      .then(data => {
        const cats = data.data || [];
        const map = {};
        cats.forEach(c => { map[c.id] = c.name; });
        setCategoryMap(map);
        setCategoryOptions(cats.map(c => ({ value: c.id, label: c.name })));
        setCategoryTotal(data.meta?.total ?? cats.length);
      })
      .catch(() => {});
  }, []);

  const allSelected  = products.length > 0 && products.every(p => selectedIds.has(p.id));
  const someSelected = products.some(p => selectedIds.has(p.id));
  const selectedCount = selectedIds.size;

  function openBulkEdit() {
    const items = products.filter(p => selectedIds.has(p.id));
    navigate('/catalog/bulk-edit', { state: { kind: 'catalog', backTo: '/catalog', items } });
  }

  const loadProducts = useCallback(async () => {
    setSelectedIds(new Set());
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        page, size,
        categoryId: filters.categoryIds.length ? filters.categoryIds.join(',') : undefined,
        keyword: filters.keyword || undefined,
        sort: `${sortKey}:${sortDir}`,
      });
      setProducts(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, filters, sortKey, sortDir]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  function handleKeywordInput(e) {
    const val = e.target.value;
    setDraftKeyword(val);
    clearTimeout(keywordTimer.current);
    keywordTimer.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: val }));
      setPage(1);
    }, 350);
  }

  function handleSort(column) {
    if (sortKey === column) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(column);
      setSortDir('asc');
    }
    setPage(1);
  }

  function handleSizeChange(val) {
    setSize(Number(val));
    setPage(1);
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(products.map(p => p.id)));
  }

  async function handleToggleVisibility(productId, newValue) {
    const prev = products.find(p => p.id === productId)?.platform_status;
    // Optimistic update
    setProducts(list => list.map(p => p.id === productId ? { ...p, platform_status: newValue ? 'published' : 'draft' } : p));
    try {
      await saveWebsiteVisibility('catalog', productId, newValue);
      showSnackbar(newValue ? t('catalog:products.shown') : t('catalog:products.hidden'), 'grey');
    } catch {
      setProducts(list => list.map(p => p.id === productId ? { ...p, platform_status: prev } : p));
      showSnackbar(t('catalog:common.failedChangeVisibility'), 'red');
    }
  }

  const hasActiveFilters = !!(filters.categoryIds.length || filters.keyword);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const missingWeightOrVolume = !isLoading && products.some(p => p.weight == null || !p.length || !p.width || !p.height);

  const TH = ({ children, column, extraStyle }) => (
    <th
      onClick={column ? () => handleSort(column) : undefined}
      style={{
        padding: '16px 12px',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: 700,
        color: '#282828',
        background: '#FFFFFF',
        borderBottom: '1px solid #D4D4D4',
        whiteSpace: 'nowrap',
        cursor: column ? 'pointer' : 'default',
        userSelect: 'none',
        ...extraStyle,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {children}
        {column && <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes loading-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4;} 40%{transform:scale(1);opacity:1;} }
      `}</style>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

        {/* Page header */}
        <h1 style={{ margin: '0 0 16px', fontSize: '26px', fontWeight: 700, color: '#282828' }}>
          {t('dashboard:catalog.title', 'Catalog')}
        </h1>

        {/* Weight / Volume info banner */}
        {missingWeightOrVolume && (
          <div style={{ marginBottom: '16px', flexShrink: 0 }}>
            <Infobox variant="info" title={t('catalog:weightVolume.requiredTitle')}
              description={t('catalog:weightVolume.requiredDesc')} />
          </div>
        )}

        {/* Summary cards: Category / Unit — each takes 1/4 of the row width */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: '0 0 25%', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden' }}>
            <p style={{ margin: 0, padding: '16px', fontSize: '15px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #E9E9E9' }}>{t('catalog:common.category')}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '16px' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#7E7E7E' }}>{t('catalog:common.total')}</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#282828' }}>{categoryTotal}</p>
              </div>
              <CTAButton
                label={t('catalog:common.viewDetail')}
                variant="primary"
                size="lg"
                onClick={() => navigate('/catalog/manage-category?tab=category')}
                rightIcon={<span style={{ fontSize: '16px' }}>›</span>}
              />
            </div>
          </div>
          <div style={{ flex: '0 0 25%', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden' }}>
            <p style={{ margin: 0, padding: '16px', fontSize: '15px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #E9E9E9' }}>{t('catalog:common.unit')}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '16px' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#7E7E7E' }}>{t('catalog:common.total')}</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#282828' }}>{total}</p>
              </div>
              <CTAButton
                label={t('catalog:common.viewDetail')}
                variant="primary"
                size="lg"
                onClick={() => navigate('/catalog/manage-category?tab=unit')}
                rightIcon={<span style={{ fontSize: '16px' }}>›</span>}
              />
            </div>
          </div>
        </div>

        {/* Card — fills remaining height; only the table body scrolls */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>

          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #D4D4D4', gap: '12px', flexShrink: 0 }}>
            <FilterPill
              label={t('catalog:common.category')}
              multiple
              options={categoryOptions}
              values={filters.categoryIds}
              onChangeMultiple={vals => { setFilters(prev => ({ ...prev, categoryIds: vals })); setPage(1); }}
              searchable
            />
            <div style={{ width: '320px', flexShrink: 0 }}>
              <SearchBar
                value={draftKeyword}
                onChange={handleKeywordInput}
                placeholder={t('dashboard:catalog.searchPlaceholder', 'Search')}
              />
            </div>
          </div>

          {/* Bulk selection bar */}
          {selectedCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#EFF6FF', borderBottom: '1px solid #D4D4D4', flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                {t('catalog:products.selected', { count: selectedCount })}
              </span>
              <button
                onClick={openBulkEdit}
                style={{ background: '#006BFF', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}
              >
                {t('catalog:common.bulkEdit')}
              </button>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>
                {t('dashboard:catalog.errorTitle', 'Failed to load products')}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={loadProducts}
                style={{ background: 'none', border: '1px solid #D4D4D4', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }}
              >
                {t('dashboard:catalog.retry', 'Retry')}
              </button>
            </div>
          )}

          {/* Table — flexes to fill remaining space; only this region scrolls */}
          {!error && (
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ ...TD, padding: '16px 12px 16px 20px', width: '44px', fontWeight: 700, background: '#FFFFFF', borderBottom: '1px solid #D4D4D4' }}>
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onChange={toggleSelectAll}
                        disabled={isLoading || bulkLoading || products.length === 0}
                      />
                    </th>
                    <TH column="name">{t('dashboard:catalog.columns.catalogName', 'Catalog Name')}</TH>
                    <TH>{t('dashboard:catalog.columns.category', 'Category')}</TH>
                    <TH column="weight">{t('dashboard:catalog.columns.weight', 'Weight')}</TH>
                    <TH>{t('dashboard:catalog.columns.volume', 'Volume')}</TH>
                    <TH column="price">{t('dashboard:catalog.columns.sellingPrice', 'Selling Price')}</TH>
                    <TH column="visibility" extraStyle={{ textAlign: 'right' }}>{t('dashboard:catalog.columns.websiteVisibility', 'Website Visibility')}</TH>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? <TableLoadingCell colSpan={7} t={t} />
                    : products.length === 0
                      ? hasActiveFilters
                        ? <TableEmptyCell colSpan={7}
                            title={t('dashboard:catalog.emptyFiltered', 'No Search Results Found')}
                            subtitle={t('dashboard:catalog.emptyFilteredSub', 'Try searching with a different term, okay?')} />
                        : <TableEmptyCell colSpan={7}
                            title={t('dashboard:catalog.emptyDefault', 'No Products Yet')}
                            subtitle={t('dashboard:catalog.emptyDefaultSub', 'Add your first product to get started')} />
                      : products.map(p => (
                        <tr key={p.id}
                          onClick={() => navigate(`/catalog/${p.id}`)}
                          style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ ...TD, padding: '16px 12px 16px 20px', width: '44px' }} onClick={e => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(p.id)}
                              onChange={() => toggleSelect(p.id)}
                              disabled={bulkLoading}
                            />
                          </td>
                          <td style={{ ...TD, fontWeight: 500, maxWidth: '240px' }}>
                            <span
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                color: '#006BFF', fontSize: '14px', fontWeight: 500,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                              }}
                              title={p.name}
                            >
                              <Award size={14} style={{ flexShrink: 0 }} />
                              {p.name}
                            </span>
                          </td>
                          <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                            {categoryMap[p.category_id] || p.category_id || '-'}
                          </td>
                          <td style={{ ...TD, whiteSpace: 'nowrap' }}>{formatWeight(p)}</td>
                          <td style={{ ...TD, whiteSpace: 'nowrap' }}>{formatVolume(p)}</td>
                          <td style={{ ...TD, whiteSpace: 'nowrap' }}>{formatPrice(p.price)}</td>
                          <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Toggle
                                checked={p.platform_status === 'published'}
                                disabled={bulkLoading}
                                onChange={checked => handleToggleVisibility(p.id, checked)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* Footer — pinned to bottom */}
          {!error && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '60px', borderTop: '1px solid #D4D4D4', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <RowsSelector size={size} options={SIZE_OPTIONS} onChange={handleSizeChange} />
                <span style={{ fontSize: '14px', color: '#282828', opacity: 0.5, whiteSpace: 'nowrap' }}>
                  {isLoading ? t('catalog:common.loadingEllipsis') : total === 0 ? t('catalog:common.noResults') : t('catalog:common.fromRows', { count: total })}
                </span>
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                hideSinglePage
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RowsSelector({ size, options, onChange }) {
  return (
    <CeDropdown
      options={options.map(opt => ({ value: opt.id, label: opt.label }))}
      value={String(size)}
      onChange={onChange}
      size="sm"
      menuPosition="top"
      searchable={false}
      className="w-auto"
    />
  );
}
