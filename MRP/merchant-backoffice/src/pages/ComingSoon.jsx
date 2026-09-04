import { useLocation } from 'react-router-dom';

const TITLES = {
  '/orders': 'Orders',
  '/catalog/package': 'Package',
  '/catalog/modifier': 'Modifier',
  '/rfq': 'Request for Quotes',
  '/bookings': 'Bookings',
  '/reviews': 'Reviews',
  '/delivery-settings': 'Delivery Settings',
  '/domain/customize': 'Customize Domain',
  '/domain/tracking': 'Website Tracking',
  '/role-management': 'Role Management',
};

export default function ComingSoon() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Coming Soon';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', gap: '8px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)' }}>{title}</h1>
      <p style={{ fontSize: '14px', color: '#6A7282' }}>This section is coming soon.</p>
    </div>
  );
}
