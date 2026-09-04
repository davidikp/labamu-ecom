import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Globe2 } from 'lucide-react';
import { MainBtn, TextField, Toggle, MediaUploadField } from '../../ce-ui';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { loadStorePreferences, saveStorePreferences } from '../section-builder/state/storage';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// ThemeGallery.jsx/PagesManagement.jsx.
const STORE_ID = 'demo';

// No store-domain/store-name field exists anywhere in this codebase yet —
// mirrors ThemeGallery.jsx's own STORE_DOMAIN convention.
const STORE_DOMAIN = `${STORE_ID}.myshopify.com`;
const STORE_NAME_PLACEHOLDER = 'My Store 6';

const DEFAULT_PREFERENCES = {
  socialImageDataUrl: null,
  homePageTitle: '',
  metaDescription: '',
  automaticHreflangTags: true,
};

const TITLE_LIMIT = 70;
const DESCRIPTION_LIMIT = 320;

function formToSnapshot(form) {
  return JSON.stringify(form);
}

export default function StorePreferences() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const initialForm = { ...DEFAULT_PREFERENCES, ...(loadStorePreferences(STORE_ID) ?? {}) };
  const [form, setForm] = useState(initialForm);
  const [savedSnapshot, setSavedSnapshot] = useState(() => formToSnapshot(initialForm));

  const isDirty = formToSnapshot(form) !== savedSnapshot;

  function patchForm(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handleSave() {
    if (!isDirty) return;
    saveStorePreferences(STORE_ID, form);
    setSavedSnapshot(formToSnapshot(form));
    showSnackbar(t('sectionBuilder:onlineStore.preferences.savedSnackbar', 'Preferences saved'), 'green');
  }

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        .section-heading { margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #282828; }
        .preferences-card {
          background: #FFFFFF; border: 1px solid #E9E9E9; border-radius: 12px; padding: 24px 20px;
        }
        .preferences-card + .preferences-card { margin-top: 24px; }
        .preferences-divider { border-top: 1px solid #E9E9E9; margin: 24px 0; padding-top: 24px; }
        .social-preview-card {
          margin-top: 16px; border: 1px solid #E9E9E9; border-radius: 10px; overflow: hidden; background: #FFFFFF;
        }
        .social-preview-card__image {
          width: 100%; aspect-ratio: 1200 / 628; background: #F3F4F6;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .social-preview-card__image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .social-preview-card__body { padding: 10px 12px; }
      `}</style>

      <div style={{ padding: '24px', paddingBottom: '96px' }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828' }}>
          {t('sectionBuilder:onlineStore.preferences.heading', 'Preferences')}
        </h1>

        {/* Card — Social sharing image and SEO (+ nested hreflang sub-section) */}
        <div className="preferences-card">
          <h2 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('sectionBuilder:onlineStore.preferences.socialSeoHeading', 'Social sharing image and SEO')}
            <Info
              size={16}
              color="#9CA3AF"
              title={t(
                'sectionBuilder:onlineStore.preferences.socialSeoTooltip',
                'This image and text are shown when your store is shared on social media and in search results.'
              )}
            />
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 320px) 1fr', gap: '32px' }}>
            {/* Left column — social share preview card only */}
            <div>
              <div className="social-preview-card">
                <div className="social-preview-card__image">
                  {form.socialImageDataUrl && (
                    <img src={form.socialImageDataUrl} alt="" />
                  )}
                </div>
                <div className="social-preview-card__body">
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', color: '#9CA3AF', textTransform: 'uppercase' }}>
                    {STORE_DOMAIN}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#282828', marginTop: '2px' }}>
                    {STORE_DOMAIN}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    {STORE_NAME_PLACEHOLDER}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — image upload + home page title + meta description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <MediaUploadField
                  items={form.socialImageDataUrl ? [{ id: 'social-image', type: 'image', src: form.socialImageDataUrl }] : []}
                  maxItems={1}
                  onAdd={({ file }) => {
                    const reader = new FileReader();
                    reader.onload = (e) => patchForm({ socialImageDataUrl: e.target.result });
                    reader.readAsDataURL(file);
                  }}
                  onReplace={(_id, { file }) => {
                    const reader = new FileReader();
                    reader.onload = (e) => patchForm({ socialImageDataUrl: e.target.result });
                    reader.readAsDataURL(file);
                  }}
                  onRemove={() => patchForm({ socialImageDataUrl: null })}
                  label={t('sectionBuilder:onlineStore.preferences.socialImageLabel', 'Social sharing image')}
                />
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9CA3AF' }}>
                  {t('sectionBuilder:onlineStore.preferences.imageRecommendation', 'Recommended: 1200 x 628 px')}
                </p>
              </div>

              <TextField
                label={t('sectionBuilder:onlineStore.preferences.homePageTitle', 'Home page title')}
                value={form.homePageTitle}
                onChange={(e) => patchForm({ homePageTitle: e.target.value })}
                placeholder={STORE_DOMAIN}
                showCount
                maxLength={TITLE_LIMIT}
              />
              <TextField
                label={t('sectionBuilder:onlineStore.preferences.metaDescription', 'Meta description')}
                value={form.metaDescription}
                onChange={(e) => patchForm({ metaDescription: e.target.value })}
                placeholder={t(
                  'sectionBuilder:onlineStore.preferences.metaDescriptionPlaceholder',
                  'Enter a description to be shown on search engines like Google'
                )}
                multiline
                rows={4}
                showCount
                maxLength={DESCRIPTION_LIMIT}
              />
            </div>
          </div>

          {/* Hreflang sub-section, nested inside this same card */}
          <div className="preferences-divider">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <Globe2 size={22} color="#282828" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h2 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  {t('sectionBuilder:onlineStore.preferences.hreflangHeading', 'Automatic hreflang tags')}
                  <Info
                    size={16}
                    color="#9CA3AF"
                    title={t(
                      'sectionBuilder:onlineStore.preferences.hreflangTooltip',
                      'hreflang tags help search engines show the right region or language version of your store.'
                    )}
                  />
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                  {t(
                    'sectionBuilder:onlineStore.preferences.hreflangDescription',
                    "Your store adds hreflang tags to its HTML so search engines can show buyers the right region or language version."
                  )}
                </p>
              </div>
              <Toggle
                checked={form.automaticHreflangTags}
                onChange={(checked) => patchForm({ automaticHreflangTags: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-6 py-3">
        <MainBtn
          variant="primary"
          size="lg"
          label={t('sectionBuilder:onlineStore.preferences.saveChanges', 'Save Changes')}
          onClick={handleSave}
          disabled={!isDirty}
        />
      </div>
    </div>
  );
}
