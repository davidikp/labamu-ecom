import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, fetchProductModifiers } from '../services/catalogService';
import { Breadcrumbs } from '../ce-ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatOptionPrice(price, t) {
  if (!price) return t('dashboard:modifier.free');
  const n = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  return `+IDR ${n}`;
}

function ruleLabel(group, t) {
  return group.required
    ? t('dashboard:modifier.connected.ruleRequired', { max: group.max })
    : t('dashboard:modifier.connected.ruleOptional', { max: group.max });
}

// ─── Chevron ────────────────────────────────────────────────────────────────────
function Chevron({ up }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#282828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

// ─── Modifier group card ─────────────────────────────────────────────────────────
function ModifierCard({ group }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '12px', padding: '20px',
      breakInside: 'avoid', marginBottom: '20px',
      display: 'flex', flexDirection: 'column', gap: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", lineHeight: '22px', letterSpacing: '0.11px' }}>
            {group.name}
          </span>
          <span style={{ fontSize: '12px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", lineHeight: '18px', letterSpacing: '0.0825px', whiteSpace: 'nowrap' }}>
            {ruleLabel(group, t)}
          </span>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
          aria-label={open ? t('dashboard:modifier.connected.collapse') : t('dashboard:modifier.connected.expand')}
          aria-expanded={open}
        >
          <Chevron up={open} />
        </button>
      </div>

      {/* Options */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {group.options.map((opt, i) => (
            <div key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {i > 0 && <div style={{ height: '1px', background: '#E9E9E9' }} />}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", lineHeight: '20px', letterSpacing: '0.096px' }}>
                  {opt.name}
                </span>
                <span style={{ fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", lineHeight: '20px', letterSpacing: '0.096px', whiteSpace: 'nowrap' }}>
                  {formatOptionPrice(opt.price, t)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ConnectedModifiers() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [productName, setProductName] = useState('');
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const [prodRes, modRes] = await Promise.all([
          fetchProductById(id),
          fetchProductModifiers(id),
        ]);
        setProductName(prodRes.data?.name || t('dashboard:modifier.connected.catalogDetailFallback'));
        setGroups(modRes.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div style={{ padding: '24px', background: '#F4F4F4', minHeight: 'calc(100vh - 60px)', fontFamily: "'Lato', sans-serif" }}>
      <style>{`@keyframes skeleton-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <Breadcrumbs
          title={t('dashboard:modifier.connected.title')}
          breadcrumbs={[
            { name: t('dashboard:sidebar.catalog'), onClick: () => navigate('/catalog') },
            { name: loading ? '…' : productName, onClick: () => navigate(`/catalog/${id}`) },
          ]}
          onBack={() => navigate(`/catalog/${id}`)}
        />
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: '16px', color: '#D0021B' }}>{t('dashboard:modifier.loadError')}</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#7E7E7E' }}>{error}</p>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ columnCount: 3, columnGap: '20px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: '#FFFFFF', borderRadius: '12px', height: '157px', breakInside: 'avoid', marginBottom: '20px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {!loading && !error && groups.length === 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#282828' }}>{t('dashboard:modifier.connected.emptyTitle')}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E' }}>{t('dashboard:modifier.connected.emptyDescription')}</p>
        </div>
      )}

      {/* ── Masonry grid of modifier cards ────────────────────────────────────── */}
      {/* 1 modifier fills the full width; 2 use two equal columns; 3+ a 3-column masonry. */}
      {!loading && !error && groups.length > 0 && (
        <div style={{ columnCount: Math.min(groups.length, 3), columnGap: '20px' }}>
          {groups.map(group => <ModifierCard key={group.id} group={group} />)}
        </div>
      )}
    </div>
  );
}
