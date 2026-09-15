import { ACTIONS } from './builderReducer';
import { createDefaultGlobals } from './defaultTheme';
import { loadDraft, savePublished } from './storage';
import { createFreshState } from './useSectionBuilder';
import { runDraftAction } from './runDraftAction';

/**
 * @module section-builder/state/siteTemplateApply
 * @description Applies a SITE_TEMPLATES entry to a store's persisted draft
 * from *outside* the builder (Online Store > Theme gallery has no live
 * useSectionBuilder instance mounted) — mirrors what the builder's own
 * dispatch + autosave effect would do, using the same pure reducer.
 *
 * First-ever pick for the store always seeds theme + pages + globals
 * (APPLY_SITE_TEMPLATE_SEED). Switching an already-seeded site takes an
 * explicit `mode`:
 *  - 'restyle' (default) — the "keep my content" choice: re-skins
 *    colors/typography AND swaps the header/footer structural
 *    layout_variant, but leaves page structure, section arrangement, and
 *    header/footer content untouched (APPLY_SITE_TEMPLATE_RESTYLE).
 *  - 'seed' — the "start fresh with this theme" choice: re-runs the full
 *    seed even though the site was already seeded, replacing theme, pages,
 *    header/footer, and media library.
 * See builderReducer.js for the seed/restyle contract.
 *
 * Picking a theme here is already a deliberate, confirmed decision (the
 * gallery's own switch/reset dialog *is* the confirmation) — not a
 * work-in-progress edit that a later "discard unpublished changes" in the
 * builder should be able to undo. `draftComparison.js`'s dirty check
 * compares `theme`/`header`/`footer`/`pages` against the last published
 * snapshot, so without this, opening the builder right after a theme switch
 * and clicking the back arrow would offer to "discard" — and if confirmed,
 * silently revert the new theme back to whatever was last published. Publish
 * immediately after applying so the new theme becomes the baseline itself.
 */
function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function applySiteTemplate(storeId, template, mode = 'restyle') {
  const current = loadDraft(storeId) ?? createFreshState(storeId);
  const isFirstPick = !current.activeTemplateId;
  const shouldSeed = isFirstPick || mode === 'seed';

  const action = shouldSeed
    ? (() => {
        const globals = createDefaultGlobals(template.pages);
        return {
          type: ACTIONS.APPLY_SITE_TEMPLATE_SEED,
          templateId: template.id,
          theme: cloneJson(template.theme),
          pages: cloneJson(template.pages),
          media: cloneJson(template.media ?? []),
          // Templates override header/footer content (logo text, layout
          // variant, tagline, ...) on top of the generic defaults —
          // createDefaultGlobals still supplies any field a template doesn't
          // override.
          header: { ...globals.header, data: { ...globals.header.data, ...cloneJson(template.header ?? {}) } },
          footer: { ...globals.footer, data: { ...globals.footer.data, ...cloneJson(template.footer ?? {}) } },
          // Content > Menus (US-Content.1) — same "template wins per-menu,
          // else the generic page-roster-derived default" merge header/
          // footer just used above (see also siteTemplates.js's
          // defaultPreviewDataFor, which mirrors this for the gallery
          // preview route).
          menus: {
            'main-menu': { ...globals.menus['main-menu'], ...cloneJson(template.menus?.['main-menu'] ?? {}) },
            'footer-menu': { ...globals.menus['footer-menu'], ...cloneJson(template.menus?.['footer-menu'] ?? {}) },
          },
        };
      })()
    : {
        type: ACTIONS.APPLY_SITE_TEMPLATE_RESTYLE,
        templateId: template.id,
        colors: cloneJson(template.theme.colors),
        typography: cloneJson(template.theme.typography),
        headerLayoutVariant: template.header?.layout_variant,
        footerLayoutVariant: template.footer?.layout_variant,
      };

  const next = runDraftAction(storeId, action);
  savePublished(storeId, next);
  return next;
}
