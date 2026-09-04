import React from 'react';
import { TextField, Toggle } from '../../../../ce-ui';
import LangPillsBar from '../components/LangPillsBar';
import DeleteIconButton from '../components/DeleteIconButton';

const ContactPanel = React.memo(({ contact, langBarProps, updateConfig, t }) => {
  const TOGGLE_FIELDS = [
    { key: 'salutation', label: t('website:shop.salutation') },
    { key: 'email',      label: t('website:studio.common.email'), group: 'contact' },
    { key: 'phone',      label: t('website:studio.common.phone'), group: 'contact' },
  ];

  const ALWAYS_REQUIRED = [t('website:studio.panelContent.contact.nameField'), t('website:studio.panelContent.contact.messageField')];

  return (
  <div style={{ padding: '32px 48px', width: '100%', boxSizing: 'border-box' }}>
    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '0px' }}>

      {/* ── General Section ── */}
      <div style={{ marginBottom: '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{t('website:studio.panelContent.contact.generalTitle')}</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>{t('website:studio.panelContent.contact.generalDesc')}</p>
        <LangPillsBar {...langBarProps} />
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <TextField
              label={t('website:studio.panelContent.shared.sectionTitle')}
              required
              value={contact?.title || ''}
              onChange={e => updateConfig('contact', { ...contact, title: e.target.value })}
              placeholder={t('website:template_houzez.contact.title')}
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              label={t('website:studio.panelContent.shared.sectionDescriptionLabel')}
              required
              value={contact?.description || ''}
              onChange={e => updateConfig('contact', { ...contact, description: e.target.value })}
              placeholder={t('website:template_houzez.contact.subtitle')}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '10px' }}>
            <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span> {t('website:studio.panelContent.contact.headerImageLabel')}
          </label>
          {contact?.headerImage ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
                <img src={contact.headerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <DeleteIconButton onClick={() => updateConfig('contact', { ...contact, headerImage: '' })} style={{ position: 'absolute', top: '4px', right: '4px' }} />
              </div>
            </div>
          ) : (
            <div onClick={() => updateConfig('contact', { ...contact, headerImage: `https://picsum.photos/seed/contact${Math.random()}/1200/400` })} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '8px', border: '1px dashed #D1D5DB', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{t('website:studio.upload.dragDrop')}</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5' }}>{t('website:studio.upload.acceptedFormats')}<br/>{t('website:studio.upload.maxSize')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F4F6', margin: '28px 0' }} />

      {/* ── Required Fields ── */}
      <div style={{ marginBottom: '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{t('website:studio.panelContent.contact.requiredFieldsTitle')}</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>{t('website:studio.panelContent.contact.requiredFieldsDesc')}</p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          {ALWAYS_REQUIRED.map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>{label}</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{t('website:studio.panelContent.contact.alwaysRequired')}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {TOGGLE_FIELDS.map(field => {
            const isOn = contact?.requiredFields?.[field.key] ?? false;
            const peerKey = field.group === 'contact' ? (field.key === 'email' ? 'phone' : 'email') : null;
            const peerIsOn = peerKey ? (contact?.requiredFields?.[peerKey] ?? false) : true;
            const isInteractive = !field.group || peerIsOn;
            return (
              <div
                key={field.key}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', userSelect: 'none' }}
              >
                <Toggle
                  size="small"
                  checked={isOn}
                  disabled={!isInteractive}
                  onChange={() => updateConfig('contact', { ...contact, requiredFields: { ...contact?.requiredFields, [field.key]: !isOn } })}
                />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{field.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F4F6', margin: '28px 0' }} />

      {/* ── Forward Contact Us Form ── */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{t('website:studio.panelContent.contact.forwardTitle')}</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>{t('website:studio.panelContent.contact.forwardDesc')}</p>
        <div style={{ marginBottom: '16px' }}>
          <TextField
            label={t('website:studio.panelContent.contact.businessEmailLabel')}
            value={contact?.businessEmail || ''}
            onChange={e => updateConfig('contact', { ...contact, businessEmail: e.target.value })}
            placeholder={t('website:studio.panelContent.contact.businessEmailPlaceholder')}
          />
        </div>
        <LangPillsBar {...langBarProps} />
        <div>
          <TextField
            label={t('website:studio.panelContent.contact.confirmationMessageLabel')}
            value={contact?.confirmationMessage || ''}
            onChange={e => updateConfig('contact', { ...contact, confirmationMessage: e.target.value })}
            placeholder={t('website:studio.panelContent.contact.confirmationMessagePlaceholder')}
            multiline
            rows={3}
          />
        </div>
      </div>
    </div>
  </div>
  );
});

export default ContactPanel;
