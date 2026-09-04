import { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';

/**
 * Floating "Simulate" trigger — same look/placement as demo-mrp's dashboard
 * Simulate Event button (a black pill, bottom-right of the page, ⚡ icon),
 * reused here since there's no real backend for these screens to fail
 * against. Clicking it opens a small dropdown panel of checkboxes/actions
 * instead of scattering always-visible toggles across the page.
 *
 * `options`: array of any of
 *   { type: 'checkbox', label, checked, onChange }
 *   { type: 'action', label, onClick }
 *   { type: 'select', label, value, onChange, choices: [{ value, label }] }
 *     — for outcomes that are mutually exclusive (e.g. "no failure" /
 *     "partial failure" / "total failure" for the same bulk action).
 *
 * `aboveFooter`: true sits the button just above a page's sticky footer
 * action bar instead of flush against the viewport corner (Edit/Create Page
 * screens have one; the Pages list doesn't).
 */
export default function SimulateTrigger({ options, aboveFooter = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Click/tap anywhere outside the button+panel closes it, same as any
  // other dropdown/popover in this app.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: 'fixed', right: 24, bottom: aboveFooter ? 88 : 24, zIndex: 40 }}>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            minWidth: 220,
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
            padding: '8px 0',
          }}
        >
          {options.map((opt) =>
            opt.type === 'select' ? (
              <div
                key={opt.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                  color: '#282828',
                }}
              >
                <span>{opt.label}</span>
                <select
                  value={opt.value}
                  onChange={(e) => opt.onChange(e.target.value)}
                  style={{
                    fontSize: 12,
                    color: '#282828',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    padding: '4px 6px',
                    background: '#fff',
                  }}
                >
                  {opt.choices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : opt.type === 'action' ? (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  opt.onClick();
                }}
                style={{
                  width: '100%',
                  display: 'block',
                  textAlign: 'left',
                  padding: '8px 14px',
                  fontSize: 13,
                  color: '#282828',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ) : (
              <label
                key={opt.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  fontSize: 13,
                  color: '#282828',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.onChange(e.target.checked)}
                />
                {opt.label}
              </label>
            )
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          borderRadius: 999,
          background: '#0F0F0F',
          color: '#fff',
          border: 'none',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        }}
      >
        <Zap size={14} fill="currentColor" />
        Simulate
      </button>
    </div>
  );
}
