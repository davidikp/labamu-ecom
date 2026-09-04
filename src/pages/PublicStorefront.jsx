import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HouzezPreview from './websites/templates/houzez/HouzezPreview';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { loadStorefrontConfig } from './websites/builder/storefrontStorage';

// Public-facing storefront: renders whatever the merchant last saved in the
// Template Builder. Falls back to the default Houzez showcase content when
// nothing has been published yet (no persistence backend exists — this
// reads localStorage), so the page never looks broken/empty.
export default function PublicStorefront() {
  const { i18n } = useTranslation();
  const saved = useMemo(() => loadStorefrontConfig(), []);

  if (!saved) {
    return (
      <ErrorBoundary>
        <HouzezPreview />
      </ErrorBoundary>
    );
  }

  const langCode = saved.configs?.[i18n.language] ? i18n.language : (saved.activeLang || saved.languages?.[0]?.code);
  const currentConfig = saved.configs?.[langCode] ?? Object.values(saved.configs || {})[0] ?? {};

  return (
    <ErrorBoundary>
      <HouzezPreview
        builderConfig={{ ...currentConfig, ...saved.sharedConfig }}
        previewLanguages={saved.languages}
        builderActiveLang={langCode}
        isBuilderMode={true}
        selectedFeatures={new Set(saved.selectedFeatures)}
        featureOrder={saved.featureOrder}
      />
    </ErrorBoundary>
  );
}
