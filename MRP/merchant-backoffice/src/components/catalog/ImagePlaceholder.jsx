// Shared "no image" placeholder for catalog and package images.
export default function ImagePlaceholder({ size = 40, radius = 8 }) {
  const isFull = size === '100%';
  const dim = typeof size === 'number' ? `${size}px` : size;
  const iconSize = isFull || (typeof size === 'number' && size > 100) ? 48 : 20;
  return (
    <div style={{ width: dim, height: dim, borderRadius: radius, background: '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    </div>
  );
}
