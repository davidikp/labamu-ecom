import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import { useCompany } from '../contexts/CompanyContext';
import { INDUSTRY_LABELS, INDUSTRY_GROUPS } from '../constants/industries';

/**
 * Template Recommendation Matrix (Group-Based)
 * ─────────────────────────────────────────────
 * Templates are tagged with industry GROUPS (not individual keys).
 * When a user selects any industry, we look up its `group` from the
 * INDUSTRIES registry and match it against this list.
 *
 * To add a new industry: just add it to industries.js with the correct
 * `group` value — it will automatically inherit recommendations here.
 */
const TEMPLATES = [
  { id: 'barger',       industries: ['hospitality'],                                                       preview: '/assets/templates/barger/barger.png' },
  { id: 'napoli',       industries: ['hospitality'],                                                       preview: '/assets/templates/napoli/napoli.png' },
  { id: 'xinear',       industries: ['beauty_service', 'retail', 'retail_service', 'tech'],                preview: '/assets/templates/xinear/xinear.png' },
  { id: 'houzez',       industries: ['production', 'prof_services', 'tech', 'real_estate', 'nonprofit'],   preview: '/assets/templates/houzez/assets/houzez.png' },
  { id: 'dekor',        industries: ['retail', 'production', 'retail_service', 'construction', 'other'],   preview: '/assets/templates/dekor/dekor.png' },
  { id: 'medic',        industries: ['healthcare', 'services'],                                            preview: '/assets/templates/medic/medic.png' },
  { id: 'photostoodio', industries: ['services', 'prof_services', 'tech', 'retail_service', 'healthcare', 'nonprofit'], preview: '/assets/templates/photostoodio/photostoodio.png' },
  { id: 'local',        industries: ['retail', 'production', 'construction', 'real_estate', 'other'],      preview: '/assets/templates/local/local.png' }
];

export default function WebsiteTemplates() {
  const { t } = useTranslation();
  const { companyData, isLoading } = useCompany();
  
  // 1. Always call hooks unconditionally
  const [industry, setIndustry] = useState('fnb'); 

  // 2. Sync with companyData once it becomes available
  useEffect(() => {
    if (companyData?.industry) {
      setIndustry(companyData.industry);
    }
  }, [companyData, isLoading]);

  const industries = Object.entries(INDUSTRY_LABELS).map(([key, labelKey]) => ({
    id: key,
    label: t(labelKey),
  }));

  const sortedTemplates = useMemo(() => {
    const selectedIndustryGroup = INDUSTRY_GROUPS[industry] ?? 'other';
    
    return [...TEMPLATES].sort((a, b) => {
      const aRec = a.industries.includes(selectedIndustryGroup);
      const bRec = b.industries.includes(selectedIndustryGroup);
      if (aRec && !bRec) return -1;
      if (!aRec && bRec) return 1;
      return 0;
    });
  }, [industry]);

  const navigate = useNavigate();

  function handlePreview(id) {
    if (id === 'houzez') {
      window.open(`/templates-preview/${id}`, '_blank');
    }
  }

  function handleEdit(id) {
    if (id === 'houzez') {
      navigate(`/templates-edit/${id}`);
    } else {
      alert(t('website:studio.editorComingSoon'));
    }
  }

  // 3. Loading Shell - Keeping Sidebar/Header visible (Layout)
  if (isLoading || !companyData) {
    return (
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #F3F4F6', borderTopColor: '#006BFF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280', fontSize: '14px', fontFamily: "'Lato', sans-serif", fontWeight: 500 }}>
             {t('dashboard:profile.loading') || 'Loading business profile...'}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
          transition: all 0.5s ease-in-out;
        }

        .template-card-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .template-card {
           position: relative;
           border-radius: 16px;
           overflow: hidden;
           border: 1px solid #F3F4F6;
           transition: all 0.3s ease;
           cursor: pointer;
           background: #F9FAFB;
           z-index: 1;
        }

        .template-card:hover {
           transform: translateY(-4px);
           border-color: #006BFF;
           box-shadow: 0 12px 24px rgba(0, 107, 255, 0.12);
        }

        .template-overlay {
           position: absolute;
           inset: 0;
           background: rgba(0, 0, 0, 0.5);
           opacity: 0;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           gap: 16px;
           transition: opacity 0.2s;
           backdrop-filter: blur(4px);
           padding: 24px;
           z-index: 20;
        }

        .template-card:hover .template-overlay {
           opacity: 1;
        }

        .badge-recommended {
           position: absolute;
           top: 16px;
           right: 16px;
           padding: 6px 14px;
           border-radius: 100px;
           font-size: 10px;
           font-weight: 700;
           text-transform: uppercase;
           letter-spacing: 0.8px;
           background: #006BFF; /* Labamu Blue */
           color: #FFFFFF; /* High-Contrast White */
           box-shadow: 0 4px 12px rgba(0, 107, 255, 0.25);
           display: flex;
           align-items: center;
           gap: 6px;
           z-index: 5;
           border: 1px solid rgba(255, 255, 255, 0.1); 
           transition: all 0.3s ease;
        }

        .template-img {
           width: 100%;
           aspect-ratio: 4/3;
           object-fit: cover;
           object-position: top center;
           display: block;
        }
      `}</style>

      <main style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Hero Section */}
        <div style={{ padding: '80px 32px 48px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', letterSpacing: '-0.03em' }}>
            {t('website:hero.titlePrefix')} {companyData.brandName}
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280', margin: '0 0 40px 0', lineHeight: '28px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            {t('website:hero.subtitle')}
          </p>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '4px', 
            background: '#FFFFFF', padding: '16px 32px', borderRadius: '100px', 
            border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'all 0.3s',
            fontSize: '16px', color: '#4B5563'
          }}>
            <span style={{ fontWeight: 500 }}>
              {t('website:hero.filterLabel')}
            </span>
            <Dropdown 
              variant="seamless"
              options={industries}
              selected={industry}
              onSelect={setIndustry}
              width="auto"
            />
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 32px 0' }}>
            {t('dashboard:gallery.browse')}
          </h2>
        </div>

        <div style={{ padding: '0 32px 100px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div className="template-grid">
            {sortedTemplates.map(tmp => {
               const industryGroup = INDUSTRY_GROUPS[industry] ?? 'other';
               const isRecommended = tmp.industries.includes(industryGroup);
               
               return (
                 <div key={tmp.id} className="template-card-container">
                    <div className="template-card">
                       <img 
                          src={tmp.preview} 
                          className="template-img"
                          alt={tmp.id} 
                       />
                       
                       {isRecommended && (
                         <div className="badge-recommended">
                           <span style={{ fontSize: '13px' }}>👍</span>
                           <span>{t('website:gallery.recommended')}</span>
                         </div>
                       )}

                       <div className="template-overlay">
                          <Button 
                            variant="secondary" 
                            width="180px"
                            onClick={(e) => { e.stopPropagation(); handlePreview(tmp.id); }}
                            style={{ padding: '12px 24px', fontSize: '14px' }}
                          >
                            {t('website:gallery.preview')}
                          </Button>
                          <Button 
                            variant="primary" 
                            width="180px"
                            onClick={(e) => { e.stopPropagation(); handleEdit(tmp.id); }}
                            style={{ padding: '12px 24px', fontSize: '14px' }}
                          >
                            {t('website:gallery.edit')}
                          </Button>
                       </div>
                    </div>

                    <div style={{ padding: '0 4px' }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                        {t(`website:gallery.templates.${tmp.id}.title`)}
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '14px', 
                        color: '#6B7280', 
                        lineHeight: '20px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '40px'
                      }}>
                        {t(`website:gallery.templates.${tmp.id}.desc`)}
                      </p>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
