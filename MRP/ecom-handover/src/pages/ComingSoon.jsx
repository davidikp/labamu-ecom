import { useLocation } from 'react-router-dom';

const TITLES = {
  '/online-store/theme': 'Website Builder',
  '/online-store/preferences': 'Preferences',
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
  // /section-builder/:storeId(/pages/:pageId) is dynamic (real ids in the
  // path), so it can't be an exact TITLES key like the static routes below.
  const title = location.pathname.startsWith('/section-builder/')
    ? 'Website Builder'
    : TITLES[location.pathname] || 'Coming Soon';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', gap: '8px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)' }}>{title}</h1>
      <p style={{ fontSize: '14px', color: '#6A7282' }}>This section is coming soon.</p>
    </div>
  );
}
