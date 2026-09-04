import React from 'react';
import { Search } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { TextField } from '../../../../ce-ui';

const PublishStep = React.memo(({
  subdomain, domainStatus, customDomain,
  handleSubdomainChange, handleCheckDomain, setCustomDomain,
  t,
}) => (
  <div style={{ animation: 'fadeIn 0.3s ease' }}>
    <div style={{ position: 'sticky', top: '-24px', zIndex: 5, background: '#FFFFFF', margin: '-24px -24px 24px', padding: '24px 24px 20px', boxShadow: '0 1px 0 #E5E7EB' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>{t('studio.publish.title')}</h2>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{t('studio.publish.subtitle')}</p>
    </div>

    <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{t('studio.publish.subdomain.title')}</div>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{t('studio.publish.subdomain.subtitle')}</div>
      <div style={{ marginBottom: '12px' }}>
        <TextField
          value={subdomain}
          onChange={e => handleSubdomainChange(e.target.value)}
          placeholder={t('studio.publish.subdomain.placeholder')}
          rightIcon={<span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{t('studio.publish.subdomain.suffix')}</span>}
        />
      </div>
      <Button variant="secondary" onClick={handleCheckDomain} leftIcon={<Search size={14} />} style={{ width: '100%', justifyContent: 'center' }}>
        {t('studio.publish.subdomain.checkAvailability')}
      </Button>
      {domainStatus && (
        <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: domainStatus === 'available' ? '#ECFDF5' : '#FEF2F2', color: domainStatus === 'available' ? '#059669' : '#DC2626', border: `1px solid ${domainStatus === 'available' ? '#A7F3D0' : '#FECACA'}` }}>
          {domainStatus === 'available' ? t('studio.publish.subdomain.available') : t('studio.publish.subdomain.unavailable')}
        </div>
      )}
    </div>

    <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{t('studio.publish.customDomain.title')}</div>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{t('studio.publish.customDomain.subtitle')}</div>
      <div style={{ marginBottom: '16px' }}>
        <TextField
          value={customDomain}
          onChange={e => setCustomDomain(e.target.value)}
          placeholder={t('studio.publish.customDomain.placeholder')}
        />
      </div>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>{t('studio.publish.customDomain.instructions')}</div>
      <div style={{ borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', background: '#F3F4F6', padding: '10px 14px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div>{t('studio.publish.customDomain.recordType')}</div>
          <div>{t('studio.publish.customDomain.recordName')}</div>
          <div>{t('studio.publish.customDomain.recordValue')}</div>
        </div>
        {[{ type: 'CNAME', name: 'www', value: 'proxy.labamu.store' }, { type: 'A', name: '@', value: '76.76.21.21' }].map((rec, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', padding: '10px 14px', fontSize: '13px', color: '#374151', borderTop: '1px solid #E5E7EB' }}>
            <div style={{ fontWeight: 600 }}>{rec.type}</div>
            <div style={{ fontFamily: 'monospace' }}>{rec.name}</div>
            <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{rec.value}</div>
          </div>
        ))}
      </div>
      <Button variant="secondary" onClick={() => alert(t('studio.domainConnectMock'))} style={{ width: '100%', justifyContent: 'center' }}>
        {t('studio.publish.customDomain.connectDomain')}
      </Button>
    </div>
  </div>
));

export default PublishStep;
