import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import AddLanguagePill from '../components/AddLanguagePill';
import { ALL_LANGUAGES } from '../constants';

const ConfigureStep = React.memo(({
  languages, activeLang, setActiveLang,
  handleAddLanguage, handleRemoveLanguage,
  configItems, activeConfigPanel, setActiveConfigPanel,
  t,
}) => (
  <div style={{ animation: 'fadeIn 0.3s ease' }}>
    {/* ── Language Section ── */}
    <div style={{ position: 'sticky', top: '-24px', zIndex: 5, background: '#FFFFFF', margin: '-24px -24px 24px', padding: '24px 24px 20px', borderBottom: '1.5px solid #F3F4F6', boxShadow: '0 1px 0 #E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>{t('studio.basic.languages.title')}</h2>
        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>{languages.length}/5</span>
      </div>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>{t('studio.basic.languages.subtitle')}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {languages.map((lang) => (
          <div
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            style={{ height: '36px', padding: '0 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeLang === lang.code ? '#EEF4FF' : '#FFFFFF', border: activeLang === lang.code ? '1px solid #006BFF' : '1px solid #E5E7EB', color: activeLang === lang.code ? '#006BFF' : '#4B5563', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', boxSizing: 'border-box' }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>{lang.label}</div>
            {languages.length > 1 && (
              <button onClick={(e) => handleRemoveLanguage(lang.code, e)} style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#FEF2F2', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
                <X size={10} strokeWidth={3} />
              </button>
            )}
          </div>
        ))}
        {languages.length < 5 && (
          <AddLanguagePill
            options={ALL_LANGUAGES.filter(l => !languages.find(a => a.code === l.code)).map(l => ({ id: l.code, label: l.label }))}
            onSelect={handleAddLanguage}
            placeholder={t('studio.actions.addLanguage')}
          />
        )}
      </div>
    </div>

    {/* ── Feature Config Cards ── */}
    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>{t('studio.configure.title')}</h2>
    <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0' }}>{t('studio.configure.subtitle')}</p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {configItems.map(item => (
        <div
          key={item.id}
          onClick={() => setActiveConfigPanel(item.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: activeConfigPanel === item.id ? '#EEF4FF' : '#FFFFFF', border: activeConfigPanel === item.id ? '1px solid #006BFF' : '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={e => { if (activeConfigPanel !== item.id) e.currentTarget.style.borderColor = '#B0C4FF'; }}
          onMouseOut={e => { if (activeConfigPanel !== item.id) e.currentTarget.style.borderColor = '#E5E7EB'; }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: activeConfigPanel === item.id ? '#006BFF' : '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeConfigPanel === item.id ? '#FFFFFF' : '#1D4ED8', flexShrink: 0, transition: 'all 0.2s' }}>
            <item.icon size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{item.title}</div>
            <div style={{ fontSize: '12.5px', color: '#9CA3AF' }}>{item.desc}</div>
          </div>
          <ChevronRight size={18} color="#C9CDD4" style={{ flexShrink: 0 }} />
        </div>
      ))}
    </div>
  </div>
));

export default ConfigureStep;
