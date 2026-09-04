import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Store, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import LabamuLogoPng from '../assets/labamu-logo.png';

function DecorativeBlob({ style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        borderRadius: '999px',
        filter: 'blur(4px)',
        background: 'rgba(255, 255, 255, 0.12)',
        ...style,
      }}
    />
  );
}

export default function FirstTimeBoth() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSetupWebsite = () => {
    sessionStorage.setItem('lb_first_time_source', 'both');
    navigate('/first-time-both/onboarding');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--feature-brand-primary) 0%, #0058d6 100%)',
        fontFamily: "'Lato', sans-serif",
        color: 'var(--neutral-on-surface-reverse)',
      }}
    >
      <DecorativeBlob style={{ width: '260px', height: '260px', top: '-80px', right: '-40px' }} />
      <DecorativeBlob style={{ width: '220px', height: '220px', bottom: '-60px', left: '-40px' }} />
      <DecorativeBlob style={{ width: '180px', height: '180px', top: '140px', left: '14%' }} />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'min(960px, 100%)',
            background: 'var(--neutral-surface-primary)',
            color: 'var(--neutral-on-surface-primary)',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 32px 96px rgba(0, 0, 0, 0.22)',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(0, 1.1fr)',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #0C67F2 0%, #0058d6 100%)',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                width: 'fit-content',
                padding: '10px 14px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.14)',
                color: 'var(--neutral-on-surface-reverse)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <Sparkles size={16} />
              {t('auth:firstTime.badge')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignSelf: 'stretch', color: '#FFFFFF' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={36} />
              </div>
              <h1 style={{ margin: 0, fontSize: '36px', lineHeight: '44px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', width: '100%' }}>
                {t('auth:firstTime.heading')}
              </h1>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '26px', color: 'rgba(255, 255, 255, 0.82)', width: '100%' }}>
                {t('auth:firstTime.both.body')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                t('auth:firstTime.steps.confirmBusiness'),
                t('auth:firstTime.steps.chooseSyncPlatform'),
                t('auth:firstTime.steps.chooseTemplate'),
                t('auth:firstTime.steps.continueDashboard'),
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#FFFFFF',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span style={{ fontWeight: 400, color: '#FFFFFF' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '48px 48px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={LabamuLogoPng} alt="Labamu" style={{ width: '180px', height: 'auto', display: 'block' }} />
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', lineHeight: '34px', fontWeight: 800, color: 'var(--neutral-on-surface-primary)' }}>
                {t('auth:firstTime.welcomeTitle')}
              </h2>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '26px', color: 'var(--neutral-on-surface-secondary)' }}>
                {t('auth:firstTime.both.welcomeBody')}
              </p>
            </div>

            <div
              style={{
                padding: '20px 24px',
                borderRadius: '16px',
                background: 'var(--feature-brand-container-lighter)',
                border: '1px solid var(--feature-brand-container-darker)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="9" cy="9" r="8" stroke="var(--feature-brand-on-container)" strokeWidth="1.5" />
                <path d="M9 5.5v4M9 11.5h.01" stroke="var(--feature-brand-on-container)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--feature-brand-on-container)' }}>
                  {t('auth:firstTime.both.importantTitle')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--neutral-on-surface-secondary)', lineHeight: '20px' }}>
                  {t('auth:firstTime.both.importantBody')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button
                variant="primary"
                size="main"
                width="100%"
                onClick={handleSetupWebsite}
              >
                {t('auth:firstTime.setupWebsite')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
