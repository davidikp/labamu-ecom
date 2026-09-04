import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * PreviewLayout: A wrapper for template previews that adds common "Demo Mode" features.
 */
export default function PreviewLayout({ children }) {
  const [showToast, setShowToast] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');
  const { t } = useTranslation();

  const handleAction = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const clonedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { handleDemoAction: handleAction, isMobile: viewMode === 'mobile' });
    }
    return child;
  });

  return (
    <div className="preview-container" style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', background: viewMode === 'mobile' ? '#F3F4F6' : '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Top Banner */}
      <div style={{
        flexShrink: 0,
        width: '100%',
        height: '56px',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'center',
        zIndex: 999999,
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          position: 'absolute', left: '24px', fontSize: '13px', fontWeight: 500, color: '#6B7280',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>⚠️</span>
          {t('website:template_houzez.previewOnly', 'You are currently viewing a demo preview')}
        </div>

        {/* Toggle Desktop / Mobile */}
        <div style={{ display: 'flex', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              background: viewMode === 'desktop' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'desktop' ? '#006BFF' : '#6B7280',
              border: 'none', padding: '6px 16px', borderRadius: '6px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: viewMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t('website:studio.viewport.desktop')}
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              background: viewMode === 'mobile' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'mobile' ? '#006BFF' : '#6B7280',
              border: 'none', padding: '6px 16px', borderRadius: '6px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: viewMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t('website:studio.viewport.mobile')}
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1F2937',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '100px',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {t('website:template_houzez.previewOnly', 'Demo Preview Only')}
          <style>{`
            @keyframes slideUp {
              from { transform: translate(-50%, 20px); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: viewMode === 'mobile' ? '40px 0' : '0', overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{
          width: viewMode === 'mobile' ? '375px' : '100%',
          height: viewMode === 'mobile' ? '812px' : 'auto',
          background: '#FFFFFF',
          borderRadius: viewMode === 'mobile' ? '36px' : '0',
          boxShadow: viewMode === 'mobile' ? '0 25px 50px -12px rgba(0,0,0,0.25)' : 'none',
          border: viewMode === 'mobile' ? '12px solid #D1D1D6' : 'none',
          boxSizing: 'content-box',
          overflow: viewMode === 'mobile' ? 'hidden' : 'visible',
          transform: viewMode === 'mobile' ? 'translateZ(0)' : 'none',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {viewMode === 'mobile' ? (
            <div style={{ height: '100%', width: '100%', overflowY: 'auto', overflowX: 'hidden', paddingLeft: viewMode === 'mobile' ? '14px' : '0' }}>
              {clonedChildren}
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {clonedChildren}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
