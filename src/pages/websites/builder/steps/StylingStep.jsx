import React from 'react';

const StylingStep = React.memo(({ primaryColor, fontFamily, updateConfig, t }) => (
  <div style={{ animation: 'fadeIn 0.3s ease' }}>
    <div style={{ position: 'sticky', top: '-24px', zIndex: 5, background: '#FFFFFF', margin: '-24px -24px 24px', padding: '24px 24px 20px', boxShadow: '0 1px 0 #E5E7EB' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>{t('studio.styling.title')}</h2>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{t('studio.styling.subtitle')}</p>
    </div>

    <div style={{ marginBottom: '32px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>{t('studio.basic.appearance.colors.title')}</div>
      <div style={{ fontSize: '12.5px', color: '#9CA3AF', marginBottom: '16px' }}>{t('studio.basic.appearance.colors.subtitle')}</div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {['#1D4ED8', '#7C3AED', '#DB2777', '#059669', '#111827'].map(color => (
          <button key={color} onClick={() => updateConfig('primaryColor', color)}
            style={{ width: '40px', height: '40px', borderRadius: '10px', background: color, border: primaryColor === color ? '3px solid #E5E7EB' : 'none', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: primaryColor === color ? `0 0 0 2px ${color}` : 'none', transform: primaryColor === color ? 'scale(1.1)' : 'none' }}
          />
        ))}
      </div>
    </div>

    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>{t('studio.basic.appearance.font.title')}</div>
      <div style={{ fontSize: '12.5px', color: '#9CA3AF', marginBottom: '16px' }}>{t('studio.basic.appearance.font.subtitle')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { id: 'modern', label: t('studio.basic.appearance.font.options.modern'), font: 'Inter' },
          { id: 'classic', label: t('studio.basic.appearance.font.options.classic'), font: 'Crimson Pro' },
          { id: 'soft', label: t('studio.basic.appearance.font.options.soft'), font: 'Outfit' },
          { id: 'bold', label: t('studio.basic.appearance.font.options.bold'), font: 'DM Sans' }
        ].map(f => (
          <button key={f.id} onClick={() => updateConfig('fontFamily', f.font)}
            style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', background: fontFamily === f.font ? '#F9FAFB' : '#FFFFFF', borderColor: fontFamily === f.font ? '#006BFF' : '#E5E7EB', textAlign: 'left', cursor: 'pointer', fontFamily: f.font }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{f.label}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{t('studio.features.fontPreviewSample')}</div>
          </button>
        ))}
      </div>
    </div>
  </div>
));

export default StylingStep;
