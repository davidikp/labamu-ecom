/**
 * @module section-builder/state/builderReducer
 * @description Core reducer for the section-based storefront builder.
 *
 * Owns `{ pages, activePageId, theme, header, footer, selection, mediaLibrary }`
 * for a single store. This is intentionally the *only* mutable model —
 * Phases 3-9 add action types here rather than introducing new state
 * containers, so the Phase 6 undo/redo history wrapper only ever has one
 * shape to snapshot.
 *
 * Header and footer (US-3.6, US-6.6) are stored once, globally — not per
 * page — so editing either one is inherently store-wide; there is no
 * separate "propagate to all pages" step to get wrong. `page.sections` holds
 * only the reorderable, per-page middle sections.
 *
 * `selection` and `mediaLibrary` are excluded from undo history by
 * useSectionBuilder (selection isn't content, and library deletes are
 * confirmed separately per US-9.4) — see TRANSIENT_ACTION_TYPES there.
 */

import { mergeRequiredSystemPages, requiredSystemPages, REQUIRED_SYSTEM_TYPES, POLICY_SYSTEM_TYPES } from './defaultTheme';
import { SHOP_CORE_SECTION_ID } from '../sections/catalog_list/schema';
import { PRODUCT_CORE_SECTION_ID } from '../sections/product_detail/schema';
import { EDITORIAL_COLLECTION_LIST_CORE_SECTION_ID } from '../sections/editorial_collection_list/schema';
import { EDITORIAL_COLLECTION_DETAIL_CORE_SECTION_ID } from '../sections/editorial_collection_detail/schema';

export const MAX_SECTIONS_PER_PAGE = 20;
export const SECTION_WARNING_THRESHOLD = 18;

/** Section ids that must not be removable via REMOVE_SECTION, per system
 * page kind — the section-level analogue of REQUIRED_SYSTEM_TYPES' page-
 * level guard: the Shop page's `sections` array is an ordinary reorderable
 * list, so without this a merchant could delete its only catalog section
 * and leave Shop blank. Keyed by `systemType`, not page id, matching how
 * `pageFillsSystemType` (defaultTheme.js) already treats those two as
 * interchangeable. */
const REQUIRED_SECTION_ID_BY_SYSTEM_TYPE = {
  shop: SHOP_CORE_SECTION_ID,
  product: PRODUCT_CORE_SECTION_ID,
  // Guarded the same way even though neither page is in REQUIRED_SYSTEM_TYPES
  // (both stay optional/removable pages, per US Collection feature) — this
  // map only protects the *section* from being emptied out while its page
  // still exists, independent of whether the page itself is required.
  editorial_collection_list: EDITORIAL_COLLECTION_LIST_CORE_SECTION_ID,
  editorial_collection_detail: EDITORIAL_COLLECTION_DETAIL_CORE_SECTION_ID,
};

export const ACTIONS = {
  SET_ACTIVE_PAGE: 'SET_ACTIVE_PAGE',
  ADD_PAGE: 'ADD_PAGE',
  RENAME_PAGE: 'RENAME_PAGE',
  DELETE_PAGE: 'DELETE_PAGE',
  REORDER_PAGES: 'REORDER_PAGES',
  UPDATE_PAGE_SEO: 'UPDATE_PAGE_SEO',
  TOGGLE_PAGE_NAV_HIDDEN: 'TOGGLE_PAGE_NAV_HIDDEN',
  UPDATE_PAGE_VISIBILITY: 'UPDATE_PAGE_VISIBILITY',
  UPDATE_PAGE: 'UPDATE_PAGE',
  BULK_UPDATE_PAGE_VISIBILITY: 'BULK_UPDATE_PAGE_VISIBILITY',
  BULK_DELETE_PAGES: 'BULK_DELETE_PAGES',
  ADD_SECTION: 'ADD_SECTION',
  REMOVE_SECTION: 'REMOVE_SECTION',
  DUPLICATE_SECTION: 'DUPLICATE_SECTION',
  MOVE_SECTION: 'MOVE_SECTION',
  REORDER_SECTIONS: 'REORDER_SECTIONS',
  UPDATE_SECTION_DATA: 'UPDATE_SECTION_DATA',
  ADD_BLOCK: 'ADD_BLOCK',
  REMOVE_BLOCK: 'REMOVE_BLOCK',
  DUPLICATE_BLOCK: 'DUPLICATE_BLOCK',
  MOVE_BLOCK: 'MOVE_BLOCK',
  REORDER_BLOCKS: 'REORDER_BLOCKS',
  MOVE_BLOCK_TO_PATH: 'MOVE_BLOCK_TO_PATH',
  UPDATE_BLOCK_DATA: 'UPDATE_BLOCK_DATA',
  TOGGLE_GLOBAL_HIDDEN: 'TOGGLE_GLOBAL_HIDDEN',
  UPDATE_GLOBAL_DATA: 'UPDATE_GLOBAL_DATA',
  UPDATE_THEME_FIELD: 'UPDATE_THEME_FIELD',
  APPLY_THEME_PRESET: 'APPLY_THEME_PRESET',
  // Phase 4 — storefront theme layer (src/pages/section-builder/themes/**).
  // Entirely additive/opt-in state, separate from the flat-preset system
  // above (colors/typography/APPLY_THEME_PRESET). Defaults to null/'light'
  // so existing drafts render with zero visual change until a merchant
  // explicitly picks a storefront theme in ThemePanel.
  SET_STOREFRONT_THEME_ID: 'SET_STOREFRONT_THEME_ID',
  SET_STOREFRONT_THEME_MODE: 'SET_STOREFRONT_THEME_MODE',
  APPLY_SITE_TEMPLATE_SEED: 'APPLY_SITE_TEMPLATE_SEED',
  APPLY_SITE_TEMPLATE_RESKIN: 'APPLY_SITE_TEMPLATE_RESKIN',
  APPLY_SITE_TEMPLATE_RESTYLE: 'APPLY_SITE_TEMPLATE_RESTYLE',
  SELECT: 'SELECT',
  DESELECT: 'DESELECT',
  ADD_MEDIA_ITEM: 'ADD_MEDIA_ITEM',
  REMOVE_MEDIA_ITEM: 'REMOVE_MEDIA_ITEM',
  DELETE_MEDIA_ITEM: 'DELETE_MEDIA_ITEM',
  BULK_DELETE_MEDIA_ITEMS: 'BULK_DELETE_MEDIA_ITEMS',
  RENAME_MEDIA_ITEM: 'RENAME_MEDIA_ITEM',
  // Content > Menus (US-Content.1) — a menu's `items` array (each
  // `{ id, label, url }`) is always replaced wholesale rather than mutated
  // item-by-item, matching how repeater-style fields elsewhere in this
  // reducer (e.g. UPDATE_SECTION_DATA/UPDATE_BLOCK_DATA) are committed as a
  // single settled edit from the editing UI rather than one action per
  // keystroke/reorder.
  UPDATE_MENU_ITEMS: 'UPDATE_MENU_ITEMS',
  // Adds a brand-new entry to `state.menus`, starting with `items: []` — the
  // Content > Menus "Create menu" action (MenusManagement.jsx). Kept
  // separate from UPDATE_MENU_ITEMS (which only ever replaces an existing
  // menu's items) rather than overloading it, since this also has to invent
  // a stable id/name pair for a menu that doesn't exist yet.
  CREATE_MENU: 'CREATE_MENU',
  // Upserts a menu's `name` and `items` together in one dispatch — the
  // single create-or-edit modal (MenusManagement.jsx's MenuFormPopup) that
  // replaced the separate "name a new menu" / "edit an existing menu's
  // items" popups. Left as an addition alongside CREATE_MENU/UPDATE_MENU_ITEMS
  // rather than folding into either of them, so any other caller of those two
  // (e.g. future automated menu seeding) keeps its current single-field
  // contract unchanged.
  SAVE_MENU: 'SAVE_MENU',
  // Removes a custom menu from `state.menus` — MenusManagement.jsx's Edit
  // drawer Delete button. The two default menus ('main-menu'/'footer-menu')
  // are never dispatched through this action (the UI disables Delete for
  // them, since Header/Footer's `nav_menu_ref` defaults point at those fixed
  // ids), but this reducer case also refuses to remove them defensively —
  // same "UI guard + reducer backstop" pairing as ACTIONS.DELETE_PAGE.
  DELETE_MENU: 'DELETE_MENU',
};

// Default menus every store starts with (see createInitialState below) —
// these ids can never be deleted since Header/Footer's `nav_menu_ref`
// defaults point at them. Exported so MenusManagement.jsx's Edit drawer can
// disable its Delete button for the same two ids without duplicating them.
export const PROTECTED_MENU_IDS = ['main-menu', 'footer-menu'];

export function createInitialState({ storeId, pages, theme, header, footer, activeTemplateId = null, menus }) {
  return {
    storeId,
    pages,
    activePageId: pages[0]?.id ?? null,
    // storefrontThemeId/storefrontThemeMode are the Phase 4 storefront theme
    // layer's state — additive to whatever `theme` already carries (colors/
    // typography/etc from the existing preset system). Defaulted here rather
    // than in defaultTheme.js so that system stays untouched; ?? lets a
    // restored draft's own values win if already present.
    theme: {
      ...theme,
      storefrontThemeId: theme?.storefrontThemeId ?? null,
      storefrontThemeMode: theme?.storefrontThemeMode ?? 'light',
    },
    header,
    footer,
    activeTemplateId,
    selection: { id: null },
    mediaLibrary: [],
    // Content > Menus (US-Content.1) — two default menus every store starts
    // with, mirroring Shopify's "Main menu"/"Footer menu" pair. Header/
    // footer sections reference one of these by id (see their schema's
    // `nav_menu_ref` field) rather than storing nav links inline. `menus`
    // lets a caller (e.g. createDefaultGlobals's page-roster-derived nav)
    // seed real starting items instead of always starting empty.
    menus: menus ?? {
      'main-menu': { id: 'main-menu', name: 'Main menu', items: [] },
      'footer-menu': { id: 'footer-menu', name: 'Footer menu', items: [] },
    },
  };
}

function updatePage(pages, pageId, updater) {
  return pages.map((page) => (page.id === pageId ? updater(page) : page));
}

function updateSection(pages, pageId, sectionId, updater) {
  return updatePage(pages, pageId, (page) => ({
    ...page,
    sections: page.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
  }));
}

// Compound selection id for a block ("<sectionId>::<id1>::<id2>::…"). Kept in
// sync with sections/blockHelpers.js (which owns the reverse parse) so the
// reducer has no import cycle with the sections registry. `path` is the
// block-id chain from the top-level block down to the target.
function blockSelId(sectionId, path) {
  const ids = path ?? [];
  return ids.length ? `${sectionId}::${ids.join('::')}` : sectionId;
}

// Apply `fn` to the block array living at `parentPath` — [] means the
// section's own top-level blocks; a non-empty array descends through nested
// group blocks by id, at any depth, to reach the target container.
function mapContainerAtPath(blocks, path, fn) {
  if (!path || path.length === 0) return fn(blocks);
  const [head, ...rest] = path;
  return blocks.map((b) => (b.id === head ? { ...b, blocks: mapContainerAtPath(b.blocks ?? [], rest, fn) } : b));
}

function mapBlockContainer(section, parentPath, fn) {
  return { ...section, blocks: mapContainerAtPath(section.blocks ?? [], parentPath ?? [], fn) };
}

function clampInsertIndex(length, index) {
  if (index == null) return length;
  return Math.max(0, Math.min(index, length));
}

export function builderReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ACTIVE_PAGE:
      return { ...state, activePageId: action.pageId, selection: { id: null } };

    case ACTIONS.ADD_SECTION: {
      const { pageId, section, index } = action;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => {
          if (page.sections.length >= MAX_SECTIONS_PER_PAGE) return page;
          const sections = [...page.sections];
          sections.splice(clampInsertIndex(sections.length, index), 0, section);
          return { ...page, sections };
        }),
        selection: { id: section.id },
      };
    }

    case ACTIONS.DUPLICATE_SECTION: {
      const { pageId, sectionId, newId } = action;
      let newSection = null;
      const pages = updatePage(state.pages, pageId, (page) => {
        const idx = page.sections.findIndex((s) => s.id === sectionId);
        if (idx === -1 || page.sections.length >= MAX_SECTIONS_PER_PAGE) return page;
        const original = page.sections[idx];
        newSection = {
          ...original,
          id: newId,
          data: { ...original.data },
          blocks: (original.blocks ?? []).map((b) => ({ ...b, id: crypto.randomUUID(), data: { ...b.data } })),
        };
        const sections = [...page.sections];
        sections.splice(idx + 1, 0, newSection);
        return { ...page, sections };
      });
      if (!newSection) return state;
      return { ...state, pages, selection: { id: newSection.id } };
    }

    case ACTIONS.REMOVE_SECTION: {
      const { pageId, sectionId } = action;
      const page = state.pages.find((p) => p.id === pageId);
      const requiredId = page?.type === 'system' ? REQUIRED_SECTION_ID_BY_SYSTEM_TYPE[page.systemType] : null;
      if (requiredId && requiredId === sectionId) return state;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => ({
          ...page,
          sections: page.sections.filter((s) => s.id !== sectionId),
        })),
        selection: state.selection.id === sectionId ? { id: null } : state.selection,
      };
    }

    case ACTIONS.MOVE_SECTION: {
      const { pageId, sectionId, direction } = action; // direction: -1 | 1
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => {
          const idx = page.sections.findIndex((s) => s.id === sectionId);
          const targetIdx = idx + direction;
          if (idx === -1 || targetIdx < 0 || targetIdx >= page.sections.length) return page;
          const sections = [...page.sections];
          [sections[idx], sections[targetIdx]] = [sections[targetIdx], sections[idx]];
          return { ...page, sections };
        }),
      };
    }

    case ACTIONS.REORDER_SECTIONS: {
      const { pageId, orderedIds } = action;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => {
          const byId = new Map(page.sections.map((s) => [s.id, s]));
          return { ...page, sections: orderedIds.map((id) => byId.get(id)) };
        }),
      };
    }

    case ACTIONS.UPDATE_SECTION_DATA: {
      const { pageId, sectionId, data } = action;
      return {
        ...state,
        pages: updatePage(state.pages, pageId, (page) => ({
          ...page,
          sections: page.sections.map((s) =>
            s.id === sectionId ? { ...s, data: { ...s.data, ...data } } : s
          ),
        })),
      };
    }

    case ACTIONS.ADD_BLOCK: {
      const { pageId, sectionId, block, index, parentPath } = action;
      const path = parentPath ?? [];
      return {
        ...state,
        pages: updateSection(state.pages, pageId, sectionId, (s) =>
          mapBlockContainer(s, path, (blocks) => {
            const next = [...blocks];
            next.splice(clampInsertIndex(next.length, index), 0, block);
            return next;
          })
        ),
        selection: { id: blockSelId(sectionId, [...path, block.id]) },
      };
    }

    case ACTIONS.REMOVE_BLOCK: {
      const { pageId, sectionId, blockId, parentPath } = action;
      const path = parentPath ?? [];
      const wasSelected = state.selection.id === blockSelId(sectionId, [...path, blockId]);
      return {
        ...state,
        pages: updateSection(state.pages, pageId, sectionId, (s) =>
          mapBlockContainer(s, path, (blocks) => blocks.filter((b) => b.id !== blockId))
        ),
        selection: wasSelected ? { id: blockSelId(sectionId, path) } : state.selection,
      };
    }

    case ACTIONS.DUPLICATE_BLOCK: {
      const { pageId, sectionId, blockId, newId, parentPath } = action;
      const path = parentPath ?? [];
      let found = false;
      const pages = updateSection(state.pages, pageId, sectionId, (s) =>
        mapBlockContainer(s, path, (blocks) => {
          const idx = blocks.findIndex((b) => b.id === blockId);
          if (idx === -1) return blocks;
          found = true;
          const orig = blocks[idx];
          const copy = {
            ...orig,
            id: newId,
            data: { ...orig.data },
            ...(orig.blocks ? { blocks: orig.blocks.map((c) => ({ ...c, id: crypto.randomUUID(), data: { ...c.data } })) } : {}),
          };
          const next = [...blocks];
          next.splice(idx + 1, 0, copy);
          return next;
        })
      );
      return found ? { ...state, pages, selection: { id: blockSelId(sectionId, [...path, newId]) } } : state;
    }

    case ACTIONS.MOVE_BLOCK: {
      const { pageId, sectionId, blockId, direction, parentPath } = action; // -1 | 1
      return {
        ...state,
        pages: updateSection(state.pages, pageId, sectionId, (s) =>
          mapBlockContainer(s, parentPath ?? [], (blocks) => {
            const next = [...blocks];
            const idx = next.findIndex((b) => b.id === blockId);
            const target = idx + direction;
            if (idx === -1 || target < 0 || target >= next.length) return blocks;
            [next[idx], next[target]] = [next[target], next[idx]];
            return next;
          })
        ),
      };
    }

    case ACTIONS.REORDER_BLOCKS: {
      const { pageId, sectionId, orderedIds, parentPath } = action;
      return {
        ...state,
        pages: updateSection(state.pages, pageId, sectionId, (s) =>
          mapBlockContainer(s, parentPath ?? [], (blocks) => {
            const byId = new Map(blocks.map((b) => [b.id, b]));
            return orderedIds.map((id) => byId.get(id)).filter(Boolean);
          })
        ),
      };
    }

    // Moves a block from one container to another (any depth, including into
    // or out of a group) — the sidebar layers tree's cross-group drag. Removes
    // from the source container then inserts into the destination container;
    // a no-op (returns the same section) if the block isn't found at `fromParentPath`.
    case ACTIONS.MOVE_BLOCK_TO_PATH: {
      const { pageId, sectionId, blockId, fromParentPath, toParentPath, toIndex } = action;
      return {
        ...state,
        pages: updateSection(state.pages, pageId, sectionId, (s) => {
          let moved = null;
          const withoutBlock = mapBlockContainer(s, fromParentPath ?? [], (blocks) => {
            const idx = blocks.findIndex((b) => b.id === blockId);
            if (idx === -1) return blocks;
            moved = blocks[idx];
            return blocks.filter((b) => b.id !== blockId);
          });
          if (!moved) return s;
          return mapBlockContainer(withoutBlock, toParentPath ?? [], (blocks) => {
            const next = [...blocks];
            next.splice(clampInsertIndex(next.length, toIndex), 0, moved);
            return next;
          });
        }),
      };
    }

    case ACTIONS.UPDATE_BLOCK_DATA: {
      const { pageId, sectionId, blockId, data, parentPath } = action;
      return {
        ...state,
        pages: updateSection(state.pages, pageId, sectionId, (s) =>
          mapBlockContainer(s, parentPath ?? [], (blocks) =>
            blocks.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b))
          )
        ),
      };
    }

    case ACTIONS.TOGGLE_GLOBAL_HIDDEN: {
      const { which } = action; // 'header' | 'footer'
      return { ...state, [which]: { ...state[which], hidden: !state[which].hidden } };
    }

    case ACTIONS.UPDATE_GLOBAL_DATA: {
      const { which, data } = action;
      return { ...state, [which]: { ...state[which], data: { ...state[which].data, ...data } } };
    }

    case ACTIONS.UPDATE_THEME_FIELD: {
      const { group, field, value } = action;
      return {
        ...state,
        theme: {
          ...state.theme,
          [group]: { ...state.theme[group], [field]: value },
        },
      };
    }

    case ACTIONS.APPLY_THEME_PRESET: {
      // Presets replace colors and fonts only — never section content,
      // buttons, layout, or product-card settings (US-5.5).
      const { colors, typography } = action;
      return { ...state, theme: { ...state.theme, colors, typography } };
    }

    case ACTIONS.SET_STOREFRONT_THEME_ID: {
      return { ...state, theme: { ...state.theme, storefrontThemeId: action.themeId } };
    }

    case ACTIONS.SET_STOREFRONT_THEME_MODE: {
      return { ...state, theme: { ...state.theme, storefrontThemeMode: action.mode } };
    }

    case ACTIONS.APPLY_SITE_TEMPLATE_SEED: {
      // First-ever template pick for this site: replaces theme AND
      // generates the page roster + globals + media library from the
      // template's scaffold. Only used when state.activeTemplateId is still
      // null — see siteTemplates.js for the seed-vs-reskin contract.
      // mergeRequiredSystemPages guarantees Shop + Product Detail exist even
      // for templates (siteTemplates.js) that don't define them themselves —
      // it never duplicates a page a template *does* already define (e.g. a
      // future template with its own 'shop'-id or systemType:'shop' page).
      const { templateId, theme, pages, header, footer, media, menus } = action;
      const mergedPages = mergeRequiredSystemPages(pages, requiredSystemPages());
      return {
        ...state,
        activeTemplateId: templateId,
        theme: { ...state.theme, ...theme },
        pages: mergedPages,
        activePageId: pages[0]?.id ?? mergedPages[0]?.id ?? null,
        header,
        footer,
        mediaLibrary: media ?? [],
        // Optional — callers that don't seed nav menus (e.g. existing tests
        // constructing this action by hand) leave `state.menus` untouched
        // rather than clobbering it with nothing.
        menus: menus ?? state.menus,
        selection: { id: null },
      };
    }

    case ACTIONS.APPLY_SITE_TEMPLATE_RESKIN: {
      // Switching templates on an already-seeded site: re-skin only
      // (colors + typography), exactly like APPLY_THEME_PRESET. Page
      // structure, section arrangement, and any section customization
      // (including literal hex color overrides) are left untouched.
      const { templateId, colors, typography } = action;
      return {
        ...state,
        activeTemplateId: templateId,
        theme: { ...state.theme, colors, typography },
      };
    }

    case ACTIONS.APPLY_SITE_TEMPLATE_RESTYLE: {
      // Switching templates on an already-seeded site, "keep my content":
      // re-skin colors + typography like RESKIN, but also swap the header's
      // and footer's structural layout_variant so the site's global chrome
      // actually looks like the new theme, not just its palette. Page
      // structure, section arrangement, and header/footer *content* (logo
      // text, nav links, tagline, link columns) are left untouched.
      const { templateId, colors, typography, headerLayoutVariant, footerLayoutVariant } = action;
      return {
        ...state,
        activeTemplateId: templateId,
        theme: { ...state.theme, colors, typography },
        header: { ...state.header, data: { ...state.header.data, layout_variant: headerLayoutVariant } },
        footer: { ...state.footer, data: { ...state.footer.data, layout_variant: footerLayoutVariant } },
      };
    }

    case ACTIONS.ADD_PAGE: {
      // Pages panel Visible/Hidden radio + "visible as of <date>" field
      // (visibility/visibleFrom) is a new concept distinct from
      // hiddenFromNav (which only controls header nav link presence).
      // Defaulted here so callers that don't yet pass them (e.g.
      // SectionBuilder.jsx's "add page" flow) still get a well-formed page.
      const page = {
        visibility: 'visible',
        visibleFrom: null,
        ...action.page,
        updatedAt: Date.now(),
      };
      return {
        ...state,
        pages: [...state.pages, page],
        activePageId: page.id,
        selection: { id: null },
      };
    }

    case ACTIONS.RENAME_PAGE:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => ({
          ...page,
          name: action.name,
          updatedAt: Date.now(),
        })),
      };

    case ACTIONS.DELETE_PAGE: {
      // Integrity guard: required system pages (Shop, Product Detail — see
      // REQUIRED_SYSTEM_TYPES in defaultTheme.js) can't be deleted through
      // this path. PagesPanel.jsx's UI already hides the delete affordance
      // for any `type: 'system'` page, so this is a defensive backstop, not
      // the primary guard.
      const target = state.pages.find((p) => p.id === action.pageId);
      if (target && target.type === 'system' && REQUIRED_SYSTEM_TYPES.includes(target.systemType)) {
        return state;
      }
      const pages = state.pages.filter((p) => p.id !== action.pageId);
      const activePageId = state.activePageId === action.pageId ? pages[0]?.id ?? null : state.activePageId;
      return { ...state, pages, activePageId };
    }

    case ACTIONS.REORDER_PAGES: {
      // Full-list reorder (Online Store > Pages) — orderedIds is the entire
      // pages array's new id order. Unknown ids are dropped defensively;
      // callers are expected to keep system pages' relative order stable.
      const byId = new Map(state.pages.map((p) => [p.id, p]));
      const pages = action.orderedIds.map((id) => byId.get(id)).filter(Boolean);
      return { ...state, pages };
    }

    case ACTIONS.UPDATE_PAGE_SEO:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => ({
          ...page,
          seo: { ...page.seo, ...action.seo },
          updatedAt: Date.now(),
        })),
      };

    case ACTIONS.TOGGLE_PAGE_NAV_HIDDEN:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => ({
          ...page,
          hiddenFromNav: !page.hiddenFromNav,
          updatedAt: Date.now(),
        })),
      };

    // Page-level visibility (distinct from hiddenFromNav, which only hides
    // the header nav link): 'visible' | 'hidden', plus an optional
    // visibleFrom epoch-ms timestamp for scheduled visibility.
    case ACTIONS.UPDATE_PAGE_VISIBILITY:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => ({
          ...page,
          visibility: action.visibility,
          visibleFrom: action.visibleFrom ?? null,
          updatedAt: Date.now(),
        })),
      };

    // Generic partial-page update used by the dedicated Page editor screen
    // (title/content/template/seo/visibility, saved atomically from one
    // form). `patch` is shallow-merged onto the page; nested objects like
    // `seo` should be pre-merged by the caller if a partial merge is wanted.
    case ACTIONS.UPDATE_PAGE:
      return {
        ...state,
        pages: updatePage(state.pages, action.pageId, (page) => {
          // Written-policy pages (Settings > Policies) are reserved: name and
          // slug are locked so their footer/menu links and Settings rows
          // never break — only content/seo/visibility stay editable through
          // this generic patch path.
          const isLockedPolicy = page.type === 'system' && POLICY_SYSTEM_TYPES.includes(page.systemType);
          const { name: _name, slug: _slug, ...restPatch } = action.patch ?? {};
          return {
            ...page,
            ...(isLockedPolicy ? restPatch : action.patch),
            updatedAt: Date.now(),
          };
        }),
      };

    // Bulk Set Pages Visible/Hidden/Scheduled — same visibility field
    // UPDATE_PAGE_VISIBILITY writes, applied to every id in `pageIds` at
    // once. `visibleFrom` defaults to null (immediate Set as visible/Set as
    // hidden); "Set schedule visibility" passes a future timestamp instead.
    case ACTIONS.BULK_UPDATE_PAGE_VISIBILITY: {
      const ids = new Set(action.pageIds);
      return {
        ...state,
        pages: state.pages.map((page) =>
          ids.has(page.id)
            ? { ...page, visibility: action.visibility, visibleFrom: action.visibleFrom ?? null, updatedAt: Date.now() }
            : page
        ),
      };
    }

    case ACTIONS.BULK_DELETE_PAGES: {
      // Same integrity guard as DELETE_PAGE — required system pages are
      // silently excluded from the bulk-delete set rather than blocking the
      // whole operation.
      const ids = new Set(action.pageIds);
      const pages = state.pages.filter((p) => {
        if (!ids.has(p.id)) return true;
        return p.type === 'system' && REQUIRED_SYSTEM_TYPES.includes(p.systemType);
      });
      const remainingIds = new Set(pages.map((p) => p.id));
      const activePageId = remainingIds.has(state.activePageId) ? state.activePageId : pages[0]?.id ?? null;
      return { ...state, pages, activePageId };
    }

    case ACTIONS.ADD_MEDIA_ITEM:
      return { ...state, mediaLibrary: [action.item, ...state.mediaLibrary] };

    case ACTIONS.REMOVE_MEDIA_ITEM:
      // Any field still referencing this id (`{ mediaId }`) simply resolves
      // to nothing at render time — see ui/fields/imageValue.js — so there's
      // no section data to clean up here (US-9.4).
      return { ...state, mediaLibrary: state.mediaLibrary.filter((m) => m.id !== action.id) };

    // Single-item delete for the Content > Files screen — same "no cleanup
    // needed" rationale as REMOVE_MEDIA_ITEM above (kept as a distinct
    // action, rather than reusing REMOVE_MEDIA_ITEM, to match this reducer's
    // existing single/bulk pairing convention, e.g. DELETE_PAGE vs.
    // BULK_DELETE_PAGES).
    case ACTIONS.DELETE_MEDIA_ITEM:
      return { ...state, mediaLibrary: state.mediaLibrary.filter((m) => m.id !== action.id) };

    case ACTIONS.BULK_DELETE_MEDIA_ITEMS: {
      const ids = new Set(action.ids);
      return { ...state, mediaLibrary: state.mediaLibrary.filter((m) => !ids.has(m.id)) };
    }

    // Content > Files' row-level "Edit" action — renames the item in place,
    // same filter-and-map-by-id style as the delete cases above.
    case ACTIONS.RENAME_MEDIA_ITEM:
      return {
        ...state,
        mediaLibrary: state.mediaLibrary.map((m) =>
          m.id === action.id ? { ...m, filename: action.filename } : m
        ),
      };

    // Replaces a menu's full `items` array — see ACTIONS.UPDATE_MENU_ITEMS
    // above for why this is whole-array rather than per-item.
    case ACTIONS.UPDATE_MENU_ITEMS: {
      const { menuId, items } = action;
      const menu = state.menus?.[menuId];
      if (!menu) return state;
      return { ...state, menus: { ...state.menus, [menuId]: { ...menu, items } } };
    }

    // Adds a new menu with the given `id`/`name` and empty `items` — a no-op
    // if `id` already exists (the caller, MenusManagement.jsx, is expected
    // to generate a unique slug against the current `state.menus` keys, the
    // same "stable id" convention MenuEditorPopup's items already use via
    // `crypto.randomUUID()`, just slug-based here for a human-readable id).
    case ACTIONS.CREATE_MENU: {
      const { id, name } = action;
      if (state.menus?.[id]) return state;
      return { ...state, menus: { ...state.menus, [id]: { id, name, items: [] } } };
    }

    // Upsert form save for MenuFormPopup — sets `name`+`items` together,
    // creating the menu at `id` if it doesn't exist yet (so the same action
    // covers both "Save" on a brand-new menu and "Save" on an existing one).
    case ACTIONS.SAVE_MENU: {
      const { id, name, items } = action;
      const existing = state.menus?.[id];
      return { ...state, menus: { ...state.menus, [id]: { id, name, items: items ?? existing?.items ?? [] } } };
    }

    // Removes a menu from `state.menus` — same entity-removal shape as
    // REMOVE_MEDIA_ITEM/DELETE_MEDIA_ITEM above, applied to the `menus`
    // object's keys instead of an array. Protected default menus are never
    // removed, even if a caller mistakenly dispatches this for one.
    case ACTIONS.DELETE_MENU: {
      const { id } = action;
      if (PROTECTED_MENU_IDS.includes(id) || !state.menus?.[id]) return state;
      const { [id]: _removed, ...rest } = state.menus;
      return { ...state, menus: rest };
    }

    case ACTIONS.SELECT:
      return { ...state, selection: { id: action.id } };

    case ACTIONS.DESELECT:
      return { ...state, selection: { id: null } };

    default:
      return state;
  }
}
