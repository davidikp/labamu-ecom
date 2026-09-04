import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompany } from '../contexts/CompanyContext';

const DISMISSED_KEY = 'lb_ecommerce_mismatch_dismissed';

function EcommerceMismatchBanner({ onDismiss }) {
  const { t } = useTranslation();
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      background: '#FFF8E6',
      border: '1px solid #F5C842',
      borderRadius: '12px',
      margin: '24px 24px 0',
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, color: '#C98A00' }}>
        <path d="M10 2.5L17.5 15.5H2.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 8.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
      </svg>
      <span style={{
        flex: 1,
        fontFamily: "'Lato', sans-serif",
        fontSize: '14px',
        lineHeight: '20px',
        color: '#7A5200',
      }}>
        {t('dashboard:ecommerceMismatchBanner.message')}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('dashboard:ecommerceMismatchBanner.dismiss')}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: '#7A5200',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { companyData } = useCompany();

  const [bannerVisible, setBannerVisible] = useState(
    sessionStorage.getItem('lb_show_mismatch_banner') === 'true' &&
    localStorage.getItem(DISMISSED_KEY) !== 'true'
  );

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setBannerVisible(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 'calc(100vh - 56px)' }}>
      {bannerVisible && <EcommerceMismatchBanner onDismiss={handleDismiss} />}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        padding: '48px 24px',
      }}>
        <img src="/favicon.ico" alt={t('dashboard:welcome.iconAlt')} style={{ width: '64px', height: '64px' }} />
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-on-surface-primary)' }}>
          {t('dashboard:welcome.title')}{companyData?.brandName ? `, ${companyData.brandName}` : ''}
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--neutral-on-surface-secondary)', textAlign: 'center', maxWidth: '360px', lineHeight: '22px' }}>
          {t('dashboard:welcome.messagePrefix')}
          <strong style={{ color: '#1a1a1a' }}>{t('dashboard:welcome.messageStrong')}</strong>
          {t('dashboard:welcome.messageSuffix')}
        </p>
      </main>
    </div>
  );
}
