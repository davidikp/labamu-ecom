import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchProducts, fetchUnits } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import { Dropdown as CeDropdown, Tabs, Breadcrumbs, Infobox, EmptyState, SearchBar } from '../ce-ui';

// ─── Sort chevron ─────────────────────────────────────────────────────────────
function SortIcon({ active, dir }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px', width: '17px', height: '17px', flexShrink: 0 }}>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
        style={{ transition: 'transform 0.2s', transform: active && dir === 'asc' ? 'rotate(180deg)' : 'none', color: active ? '#006BFF' : '#A9A9A9' }}>
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

// ─── Shared cell / header styles ──────────────────────────────────────────────
const TD = { padding: '16px 20px', borderBottom: '1px solid #E9E9E9', fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif" };
const THEAD = { padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#282828', background: '#FFFFFF', borderBottom: '1px solid #D4D4D4', whiteSpace: 'nowrap', fontFamily: "'Lato', sans-serif", userSelect: 'none' };

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyIllustration() {
  return (
    <svg width="140" height="140" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <rect x="46" y="30" width="108" height="130" rx="8" fill="#F4F4F4" stroke="#E0E0E0" strokeWidth="1.5" strokeDasharray="6 4"/>
      <rect x="62" y="57" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="73" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="89" width="76" height="8" rx="4" fill="#ECECEC"/>
      <circle cx="88" cy="108" r="38" fill="white" stroke="#D0D0D0" strokeWidth="3"/>
      <circle cx="88" cy="108" r="28" fill="#F9F9F9" stroke="#D0D0D0" strokeWidth="2"/>
      <line x1="110" y1="130" x2="130" y2="155" stroke="#C0C0C0" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Loading dots ─────────────────────────────────────────────────────────────
function LoadingRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '80px', paddingBottom: '80px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#006BFF', animation: `loading-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </td>
    </tr>
  );
}

// ─── Pagination helpers ───────────────────────────────────────────────────────
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 4) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 3) pages.push('…');
  pages.push(total);
  return pages;
}

function StepBtn({ children, onClick, disabled, active, outlined }) {
  return (
    <IconButton icon={children} onClick={onClick} disabled={disabled}
      variant={active ? 'primary' : outlined ? 'secondary' : 'ghost'} size="sm" />
  );
}

const SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

function RowsSelector({ size, onChange }) {
  return (
    <CeDropdown options={SIZE_OPTIONS} value={String(size)} onChange={onChange}
      size="sm" menuPosition="top" searchable={false} className="w-auto" />
  );
}

const FOOTER_STYLE = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '60px', borderTop: '1px solid #E9E9E9', gap: '12px', flexShrink: 0 };
const FOOTER_TEXT = { fontSize: '14px', color: '#282828', opacity: 0.5, whiteSpace: 'nowrap' };

// ─── Full footer with rows selector + pagination (unit tab) ───────────────────
function PagedFooter({ size, onSizeChange, total, page, totalPages, onPage, t }) {
  const pageList = buildPageList(page, totalPages);
  return (
    <div style={FOOTER_STYLE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <RowsSelector size={size} onChange={onSizeChange} />
        <span style={FOOTER_TEXT}>{total === 0 ? t('catalog:common.noResults') : t('catalog:common.fromRows', { count: total })}</span>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <StepBtn onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1} outlined>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </StepBtn>
          {pageList.map((item, i) =>
            item === '…'
              ? <span key={`e${i}`} style={{ width: '30px', textAlign: 'center', fontSize: '14px', color: '#282828' }}>...</span>
              : <StepBtn key={item} active={item === page} onClick={() => onPage(item)}>{item}</StepBtn>
          )}
          <StepBtn onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} outlined>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </StepBtn>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CatalogSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'unit' ? 'unit' : 'category';
  const setTab = next => setSearchParams(prev => {
    const p = new URLSearchParams(prev);
    p.set('tab', next);
    return p;
  }, { replace: true });

  // ── Category state ───────────────────────────────────────────────────────
  const [allCategories, setAllCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [catLoading, setCatLoading]   = useState(true);
  const [catError, setCatError]       = useState(null);
  const [catSearch, setCatSearch]     = useState('');
  const [manualOrder, setManualOrder] = useState(null); // array of ids, or null
  const [reordering, setReordering]   = useState(false);
  const [reorderList, setReorderList] = useState([]);    // working copy during reorder
  const dragIndex = useRef(null);

  // ── Unit state ──────────────────────────────────────────────────────────
  const [allUnits, setAllUnits]   = useState([]);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitError, setUnitError] = useState(null);
  const [unitSearch, setUnitSearch] = useState('');
  const [unitSortDir, setUnitSortDir] = useState(null); // null | 'asc' | 'desc'
  const [unitPage, setUnitPage] = useState(1);
  const [unitSize, setUnitSize] = useState(25);

  // ── Load categories ────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setCatLoading(true); setCatError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchCategories({ size: 100, sort: 'name:asc' }),
          fetchProducts({ size: 100 }),
        ]);
        setAllCategories(catRes.data || []);
        const counts = {};
        (prodRes.data || []).forEach(p => { counts[p.category_id] = (counts[p.category_id] || 0) + 1; });
        setProductCounts(counts);
      } catch (e) {
        setCatError(e.message || t('catalog:settings.failedLoadCategories'));
      } finally {
        setCatLoading(false);
      }
    }
    load();
  }, []);

  // ── Load units ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setUnitLoading(true); setUnitError(null);
      try {
        const res = await fetchUnits();
        setAllUnits(res.data || []);
      } catch (e) {
        setUnitError(e.message || t('catalog:settings.failedLoadUnits'));
      } finally {
        setUnitLoading(false);
      }
    }
    load();
  }, []);

  // ── Derived: ordered + filtered categories ───────────────────────────────
  const orderedCategories = useMemo(() => {
    if (!manualOrder) return allCategories;
    const byId = new Map(allCategories.map(c => [c.id, c]));
    const ordered = manualOrder.map(id => byId.get(id)).filter(Boolean);
    allCategories.forEach(c => { if (!manualOrder.includes(c.id)) ordered.push(c); });
    return ordered;
  }, [allCategories, manualOrder]);

  const filteredCategories = useMemo(() => {
    const kw = catSearch.trim().toLowerCase();
    if (!kw) return orderedCategories;
    return orderedCategories.filter(c => (c.name || '').toLowerCase().includes(kw));
  }, [orderedCategories, catSearch]);

  // ── Derived: filtered + sorted units ──────────────────────────────────────
  const filteredUnits = useMemo(() => {
    const kw = unitSearch.trim().toLowerCase();
    let rows = kw ? allUnits.filter(u => (u.name || '').toLowerCase().includes(kw)) : allUnits;
    if (unitSortDir) {
      rows = [...rows].sort((a, b) =>
        unitSortDir === 'asc' ? a.catalogCount - b.catalogCount : b.catalogCount - a.catalogCount);
    }
    return rows;
  }, [allUnits, unitSearch, unitSortDir]);

  const unitTotalPages = Math.max(1, Math.ceil(filteredUnits.length / unitSize));
  const unitPageRows = filteredUnits.slice((unitPage - 1) * unitSize, unitPage * unitSize);

  // ── Reorder handlers ──────────────────────────────────────────────────────
  function startReorder() {
    setReorderList(orderedCategories);
    setReordering(true);
  }
  function cancelReorder() {
    setReordering(false);
    setReorderList([]);
    dragIndex.current = null;
  }
  function saveReorder() {
    setManualOrder(reorderList.map(c => c.id));
    setReordering(false);
    setReorderList([]);
    dragIndex.current = null;
    showSnackbar(t('catalog:settings.categoryOrderUpdated'), 'success');
  }
  function handleDrop(targetIdx) {
    const from = dragIndex.current;
    if (from == null || from === targetIdx) return;
    setReorderList(list => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    dragIndex.current = null;
  }

  const catRows = reordering ? reorderList : filteredCategories;

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
      <style>{`@keyframes loading-dot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }`}</style>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

        {/* Page header (static) */}
        <div style={{ marginBottom: '20px', flexShrink: 0 }}>
          <Breadcrumbs
            title={t('catalog:settings.title')}
            breadcrumbs={[{ name: t('catalog:common.catalogLabel'), onClick: () => navigate('/catalog') }]}
            onBack={() => navigate('/catalog')}
          />
        </div>

        {/* Card — hugs content when short, caps to available height (table scrolls) when tall */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* Tabs + search (static) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #E9E9E9', gap: '12px', flexShrink: 0 }}>
            <Tabs
              tabs={[{ id: 'category', label: t('catalog:common.category') }, { id: 'unit', label: t('catalog:common.unit') }]}
              activeTab={tab}
              onChange={next => { if (!reordering) setTab(next); }}
            />
            <div style={{ width: '240px', flexShrink: 0 }}>
              {tab === 'category'
                ? <SearchBar value={catSearch} onChange={e => setCatSearch(e.target.value)} placeholder={t('catalog:settings.searchCategoryPlaceholder')} size="sm" />
                : <SearchBar value={unitSearch} onChange={e => { setUnitSearch(e.target.value); setUnitPage(1); }} placeholder={t('catalog:settings.searchUnitPlaceholder')} size="sm" />}
            </div>
          </div>

          {/* ── Category tab ──────────────────────────────────────────────────── */}
          {tab === 'category' && (
            <>
              {/* Banner + action (static) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '16px 20px 0', flexShrink: 0 }}>
                <Infobox variant="info" message={reordering
                  ? t('catalog:settings.dragInstructions')
                  : t('catalog:settings.reorderWarning')} />
                {reordering ? (
                  <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                    <Button variant="secondary" size="small" onClick={cancelReorder}>{t('catalog:common.cancel')}</Button>
                    <Button variant="primary" size="small" onClick={saveReorder}>{t('catalog:settings.saveCategoryOrder')}</Button>
                  </div>
                ) : (
                  <button onClick={startReorder} disabled={catLoading || filteredCategories.length === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: catLoading ? 'default' : 'pointer', fontSize: '14px', fontWeight: 700, color: '#006BFF', fontFamily: "'Lato', sans-serif", flexShrink: 0, opacity: catLoading ? 0.5 : 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                    {t('catalog:settings.changeCategoryOrder')}
                  </button>
                )}
              </div>

              {/* Table (scrollable body) */}
              {catError && !catLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444' }}>{catError}</p>
                </div>
              ) : (
                <div style={{ overflowY: 'auto', flex: '0 1 auto', minHeight: 0, marginTop: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '14px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        {reordering && <th style={{ ...THEAD, width: '56px', padding: '16px 0 16px 20px' }} />}
                        <th style={THEAD}>{t('catalog:settings.columns.categoryName')}</th>
                        <th style={THEAD}>{t('catalog:settings.columns.totalProducts')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catLoading ? (
                        <LoadingRow colSpan={reordering ? 3 : 2} />
                      ) : catRows.length === 0 ? (
                        <tr>
                          <td colSpan={2} style={{ padding: 0, borderBottom: 'none' }}>
                            <EmptyState
                              illustration={<EmptyIllustration />}
                              title={catSearch ? t('catalog:common.noSearchResultsTitle') : t('catalog:settings.noCategoryTitle')}
                              description={catSearch ? t('catalog:common.noSearchResultsSub') : t('catalog:settings.noCategorySub')}
                            />
                          </td>
                        </tr>
                      ) : reordering ? (
                        reorderList.map((cat, idx) => (
                          <tr key={cat.id}
                            draggable
                            onDragStart={() => { dragIndex.current = idx; }}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => handleDrop(idx)}
                            style={{ cursor: 'grab', background: '#FFFFFF' }}>
                            <td style={{ ...TD, padding: '16px 0 16px 20px', color: '#A9A9A9' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                                <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
                              </svg>
                            </td>
                            <td style={{ ...TD, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</td>
                            <td style={TD}>{productCounts[cat.id] || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        filteredCategories.map(cat => (
                          <tr key={cat.id} style={{ transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ ...TD, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</td>
                            <td style={TD}>{productCounts[cat.id] || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer — row count only (no pagination; drag reorder needs all rows) */}
              {!catError && !catLoading && catRows.length > 0 && (
                <div style={FOOTER_STYLE}>
                  <span style={FOOTER_TEXT}>{t('catalog:common.showFromRows', { shown: filteredCategories.length, total: allCategories.length })}</span>
                </div>
              )}
            </>
          )}

          {/* ── Unit tab ──────────────────────────────────────────────────────── */}
          {tab === 'unit' && (
            <>
              {unitError && !unitLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444' }}>{unitError}</p>
                </div>
              ) : (
                <div style={{ overflowY: 'auto', flex: '0 1 auto', minHeight: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '14px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={THEAD}>{t('catalog:common.unit')}</th>
                        <th style={{ ...THEAD, cursor: 'pointer' }}
                          onClick={() => { setUnitSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'); setUnitPage(1); }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {t('catalog:settings.columns.numberOfCatalog')}
                            <SortIcon active={!!unitSortDir} dir={unitSortDir} />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitLoading ? (
                        <LoadingRow colSpan={2} />
                      ) : filteredUnits.length === 0 ? (
                        <tr>
                          <td colSpan={2} style={{ padding: 0, borderBottom: 'none' }}>
                            <EmptyState
                              illustration={<EmptyIllustration />}
                              title={unitSearch ? t('catalog:common.noSearchResultsTitle') : t('catalog:settings.noUnitTitle')}
                              description={unitSearch ? t('catalog:common.noSearchResultsSub') : t('catalog:settings.noUnitSub')}
                            />
                          </td>
                        </tr>
                      ) : (
                        unitPageRows.map(u => (
                          <tr key={u.id} style={{ transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ ...TD, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</td>
                            <td style={TD}>{u.catalogCount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!unitError && !unitLoading && filteredUnits.length > 0 && (
                <PagedFooter
                  size={unitSize} onSizeChange={v => { setUnitSize(Number(v)); setUnitPage(1); }}
                  total={filteredUnits.length} page={unitPage} totalPages={unitTotalPages} onPage={setUnitPage}
                  t={t}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
