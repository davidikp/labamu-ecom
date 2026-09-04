import React from 'react';

const ConfigSection = React.memo(({ title, subtitle, children, noBorder }) => (
  <div style={{ marginBottom: '32px', borderBottom: noBorder ? 'none' : '1px solid #F3F4F6', paddingBottom: noBorder ? '0' : '32px' }}>
    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{title}</h3>
    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px 0' }}>{subtitle}</p>
    {children}
  </div>
));

export default ConfigSection;
