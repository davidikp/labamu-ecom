import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchModifiers } from '../services/catalogService';
import { Dropdown as CeDropdown, SearchBar, Pagination, EmptyState } from '../ce-ui';

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

const TD = { padding: '16px 20px', borderBottom: '1px solid #E9E9E9', fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const TH = { padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#282828', background: '#FFFFFF', borderBottom: '1px solid #D4D4D4', whiteSpace: 'nowrap', fontFamily: "'Lato', sans-serif" };

export default function ModifierList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [modifiers, setModifiers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [draftKeyword, setDraftKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const keywordTimer = useRef(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetchModifiers();
        if (alive) setModifiers(res.data || []);
      } catch (e) {
        if (alive) setError(e.message || t('dashboard:modifier.loadError'));
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
    return kw ? modifiers.filter(m => m.name.toLowerCase().includes(kw)) : modifiers;
  }, [modifiers, keyword]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageRows = filtered.slice((page - 1) * size, page * size);

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
      <style>{`@keyframes loading-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4;} 40%{transform:scale(1);opacity:1;} }`}</style>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828', flexShrink: 0 }}>{t('dashboard:sidebar.modifier')}</h1>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 20px', borderBottom: '1px solid #D4D4D4', flexShrink: 0 }}>
            <div style={{ width: '320px' }}>
              <SearchBar value={draftKeyword} onChange={handleKeywordInput} placeholder={t('common:dropdown.search')} />
            </div>
          </div>

          {error && !isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>{t('dashboard:modifier.loadError')}</p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{error}</p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '14px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ ...TH, width: '22%' }}>{t('dashboard:modifier.list.colName')}</th>
                    <th style={{ ...TH, width: '39%' }}>{t('dashboard:modifier.list.colOptions')}</th>
                    <th style={{ ...TH, width: '39%' }}>{t('dashboard:modifier.connectedCatalog')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={3} style={{ padding: 0, borderBottom: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '80px 0' }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#006BFF', animation: `loading-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                      </div>
                    </td></tr>
                  ) : pageRows.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: 0, borderBottom: 'none' }}>
                      <EmptyState illustration={<EmptyIllustration />}
                        title={keyword ? t('dashboard:modifier.list.emptyTitleSearch') : t('dashboard:modifier.list.emptyTitleDefault')}
                        description={keyword ? t('dashboard:modifier.list.emptyDescSearch') : t('dashboard:modifier.list.emptyDescDefault')} />
                    </td></tr>
                  ) : (
                    pageRows.map(m => (
                      <tr key={m.id}
                        onClick={() => navigate(`/catalog/modifier/${m.id}`)}
                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...TD, color: '#006BFF', fontWeight: 500 }}>{m.name}</td>
                        <td style={TD} title={m.options.map(o => o.name).join(', ')}>{m.options.map(o => o.name).join(', ')}</td>
                        <td style={TD} title={m.connected.join(', ')}>{m.connected.length > 0 ? m.connected.join(', ') : '-'}</td>
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
                  {isLoading ? t('dashboard:modifier.list.footerLoading') : total === 0 ? t('dashboard:modifier.list.footerNoResults') : t('dashboard:modifier.list.footerRows', { total })}
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
