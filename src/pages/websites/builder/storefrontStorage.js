// Client-side persistence for the merchant's published storefront config.
// There is no backend endpoint for this yet — the public /storefront route
// reads whatever was last saved here from the Template Builder.
const STORAGE_KEY = 'lb_storefront_config_v1';

export function loadStorefrontConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStorefrontConfig({ configs, sharedConfig, languages, activeLang, selectedFeatures, featureOrder }) {
  const payload = {
    configs,
    sharedConfig,
    languages,
    activeLang,
    selectedFeatures: Array.from(selectedFeatures),
    featureOrder,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}
