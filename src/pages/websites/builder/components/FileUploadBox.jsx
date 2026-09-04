import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIconButton from './DeleteIconButton';

const FileUploadBox = React.memo(({ label, onUpload, onRemove, value, index }) => {
  const { t } = useTranslation();
  return (
  <div style={{ marginBottom: '24px', position: 'relative' }}>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      {value ? (
        <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
          <img src={value} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <DeleteIconButton onClick={() => onRemove(index)} style={{ position: 'absolute', top: '4px', right: '4px' }} />
        </div>
      ) : (
        <div
          onClick={() => onUpload(index)}
          style={{ width: '120px', height: '120px', borderRadius: '12px', border: '1px dashed #D1D5DB', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#006BFF'}
          onMouseOut={e => e.currentTarget.style.borderColor = '#D1D5DB'}
        >
          <div style={{ color: '#9CA3AF' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
        </div>
      )}
      {!value && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{t('website:studio.upload.dragDrop')}</div>
          <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '2px' }}>{t('website:studio.upload.acceptedFormats')}</div>
          <div style={{ fontSize: '13px', color: '#9CA3AF' }}>{t('website:studio.upload.maxSize')}</div>
        </div>
      )}
      {value && <div style={{ flex: 1 }}><div style={{ fontSize: '14px', color: '#6B7280' }}>{t('website:studio.upload.uploadedSuffix', { label })}</div></div>}
    </div>
  </div>
  );
});

export default FileUploadBox;
