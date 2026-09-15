# 10 — Barger Theme

## Goal

Add "Barger" as a real, selectable theme (currently a `comingSoon: true` stub in
`themeRoster.js`), built from the Figma source:

- Dark mode tokens — node `171:69357`
- Light mode tokens — node `171:76095`
- Component variants (Button, Text Field, CTA, Voucher/Toggle, Catalog Card,
  Snackbar, Social Media, Info, Customer Info, Order Notes, Total) — node `165:84351`
- Homepage — node `96:114687`
- Shop / catalog list — node `96:129062`
- Product detail page — node `96:129435`

## Decisions (confirmed with user)

1. **Full theme**, not a reskin: new token file + registry entry + its own
   `SITE_TEMPLATES` content entry, mirroring how `xinear` and `houzez` were added.
2. **Dark/light are theme-setup variants, not a runtime toggle.** Both full
   token sets ship; the merchant picks light or dark when configuring the
   theme in the site builder, same as choosing any other theme setting. No
   storefront-facing light/dark switch is being built.
3. **Reuse existing shared components**, restyled via tokens — no new React
   components or section renderers. Per the codebase's own convention (see
   `ProductCard.jsx`, `themedButtonStyle.js` doc comments), a theme is
   supposed to be achievable through token values + content recipes alone.
   Figma's "components" frame is treated as a token/state reference (hover,
   disabled, error, filled, etc.), not a build spec for bespoke components.
4. **Phased delivery**, each phase independently reviewable.
5. **Entry point is the Discover Themes "Add" card** — same flow Xinear/
   Houzez use today (`ThemeGallery.jsx`'s `handleDiscoverAdd`), not a new
   surface. Barger's `themeRoster.js` entry flips from `comingSoon: true` to
   `false` once Phase 1 lands, which is what turns its card's action from the
   disabled "Coming soon" pill into a working "Add" button.
6. **Light/dark configuration reuses the existing builder control** —
   `ThemePanel.jsx`'s `StorefrontThemeSection` already renders a
   `storefrontThemeId` select plus a light/dark segmented toggle wired to
   `state.theme.storefrontThemeMode` (`builderReducer.js` actions
   `SET_STOREFRONT_THEME_ID` / the mode setter), and `applyThemeToElement`
   already reads that mode live (`PageFrame.jsx`). This infrastructure is
   theme-agnostic today (built for the storefront-theme layer in general, not
   Xinear/Houzez specifically) — Barger just needs to be a valid
   `storefrontThemeId` for the toggle to work for it with no new UI code.

## Architecture recap (from codebase, for reference)

- `themes/<id>.js` — token definition: `id`, `name`, `typography`, `shape`,
  `light{...}`, `dark{...}` (~50 color slots each), validated by
  `tokenSchema.js`'s `validateTheme()`.
- `themes/registry.js` — `{ xinear, houzez, barger }` lookup map.
- `themes/themeRoster.js` — gallery listing; **Barger's entry already exists**
  with `comingSoon: true` — flipping that flag is part of this work, gated on
  the registry entry existing (there's a dev-time throw if not).
- `themes/applyTheme.js` — walks `colorSlots`, writes CSS custom properties;
  already mode-aware (`MODES = ['light', 'dark']`), needs no changes.
- `state/siteTemplates.js` — per-theme **content**: page/section composition,
  nav/footer copy, category items, hero/form/nav "recipes"
  (`sections/shared/{heroRecipes,formRecipes,navRecipes}.js`).
- `sections/mocks/` — per-theme mock catalog data (pattern:
  `mocks/houzezProducts.js`).
- Shared, theme-agnostic renderers: `ProductCard.jsx`, `themedButtonStyle.js`,
  `themedLayout.js` — not touched unless Barger needs a genuinely new layout
  primitive the shared renderers can't express.

## Phase 1 — Tokens & core components

- `src/pages/section-builder/themes/barger.js`: new file, `bargerTheme` with
  `light`/`dark` blocks sourced from Figma nodes `171:76095` / `171:69357`
  (colors captured this session — background, surface1-8, outline1-5,
  onSurface1-9 (+alpha variants), primary1/1_60/1_10/2/secondary/onPrimary/
  onPrimary2/hover, alert{Danger,Warning,Success}(+Container), other{Rating,
  Black,White,DarkGrey,Outline,Placeholder,Background}); `typography` and
  `shape` (radii/shadows) pulled from the Button/Text Field/CTA component
  frames in node `165:84351`. Call `validateTheme(bargerTheme)`.
- `themes/registry.js`: register `barger: bargerTheme`.
- `themes/themeRoster.js`: flip `barger`'s `comingSoon` to `false`.
- Verify button/text-field/CTA/voucher/toggle/snackbar states (enable, hover,
  disabled, focus, typing, filled, error) render correctly through
  `themedButtonStyle.js` / existing field components with only token changes —
  no new component code expected here per decision #3. Flag anything that
  doesn't fit the shared abstraction as a scoped exception before Phase 2.
- Add/extend `sectionBuilder.json` (en/id locales) with Barger's
  name/description strings for the gallery card.
- Provide `public/assets/templates/barger/barger.png` gallery preview asset.
- `ThemeGallery.jsx`'s `handleDiscoverAdd`: once `siteTemplateById('barger')`
  (added in Phase 2) resolves, Barger's "Add" click follows the same
  `applySiteTemplate(newDraftId, matchedTemplate, 'seed')` branch Xinear/
  Houzez use — no branch-specific code needed. Until Phase 2 lands, Barger
  would fall into the skin-only branch (`storefrontThemeId` set, no seeded
  pages); sequence Phase 1 merge behind Phase 2 if "Add" needs to be
  clickable end-to-end from the start, or accept a content-less interim
  state if phases ship independently.
- Confirm `ThemePanel.jsx`'s existing light/dark toggle needs no changes for
  Barger (it's generic over `storefrontThemeId`) — this phase should only
  need to smoke-test it once `barger` is registered, not build new UI.
- Tests: `themeSchemaAdapter`/`defaultTheme`/registry-level tests mirroring
  Xinear/Houzez's, covering both `light` and `dark` slot completeness.

## Phase 2 — Homepage

- New `SITE_TEMPLATES` entry (id e.g. `barger` or `fnb`-style) composing
  existing shared sections per Figma node `96:114687`: header/nav
  (`navRecipes`), hero banner, "Best Seller" `featured_products` grid,
  appointment/quote CTA band, testimonials, contact block, "Visit Our
  Restaurant" map/location block, custom-order CTA, footer.
- Any homepage content not expressible via existing section types
  (testimonials-with-rating, map/location block) gets flagged for a
  section-type gap check before assuming it fits `featured_products` /
  generic content sections.
- Mock catalog: `sections/mocks/bargerProducts.js` for Best Seller cards.

## Phase 3 — Shop / catalog list

- Wire the `catalog_list` section (per node `96:129062`) into the new site
  template's Shop page, following the same pattern as
  `08-wire-shoppage-into-houzezpreview.md`.
- Confirm the existing `catalog_list` Renderer covers Barger's grid/card
  layout via tokens alone.

## Phase 4 — Product detail page

- Wire PDP composition (per node `96:129435`: image gallery, title/price,
  stepper + subtotal, CTA buttons, shipping summary, description tabs, "Other
  Picks" carousel) using existing PDP section/renderer, per
  `05-catalog-product-detail-page.md` precedent.
- Toast/snackbar "Item added to cart" state uses the shared Snackbar
  component with Barger tokens.

## Open items to confirm before Phase 1 starts

- Exact hex/typography values should be re-pulled via `get_design_context` on
  each node at implementation time (this session only read metadata + swatch
  labels, not a full design-context extraction) — plan assumes that happens
  as the first step of Phase 1, not before.
- Confirm which `SITE_TEMPLATES` id/name to use for Barger's content entry
  (new template vs extending an existing food/retail-flavored one), and that
  its id matches the `storefrontThemeId`/roster id (`barger`) so
  `handleDiscoverAdd`'s `siteTemplateById` lookup actually matches it.
- Decide Phase 1 vs Phase 2 sequencing given the "Add" flow depends on a
  matching site template existing (see Phase 1 note above) — either merge
  Phase 1+2 together for a clickable Add on day one, or explicitly accept an
  interim content-less state.
