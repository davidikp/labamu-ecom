import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LabamuLogoPng from '../assets/labamu-logo.png';
import LoginHeroImg from '../assets/login-page-image.png';
import { useSnackbar } from '../contexts/SnackbarContext';

const MOCK_EMAIL = 'merchant@labamu.id';
const MOCK_PASSWORD = 'password123';

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1.5 9s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6Z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2.5 2.5l13 13M7.5 7.6A2.25 2.25 0 0 0 11.4 11.5M5.8 5.8C4 6.9 2.5 9 2.5 9s2.5 5.5 6.5 5.5a6.8 6.8 0 0 0 3.2-.85M9 3.5c3.7 0 6 5.5 6 5.5a11 11 0 0 1-1.5 2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5.8 2.4c.2-.5.8-.8 1.3-.7l1.5.4c.5.1.9.5 1 .9l.4 1.6c.1.5 0 1-.4 1.3l-.8.8c-.2.2-.3.5-.2.8.3 1 1 2.1 1.8 2.9.8.8 1.9 1.5 2.9 1.8.3.1.6 0 .8-.2l.8-.8c.3-.3.8-.5 1.3-.4l1.6.4c.5.1.8.5.9 1l.4 1.5c.1.5-.2 1.1-.7 1.3-.8.3-1.9.6-3.1.6-5 0-9.1-4.1-9.1-9.1 0-1.2.3-2.3.6-3.1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

function BgRects() {
  const base = {
    position: 'absolute',
    width: '309px',
    height: '309px',
    background: '#FFFFFF',
    opacity: 0.1,
    borderRadius: '30px',
  };

  return (
    <>
      <div style={{ ...base, left: '984px', top: '-29px', transform: 'rotate(-15.75deg)' }} />
      <div style={{ ...base, left: '-115px', top: '-140px', transform: 'rotate(37deg)' }} />
      <div style={{ ...base, left: '508px', top: '283px', transform: 'rotate(-30.26deg)' }} />
      <div style={{ ...base, left: '1211px', top: '720px', transform: 'rotate(-30.26deg)' }} />
      <div style={{ ...base, left: '115px', top: '894px', transform: 'rotate(22.2deg)' }} />
    </>
  );
}


export default function LoginRevamp() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const lang = i18n.language;

  function handleLangChange(lng) {
    i18n.changeLanguage(lng);
    localStorage.setItem('lb_lang', lng);
    setLangMenuOpen(false);
    setEmailErr('');
    setPwErr('');
  }

  function validateEmail(v) {
    if (!v) return t('auth:errors.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t('auth:errors.emailInvalid');
    return '';
  }

  function validatePw(v) {
    if (!v) return t('auth:errors.passwordRequired');
    if (v.length < 6) return t('auth:errors.passwordMinLength');
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ee = validateEmail(email);
    const pe = validatePw(password);
    setEmailErr(ee);
    setPwErr(pe);
    if (ee || pe || !agreed) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      sessionStorage.setItem('lb_mock_auth', 'true');
      showSnackbar(t('auth:errors.loginSuccess'), 'green');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      setLoading(false);
      showSnackbar(t('auth:errors.loginFailed'), 'red');
    }
  }

  function handleFirstTimeFromLabamu() {
    sessionStorage.setItem('lb_first_time_source', 'labamu-app');
    navigate('/first-time-from-labamu');
  }

  function handleFirstTimeFromMRP() {
    sessionStorage.setItem('lb_first_time_source', 'mrp');
    navigate('/first-time-from-mrp');
  }

  function handleFirstTimeBoth() {
    sessionStorage.setItem('lb_first_time_source', 'both');
    navigate('/first-time-both');
  }

  function handleMalformedSSO() {
    sessionStorage.removeItem('lb_mock_auth');
    sessionStorage.setItem('lb_sso_error', 'malformed');
    navigate('/dashboard');
  }

  function handleEcommerceViaLabamuAccessMRP() {
    sessionStorage.setItem('lb_mock_auth', 'true');
    sessionStorage.setItem('lb_show_mismatch_banner', 'true');
    localStorage.removeItem('lb_ecommerce_mismatch_dismissed');
    navigate('/dashboard');
  }


  const canSubmit = email.length > 0 && password.length > 0 && agreed && !loading;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      background: '#006BFF',
      fontFamily: "'Lato', sans-serif",
      minHeight: '100vh',
    }}>
      <BgRects />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '64px 95px 48px',
        boxSizing: 'border-box',
        gap: '56px',
      }}>
        <div style={{
          width: '560px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: '360px',
            height: '360px',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={LoginHeroImg}
              alt="Labamu Ecommerce illustration"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ marginTop: '44px', width: '560px' }}>
            <h1 style={{
              margin: 0,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: '40px',
              lineHeight: '48px',
              letterSpacing: '0.17875px',
              color: '#FFFFFF',
              maxWidth: '560px',
            }}>
              {t('auth:hero.title')}
            </h1>
            <p style={{
              margin: '18px 0 0',
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '32px',
              letterSpacing: '0.1375px',
              color: '#FFFFFF',
              maxWidth: '560px',
            }}>
              {t('auth:hero.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '84px', marginLeft: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '999px', background: '#FFFFFF', display: 'block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '999px', background: 'rgba(255,255,255,0.35)', display: 'block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '999px', background: 'rgba(255,255,255,0.35)', display: 'block' }} />
          </div>
        </div>

        <div style={{
          width: '496px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{
            width: '496px',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '40px',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'start',
              marginBottom: '28px',
              position: 'relative',
            }}>
              <div />
              <img
                src={LabamuLogoPng}
                alt="Labamu"
                style={{ width: '161px', height: 'auto', display: 'block', justifySelf: 'center' }}
              />
              <div style={{ justifySelf: 'end', alignSelf: 'start', position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: 'auto',
                    height: 'auto',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 0,
                    boxShadow: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#081B34',
                    lineHeight: 1,
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{lang === 'id' ? '🇮🇩' : '🇺🇸'}</span>
                  <span style={{ textAlign: 'left' }}>{lang === 'id' ? 'ID' : 'EN'}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {langMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#FFFFFF',
                    border: '1px solid #E9E9E9',
                    borderRadius: '12px',
                    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                    zIndex: 10,
                    minWidth: '160px',
                  }}>
                    <button type="button" onClick={() => handleLangChange('id')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: lang === 'id' ? '#F4F4F4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34' }}>🇮🇩 {t('auth:languageOptions.indonesian')}</button>
                    <button type="button" onClick={() => handleLangChange('en')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: lang === 'en' ? '#F4F4F4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34' }}>🇺🇸 {t('auth:languageOptions.english')}</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <h2 style={{
                margin: 0,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '30px',
                letterSpacing: '0.165px',
                color: '#081B34',
              }}>
                {t('auth:form.title')}
              </h2>
              <p style={{
                margin: 0,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.09625px',
                color: '#081B34',
              }}>
                {t('auth:form.subtitle')}
              </p>
            </div>

            <form id="login-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth:form.emailPlaceholder')}
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
                  onBlur={() => setEmailErr(validateEmail(email))}
                  disabled={loading}
                  style={{
                    width: '100%',
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400,
                    fontSize: '18px',
                    lineHeight: '24px',
                    letterSpacing: '0.11px',
                    color: '#081B34',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${emailErr ? '#d0021b' : '#E6E6E6'}`,
                    borderRadius: 0,
                    outline: 'none',
                    padding: '10px 0 12px',
                    boxSizing: 'border-box',
                  }}
                  aria-required="true"
                  aria-invalid={!!emailErr}
                />
                {emailErr && (
                  <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', color: '#d0021b', letterSpacing: '0.0825px' }}>
                    {emailErr}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('auth:form.passwordPlaceholder')}
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (pwErr) setPwErr(''); }}
                    onBlur={() => setPwErr(validatePw(password))}
                    disabled={loading}
                    style={{
                      width: '100%',
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 400,
                      fontSize: '18px',
                      lineHeight: '24px',
                      letterSpacing: '0.11px',
                      color: '#081B34',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${pwErr ? '#d0021b' : '#E6E6E6'}`,
                      borderRadius: 0,
                      outline: 'none',
                      padding: '10px 28px 12px 0',
                      boxSizing: 'border-box',
                    }}
                    aria-required="true"
                    aria-invalid={!!pwErr}
                  />
                  <button
                    id="toggle-password-visibility"
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? t('auth:form.hidePassword') : t('auth:form.showPassword')}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-48%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: '#A9A9A9',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {pwErr && (
                  <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', color: '#d0021b', letterSpacing: '0.0825px' }}>
                    {pwErr}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => showSnackbar(t('auth:forgotPassword.snackComingSoon'), 'grey')}
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: "'Lato', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '24px',
                  letterSpacing: '0.11px',
                  color: '#006BFF',
                }}
              >
                {t('auth:forgotPassword.button')}
              </button>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '8px' }}>
                <div
                  role="checkbox"
                  aria-checked={agreed}
                  tabIndex={0}
                  className={`lb-checkbox ${agreed ? 'lb-checkbox-checked' : 'lb-checkbox-unchecked'}`}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setAgreed(v => !v)}
                  onKeyDown={e => e.key === ' ' && setAgreed(v => !v)}
                >
                  {agreed && (
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                      <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.0825px',
                  color: '#081B34',
                }}>
                  {t('auth:terms.agreePrefix')}
                  <a href="https://labamu.co.id/terms/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '14px', fontWeight: 700, color: '#006BFF', letterSpacing: '0.0825px' }}>
                    {t('auth:terms.termsLink')}
                  </a>
                  {t('auth:terms.and')}
                  <a href="https://labamu.co.id/privacy/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '14px', fontWeight: 700, color: '#006BFF', letterSpacing: '0.0825px' }}>
                    {t('auth:terms.privacyLink')}
                  </a>
                </p>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  height: '64px',
                  marginTop: '4px',
                  background: canSubmit ? '#006BFF' : '#F4F4F4',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '24px',
                  letterSpacing: '0.11px',
                  color: canSubmit ? '#FFFFFF' : '#7E7E7E',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
                disabled={!canSubmit}
                aria-busy={loading}
              >
                {loading
                  ? <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'lb-spin 0.8s linear infinite' }}>
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="24 10" strokeLinecap="round"/>
                      </svg>
                      {t('auth:form.processing')}
                    </>
                  : t('auth:form.submit')
                }
              </button>
              <style>{`@keyframes lb-spin { to { transform: rotate(360deg); } }`}</style>
            </form>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              width: '100%',
              marginTop: '28px',
            }}>
              <div style={{ flex: 1, height: 1, background: '#E9E9E9' }} />
              <span style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '0.09625px',
                color: '#7E7E7E',
              }}>
                {t('auth:divider')}
              </span>
              <div style={{ flex: 1, height: 1, background: '#E9E9E9' }} />
            </div>

            <button
              id="login-with-phone-cta"
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                marginTop: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: "'Lato', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '24px',
                letterSpacing: '0.11px',
                color: '#006BFF',
              }}
              onClick={() => showSnackbar(t('auth:forgotPassword.snackComingSoon'), 'grey')}
            >
              <IconPhone />
              <span>{t('auth:form.phoneLogin')}</span>
            </button>

            <p style={{
              margin: '26px 0 0',
              textAlign: 'center',
              fontFamily: "'Lato', sans-serif",
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '0.11px',
              color: '#081B34',
            }}>
              {t('auth:form.helperText')}
            </p>
          </div>

          <div style={{
            width: '496px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px 20px',
            boxSizing: 'border-box',
            boxShadow: '0 8px 24px rgba(8, 27, 52, 0.08)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontFamily: "'Lato', sans-serif",
              fontSize: '14px',
              lineHeight: '20px',
              color: '#7E7E7E',
            }}>
              <span style={{ flexShrink: 0 }}>•</span>
              <span>
                {t('auth:loginFooter.accountLabel')}{' '}
                <span style={{ color: '#081B34' }}>{MOCK_EMAIL} / {MOCK_PASSWORD}</span>
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginTop: '4px',
              fontFamily: "'Lato', sans-serif",
              fontSize: '14px',
              lineHeight: '20px',
              color: '#7E7E7E',
            }}>
              <span style={{ flexShrink: 0 }}>•</span>
              <span>
                {t('auth:loginFooter.caseLabel')}{' '}
                <button
                  type="button"
                  onClick={handleFirstTimeBoth}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#006BFF',
                    fontWeight: 700,
                  }}
                >
                  {t('auth:loginFooter.haveBoth')}
                </button>
                {' // '}
                <button
                  type="button"
                  onClick={handleFirstTimeFromLabamu}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#006BFF',
                    fontWeight: 700,
                  }}
                >
                  {t('auth:loginFooter.onlyLabamuApp')}
                </button>
                {' // '}
                <button
                  type="button"
                  onClick={handleFirstTimeFromMRP}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#006BFF',
                    fontWeight: 700,
                  }}
                >
                  {t('auth:loginFooter.onlyMrp')}
                </button>
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginTop: '4px',
              fontFamily: "'Lato', sans-serif",
              fontSize: '14px',
              lineHeight: '20px',
              color: '#7E7E7E',
            }}>
              <span style={{ flexShrink: 0 }}>•</span>
              <span>
                {t('auth:loginFooter.caseMismatchLabel')}{' '}
                <button
                  type="button"
                  onClick={handleEcommerceViaLabamuAccessMRP}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#006BFF',
                    fontWeight: 700,
                  }}
                >
                  {t('auth:loginFooter.mismatchButton')}
                </button>
                {' // '}
                <button
                  type="button"
                  onClick={handleMalformedSSO}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#006BFF',
                    fontWeight: 700,
                  }}
                >
                  {t('auth:loginFooter.malformedSSOButton')}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
