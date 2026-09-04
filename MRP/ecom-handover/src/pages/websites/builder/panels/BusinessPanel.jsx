import React from 'react';
import { TextField, MediaUploadField, Toggle, PhoneField, COUNTRY_CODES } from '../../../../ce-ui';
import LangPillsBar from '../components/LangPillsBar';
import InputField from '../components/InputField';

// footerPhone is stored as a single combined string (e.g. "+62 812 9876 5432"),
// but ce-ui's PhoneField tracks dial code and national number separately.
function parseCombinedPhone(combined) {
  if (!combined) return { dialCode: '+62', national: '' };
  const byLength = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const match = byLength.find((c) => combined.startsWith(c.dialCode));
  if (!match) return { dialCode: '+62', national: combined.replace(/^\+/, '') };
  return { dialCode: match.dialCode, national: combined.slice(match.dialCode.length).trim() };
}

function FooterPhoneField({ value, onChange, t }) {
  const [{ dialCode, national }, setState] = React.useState(() => parseCombinedPhone(value));

  const emit = (nextDialCode, nextNational) => {
    onChange(nextNational ? `${nextDialCode} ${nextNational}` : nextDialCode);
  };

  return (
    <PhoneField
      label={t('studio.common.phone')}
      dialCode={dialCode}
      value={national}
      onChange={(e) => {
        const next = e.target.value;
        setState({ dialCode, national: next });
        emit(dialCode, next);
      }}
      onCountryChange={(country) => {
        setState({ dialCode: country.dialCode, national });
        emit(country.dialCode, national);
      }}
    />
  );
}

const BusinessPanel = React.memo(({
  headerLogo, banners, businessName, footerPhone, footerEmail,
  heroEnabled, heroTitle, heroSubtitle, footerDesc,
  langBarProps, updateConfig, updateSharedConfig,
  handleBannerRemove,
  handleLogoFileSelect, handleBannerFileSelect,
  companyData, t,
}) => {
  const panelStyle = { padding: '40px 48px', maxWidth: '100%', margin: '0' };

  const fileFromPayload = (payload) => ({ target: { files: [payload.file], value: '' } });

  return (
    <div style={panelStyle}>
      {/* ── Logo ── */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #F3F4F6' }}>
        <MediaUploadField
          label={t('studio.editor.logo')}
          required
          maxItems={1}
          maxSizeMB={5}
          items={headerLogo ? [{ id: 'logo', type: 'image', src: headerLogo, name: t('studio.editor.logo') }] : []}
          onAdd={(payload) => handleLogoFileSelect(fileFromPayload(payload))}
          onReplace={(_id, payload) => handleLogoFileSelect(fileFromPayload(payload))}
          onRemove={() => updateSharedConfig('headerLogo', '')}
        />
      </div>

      {/* ── Hero ── */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{t('studio.editor.hero')}</h3>
          <Toggle
            checked={heroEnabled !== false}
            onChange={(checked) => updateConfig('heroEnabled', checked)}
          />
        </div>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>{t('studio.editor.heroDesc')}</p>
        {heroEnabled !== false && (
          <>
            <LangPillsBar {...langBarProps} />
            <InputField label={t('studio.basic.nav.heroLabel')} value={heroTitle} onChange={(val) => updateConfig('heroTitle', val)} placeholder={t('template_houzez.hero.title')} />
            <InputField label={t('studio.basic.nav.heroSubtitle')} value={heroSubtitle} onChange={(val) => updateConfig('heroSubtitle', val)} placeholder={t('template_houzez.hero.subtitle')} isTextarea />
            <div style={{ marginTop: '20px' }}>
              <MediaUploadField
                label={`${t('studio.editor.banner')} (${banners.length}/3)`}
                maxItems={3}
                maxSizeMB={5}
                items={banners.map((imgUrl, idx) => ({ id: String(idx), type: 'image', src: imgUrl, name: t('studio.panelContent.business.bannerItemLabel', { index: idx + 1 }) }))}
                onAdd={(payload) => handleBannerFileSelect(fileFromPayload(payload))}
                onReplace={(id, payload) => {
                  handleBannerRemove(Number(id));
                  handleBannerFileSelect(fileFromPayload(payload));
                }}
                onRemove={(id) => handleBannerRemove(Number(id))}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{t('studio.panelContent.business.footerTitle')}</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>{t('studio.panelContent.business.footerDesc')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <TextField
              label={t('studio.panelContent.business.businessNameLabel')}
              value={businessName}
              onChange={(e) => updateSharedConfig('businessName', e.target.value)}
              placeholder={companyData?.businessName || t('studio.panelContent.business.businessNamePlaceholder')}
            />
          </div>
          <div>
            <FooterPhoneField value={footerPhone} onChange={val => updateSharedConfig('footerPhone', val)} t={t} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <TextField
              label={t('studio.common.email')}
              value={footerEmail}
              onChange={(e) => updateSharedConfig('footerEmail', e.target.value)}
              placeholder={companyData?.email || t('studio.panelContent.business.emailPlaceholder')}
            />
          </div>
        </div>
        <LangPillsBar {...langBarProps} />
        <InputField label={t('studio.panelContent.business.footerDescriptionLabel')} value={footerDesc} onChange={val => updateConfig('footerDesc', val)} placeholder={t('template_houzez.footer.desc')} isTextarea />
      </div>
    </div>
  );
});

export default BusinessPanel;
