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
const OT_PENDING_PREVIEW_KEY_PREFIX = 'ot_pending_preview_v1';

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

/**
 * PageEditor.jsx's Preview button — a one-shot handoff of the CURRENT,
 * possibly-unsaved form state to the preview tab, so Preview reflects what's
 * on screen right now rather than what was last saved to the draft (the old
 * behavior forced a Save before an edit would show up in Preview).
 * sessionStorage rather than localStorage since this is only meant to reach
 * the one preview tab window.open() is about to spawn — a same-origin tab
 * opened via window.open() (without noopener) gets a clone of the opener's
 * sessionStorage per the HTML spec (see PageEditor.jsx's handlePreview for
 * the same rationale re: the ProtectedRoute session check).
 *
 * One-shot by design: `loadPendingPreview` removes the entry as soon as it
 * reads it, so a plain reload of the preview tab (no fresh Preview click)
 * falls back to the real persisted draft instead of replaying a stale
 * snapshot.
 */
function savePendingPreview(storeId, page) {
  try {
    sessionStorage.setItem(keyFor(OT_PENDING_PREVIEW_KEY_PREFIX, storeId), JSON.stringify(page));
    return true;
  } catch {
    return false;
  }
}

function loadPendingPreview(storeId) {
  const key = keyFor(OT_PENDING_PREVIEW_KEY_PREFIX, storeId);
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    sessionStorage.removeItem(key);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export {
  loadPublishedTheme,
  savePublishedTheme,
  loadDraftThemes,
  saveDraftThemes,
  loadStorePreferences,
  saveStorePreferences,
  savePendingPreview,
  loadPendingPreview,
};
