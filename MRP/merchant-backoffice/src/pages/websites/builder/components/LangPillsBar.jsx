import React from 'react';

const LangPillsBar = React.memo(({ languages, activeLang, setActiveLang, onAutoTranslate, isTranslating, t }) => {
  if (languages.length <= 1) return null;
  const primaryCode = languages[0]?.code;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            style={{
              height: '28px', padding: '0 12px', borderRadius: '20px',
              border: activeLang === lang.code ? '1px solid #006BFF' : '1px solid #E5E7EB',
              background: activeLang === lang.code ? '#EEF4FF' : '#FFFFFF',
              color: activeLang === lang.code ? '#006BFF' : '#6B7280',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Lato', sans-serif", transition: 'all 0.15s'
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>
      {activeLang !== primaryCode && (
        <button
          onClick={onAutoTranslate}
          disabled={isTranslating}
          style={{
            fontSize: '12px', color: '#006BFF', background: 'none', border: 'none',
            cursor: isTranslating ? 'not-allowed' : 'pointer', fontFamily: "'Lato', sans-serif",
            fontWeight: 600, padding: '0', opacity: isTranslating ? 0.5 : 1,
            textDecoration: 'underline', textUnderlineOffset: '2px'
          }}
        >
          {isTranslating ? t('studio.actions.translating') : t('studio.actions.autoTranslateFrom', { lang: languages[0].label })}
        </button>
      )}
    </div>
  );
});

export default LangPillsBar;
