import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPackages, saveWebsiteVisibility } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { Dropdown as CeDropdown, SearchBar, Toggle, Pagination, Checkbox, Infobox, EmptyState } from '../ce-ui';
import ImagePlaceholder from '../components/catalog/ImagePlaceholder';

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

function formatPrice(val) {
  if (val == null) return '-';
  return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
}
function formatWeight(p) { return p.gross_weight ? `${p.gross_weight} gr` : '-'; }
function formatVolume(p) {
  return (p.length && p.width && p.height) ? `${p.length} x ${p.width} x ${p.height} cm` : '-';
}

function EmptyIllustration() {
  return (
    <svg width="140" height="140" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <rect x="46" y="30" width="108" height="130" rx="8" fill="#F4F4F4" stroke="#E0E0E0" strokeWidth="1.5" strokeDasharray="6 4"/>
      <circle cx="88" cy="108" r="38" fill="white" stroke="#D0D0D0" strokeWidth="3"/>
      <circle cx="88" cy="108" r="28" fill="#F9F9F9" stroke="#D0D0D0" strokeWidth="2"/>
      <line x1="110" y1="130" x2="130" y2="155" stroke="#C0C0C0" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

function ImageThumb({ src }) {
  if (!src) return <ImagePlaceholder size={40} />;
  return (
    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

const TD = { padding: '16px 12px', borderBottom: '1px solid #E9E9E9', fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", verticalAlign: 'middle' };
const TH = { padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#282828', background: '#FFFFFF', borderBottom: '1px solid #D4D4D4', whiteSpace: 'nowrap', fontFamily: "'Lato', sans-serif" };

export default function PackageList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [packages, setPackages] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [draftKeyword, setDraftKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const keywordTimer = useRef(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetchPackages();
        if (alive) setPackages(res.data || []);
      } catch (e) {
        if (alive) setError(e.message || t('catalog:packages.failedToLoad'));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  function handleKeywordInput(e) {
    const val = e.target.value;
    setDraftKeyword(val);
    clearTimeout(keywordTimer.current);
    keywordTimer.current = setTimeout(() => { setKeyword(val); setPage(1); }, 300);
  }

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return kw ? packages.filter(p => p.name.toLowerCase().includes(kw)) : packages;
  }, [packages, keyword]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageRows = filtered.slice((page - 1) * size, page * size);
  const missingWeightOrVolume = !isLoading && packages.some(p => !p.gross_weight || !p.length || !p.width || !p.height);

  const allSelected  = pageRows.length > 0 && pageRows.every(p => selectedIds.has(p.id));
  const someSelected = pageRows.some(p => selectedIds.has(p.id));
  const selectedCount = selectedIds.size;

  function toggleSelect(id) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(pageRows.map(p => p.id)));
  }
  async function handleToggleVisibility(id, newValue) {
    const prev = packages.find(p => p.id === id)?.platform_status;
    setPackages(list => list.map(p => p.id === id ? { ...p, platform_status: newValue ? 'published' : 'draft' } : p));
    try {
      await saveWebsiteVisibility('package', id, newValue);
      showSnackbar(newValue ? t('catalog:packages.shown') : t('catalog:packages.hidden'), 'grey');
    } catch {
      setPackages(list => list.map(p => p.id === id ? { ...p, platform_status: prev } : p));
      showSnackbar(t('catalog:common.failedChangeVisibility'), 'red');
    }
  }
  function openBulkEdit() {
    const items = packages.filter(p => selectedIds.has(p.id));
    navigate('/catalog/package/bulk-edit', { state: { kind: 'package', backTo: '/catalog/package', items } });
  }

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
      <style>{`@keyframes loading-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4;} 40%{transform:scale(1);opacity:1;} }`}</style>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828', flexShrink: 0 }}>{t('catalog:packages.pageTitle')}</h1>

        {missingWeightOrVolume && (
          <div style={{ marginBottom: '20px', flexShrink: 0 }}>
            <Infobox variant="info" title={t('catalog:weightVolume.requiredTitle')}
              description={t('catalog:weightVolume.requiredDesc')} />
          </div>
        )}

        {/* Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 20px', borderBottom: '1px solid #D4D4D4', flexShrink: 0 }}>
            <div style={{ width: '320px' }}>
              <SearchBar value={draftKeyword} onChange={handleKeywordInput} placeholder={t('catalog:packages.searchPlaceholder')} />
            </div>
          </div>

          {/* Bulk selection bar */}
          {selectedCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#EFF6FF', borderBottom: '1px solid #D4D4D4', flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#282828' }}>{t('catalog:packages.selected', { count: selectedCount })}</span>
              <button onClick={openBulkEdit} style={{ background: '#006BFF', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>{t('catalog:common.bulkEdit')}</button>
            </div>
          )}

          {error && !isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>{t('catalog:packages.failedToLoad')}</p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{error}</p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ ...TH, width: '44px', padding: '16px 12px 16px 20px' }}>
                      <Checkbox checked={allSelected ? true : someSelected ? 'indeterminate' : false} onChange={toggleSelectAll} disabled={isLoading || pageRows.length === 0} />
                    </th>
                    <th style={TH}>{t('catalog:common.image')}</th>
                    <th style={TH}>{t('catalog:packages.columns.packageName')}</th>
                    <th style={TH}>{t('catalog:common.weightLabel')}</th>
                    <th style={TH}>{t('catalog:common.volumeLabel')}</th>
                    <th style={TH}>{t('catalog:common.sellingPrice')}</th>
                    <th style={{ ...TH, textAlign: 'right' }}>{t('catalog:common.websiteVisibility')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} style={{ padding: 0, borderBottom: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '80px 0' }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#006BFF', animation: `loading-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                      </div>
                    </td></tr>
                  ) : pageRows.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 0, borderBottom: 'none' }}>
                      <EmptyState illustration={<EmptyIllustration />}
                        title={keyword ? t('catalog:common.noSearchResultsTitle') : t('catalog:packages.emptyTitle')}
                        description={keyword ? t('catalog:common.noSearchResultsSub') : t('catalog:packages.emptySub')} />
                    </td></tr>
                  ) : (
                    pageRows.map(p => (
                      <tr key={p.id}
                        onClick={() => navigate(`/catalog/package/${p.id}`)}
                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...TD, padding: '16px 12px 16px 20px', width: '44px' }} onClick={e => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                        </td>
                        <td style={TD}><ImageThumb src={p.image_attached?.[0]?.document_public_url} /></td>
                        <td style={{ ...TD, fontWeight: 500, color: '#006BFF' }}>{p.name}</td>
                        <td style={{ ...TD, whiteSpace: 'nowrap' }}>{formatWeight(p)}</td>
                        <td style={{ ...TD, whiteSpace: 'nowrap' }}>{formatVolume(p)}</td>
                        <td style={{ ...TD, whiteSpace: 'nowrap' }}>{formatPrice(p.selling_price)}</td>
                        <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Toggle checked={p.platform_status === 'published'} onChange={checked => handleToggleVisibility(p.id, checked)} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!error && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '60px', borderTop: '1px solid #D4D4D4', gap: '12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <RowsSelector size={size} onChange={val => { setSize(Number(val)); setPage(1); }} />
                <span style={{ fontSize: '14px', color: '#282828', opacity: 0.5, whiteSpace: 'nowrap' }}>
                  {isLoading ? t('catalog:common.loadingEllipsis') : total === 0 ? t('catalog:common.noResults') : t('catalog:common.fromRows', { count: total })}
                </span>
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} hideSinglePage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
