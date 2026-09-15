/**
 * @module section-builder/state/storage
 * @description Client-side draft + published persistence for the section
 * builder, following the pattern in builder/storefrontStorage.js. Keyed per
 * store so it never collides with the legacy wizard's `lb_storefront_config_v1`.
 *
 * No backend endpoint exists yet (US-8.3's "draft and published versions are
 * stored independently" is satisfied here purely with two localStorage keys).
 */
import { migrateState } from './migrations';

const DRAFT_KEY_PREFIX = 'sb_draft_v1';
const PUBLISHED_KEY_PREFIX = 'sb_published_v1';
const OT_PUBLISHED_THEME_KEY_PREFIX = 'ot_published_theme_v1';
const OT_DRAFT_THEMES_KEY_PREFIX = 'ot_draft_themes_v1';
const OT_STORE_PREFERENCES_KEY_PREFIX = 'ot_store_preferences_v1';

function keyFor(prefix, storeId) {
  return `${prefix}_${storeId}`;
}

function load(prefix, storeId) {
  try {
    const raw = localStorage.getItem(keyFor(prefix, storeId));
    if (!raw) return null;
    // Run schema migrations (e.g. repeater → blocks) on every load so drafts
    // saved by older builds keep working.
    return migrateState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function save(prefix, storeId, content) {
  try {
    localStorage.setItem(
      keyFor(prefix, storeId),
      JSON.stringify({ ...content, savedAt: new Date().toISOString() })
    );
    return true;
  } catch {
    return false;
  }
}

export const loadDraft = (storeId) => load(DRAFT_KEY_PREFIX, storeId);
export const saveDraft = (storeId, present) => save(DRAFT_KEY_PREFIX, storeId, present);
export const clearDraft = (storeId) => localStorage.removeItem(keyFor(DRAFT_KEY_PREFIX, storeId));

export const loadPublished = (storeId) => load(PUBLISHED_KEY_PREFIX, storeId);
export const savePublished = (storeId, present) => save(PUBLISHED_KEY_PREFIX, storeId, present);

/**
 * Online Store > Themes persistence (Discover/Publish flows). Distinct from
 * the section-builder draft/published keys above: this stores the *theme
 * gallery's* published record ({ templateId, name, previewImageUrl,
 * publishedAt, lastSavedAt, domain }) and the list of draft theme records a
 * merchant has added but not published, not the builder's page/section
 * content itself.
 */
function loadPublishedTheme(storeId) {
  try {
    const raw = localStorage.getItem(keyFor(OT_PUBLISHED_THEME_KEY_PREFIX, storeId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePublishedTheme(storeId, theme) {
  try {
    localStorage.setItem(keyFor(OT_PUBLISHED_THEME_KEY_PREFIX, storeId), JSON.stringify(theme));
    return true;
  } catch {
    return false;
  }
}

function loadDraftThemes(storeId) {
  try {
    const raw = localStorage.getItem(keyFor(OT_DRAFT_THEMES_KEY_PREFIX, storeId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveDraftThemes(storeId, themes) {
  try {
    localStorage.setItem(keyFor(OT_DRAFT_THEMES_KEY_PREFIX, storeId), JSON.stringify(themes));
    return true;
  } catch {
    return false;
  }
}

/**
 * Online Store > Preferences persistence (social sharing image/SEO +
 * hreflang toggle). Distinct from the theme/draft/published keys above —
 * this stores the store-level preferences record shown on
 * `/online-store/preferences`.
 */
function loadStorePreferences(storeId) {
  try {
    const raw = localStorage.getItem(keyFor(OT_STORE_PREFERENCES_KEY_PREFIX, storeId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStorePreferences(storeId, prefs) {
  try {
    localStorage.setItem(keyFor(OT_STORE_PREFERENCES_KEY_PREFIX, storeId), JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

export { loadPublishedTheme, savePublishedTheme, loadDraftThemes, saveDraftThemes, loadStorePreferences, saveStorePreferences };
