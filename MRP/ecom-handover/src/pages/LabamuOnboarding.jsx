import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../contexts/SnackbarContext';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import Stepper from '../components/ui/Stepper';
import Button from '../components/ui/Button';
import ImageCropModal from '../components/ui/ImageCropModal';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { TextField, RadioCard, MediaUploadField, Popup } from '../ce-ui';
import { useBuilderContent } from './websites/builder/useBuilderContent';
import { useBuilderFeatures } from './websites/builder/useBuilderFeatures';
import { useBuilderPublish } from './websites/builder/useBuilderPublish';
import FeaturesStep from './websites/builder/steps/FeaturesStep';
import ConfigureStep from './websites/builder/steps/ConfigureStep';
import StylingStep from './websites/builder/steps/StylingStep';
import PublishStep from './websites/builder/steps/PublishStep';
import BusinessPanel from './websites/builder/panels/BusinessPanel';
import ShopPanel from './websites/builder/panels/ShopPanel';
import ContactPanel from './websites/builder/panels/ContactPanel';
import QuotePanel from './websites/builder/panels/QuotePanel';
import AppointmentPanel from './websites/builder/panels/AppointmentPanel';
import LocationPanel from './websites/builder/panels/LocationPanel';
import ReviewsPanel from './websites/builder/panels/ReviewsPanel';
import CustomPagePanel from './websites/builder/panels/CustomPagePanel';
import HouzezPreview from './websites/templates/houzez/HouzezPreview';

const LANGUAGE_OPTIONS = [
  { id: 'id', labelKey: 'auth:onboarding.basic.languages.indonesian' },
  { id: 'en', labelKey: 'auth:onboarding.basic.languages.english' },
  { id: 'both', labelKey: 'auth:onboarding.basic.languages.both' },
];

const PLATFORM_OPTIONS = [
  {
    id: 'labamu-app',
    labelKey: 'auth:onboarding.basic.labamuApp',
    helperKey: 'auth:onboarding.basic.labamuAppDescription',
    disabled: false,
  },
  {
    id: 'mrp',
    labelKey: 'auth:onboarding.basic.mrp',
    helperKey: 'auth:onboarding.basic.mrpDescription',
    disabled: true,
  },
];

const TEMPLATE_OPTIONS = [
  {
    id: 'xinear',
    preview: '/assets/templates/xinear/xinear.png',
    titleKey: 'website:gallery.templates.xinear.title',
    descKey: 'website:gallery.templates.xinear.desc',
    recommended: true,
  },
  {
    id: 'houzez',
    preview: '/assets/templates/houzez/assets/houzez.png',
    titleKey: 'website:gallery.templates.houzez.title',
    descKey: 'website:gallery.templates.houzez.desc',
  },
  {
    id: 'barger',
    preview: '/assets/templates/barger/barger.png',
    titleKey: 'website:gallery.templates.barger.title',
    descKey: 'website:gallery.templates.barger.desc',
  },
  {
    id: 'napoli',
    preview: '/assets/templates/napoli/napoli.png',
    titleKey: 'website:gallery.templates.napoli.title',
    descKey: 'website:gallery.templates.napoli.desc',
  },
  {
    id: 'dekor',
    preview: '/assets/templates/dekor/dekor.png',
    titleKey: 'website:gallery.templates.dekor.title',
    descKey: 'website:gallery.templates.dekor.desc',
  },
  {
    id: 'medic',
    preview: '/assets/templates/medic/medic.png',
    titleKey: 'website:gallery.templates.medic.title',
    descKey: 'website:gallery.templates.medic.desc',
  },
  {
    id: 'photostoodio',
    preview: '/assets/templates/photostoodio/photostoodio.png',
    titleKey: 'website:gallery.templates.photostoodio.title',
    descKey: 'website:gallery.templates.photostoodio.desc',
  },
  {
    id: 'local',
    preview: '/assets/templates/local/local.png',
    titleKey: 'website:gallery.templates.local.title',
    descKey: 'website:gallery.templates.local.desc',
  },
];

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: '20px', lineHeight: '28px', fontWeight: 800, color: 'var(--neutral-on-surface-primary)' }}>
          {title}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '14px', lineHeight: '22px', color: 'var(--neutral-on-surface-secondary)' }}>
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
}

function FooterLanguageSwitcher({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className="relative" style={{ width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-11 px-3 flex items-center justify-between gap-2 rounded-lb-input border font-lb text-[14px] text-lb-on-surface bg-lb-surface cursor-pointer transition-colors duration-150 ${
          open ? 'border-lb-brand' : 'border-lb-line-1 hover:border-lb-line-2'
        }`}
      >
        <span className="flex items-center gap-2 font-lb-bold">
          <span aria-hidden="true">{selected?.flag}</span>
          <span>{selected?.short}</span>
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div
          className="font-lb absolute left-0 w-[220px] rounded-lb-card border border-lb-line-1 bg-lb-surface shadow-lb overflow-hidden z-20"
          style={{ bottom: 'calc(100% + 8px)' }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`w-full px-4 py-3 border-none flex items-center justify-between gap-2 cursor-pointer text-left text-[14px] transition-colors duration-150 ${
                  isSelected
                    ? 'bg-lb-brand-light text-lb-brand font-lb-bold'
                    : 'bg-transparent text-lb-on-surface hover:bg-lb-surface-grey'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true">{option.flag}</span>
                  <span>{option.label}</span>
                </span>
                {isSelected && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, selected, onSelect, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        type="button"
        onClick={() => onSelect(template.id)}
        style={{
          position: 'relative',
          width: '100%',
          padding: 0,
          borderRadius: '18px',
          overflow: 'hidden',
          border: selected ? '2px solid var(--feature-brand-primary)' : '1px solid var(--neutral-line-separator-1)',
          background: 'var(--neutral-surface-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: selected ? '0 12px 24px rgba(0, 107, 255, 0.12)' : 'none',
        }}
      >
        <img
          src={template.preview}
          alt={t(template.titleKey)}
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />

        {template.recommended && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 10px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--status-green-on-container)',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            {t('auth:onboarding.template.recommended')}
          </div>
        )}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          aria-hidden="true"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: selected ? '2px solid var(--feature-brand-primary)' : '1px solid var(--neutral-line-separator-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'var(--neutral-surface-primary)',
          }}
        >
          {selected && (
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--feature-brand-primary)' }} />
          )}
        </div>
        <div>
          <div style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)' }}>
            {t(template.titleKey)}
          </div>
          <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
            {t(template.descKey)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({ open, onClose, title, description, confirmLabel, cancelLabel }) {
  return (
    <Popup
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      platform="desktop"
      primaryAction={{ label: confirmLabel.text, onClick: confirmLabel.onClick }}
      secondaryAction={{ label: cancelLabel.text, onClick: cancelLabel.onClick }}
    />
  );
}

function SyncPlatformConfirmModal({ open, onClose, onConfirm, selectedPlatform, t }) {
  const platformLabel = selectedPlatform === 'mrp' ? t('auth:onboarding.basic.mrp') : t('auth:onboarding.basic.labamuApp');

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      title={t('auth:onboarding.syncConfirm.title')}
      description={t('auth:onboarding.syncConfirm.description', { platform: platformLabel })}
      confirmLabel={{ text: t('auth:onboarding.syncConfirm.confirm'), onClick: onConfirm }}
      cancelLabel={{ text: t('auth:onboarding.syncConfirm.cancel'), onClick: onClose }}
    />
  );
}

function SkipWebsiteSetupModal({ open, onClose, onConfirm, t }) {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      title={t('auth:onboarding.skip.title')}
      description={t('auth:onboarding.skip.description')}
      confirmLabel={{ text: t('auth:onboarding.skip.confirm'), onClick: onConfirm }}
      cancelLabel={{ text: t('auth:onboarding.skip.cancel'), onClick: onClose }}
    />
  );
}

export default function LabamuOnboarding() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { t: websiteT } = useTranslation('website');
  const { showSnackbar } = useSnackbar();

  const content = useBuilderContent();
  const publish = useBuilderPublish();
  const features = useBuilderFeatures({
    onCustomPageAdd: content.handleCustomPageAdd,
    onCustomPageRemove: content.handleCustomPageRemove,
    onCustomPageRename: content.handleCustomPageRename,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('xinear');
  const firstTimeSource = sessionStorage.getItem('lb_first_time_source');
  const fromMRP = firstTimeSource === 'mrp';
  const fromBoth = firstTimeSource === 'both';
  const [selectedPlatform, setSelectedPlatform] = useState(fromMRP ? 'mrp' : 'labamu-app');
  const [syncPlatformConfirmOpen, setSyncPlatformConfirmOpen] = useState(false);
  const [pendingFinishAction, setPendingFinishAction] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState('desktop');
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [activeConfigPanel, setActiveConfigPanel] = useState('business');
  const [websiteLanguage, setWebsiteLanguage] = useState(() => {
    const codes = content.languages?.map((lang) => lang.code) ?? [];
    if (codes.includes('id') && codes.includes('en')) return 'both';
    return codes[0] === 'id' ? 'id' : 'en';
  });

  const steps = [
    t('auth:onboarding.steps.basicInformation'),
    t('auth:onboarding.steps.styling'),
    t('auth:onboarding.steps.features'),
    t('auth:onboarding.steps.configure'),
    t('auth:onboarding.steps.publish'),
  ];

  const deferredFeatureOrder = useDeferredValue(features.featureOrder);
  const deferredSelectedFeatures = useDeferredValue(features.selectedFeatures);

  const configItems = useMemo(() => {
    const items = [
      {
        id: 'business',
        title: websiteT('studio.configure.panels.business'),
        desc: websiteT('studio.configure.panels.businessDesc'),
        icon: ImageIcon,
      },
    ];

    features.featureOrder.forEach((id) => {
      if (!features.selectedFeatures.has(id)) return;

      const found = features.AVAILABLE_FEATURES.find((feature) => feature.id === id);
      if (found) {
        items.push({
          id: found.id,
          title: websiteT(`studio.configure.panels.${found.id}`),
          desc: websiteT(`studio.configure.panels.${found.id}Desc`),
          icon: found.icon,
        });
        return;
      }

      items.push({
        id,
        title: content.currentConfig.customPages?.[id] || websiteT('studio.features.pageName'),
        desc: t('auth:onboarding.studio.customPageDesc'),
        icon: LinkIcon,
        isCustom: true,
      });
    });

    return items;
  }, [
    content.currentConfig.customPages,
    features.AVAILABLE_FEATURES,
    features.featureOrder,
    features.selectedFeatures,
    websiteT,
  ]);

  const currentLocale = i18n.language === 'id' ? 'id' : 'en';
  const canContinueStepOne = content.sharedConfig.businessName.trim().length > 0 && Boolean(content.sharedConfig.headerLogo);
  const canContinueStepTwo = true;
  const resolvedConfigPanelId = activeConfigPanel && configItems.some((item) => item.id === activeConfigPanel)
    ? activeConfigPanel
    : null;
  const selectedConfigPanelTitle = resolvedConfigPanelId
    ? configItems.find((item) => item.id === resolvedConfigPanelId)?.title || ''
    : '';

  const syncWebsiteLanguageSelection = (value) => {
    setWebsiteLanguage(value);

    const target = value === 'id' ? 'id' : 'en';
    const currentCodes = content.languages.map((lang) => lang.code);

    if (value === 'both') {
      if (!currentCodes.includes('id')) content.handleAddLanguage('id');
      if (!currentCodes.includes('en')) content.handleAddLanguage('en');
      content.setActiveLang(currentLocale);
      return;
    }

    if (!currentCodes.includes(target)) {
      content.handleAddLanguage(target);
    }

    currentCodes
      .filter((code) => code !== target)
      .forEach((code) => content.handleRemoveLanguage(code));

    content.setActiveLang(target);
  };

  const finishOnboarding = (action = 'publish') => {
    sessionStorage.setItem('lb_mock_auth', 'true');
    sessionStorage.removeItem('lb_show_mismatch_banner');
    const message = action === 'skip'
      ? t('auth:onboarding.snackbar.skipped')
      : t('auth:onboarding.snackbar.published');
    showSnackbar(message, 'green');
    navigate('/dashboard', { replace: true });
  };

  const handleContinue = () => {
    if (currentStep === 0 && !canContinueStepOne) return;
    if (currentStep === 1 && !canContinueStepTwo) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (fromBoth) {
      setPendingFinishAction('publish');
      setSyncPlatformConfirmOpen(true);
      return;
    }

    finishOnboarding('publish');
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lb_lang', lng);
  };

  const handleSkipWebsiteSetup = () => {
    if (fromBoth) {
      setPendingFinishAction('skip');
      setSyncPlatformConfirmOpen(true);
      return;
    }
    setSkipModalOpen(true);
  };

  const handleConfirmSkipWebsiteSetup = () => {
    setSkipModalOpen(false);
    finishOnboarding('skip');
  };

  const handleConfirmSyncPlatform = () => {
    setSyncPlatformConfirmOpen(false);
    const action = pendingFinishAction;
    setPendingFinishAction(null);
    if (action === 'skip') {
      setSkipModalOpen(true);
    } else {
      finishOnboarding('publish');
    }
  };

  const handleCloseSyncPlatformConfirm = () => {
    setSyncPlatformConfirmOpen(false);
    setPendingFinishAction(null);
  };

  const renderConfigPanelContent = () => {
    if (!resolvedConfigPanelId) return null;

    switch (resolvedConfigPanelId) {
      case 'business':
        return (
          <BusinessPanel
            headerLogo={content.sharedConfig.headerLogo}
            banners={content.sharedConfig.banners}
            businessName={content.sharedConfig.businessName}
            footerPhone={content.sharedConfig.footerPhone}
            footerEmail={content.sharedConfig.footerEmail}
            heroEnabled={content.currentConfig.heroEnabled}
            heroTitle={content.currentConfig.heroTitle}
            heroSubtitle={content.currentConfig.heroSubtitle}
            footerDesc={content.currentConfig.footerDesc}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            updateSharedConfig={content.updateSharedConfig}
            handleBannerRemove={content.handleBannerRemove}
            handleLogoFileSelect={content.handleLogoFileSelect}
            handleBannerFileSelect={content.handleBannerFileSelect}
            companyData={content.companyData}
            t={websiteT}
          />
        );
      case 'shop':
        return (
          <ShopPanel
            enableCheckout={content.currentConfig.enableCheckout}
            handleSetCheckout={content.handleSetCheckout}
            featuredSections={content.currentConfig.featuredSections || []}
            handleSetFeaturedSections={content.handleSetFeaturedSections}
            t={websiteT}
          />
        );
      case 'contact':
        return (
          <ContactPanel
            contact={content.currentConfig.contact}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
          />
        );
      case 'quote':
        return (
          <QuotePanel
            rfq={content.currentConfig.rfq}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            handleQuoteBgFileSelect={content.handleQuoteBgFileSelect}
          />
        );
      case 'appointment':
        return (
          <AppointmentPanel
            appointment={content.currentConfig.appointment}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            t={websiteT}
          />
        );
      case 'location':
        return (
          <LocationPanel
            map={content.currentConfig.map}
            businessAddress={content.sharedConfig.businessAddress}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            updateAddress={content.updateAddress}
            companyData={content.companyData}
            t={websiteT}
          />
        );
      case 'reviews':
        return (
          <ReviewsPanel
            reviews={content.currentConfig.reviews}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            t={websiteT}
          />
        );
      default:
        if (content.currentConfig.customPages?.[resolvedConfigPanelId] !== undefined) {
          return (
            <CustomPagePanel
              panelId={resolvedConfigPanelId}
              pageName={content.currentConfig.customPages[resolvedConfigPanelId]}
              onRename={content.handleCustomPageRename}
              t={websiteT}
            />
          );
        }

        return (
          <div style={{ padding: '40px 48px', textAlign: 'center', color: '#9CA3AF' }}>
            {t('auth:onboarding.studio.selectSection')}
          </div>
        );
    }
  };

  const renderRightPane = () => {
    if (currentStep === 0) {
      return (
        <div className="labamu-scrollbar" style={{ height: '100%', overflowY: 'auto', padding: '24px', boxSizing: 'border-box' }}>
          <SectionHeader
            title={t('auth:onboarding.template.title')}
            subtitle={t('auth:onboarding.template.subtitle')}
          />

          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {TEMPLATE_OPTIONS.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={setSelectedTemplate}
                t={t}
              />
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 3 && resolvedConfigPanelId) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
          <div style={{ padding: '12px 48px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', flexShrink: 0, height: '64px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{selectedConfigPanelTitle}</h3>
            <button
              type="button"
              onClick={() => setActiveConfigPanel(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', transition: 'background 0.2s', borderRadius: '8px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          <div className="labamu-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#FFFFFF', maxHeight: 'calc(100vh - 136px)' }}>
            {renderConfigPanelContent()}
          </div>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
        <div style={{ padding: '10px 24px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setViewport('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: viewport === 'desktop' ? '#FFFFFF' : 'transparent',
                color: viewport === 'desktop' ? '#006BFF' : '#6B7280',
                boxShadow: viewport === 'desktop' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              {t('auth:onboarding.studio.viewport.desktop')}
            </button>
            <button
              onClick={() => setViewport('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: viewport === 'mobile' ? '#FFFFFF' : 'transparent',
                color: viewport === 'mobile' ? '#006BFF' : '#6B7280',
                boxShadow: viewport === 'mobile' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              {t('auth:onboarding.studio.viewport.mobile')}
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowX: viewport === 'mobile' ? 'auto' : 'hidden',
            overflowY: 'hidden',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: viewport === 'mobile' ? 'center' : 'stretch',
            padding: viewport === 'mobile' ? '40px 0' : '0',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              minWidth: viewport === 'desktop' ? '0' : '375px',
              width: viewport === 'desktop' ? '100%' : '375px',
              height: viewport === 'mobile' ? '812px' : '100%',
              background: '#FFF',
              boxShadow: viewport === 'mobile' ? '0 20px 50px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: viewport === 'mobile' ? '36px' : '0',
              overflow: 'hidden',
              margin: viewport === 'mobile' ? '0 auto' : '0',
              border: viewport === 'mobile' ? '12px solid #D1D1D6' : 'none',
              boxSizing: 'content-box',
              transform: viewport === 'mobile' ? 'translateZ(0)' : 'none',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                background: '#FFF',
                borderRadius: viewport === 'mobile' ? '18px' : '0',
                paddingLeft: viewport === 'mobile' ? '14px' : '0',
              }}
            >
              <ErrorBoundary key={`${viewport}-${currentStep}`}>
                <HouzezPreview
                  builderConfig={{ ...content.currentConfig, ...content.sharedConfig }}
                  previewLanguages={content.languages}
                  builderActiveLang={content.activeLang}
                  isBuilderMode={true}
                  isMobile={viewport === 'mobile'}
                  selectedFeatures={deferredSelectedFeatures}
                  featureOrder={deferredFeatureOrder}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const footerPrimaryLabel = currentStep === steps.length - 1 ? websiteT('studio.publish.publishBtn') : t('auth:onboarding.footer.continue');

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Lato', sans-serif", background: 'var(--neutral-surface-primary)' }}>
        <style>{`
          .onboarding-main {
            min-height: 0;
            background: var(--neutral-surface-primary);
          }

          .onboarding-footer {
            background: var(--neutral-surface-primary);
            position: relative;
            z-index: 20;
          }

          .onboarding-body {
            display: flex;
            min-height: 0;
            position: relative;
            background: var(--neutral-surface-primary);
          }

          .onboarding-sidebar {
            border-right: 1px solid var(--neutral-line-separator-1);
            background: var(--neutral-surface-primary);
            min-height: 0;
          }

          .onboarding-right-column {
            min-height: 0;
            background: var(--neutral-surface-primary);
          }

          @media (max-width: 720px) {
            .onboarding-footer {
              height: auto !important;
              padding: 16px 16px 20px !important;
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
            }

            .onboarding-footer-language {
              width: 100%;
            }

            .onboarding-footer-actions {
              width: 100%;
              justify-content: flex-end;
            }
          }
        `}</style>

        <header
          style={{
            height: '72px',
            background: 'var(--neutral-surface-primary)',
            borderBottom: '1px solid var(--neutral-line-separator-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '25%', minWidth: '150px' }}>
            <div style={{ fontSize: '24px', lineHeight: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span style={{ color: 'var(--feature-brand-primary)' }}>{t('auth:onboarding.header.brandLabamu')}</span>
              <span style={{ color: 'var(--neutral-on-surface-tertiary)' }}>{t('auth:onboarding.header.brandEcommerce')}</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '14px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
              {t('auth:onboarding.header.by')}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          <div style={{ width: '25%', minWidth: '200px', display: 'flex', justifyContent: 'flex-end' }}>
            {currentStep > 0 && (
              <Button
                variant="tertiary"
                size="main"
                onClick={handleSkipWebsiteSetup}
                style={{ height: '44px', padding: '0 8px', whiteSpace: 'nowrap' }}
              >
                {t('auth:onboarding.skip.button')}
              </Button>
            )}
          </div>
        </header>

        <main
          className="onboarding-main"
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          <div className="onboarding-body" style={{ flex: 1, minHeight: 0, overflow: 'visible' }}>
            <aside
              className="onboarding-sidebar"
              style={{
                width: isSidebarOpen ? '440px' : '0px',
                height: '100%',
                alignSelf: 'stretch',
                borderRight: isSidebarOpen ? '1px solid var(--neutral-line-separator-1)' : 'none',
                background: 'var(--neutral-surface-primary)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div
                  className="labamu-scrollbar"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: isSidebarOpen ? '24px 24px 24px' : '24px 0 24px',
                    minWidth: isSidebarOpen ? '400px' : '0px',
                    opacity: isSidebarOpen ? 1 : 0,
                    transition: 'opacity 0.2s',
                    boxSizing: 'border-box',
                  }}
                >
                  {currentStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minHeight: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '20px', background: 'var(--neutral-surface-primary)', position: 'sticky', top: '-24px', zIndex: 5, margin: '-24px -24px 0', padding: '24px 24px 20px', boxShadow: '0 1px 0 #E5E7EB' }}>
                        <h2 style={{ margin: 0, fontSize: '20px', lineHeight: '28px', fontWeight: 800, color: 'var(--neutral-on-surface-primary)' }}>
                          {t('auth:onboarding.basic.title')}
                        </h2>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '22px', color: 'var(--neutral-on-surface-secondary)' }}>
                          {t('auth:onboarding.basic.subtitle')}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div>
                          <div className="flex items-center gap-0.5">
                            <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
                            <span className="font-lb text-[12px] text-lb-on-surface leading-[18px]">
                              {t('auth:onboarding.basic.syncPlatform')}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 12px', fontSize: '13px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
                            {t('auth:onboarding.basic.syncSubtitle')}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {fromBoth && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: '#FFF8E6',
                                border: '1px solid #F5C842',
                              }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                                  <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="#B07D00" strokeWidth="1.4" strokeLinejoin="round" />
                                  <path d="M8 6v3.5M8 11.5h.01" stroke="#B07D00" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                                <p style={{ margin: 0, fontSize: '13px', lineHeight: '20px', color: '#7A5500' }}>
                                  <strong>{t('auth:onboarding.studio.importantLabel')}</strong> {t('auth:onboarding.studio.syncPlatformWarning')}
                                </p>
                              </div>
                            )}
                            <RadioCard
                              className="!flex-col"
                              value={selectedPlatform}
                              onChange={setSelectedPlatform}
                              options={PLATFORM_OPTIONS.map((option) => ({
                                value: option.id,
                                label: t(option.labelKey),
                                description: t(option.helperKey),
                                disabled: fromMRP ? option.id === 'labamu-app' : fromBoth ? false : option.disabled,
                              }))}
                            />
                          </div>
                        </div>

                        <div>
                          <TextField
                            label={t('auth:onboarding.basic.businessName')}
                            required
                            value={content.sharedConfig.businessName}
                            onChange={(event) => content.updateSharedConfig('businessName', event.target.value)}
                            placeholder={t('auth:onboarding.basic.businessNamePlaceholder')}
                            size="lg"
                          />
                        </div>

                        <div>
                          <MediaUploadField
                            label={t('auth:onboarding.basic.businessLogo')}
                            required
                            maxItems={1}
                            maxSizeMB={5}
                            items={content.sharedConfig.headerLogo ? [{
                              id: 'logo',
                              type: 'image',
                              src: content.sharedConfig.headerLogo,
                              name: t('auth:onboarding.basic.businessLogo'),
                            }] : []}
                            onAdd={(payload) => content.handleLogoFileSelect({ target: { files: [payload.file], value: '' } })}
                            onReplace={(_id, payload) => content.handleLogoFileSelect({ target: { files: [payload.file], value: '' } })}
                            onRemove={() => content.updateSharedConfig('headerLogo', '')}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-0.5" style={{ marginBottom: '8px' }}>
                            <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
                            <span className="font-lb text-[12px] text-lb-on-surface leading-[18px]">
                              {t('auth:onboarding.basic.websiteLanguage')}
                            </span>
                          </div>
                          <RadioCard
                            className="!flex-col"
                            value={websiteLanguage}
                            onChange={syncWebsiteLanguageSelection}
                            options={LANGUAGE_OPTIONS.map((option) => ({
                              value: option.id,
                              label: t(option.labelKey),
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <StylingStep
                        primaryColor={content.currentConfig.primaryColor || '#1D4ED8'}
                        fontFamily={content.currentConfig.fontFamily || 'Inter'}
                        updateConfig={content.updateConfig}
                        t={websiteT}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <FeaturesStep
                        featureOrder={features.featureOrder}
                        selectedFeatures={features.selectedFeatures}
                        enableCheckout={content.currentConfig.enableCheckout}
                        customPages={content.currentConfig.customPages}
                        AVAILABLE_FEATURES={features.AVAILABLE_FEATURES}
                        draggedIdx={features.draggedIdx}
                        dropTargetIdx={features.dropTargetIdx}
                        handleToggleFeature={features.handleToggleFeature}
                        handleAddCustomPage={features.handleAddCustomPage}
                        handleRemoveCustomPage={features.handleRemoveCustomPage}
                        handleRenameCustomPage={features.handleRenameCustomPage}
                        handleDragStart={features.handleDragStart}
                        handleDragEnd={features.handleDragEnd}
                        handleDragOver={features.handleDragOver}
                        handleDrop={features.handleDrop}
                        handleContainerDragOver={features.handleContainerDragOver}
                        handleEndZoneDragOver={features.handleEndZoneDragOver}
                        handleSetCheckout={content.handleSetCheckout}
                        t={websiteT}
                      />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <ConfigureStep
                        languages={content.languages}
                        activeLang={content.activeLang}
                        setActiveLang={content.setActiveLang}
                        handleAddLanguage={content.handleAddLanguage}
                        handleRemoveLanguage={content.handleRemoveLanguage}
                        configItems={configItems}
                        activeConfigPanel={activeConfigPanel}
                        setActiveConfigPanel={setActiveConfigPanel}
                        t={websiteT}
                      />
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <PublishStep
                        subdomain={publish.subdomain}
                        domainStatus={publish.domainStatus}
                        customDomain={publish.customDomain}
                        handleSubdomainChange={publish.handleSubdomainChange}
                        handleCheckDomain={publish.handleCheckDomain}
                        setCustomDomain={publish.setCustomDomain}
                        t={websiteT}
                      />
                    </div>
                  )}
                </div>
                <div
                  className="onboarding-footer"
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--neutral-line-separator-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    background: 'var(--neutral-surface-primary)',
                    width: '100%',
                  }}
                >
                  <div className="onboarding-footer-language" style={{ width: '120px' }}>
                    <FooterLanguageSwitcher
                      value={currentLocale}
                      onChange={handleLanguageChange}
                      options={[
                        { value: 'id', short: 'ID', label: t('auth:onboarding.basic.languages.indonesian'), flag: '🇮🇩' },
                        { value: 'en', short: 'EN', label: t('auth:onboarding.basic.languages.english'), flag: '🇬🇧' },
                      ]}
                    />
                  </div>

                  <div className="onboarding-footer-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexShrink: 0, flexWrap: 'nowrap' }}>
                    {currentStep > 0 && (
                      <Button
                        variant="secondary"
                        size="main"
                        onClick={handlePrevious}
                        style={{ height: '44px', padding: '0 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {t('auth:onboarding.footer.previous')}
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="main"
                      onClick={handleContinue}
                      disabled={(currentStep === 0 && !canContinueStepOne) || (currentStep === 1 && !canContinueStepTwo)}
                      style={{ height: '44px', padding: '0 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {footerPrimaryLabel}
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            <section className="onboarding-right-column" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'visible', position: 'relative' }}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  title={isSidebarOpen ? t('auth:onboarding.studio.sidebar.collapse') : t('auth:onboarding.studio.sidebar.expand')}
                  aria-label={isSidebarOpen ? t('auth:onboarding.studio.sidebar.collapseAria') : t('auth:onboarding.studio.sidebar.expandAria')}
                  style={{
                    position: 'absolute',
                    left: '0px',
                    marginLeft: '-1px',
                    top: '24px',
                    zIndex: 99999,
                    background: 'var(--neutral-surface-primary)',
                    border: '1px solid var(--neutral-line-separator-1)',
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    width: '28px',
                    height: '48px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--neutral-on-surface-secondary)',
                    boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ChevronLeft
                    size={18}
                    strokeWidth={2.5}
                    style={{ transform: isSidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }}
                  />
                </button>
              )}
              {renderRightPane()}
            </section>
          </div>
        </main>
      </div>

      {content.cropModal.open && (
        <ImageCropModal
          imageSrc={content.cropModal.imageSrc}
          aspectRatio={content.cropModal.aspectRatio}
          title={t('auth:onboarding.studio.cropModal.title')}
          subtitle={t('auth:onboarding.studio.cropModal.subtitle')}
          onSave={content.cropModal.onSave}
          onClose={content.closeCropModal}
        />
      )}

      <SkipWebsiteSetupModal
        open={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        onConfirm={handleConfirmSkipWebsiteSetup}
        t={t}
      />

      <SyncPlatformConfirmModal
        open={syncPlatformConfirmOpen}
        onClose={handleCloseSyncPlatformConfirm}
        onConfirm={handleConfirmSyncPlatform}
        selectedPlatform={selectedPlatform}
        t={t}
      />
    </>
  );
}
