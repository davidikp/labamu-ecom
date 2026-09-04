import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../../../../services/catalogService';
import { Toggle, Dropdown } from '../../../../ce-ui';

function ShopPanel({ enableCheckout, handleSetCheckout, featuredSections, handleSetFeaturedSections, t }) {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCatLoading(true);
    fetchCategories({ status: 'ACTIVE', has_published: true, size: 100 })
      .then(r => {
        if (cancelled) return;
        const loaded = r.data || [];
        setCategories(loaded);
        // Remove any configured sections whose category no longer has published products
        const validIds = new Set(loaded.map(c => c.id));
        const cleaned = featuredSections.filter(s => validIds.has(s.id));
        if (cleaned.length !== featuredSections.length) handleSetFeaturedSections(cleaned);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCatLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSlotChange = (idx, catId) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const next = [...featuredSections];
    next[idx] = { id: cat.id, name: cat.name };
    handleSetFeaturedSections(next);
  };

  const handleSlotRemove = (idx) => {
    const next = featuredSections.filter((_, i) => i !== idx);
    handleSetFeaturedSections(next);
  };

  const handleAddSlot = () => {
    if (featuredSections.length >= 2) return;
    const used = new Set(featuredSections.map(s => s.id));
    const first = categories.find(c => !used.has(c.id));
    if (!first) return;
    handleSetFeaturedSections([...featuredSections, { id: first.id, name: first.name }]);
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '100%' }}>
      {/* Checkout toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '32px' }}>
        <Toggle checked={enableCheckout} onChange={handleSetCheckout} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{t('studio.features.onlineCheckout')}</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
            {enableCheckout ? t('studio.features.shopOnlineDesc') : t('studio.features.shopCatalogDesc')}
          </div>
        </div>
      </div>

      {/* Featured homepage sections */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          {t('studio.panelContent.shop.sectionsTitle')}
        </div>
        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          {t('studio.panelContent.shop.sectionsDesc')}
        </div>

        {catLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: '40px', background: '#F3F4F6', borderRadius: '8px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {featuredSections.map((sec, idx) => {
              const usedIds = new Set(featuredSections.map((s, i) => i !== idx ? s.id : null));
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <Dropdown
                      value={sec.id}
                      onChange={(value) => handleSlotChange(idx, value)}
                      options={categories.map(cat => ({ value: cat.id, label: cat.name, disabled: usedIds.has(cat.id) }))}
                      size="sm"
                    />
                  </div>
                  <button
                    onClick={() => handleSlotRemove(idx)}
                    title={t('studio.panelContent.shop.removeSection')}
                    style={{ flexShrink: 0, width: '32px', height: '32px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              );
            })}

            {featuredSections.length < 2 && categories.length > 0 && (
              <button
                onClick={handleAddSlot}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1.5px dashed #D1D5DB', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#6B7280', width: '100%', justifyContent: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {t('studio.panelContent.shop.addSection')}
              </button>
            )}

            {categories.length === 0 && !catLoading && (
              <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '12px', background: '#F9FAFB', borderRadius: '8px', textAlign: 'center' }}>
                {t('studio.panelContent.shop.emptyState')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ShopPanel);
