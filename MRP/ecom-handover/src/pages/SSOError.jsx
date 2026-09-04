import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LabamuLogoPng from '../assets/labamu-logo.png';

export default function SSOErrorPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleLoginAgain() {
    sessionStorage.removeItem('lb_sso_error');
    navigate('/login', { replace: true });
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#F5F5F7',
      fontFamily: "'Lato', sans-serif",
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '48px 40px 40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0',
        boxShadow: '0 8px 32px rgba(8,27,52,0.10)',
      }}>
        <img src={LabamuLogoPng} alt="Labamu" style={{ width: '120px', height: 'auto', marginBottom: '32px' }} />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          flexShrink: 0,
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 10v8" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="22" r="1.5" fill="#DC2626"/>
            <path d="M14.27 4.28a2 2 0 0 1 3.46 0l11.32 19.6A2 2 0 0 1 27.32 27H4.68a2 2 0 0 1-1.73-3.12L14.27 4.28Z" stroke="#DC2626" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{
          margin: '0 0 12px',
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: '28px',
          color: '#081B34',
          textAlign: 'center',
        }}>
          {t('auth:ssoError.title')}
        </h1>

        <p style={{
          margin: '0 0 8px',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '22px',
          color: '#7E7E7E',
          textAlign: 'center',
        }}>
          {t('auth:ssoError.message')}
        </p>

        <p style={{
          margin: '0 0 32px',
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '18px',
          color: '#B0B0B0',
          textAlign: 'center',
        }}>
          {t('auth:ssoError.hint')}
        </p>

        <button
          type="button"
          onClick={handleLoginAgain}
          style={{
            width: '100%',
            height: '52px',
            background: '#006BFF',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: "'Lato', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '0.11px',
          }}
        >
          {t('auth:ssoError.loginAgain')}
        </button>
      </div>
    </div>
  );
}
