import React from 'react';
import { TextField } from '../../../../ce-ui';
import LangPillsBar from '../components/LangPillsBar';
import InputField from '../components/InputField';

const LocationPanel = React.memo(({ map, businessAddress, langBarProps, updateConfig, updateAddress, companyData, t }) => {
  return (
    <div style={{ padding: '40px 48px', maxWidth: '100%', margin: '0' }}>
      <LangPillsBar {...langBarProps} />
      <InputField label={t('studio.panelContent.shared.sectionTitle')} value={map?.title || ''} onChange={val => updateConfig('map', { ...map, title: val })} placeholder={t('template_houzez.map.title')} />
      <InputField label={t('studio.panelContent.shared.sectionSubtitle')} value={map?.subtitle || ''} onChange={val => updateConfig('map', { ...map, subtitle: val })} placeholder={t('template_houzez.map.subtitle')} isTextarea />
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{t('studio.panelContent.location.addressTitle')}</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>{t('studio.panelContent.location.addressDesc')}</p>
        <div style={{ marginBottom: '16px' }}>
          <TextField label={t('studio.panelContent.location.streetLabel')} value={businessAddress.street} onChange={e => updateAddress('street', e.target.value)} placeholder={companyData?.address || 'Jl. Contoh No. 123'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <TextField label={t('studio.panelContent.location.cityLabel')} value={businessAddress.city} onChange={e => updateAddress('city', e.target.value)} placeholder={companyData?.city || 'Jakarta'} />
          </div>
          <div>
            <TextField label={t('studio.panelContent.location.provinceLabel')} value={businessAddress.province} onChange={e => updateAddress('province', e.target.value)} placeholder={companyData?.province || 'DKI Jakarta'} />
          </div>
          <div>
            <TextField label={t('studio.panelContent.location.postalCodeLabel')} value={businessAddress.postalCode} onChange={e => updateAddress('postalCode', e.target.value)} placeholder={companyData?.postalCode || '12345'} />
          </div>
          <div>
            <TextField label={t('studio.panelContent.location.countryLabel')} value={businessAddress.country} onChange={e => updateAddress('country', e.target.value)} placeholder={companyData?.country || 'Indonesia'} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default LocationPanel;
