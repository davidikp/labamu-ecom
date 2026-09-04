import React from 'react';
import { Link as LinkIcon, GripVertical, X } from 'lucide-react';

const FeaturesStep = React.memo(({
  featureOrder, selectedFeatures, enableCheckout, customPages,
  AVAILABLE_FEATURES, draggedIdx, dropTargetIdx,
  handleToggleFeature, handleAddCustomPage, handleRemoveCustomPage, handleRenameCustomPage,
  handleDragStart, handleDragEnd, handleDragOver, handleDrop,
  handleContainerDragOver, handleEndZoneDragOver,
  handleSetCheckout, t,
}) => (
  <div style={{ animation: 'fadeIn 0.3s ease' }}>
    <div style={{ position: 'sticky', top: '-24px', zIndex: 5, background: '#FFFFFF', margin: '-24px -24px 24px', padding: '24px 24px 20px', boxShadow: '0 1px 0 #E5E7EB' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>{t('studio.features.title')}</h2>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{t('studio.features.subtitle')}</p>
    </div>

    <div
      onDragOver={handleContainerDragOver}
      onDrop={handleDrop}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}
    >
      {featureOrder.map((id, index) => {
        const found = AVAILABLE_FEATURES.find(f => f.id === id);
        const feature = found ? { ...found, label: found.title } : {
          id, label: customPages?.[id] ?? t('studio.customPage.defaultTitle'),
          description: t('studio.customPage.defaultMenuLink'), icon: LinkIcon, isCustom: true
        };
        const isSelected = selectedFeatures.has(id);

        const handleToggle = (e) => {
          if (['INPUT', 'SVG', 'BUTTON', 'LABEL'].includes(e.target.tagName)) return;
          handleToggleFeature(id, isSelected);
        };

        return (
          <div
            key={id} draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onClick={handleToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px',
              background: '#FFFFFF', border: isSelected ? '1px solid #006BFF' : '1px solid #E5E7EB',
              borderRadius: '12px', cursor: 'pointer', position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
              boxShadow: draggedIdx === index ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
              transform: draggedIdx === index ? 'scale(0.98)' : 'none',
              zIndex: draggedIdx === index ? 10 : 1,
              marginTop: (dropTargetIdx === index && draggedIdx !== index) ? '32px' : '0',
            }}
          >
            <GripVertical size={16} color="#C9CDD4" style={{ flexShrink: 0, cursor: 'grab' }} />
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: isSelected ? 'none' : '1.5px solid #C9CDD4', background: isSelected ? '#006BFF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
              {isSelected && (<svg width="10" height="8" viewBox="0 0 12 9" fill="none" style={{ pointerEvents: 'none' }}><path d="M10.5 1.5L4.5 7.5L1.5 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', flexShrink: 0 }}>
              {feature?.icon ? <feature.icon size={20} strokeWidth={2} /> : <LinkIcon size={20} strokeWidth={2} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {feature.isCustom && isSelected ? (
                <input
                  value={feature.label}
                  onChange={(e) => handleRenameCustomPage(id, e.target.value)}
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #E5E7EB', fontSize: '15px', fontWeight: 700, color: '#111827', width: '100%', padding: '0', outline: 'none', fontFamily: 'inherit', lineHeight: '1.3', marginBottom: '3px' }}
                  onClick={e => e.stopPropagation()}
                  placeholder={t('studio.features.pageName')}
                />
              ) : (
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', lineHeight: '1.3', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {id === 'shop' ? (enableCheckout ? t('studio.features.shopOnlineTitle') : t('studio.features.shopCatalogTitle')) : feature.label}
                </div>
              )}
              <div style={{ fontSize: '12.5px', color: '#9CA3AF', lineHeight: '1.4' }}>
                {id === 'shop' ? (enableCheckout ? t('studio.features.shopOnlineDesc') : t('studio.features.shopCatalogDesc')) : feature.description}
              </div>
              {id === 'shop' && isSelected && (
                <div
                  onClick={(e) => { e.stopPropagation(); handleSetCheckout(!enableCheckout); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: enableCheckout ? '#006BFF' : '#E5E7EB', position: 'relative', transition: 'all 0.2s' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: enableCheckout ? '16px' : '2px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>{t('studio.features.onlineCheckout')}</span>
                </div>
              )}
            </div>
            {feature.isCustom && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveCustomPage(id); }}
                style={{ position: 'absolute', top: '0', right: '0', transform: 'translate(50%, -50%)', background: '#FFF5F5', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 5px rgba(239, 68, 68, 0.15)', zIndex: 10, transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#FFF5F5'; e.currentTarget.style.color = '#EF4444'; }}
              >
                <X size={12} strokeWidth={2} style={{ width: '12px', height: '12px', flexShrink: 0 }} />
              </button>
            )}
          </div>
        );
      })}

      <div
        onClick={handleAddCustomPage}
        style={{ marginTop: '12px', width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #006BFF', background: '#FFFFFF', color: '#006BFF', fontSize: '13px', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' }}
        onMouseOver={e => e.currentTarget.style.background = '#EEF4FF'}
        onMouseOut={e => e.currentTarget.style.background = '#FFFFFF'}
      >
        {t('studio.features.addCustom')}
      </div>

      {draggedIdx !== null && (
        <div
          onDragOver={(e) => handleEndZoneDragOver(e, featureOrder.length)}
          style={{ height: '40px', marginTop: '10px' }}
        />
      )}
    </div>
  </div>
));

export default FeaturesStep;
