import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

/**
 * @component Dropdown
 * @description Labamu-styled dropdown with inline type-to-search.
 * Default variant: checkmark on selected, clear button, error state.
 * Seamless variant (Website Studio): minimal, no border/error/clear.
 */

const ERROR_RED = '#D0021B';

export default function Dropdown({
  label,
  options = [],
  selected,
  onSelect,
  placeholder = 'Select option',
  width = '100%',
  variant = 'default',
  error = '',
  hideChevron = false,
  hideSearch = false,
  primary = false,
  style
}) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuPlacement, setMenuPlacement] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const isSeamless = variant === 'seamless';
  const selectedOption = (options || []).find(opt => opt.id === selected);
  const resolvedPlaceholder = placeholder === 'Select option' ? t('dropdown.select') : placeholder;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate menu placement
  const updatePlacement = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuPlacement({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePlacement();
      
      // Update placement on scroll and resize
      window.addEventListener('scroll', updatePlacement, true);
      window.addEventListener('resize', updatePlacement);
      
      return () => {
        window.removeEventListener('scroll', updatePlacement, true);
        window.removeEventListener('resize', updatePlacement);
      };
    }
  }, [isOpen, updatePlacement]);

  // Auto-focus the input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 10);
    }
  }, [isOpen]);

  const filteredOptions = options
    .filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.id === selected ? -1 : b.id === selected ? 1 : 0));

  function handleOpen() {
    setIsOpen(true);
    setSearchTerm('');
  }

  function handleSelect(optionId) {
    onSelect(optionId);
    setIsOpen(false);
    setSearchTerm('');
  }

  function handleClear(e) {
    e.stopPropagation();
    onSelect('');
    setIsOpen(false);
    setSearchTerm('');
  }

  // Border color logic: active > error > default
  const borderColor = (() => {
    if (isSeamless) return 'transparent';
    if (variant === 'filter') return isOpen || selectedOption ? '#006BFF' : '#A9A9A9';
    if (isOpen) return 'var(--focus-color, #006BFF)';
    if (error) return '#EF4444';
    if (variant === 'dashed') return style?.borderColor || '#9CA3AF';
    return '#E5E7EB';
  })();

  const resolvedBorderColor = (primary && variant === 'dashed') ? '#006BFF' : borderColor;

  const backgroundTheme = variant === 'dashed' 
    ? (isOpen ? '#FFFFFF' : (isHovered ? '#EEF4FF' : '#FFFFFF')) 
    : (isSeamless ? 'transparent' : '#FFFFFF');

  const borderType = variant === 'dashed' ? '1px dashed' : '1px solid';

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: isSeamless ? 'auto' : width, 
        display: (isSeamless || width === 'auto') ? 'inline-block' : 'block', 
        boxSizing: 'border-box',
        ...style 
      }}
    >
      {label && !isSeamless && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: 600, 
          color: '#6B7280' 
        }}>
          {label}
        </label>
      )}
      
      {/* Trigger / Inline Search Field */}
      <div 
        onClick={() => !isOpen && handleOpen()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: backgroundTheme,
          border: isSeamless ? 'none' : `${borderType} ${resolvedBorderColor}`,
          borderRadius: isSeamless ? '0' : (style?.borderRadius || '8px'),
          padding: isSeamless ? '0 4px' : '0 12px',
          height: isSeamless ? 'auto' : (style?.height || (variant === 'filter' ? '34px' : '40px')),
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSeamless ? 'flex-start' : (hideChevron && !selectedOption ? 'center' : 'space-between'),
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: isSeamless ? 'inherit' : (variant === 'filter' ? '14px' : '15px'),
          fontWeight: isSeamless ? 700 : (variant === 'filter' ? 400 : 500),
          boxShadow: 'none',
          verticalAlign: isSeamless ? 'baseline' : 'middle',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: isSeamless ? '#006BFF' : (variant === 'filter' ? (selectedOption ? '#282828' : '#A9A9A9') : (selectedOption ? '#1B1B1B' : (primary && variant === 'dashed' ? '#006BFF' : '#9CA3AF'))),
          fontSize: isSeamless ? 'inherit' : '15px'
        }}>
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </span>
        
        {/* Right-side icons */}
        {/* Right-side icons - only render if there are icons to show */}
        {!isSeamless && (!hideChevron || (selectedOption && isOpen)) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
            {/* Clear button — only when there's a selection and dropdown is open or focused */}
            {selectedOption && isOpen && (
              <svg 
                onClick={handleClear}
                width="16" height="16" viewBox="0 0 16 16" fill="none" 
                style={{ cursor: 'pointer', color: '#9CA3AF' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
              >
                <path d="M4 4L12 12M12 4L4 12" stroke="#282828" strokeWidth="1.2" />
              </svg>
            )}
            {/* Chevron */}
            {!hideChevron && (
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
            )}
          </div>
        )}
      </div>

      {/* Options Panel Rendered via Portal */}
      {isOpen && createPortal(
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
          top: `${menuPlacement.top}px`,
          left: `${menuPlacement.left}px`,
          minWidth: isSeamless ? 'max-content' : `${menuPlacement.width}px`,
          width: 'max-content',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          zIndex: 99999,
          maxHeight: '280px',
          overflowY: 'auto',
          padding: '6px 0',
          fontFamily: "'Lato', sans-serif",
        }}
          className="labamu-scrollbar"
        >
          {/* Search Box inside Options Panel */}
          {!hideSearch && <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F9FAFB',
              borderRadius: '6px',
              padding: '0 10px',
              height: '34px',
              border: '1px solid #E5E7EB'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                ref={inputRef}
                type="text"
                autoComplete="off"
                placeholder={t('dropdown.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#1B1B1B',
                  background: 'transparent',
                  padding: '0 8px',
                  height: '100%',
                  fontFamily: "'Lato', sans-serif"
                }}
              />
            </div>
          </div>}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = selected === option.id;
              return (
                <div key={option.id}>
                  {index > 0 && (
                    <div style={{ height: '1px', background: '#F3F4F6', margin: '0 14px' }} />
                  )}
                  <div 
                    onClick={() => handleSelect(option.id)}
                    style={{
                      padding: '0 14px',
                      height: '40px',
                      fontSize: '15px',
                      color: '#1B1B1B',
                      fontWeight: isSelected ? 700 : 400,
                      cursor: 'pointer',
                      background: 'transparent',
                      transition: 'background 0.1s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{option.label}</span>
                    {/* Checkmark on selected option */}
                    {isSelected && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginLeft: '12px' }}>
                        <path d="M4 10.5L8 14.5L16 5.5" stroke="#282828" strokeWidth="1.2" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '16px', fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>
              {t('dropdown.noResult')}
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Inline error text */}
      {error && !isSeamless && !isOpen && (
        <span style={{ fontSize: '13px', color: ERROR_RED, marginTop: '6px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}
