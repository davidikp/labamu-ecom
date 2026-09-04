import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/min';
import enLabels from 'react-phone-number-input/locale/en.json';

/**
 * Labamu PhoneInput Component
 *
 * Fully custom phone input with:
 * - Country flag parsed from typed digits (no forced validation mid-type)
 * - Local uncontrolled buffer — parent only receives value on blur (not every keystroke)
 * - Country dropdown with search
 * - Validation deferred to save-time
 *
 * @param {string}   value          - Current phone string (e.g. "+62 812 9876 5432")
 * @param {function} onChange       - Called on blur with the latest raw string
 * @param {string}   placeholder    - Input placeholder
 * @param {boolean}  disabled       - Disabled state
 * @param {string}   defaultCountry - ISO 3166-1 alpha-2 country code (e.g. "ID")
 */

// ─── Country data ────────────────────────────────────────────────────────────

const ALL_COUNTRIES = getCountries().map(code => ({
  value: code,
  label: enLabels[code] || code,
  callingCode: getCountryCallingCode(code),
}));

/**
 * For calling codes shared by multiple countries (e.g. NANP +1),
 * specify which country should be inferred as the default.
 */
const SHARED_CODE_PRIORITY = {
  '1':   'US', // NANP — USA takes priority over Antigua, Canada, Jamaica, etc.
  '7':   'RU', // Russia (also Kazakhstan)
  '44':  'GB', // United Kingdom (also Jersey, Guernsey, Isle of Man)
  '61':  'AU', // Australia (also Christmas Island, Cocos Islands)
  '64':  'NZ', // New Zealand (also Pitcairn Islands)
  '262': 'RE', // Réunion (also Mayotte)
};

/**
 * Build a lookup table: callingCode → ISO code.
 * Sorted longest-first so longer prefixes (e.g. "+376") win over shorter ones (e.g. "+3").
 * SHARED_CODE_PRIORITY overrides the default first-match winner for ambiguous codes.
 */
const CALLING_CODE_MAP = (() => {
  const map = {};
  // First pass: fill with first-match (sorted by code length desc, then alpha)
  [...ALL_COUNTRIES]
    .sort((a, b) => b.callingCode.length - a.callingCode.length || a.value.localeCompare(b.value))
    .forEach(c => {
      if (!map[c.callingCode]) map[c.callingCode] = c.value;
    });
  // Second pass: apply priority overrides
  Object.entries(SHARED_CODE_PRIORITY).forEach(([code, iso]) => {
    map[code] = iso;
  });
  return map;
})();

/** Infer ISO country code from a raw phone string like "+6281..." */
function inferCountry(raw) {
  if (!raw || !raw.startsWith('+')) return null;
  const digits = raw.replace(/\D/g, '');
  // Try lengths 4 → 1
  for (let len = 4; len >= 1; len--) {
    const code = digits.slice(0, len);
    if (CALLING_CODE_MAP[code]) return CALLING_CODE_MAP[code];
  }
  return null;
}

// ─── Country Select Dropdown ──────────────────────────────────────────────────

function CountrySelect({ country, onCountryChange, isMobile }) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const filtered = ALL_COUNTRIES
    .filter(c =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.callingCode.includes(search) ||
      c.value.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.value === country ? -1 : b.value === country ? 1 : 0));

  return (
    <div ref={containerRef} style={{ position: isMobile ? 'static' : 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', paddingRight: '12px', height: '100%' }}
      >
        <div style={{ width: 24, height: 16, display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
          {country ? (
            <img
              key={country}
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country}.svg`}
              alt={country}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ margin: 'auto' }}>
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          )}
        </div>
        <svg 
          width="12" height="7" viewBox="0 0 12 7" fill="none" 
          style={{ 
            transition: 'transform 0.2s', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            color: '#282828', 
            flexShrink: 0 
          }}
        >
          <path d="M1.2 1L6 5.8L10.8 1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', 
          left: isMobile ? '0' : '-16px',
          right: isMobile ? '0' : 'auto',
          width: isMobile ? '100%' : '240px',
          background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 1000,
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Search */}
          <div style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: '6px', padding: '0 10px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                autoFocus
                type="text"
                autoComplete="off"
                placeholder={t('phone.searchCountry')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', border: 'none', background: 'transparent', padding: '8px', fontSize: '15px', outline: 'none', fontFamily: "'Lato', sans-serif", caretColor: 'var(--focus-color, #006BFF)', lineHeight: '22px' }}
              />
            </div>
          </div>
          {/* List */}
          <div style={{ maxHeight: '240px', overflowY: 'auto' }} className="labamu-scrollbar">
            {filtered.map(opt => {
              const isSelected = country === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => { onCountryChange(opt.value); setIsOpen(false); }}
                  style={{
                    padding: '10px 16px', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'transparent',
                    color: '#111827',
                    fontWeight: isSelected ? 700 : 400,
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ width: 24, height: 16, display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${opt.value}.svg`}
                        alt={opt.value}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <span style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      flex: 1
                    }}>
                      {opt.label}
                    </span>
                    <span style={{ color: '#9CA3AF', fontSize: '13px', flexShrink: 0 }}>+{opt.callingCode}</span>
                  </div>
                  {isSelected && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginLeft: '12px' }}>
                      <path d="M4 10.5L8 14.5L16 5.5" stroke="#282828" strokeWidth="1.2" />
                    </svg>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '16px', fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>{t('phone.noCountry')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main PhoneInput ──────────────────────────────────────────────────────────

const ERROR_RED = '#D0021B';

export default function PhoneInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  defaultCountry = 'ID',
  error = '',
  maxDigits = 20,
  isMobile = false,
  height = '40px',
}) {
  const { t } = useTranslation('common');
  const resolvedPlaceholder = placeholder ?? t('phone.placeholder');
  // LOCAL buffer — not synced from parent on every render.
  // This eliminates the controlled-input double-delete bug.
  const [localValue, setLocalValue] = useState(() => value || '');
  const [country, setCountry] = useState(() => inferCountry(value) || defaultCountry);
  const [isFocused, setIsFocused] = useState(false);

  // Sync initial value from parent only on mount (or when parent resets to empty)
  const prevValueRef = useRef(value);
  useEffect(() => {
    // Allow parent to reset (e.g. on Cancel)
    if (!value && prevValueRef.current) {
      setLocalValue('');
      setCountry(defaultCountry);
    }
    prevValueRef.current = value;
  }, [value, defaultCountry]);

  // Parse country flag as the user types — no blocking, just reading
  // Only allow digits, +, spaces, hyphens, parentheses (valid phone chars)
  // Enforce maxDigits cap
  function handleInput(e) {
    const raw = e.target.value.replace(/[^0-9+\s\-().]/g, '');
    // Count only digits for max check
    const digitCount = (raw.match(/\d/g) || []).length;
    if (digitCount > maxDigits) return; // silently reject
    setLocalValue(raw);
    const inferred = inferCountry(raw);
    if (inferred) setCountry(inferred);
  }

  // Sync to parent only on blur — no re-render per keystroke
  function handleBlur() {
    setIsFocused(false);
    onChange(localValue);
  }

  // When user picks a country from dropdown:
  // preserve existing national number, replace/prepend the calling code
  function handleCountryChange(newCountry) {
    setCountry(newCountry);
    const newPrefix = '+' + getCountryCallingCode(newCountry);
    const oldPrefix = '+' + getCountryCallingCode(country);

    let national = localValue;
    if (national.startsWith(oldPrefix)) {
      national = national.slice(oldPrefix.length).trim();
    } else if (national.startsWith('+')) {
      // strip any other leading country code
      national = national.replace(/^\+\d{1,4}\s?/, '').trim();
    }
    const next = national ? `${newPrefix} ${national}` : newPrefix;
    setLocalValue(next);
    onChange(next);
  }

  const borderColor = error && !isFocused ? ERROR_RED : '#E5E7EB';
  const focusClass = error ? 'labamu-phone-wrap-error' : 'labamu-phone-wrap';

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        height,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '0 16px',
        background: '#FFFFFF',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        position: 'relative',
      }}
        className={focusClass}
      >
        <style>{`
          .labamu-phone-wrap:focus-within { border-color: var(--focus-color, #006BFF) !important; }
          .labamu-phone-wrap-error:focus-within { border-color: ${ERROR_RED} !important; }
        `}</style>
        <CountrySelect country={country} onCountryChange={handleCountryChange} isMobile={isMobile} />
        <input
          type="tel"
          autoComplete="off"
          value={localValue}
          onChange={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          style={{
            flex: 1, height: '100%',
            border: 'none', outline: 'none',
            fontSize: '15px', color: '#1A1A1A',
            background: 'transparent',
            fontFamily: "'Lato', sans-serif",
            caretColor: 'var(--focus-color, #006BFF)',
            lineHeight: '22px'
          }}
        />
      </div>
      {error && !isFocused && (
        <span style={{ fontSize: '13px', color: ERROR_RED, marginTop: '6px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}

