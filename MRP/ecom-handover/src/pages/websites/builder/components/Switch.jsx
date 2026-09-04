import React from 'react';

const Switch = React.memo(({ label, checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer', minWidth: '140px' }}
  >
    <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: checked ? '#006BFF' : '#E5E7EB', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: checked ? '20px' : '2px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
    </div>
    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{label}</span>
  </div>
));

export default Switch;
