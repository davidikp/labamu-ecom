import React from 'react';
import { TextField, MediaUploadField } from '../../../../ce-ui';
import LangPillsBar from '../components/LangPillsBar';

const QuotePanel = React.memo(({ rfq, langBarProps, updateConfig, handleQuoteBgFileSelect, t }) => (
  <div style={{ padding: '32px 48px', width: '100%', boxSizing: 'border-box' }}>
    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '0px' }}>

      {/* ── General Section ── */}
      <div style={{ marginBottom: '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{t('studio.panelContent.quote.sectionTitle')}</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>{t('studio.panelContent.quote.sectionDesc')}</p>
        <LangPillsBar {...langBarProps} />
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <TextField
              label={t('studio.panelContent.shared.sectionTitle')}
              required
              value={rfq?.title || ''}
              onChange={e => updateConfig('rfq', { ...rfq, title: e.target.value })}
              placeholder={t('template_houzez.rfq.title')}
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              label={t('studio.panelContent.shared.sectionDescriptionLabel')}
              required
              value={rfq?.subtitle || ''}
              onChange={e => updateConfig('rfq', { ...rfq, subtitle: e.target.value })}
              placeholder={t('studio.panelContent.quote.descPlaceholder')}
            />
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F4F6', margin: '28px 0' }} />

      {/* ── Background Image ── */}
      <div>
        <MediaUploadField
          label={t('studio.panelContent.quote.bgImageLabel')}
          maxItems={1}
          maxSizeMB={5}
          items={rfq?.bgImage ? [{ id: 'bg', type: 'image', src: rfq.bgImage, name: t('studio.panelContent.quote.bgImageLabel') }] : []}
          onAdd={(payload) => handleQuoteBgFileSelect({ target: { files: [payload.file], value: '' } })}
          onReplace={(_id, payload) => handleQuoteBgFileSelect({ target: { files: [payload.file], value: '' } })}
          onRemove={() => updateConfig('rfq', { ...rfq, bgImage: '' })}
        />
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '8px 0 0' }}>{t('studio.panelContent.quote.bgImageFallback')}</p>
      </div>

    </div>
  </div>
));

export default QuotePanel;
