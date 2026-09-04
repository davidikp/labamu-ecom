import React from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AddLanguagePill = React.memo(({ options, onSelect, placeholder }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [menuPos, setMenuPos] = React.useState({ top: 0, left: 0, width: 0 });
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const filtered = options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const updatePos = React.useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 180) });
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [isOpen, updatePos]);

  React.useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current.focus(), 10);
  }, [isOpen]);

  React.useEffect(() => {
    function onDown(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) { setIsOpen(false); setSearchTerm(''); }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const HEIGHT = 36;
  const RADIUS = 10;

  return (
    <div ref={triggerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => { setIsOpen(v => !v); setSearchTerm(''); }}
        style={{
          height: `${HEIGHT}px`, padding: '0 12px', borderRadius: `${RADIUS}px`,
          border: 'none', background: 'transparent', color: '#006BFF',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
          position: 'relative', boxSizing: 'border-box',
        }}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <rect
            style={{ x: '1px', y: '1px', width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
            rx={RADIUS - 1} fill="none" stroke="#006BFF" strokeWidth="1" strokeDasharray="4 3"
          />
        </svg>
        {placeholder}
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed', top: `${menuPos.top}px`, left: `${menuPos.left}px`,
            width: `${menuPos.width}px`, background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            zIndex: 99999, maxHeight: '280px', overflowY: 'auto', padding: '6px 0',
          }}
          className="labamu-scrollbar"
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', borderRadius: '6px', padding: '0 10px', height: '34px', border: '1px solid #E5E7EB' }}>
              <Search size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef} type="text" autoComplete="off" placeholder={t('website:studio.search.placeholder')}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#1B1B1B', background: 'transparent', padding: '0 8px', height: '100%' }}
              />
            </div>
          </div>
          {filtered.length > 0 ? filtered.map((opt, i) => (
            <div key={opt.id}>
              {i > 0 && <div style={{ height: '1px', background: '#F3F4F6', margin: '0 14px' }} />}
              <div
                onClick={() => { onSelect(opt.id); setIsOpen(false); setSearchTerm(''); }}
                style={{ padding: '0 14px', height: '40px', fontSize: '15px', color: '#1B1B1B', fontWeight: 400, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.1s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {opt.label}
              </div>
            </div>
          )) : (
            <div style={{ padding: '16px', fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>{t('website:studio.search.noResults')}</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
});

export default AddLanguagePill;
