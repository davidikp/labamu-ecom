import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import HouzezPreview from './templates/houzez/HouzezPreview';
import PageHeader from '../../components/ui/PageHeader';
import ImageCropModal from '../../components/ui/ImageCropModal';
import { Image, Link as LinkIcon, X } from 'lucide-react';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { saveStorefrontConfig } from './builder/storefrontStorage';
import { useBuilderNav }      from './builder/useBuilderNav';
import { useBuilderContent }  from './builder/useBuilderContent';
import { useBuilderFeatures } from './builder/useBuilderFeatures';
import { useBuilderPublish }  from './builder/useBuilderPublish';
// Panels
import BusinessPanel    from './builder/panels/BusinessPanel';
import ShopPanel        from './builder/panels/ShopPanel';
import ContactPanel     from './builder/panels/ContactPanel';
import QuotePanel       from './builder/panels/QuotePanel';
import AppointmentPanel from './builder/panels/AppointmentPanel';
import LocationPanel    from './builder/panels/LocationPanel';
import ReviewsPanel     from './builder/panels/ReviewsPanel';
import CustomPagePanel  from './builder/panels/CustomPagePanel';
// Steps
import FeaturesStep  from './builder/steps/FeaturesStep';
import ConfigureStep from './builder/steps/ConfigureStep';
import StylingStep   from './builder/steps/StylingStep';
import PublishStep   from './builder/steps/PublishStep';

export default function TemplateBuilder() {
  const { t } = useTranslation('website');

  // ── Focused hooks — each owns one concern ──────────────────────────────────
  const nav     = useBuilderNav();
  const content = useBuilderContent();
  const publish = useBuilderPublish();
  const features = useBuilderFeatures({
    onCustomPageAdd:    content.handleCustomPageAdd,
    onCustomPageRemove: content.handleCustomPageRemove,
    onCustomPageRename: content.handleCustomPageRename,
  });

  // ── Destructure to keep the same variable names used in JSX ───────────────
  const {
    currentStep, activeConfigPanel, setActiveConfigPanel,
    isSidebarOpen, setIsSidebarOpen, viewport, setViewport, handleStepChange,
  } = nav;

  const {
    configs, sharedConfig, languages, activeLang, setActiveLang,
    cropModal,
    bannerFileInputRef, logoFileInputRef, quoteBgFileInputRef,
    currentConfig, langBarProps, companyData,
    updateConfig, updateSharedConfig, updateAddress, handleSetCheckout, handleSetFeaturedSections,
    handleAddLanguage, handleRemoveLanguage,
    handleBannerUpload, handleBannerFileSelect, handleBannerRemove,
    handleLogoFileSelect, closeCropModal,
    handleQuoteBgUpload, handleQuoteBgFileSelect,
  } = content;

  const {
    subdomain, domainStatus, customDomain, setCustomDomain,
    handleSubdomainChange, handleCheckDomain,
  } = publish;

  const {
    AVAILABLE_FEATURES, selectedFeatures, featureOrder,
    draggedIdx, dropTargetIdx,
    handleToggleFeature, handleAddCustomPage, handleRemoveCustomPage, handleRenameCustomPage,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleContainerDragOver, handleEndZoneDragOver,
  } = features;

  // Deferred values prevent the preview from blocking text-input renders
  const deferredFeatureOrder     = useDeferredValue(featureOrder);
  const deferredSelectedFeatures = useDeferredValue(selectedFeatures);

  const steps = [
    t('studio.steps.features'),
    t('studio.steps.configure'),
    t('studio.steps.styling'),
    t('studio.steps.publish'),
  ];

  // ── Config items for Step 1 (Configure) sidebar ───────────────────────────

  const getConfigItems = () => {
    const items = [
      { id: 'business', title: t('studio.configure.panels.business'), desc: t('studio.configure.panels.businessDesc'), icon: Image }
    ];
    featureOrder.forEach(id => {
      if (!selectedFeatures.has(id)) return;
      const found = AVAILABLE_FEATURES.find(f => f.id === id);
      if (found) {
        items.push({ id: found.id, title: t(`studio.configure.panels.${found.id}`), desc: t(`studio.configure.panels.${found.id}Desc`), icon: found.icon });
      } else {
        items.push({ id, title: currentConfig.customPages?.[id] || t('studio.customPage.defaultTitle'), desc: t('studio.customPage.defaultDesc'), icon: LinkIcon, isCustom: true });
      }
    });
    return items;
  };

  const getConfigPanelTitle = () => {
    const item = getConfigItems().find(i => i.id === activeConfigPanel);
    return item?.title || '';
  };

  // ── Config Panel Content ──────────────────────────────────────────────────

  const renderConfigPanelContent = () => {
    switch (activeConfigPanel) {
      case 'business':
        return (
          <BusinessPanel
            logoInputRef={logoFileInputRef}
            bannerInputRef={bannerFileInputRef}
            headerLogo={sharedConfig.headerLogo}
            banners={sharedConfig.banners}
            businessName={sharedConfig.businessName}
            footerPhone={sharedConfig.footerPhone}
            footerEmail={sharedConfig.footerEmail}
            heroEnabled={currentConfig.heroEnabled}
            heroTitle={currentConfig.heroTitle}
            heroSubtitle={currentConfig.heroSubtitle}
            footerDesc={currentConfig.footerDesc}
            langBarProps={langBarProps}
            updateConfig={updateConfig}
            updateSharedConfig={updateSharedConfig}
            handleBannerUpload={handleBannerUpload}
            handleBannerRemove={handleBannerRemove}
            handleLogoFileSelect={handleLogoFileSelect}
            handleBannerFileSelect={handleBannerFileSelect}
            companyData={companyData}
            t={t}
          />
        );
      case 'shop':
        return (
          <ShopPanel
            enableCheckout={currentConfig.enableCheckout}
            handleSetCheckout={handleSetCheckout}
            featuredSections={currentConfig.featuredSections || []}
            handleSetFeaturedSections={handleSetFeaturedSections}
            t={t}
          />
        );
      case 'contact':
        return (
          <ContactPanel
            contact={currentConfig.contact}
            langBarProps={langBarProps}
            updateConfig={updateConfig}
            t={t}
          />
        );
      case 'quote':
        return (
          <QuotePanel
            rfq={currentConfig.rfq}
            langBarProps={langBarProps}
            updateConfig={updateConfig}
            t={t}
            quoteBgInputRef={quoteBgFileInputRef}
            handleQuoteBgUpload={handleQuoteBgUpload}
            handleQuoteBgFileSelect={handleQuoteBgFileSelect}
          />
        );
      case 'appointment':
        return (
          <AppointmentPanel
            appointment={currentConfig.appointment}
            langBarProps={langBarProps}
            updateConfig={updateConfig}
            t={t}
          />
        );
      case 'location':
        return (
          <LocationPanel
            map={currentConfig.map}
            businessAddress={sharedConfig.businessAddress}
            langBarProps={langBarProps}
            updateConfig={updateConfig}
            updateAddress={updateAddress}
            companyData={companyData}
            t={t}
          />
        );
      case 'reviews':
        return (
          <ReviewsPanel
            reviews={currentConfig.reviews}
            langBarProps={langBarProps}
            updateConfig={updateConfig}
            t={t}
          />
        );
      default:
        if (activeConfigPanel && currentConfig.customPages?.[activeConfigPanel] !== undefined) {
          return (
            <CustomPagePanel
              panelId={activeConfigPanel}
              pageName={currentConfig.customPages[activeConfigPanel]}
              onRename={content.handleCustomPageRename}
              t={t}
            />
          );
        }
        return <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>{t('studio.selectSection')}</div>;
    }
  };

  // ══════════════════════════════════════════════════════════════
  // ── RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Lato', sans-serif", background: '#FFFFFF' }}>

      {/* ── Top Header ── */}
      <header style={{ height: '72px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 50, background: '#FFFFFF' }}>
        <div style={{ width: '25%', minWidth: '150px' }}>
          <PageHeader title={t('studio.title')} backPath="/websites" breadcrumbs={[{ label: t('studio.header.breadcrumbTemplates'), path: '/websites' }, { label: t('studio.header.breadcrumbStudio') }]} />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <Stepper steps={steps} currentStep={currentStep} onChange={handleStepChange} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', width: '25%', minWidth: '200px' }}>
          <Button
            variant="primary"
            onClick={() => {
              saveStorefrontConfig({ configs, sharedConfig, languages, activeLang, selectedFeatures, featureOrder });
              alert(t('studio.actions.saveSuccess', 'Saved! "View Website" will now show these changes.'));
            }}
          >
            {t('studio.actions.save')}
          </Button>
        </div>
      </header>

      {/* ── Main Builder Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* ═══ Left Sidebar ═══ */}
        <div style={{
          width: isSidebarOpen ? '440px' : '0px',
          borderRight: isSidebarOpen ? '1px solid #E5E7EB' : 'none',
          background: '#FFFFFF', display: 'flex', flexDirection: 'column', flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden'
        }}>
          <div className="labamu-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: isSidebarOpen ? '24px' : '24px 0', minWidth: '400px', opacity: isSidebarOpen ? 1 : 0, transition: 'opacity 0.2s' }}>

            {currentStep === 0 && (
              <FeaturesStep
                featureOrder={featureOrder}
                selectedFeatures={selectedFeatures}
                enableCheckout={currentConfig.enableCheckout}
                customPages={currentConfig.customPages}
                AVAILABLE_FEATURES={AVAILABLE_FEATURES}
                draggedIdx={draggedIdx}
                dropTargetIdx={dropTargetIdx}
                handleToggleFeature={handleToggleFeature}
                handleAddCustomPage={handleAddCustomPage}
                handleRemoveCustomPage={handleRemoveCustomPage}
                handleRenameCustomPage={handleRenameCustomPage}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleContainerDragOver={handleContainerDragOver}
                handleEndZoneDragOver={handleEndZoneDragOver}
                handleSetCheckout={handleSetCheckout}
                t={t}
              />
            )}

            {currentStep === 1 && (
              <ConfigureStep
                languages={languages}
                activeLang={activeLang}
                setActiveLang={setActiveLang}
                handleAddLanguage={handleAddLanguage}
                handleRemoveLanguage={handleRemoveLanguage}
                configItems={getConfigItems()}
                activeConfigPanel={activeConfigPanel}
                setActiveConfigPanel={setActiveConfigPanel}
                t={t}
              />
            )}

            {currentStep === 2 && (
              <StylingStep
                primaryColor={currentConfig.primaryColor}
                fontFamily={currentConfig.fontFamily}
                updateConfig={updateConfig}
                t={t}
              />
            )}

            {currentStep === 3 && (
              <PublishStep
                subdomain={subdomain}
                domainStatus={domainStatus}
                customDomain={customDomain}
                handleSubdomainChange={handleSubdomainChange}
                handleCheckDomain={handleCheckDomain}
                setCustomDomain={setCustomDomain}
                t={t}
              />
            )}

          </div>

          {/* Footer Sticky Area */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', justifyContent: 'flex-end', minWidth: '400px', gap: '12px' }}>
            {currentStep > 0 && (
              <Button variant="secondary" onClick={() => handleStepChange(currentStep - 1)}>{t('studio.actions.previous')}</Button>
            )}
            {currentStep < 3 ? (
              <Button variant="primary" onClick={() => handleStepChange(currentStep + 1)}>{t('studio.actions.continue')}</Button>
            ) : (
              <Button variant="primary" onClick={() => alert(t('studio.publishedMock'))}>{t('studio.publish.publishBtn')}</Button>
            )}
          </div>
        </div>

        {/* ═══ Right Canvas (Preview / Config Panel) ═══ */}
        <div style={{ flex: 1, background: '#F5F5F7', position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 10, minWidth: 0 }}>

          {/* Floating Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? t('studio.sidebarToggle.collapse') : t('studio.sidebarToggle.expand')}
            style={{ position: 'absolute', left: '0px', marginLeft: '-1px', top: '24px', zIndex: 99999, background: '#FFFFFF', border: '1px solid #D1D5DB', borderLeft: 'none', borderRadius: '0 8px 8px 0', width: '28px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', boxShadow: '4px 0 12px rgba(0,0,0,0.05)', transition: 'background 0.2s', outline: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isSidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }}><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          {/* ── Config Panel Mode ── */}
          {currentStep === 1 && activeConfigPanel ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
              <div style={{ padding: '12px 48px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', flexShrink: 0, height: '64px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{getConfigPanelTitle()}</h3>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveConfigPanel(null)}
                  icon={<X size={20} strokeWidth={2.5} />}
                />
              </div>
              <div className="labamu-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#FFFFFF', maxHeight: 'calc(100vh - 136px)' }}>
                {renderConfigPanelContent()}
              </div>
            </div>
          ) : (
            /* ── Normal Preview Mode ── */
            <>
              <div style={{ padding: '10px 24px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                  <button onClick={() => setViewport('desktop')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', background: viewport === 'desktop' ? '#FFFFFF' : 'transparent', color: viewport === 'desktop' ? '#006BFF' : '#6B7280', boxShadow: viewport === 'desktop' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    {t('studio.viewport.desktop')}
                  </button>
                  <button onClick={() => setViewport('mobile')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', background: viewport === 'mobile' ? '#FFFFFF' : 'transparent', color: viewport === 'mobile' ? '#006BFF' : '#6B7280', boxShadow: viewport === 'mobile' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                    {t('studio.viewport.mobile')}
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowX: viewport === 'mobile' ? 'auto' : 'hidden', overflowY: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: viewport === 'mobile' ? 'center' : 'stretch', padding: viewport === 'mobile' ? '40px 0' : '0' }}>
                <div style={{ minWidth: viewport === 'desktop' ? '0' : '375px', width: viewport === 'desktop' ? '100%' : '375px', height: viewport === 'mobile' ? '812px' : '100%', background: '#FFF', boxShadow: viewport === 'mobile' ? '0 20px 50px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: viewport === 'mobile' ? '36px' : '0', overflow: 'hidden', margin: viewport === 'mobile' ? '0 auto' : '0', border: viewport === 'mobile' ? '12px solid #D1D1D6' : 'none', boxSizing: 'content-box', transform: viewport === 'mobile' ? 'translateZ(0)' : 'none' }}>
                  <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', background: '#FFF', borderRadius: viewport === 'mobile' ? '18px' : '0', paddingLeft: viewport === 'mobile' ? '14px' : '0' }}>
                    <ErrorBoundary key={viewport}>
                      <HouzezPreview
                        builderConfig={{ ...currentConfig, ...sharedConfig }}
                        previewLanguages={languages}
                        builderActiveLang={activeLang}
                        isBuilderMode={true}
                        isMobile={viewport === 'mobile'}
                        selectedFeatures={deferredSelectedFeatures}
                        featureOrder={deferredFeatureOrder}
                      />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>

    {cropModal.open && (
      <ImageCropModal
        imageSrc={cropModal.imageSrc}
        aspectRatio={cropModal.aspectRatio}
        title={t('studio.previewModal.title')}
        subtitle={t('studio.previewModal.subtitle')}
        onSave={cropModal.onSave}
        onClose={closeCropModal}
      />
    )}
    </>
  );
}
