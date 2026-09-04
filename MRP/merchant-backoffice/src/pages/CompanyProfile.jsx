import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCompany } from '../contexts/CompanyContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import Button from '../components/ui/Button';
import { INDUSTRY_LABELS } from '../constants/industries';
import { BUSINESS_ENTITY_LABELS } from '../constants/businessEntities';
import { BUSINESS_TYPE_LABELS } from '../constants/businessTypes';
import { BUSINESS_ACTIVITY_LABELS } from '../constants/businessActivities';

function formatSyncedAt(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

export default function CompanyProfile() {
  const { t } = useTranslation();
  const { companyData, isLoading, error, syncCompanyData } = useCompany();
  const { showSnackbar } = useSnackbar();
  const proColor = '#3F44A7';

  const [isSyncing, setIsSyncing] = React.useState(false);

  // DEMO ONLY — simulates re-pull from Labamu Core SSO
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncCompanyData();
      showSnackbar(t('dashboard:profile.syncSuccess', 'Data synced successfully'), 'green');
    } catch (e) {
      console.error('Failed to sync company data:', e);
      showSnackbar(t('dashboard:profile.syncError', 'Sync failed'), 'red');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lato', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#006BFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 500 }}>{t('dashboard:profile.loading', 'Loading company data...')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lato', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#EF4444', maxWidth: '400px', padding: '24px' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            {t('dashboard:profile.errorTitle', 'Failed to load data')}
          </p>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{error || t('dashboard:profile.dataUnavailable')}</p>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#6B7280', margin: 0 }}>
        {title}
      </h3>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', marginBottom: '24px', fontSize: '15px' }}>
      <div style={{ width: '230px', color: '#6B7280' }}>{label}</div>
      <div style={{ fontWeight: 500, color: '#1B1B1B', flex: 1 }}>{value || '-'}</div>
    </div>
  );

  return (
    <div style={{ background: '#F4F4F4', minHeight: '100vh', padding: '24px', fontFamily: "'Lato', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>

        {/* Header Section */}
        <div style={{ padding: '32px 48px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%', border: `2px solid ${proColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', padding: '3px'
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src={companyData.logoUrl} alt={t('dashboard:profile.logoAlt')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 800, color: '#1B1B1B' }}>
                {companyData.businessName}
              </h1>
              <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '15px', fontWeight: 500 }}>
                {t(`dashboard:profile.membership.${companyData.membership}`)}
              </p>
              <p style={{ margin: 0, color: '#9CA3AF', fontSize: '13px' }}>
                {companyData.syncedAt
                  ? `${t('dashboard:profile.lastSynced', 'Last synced')}: ${formatSyncedAt(companyData.syncedAt)}`
                  : t('dashboard:profile.neverSynced', 'Never synced')}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '40px 48px 60px' }}>
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1B1B1B', margin: 0 }}>
              {t('dashboard:profile.title')}
            </h2>

            {/* DEMO ONLY — simulates re-pull from Labamu Core SSO */}
            <Button
              variant="primary"
              size="medium"
              onClick={handleSync}
              disabled={isSyncing}
              style={{ minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isSyncing ? (
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                t('dashboard:profile.syncBtn', 'Sync from Labamu Admin')
              )}
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 1fr) minmax(400px, 1fr)', gap: '80px' }}>

            {/* Left: Informasi Usaha */}
            <div>
              <SectionHeader title={t('dashboard:profile.sections.info')} />

              <InfoRow
                label={t('dashboard:profile.fields.entity')}
                value={companyData.entity ? t(BUSINESS_ENTITY_LABELS[companyData.entity]) : '-'}
              />
              <InfoRow label={t('dashboard:profile.fields.legalName')}    value={companyData.businessName} />
              <InfoRow label={t('dashboard:profile.fields.brandName')}    value={companyData.brandName} />
              <InfoRow label={t('dashboard:profile.fields.whatsapp')}     value={companyData.whatsapp} />
              <InfoRow label={t('dashboard:profile.fields.phone')}        value={companyData.phone} />
              <InfoRow label={t('dashboard:profile.fields.email')}        value={companyData.email} />
              <InfoRow label={t('dashboard:profile.fields.npwpBusiness')} value={companyData.businessNpwp} />
              <InfoRow
                label={t('dashboard:profile.fields.type')}
                value={companyData.type ? t(BUSINESS_TYPE_LABELS[companyData.type]) : '-'}
              />
              <InfoRow
                label={t('dashboard:profile.fields.industry')}
                value={companyData.industry ? t(INDUSTRY_LABELS[companyData.industry]) : '-'}
              />
              <InfoRow
                label={t('dashboard:profile.fields.activity')}
                value={companyData.activity ? t(BUSINESS_ACTIVITY_LABELS[companyData.activity]) : '-'}
              />
              <InfoRow label={t('dashboard:profile.fields.npwpPersonal')} value={companyData.personalNpwp} />
            </div>

            {/* Right: Alamat Usaha */}
            <div>
              <SectionHeader title={t('dashboard:profile.sections.address')} />

              <InfoRow label={t('dashboard:profile.fields.address')} value={companyData.address} />

              {companyData.country === 'Indonesia' && (
                <InfoRow
                  label={t('dashboard:profile.fields.rtRw')}
                  value={companyData.rt ? `${companyData.rt} / ${companyData.rw}` : '-'}
                />
              )}

              <InfoRow label={t('dashboard:profile.fields.country')}       value={companyData.country} />
              <InfoRow label={t('dashboard:profile.fields.provinceState')} value={companyData.province} />
              <InfoRow label={t('dashboard:profile.fields.city')}          value={companyData.city} />
              <InfoRow label={t('dashboard:profile.fields.district')}      value={companyData.district} />
              <InfoRow label={t('dashboard:profile.fields.village')}       value={companyData.region} />
              <InfoRow label={t('dashboard:profile.fields.zip')}           value={companyData.postalCode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
