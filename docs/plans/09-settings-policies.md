# Settings → Policies — Implementation Plan

## Goal

Add a Shopify-style Settings → Policies page: a minimal Settings hub hosting
one child ("Policies"), a "Return and cancellation rules" section stubbed as
Coming Soon, and a "Written policies" section (Return & refund, Privacy,
Terms of service, Shipping policy, Legal notice, Contact information) whose
content is authored via the existing rich-text page editor and is genuinely
routable on the live storefront preview.

Reference: Shopify Admin → Settings → Policies (screenshot provided by user).

---

## Background / current state

- No Settings hub exists. Settings-type pages are flat, individual entries in
  `Layout.jsx`'s sidebar nav. A `sidebar.settings` locale key already sits
  unused in `src/locales/{en,id}/dashboard.json` — this plan activates it.
- The Pages CMS (`PagesManagement.jsx` + `PageEditor.jsx` +
  `RichTextEditor.jsx`) already provides create/edit/rich-text-body/slug
  machinery, backed by `state.pages` in the section-builder draft
  (`demoBootstrap.js` / `builderReducer.js`), no real backend — this plan
  reuses it rather than building a parallel content model.
- `src/pages/section-builder/ui/fields/PageLinkCombobox.jsx` (the link picker
  used by Menus and footer link columns) already has a **hardcoded**
  `MOCK_POLICIES` array with 4 of the 5 target policies and the exact
  `/policies/<slug>` URL scheme Shopify uses. It is decorative only — nothing
  renders behind those URLs today. This plan replaces the mock with real data.
- `footer/schema.js` + `footer/Renderer.jsx` render `link_columns` as plain
  `{label, url}` pairs — no renderer change needed once real policy URLs
  exist.
- No return/cancellation rule-builder UI exists anywhere in the codebase, and
  none is being built here — the section renders as a disabled "Coming soon"
  card only.

---

## Scope decisions (confirmed with user)

| Question | Decision |
|---|---|
| Return/cancellation rule engine | **Coming Soon** stub only — no rule logic, no "Add rule" functionality |
| Written policies data model | **A1**: reserved entries inside the existing Pages CMS (`state.pages`), not a separate service |
| Backend | **Mock only** — no real API; follows the existing demo-draft state pattern used by Pages CMS (not the `companyService.js` mock-service pattern, since we're reusing Pages CMS as-is) |
| Settings hub breadth | **Minimal** — just enough to host Policies, not a reorg of all existing settings pages |
| Storefront routing | Policy pages must be **actually routable** in the live storefront preview, not just CMS entries |

---

## Files

### New

| File | Purpose |
|------|---------|
| `src/pages/SettingsIndex.jsx` | Minimal Settings hub — card list, currently one entry: Policies |
| `src/pages/settings/PoliciesSettings.jsx` | Policies page: rules-coming-soon card + written-policies list |
| `src/locales/en/settings.json` | New `settings.*` / `settings.policies.*` locale namespace |
| `src/locales/id/settings.json` | Indonesian counterpart |

### Modified

| File | Change |
|------|--------|
| `src/App.jsx` | Add lazy routes: `/settings` → `SettingsIndex`, `/settings/policies` → `PoliciesSettings` |
| `src/components/Layout.jsx` | Add a `settings` nav entry (uses existing `sidebar.settings` key) with one child linking to `/settings/policies` |
| `src/i18n.js` | Register `settings.json` in both locale bundles |
| `src/pages/section-builder/state/defaultTheme.js` | Add 5 reserved system pages (policy pages) via the existing `requiredSystemPages` / `REQUIRED_SYSTEM_TYPES` pattern, so they always exist in a draft and are guaranteed routable |
| `src/pages/section-builder/state/builderReducer.js` | Guard: policy pages' `slug` and `systemType` cannot be edited/deleted via normal Pages CMS actions (same style of protection already used for `PROTECTED_MENU_IDS`) |
| `src/pages/online-store/PagesManagement.jsx` | Show policy pages in the general Pages list alongside merchant pages, with a "Policy" badge; slug/name/delete stay locked (edit still routes to the same rich-text editor as Settings → Policies — same underlying page, two entry points) |
| `src/pages/section-builder/ui/fields/PageLinkCombobox.jsx` | Replace `MOCK_POLICIES` with real entries derived from `state.pages` (filter by `systemType` in the policy set), same mapping style already used for the "Pages" category |
| Storefront preview page-resolution layer (exact file TBD — likely `PreviewLive.jsx` / the router that resolves `state.pages` slugs to rendered content, per the existing `requiredSystemPages` usage) | Ensure `/policies/refund-policy` etc. resolve like any other system page and render the policy's rich-text body |

> No changes to `footer/Renderer.jsx`, `footer/schema.js`, or
> `MenusManagement.jsx` — both already handle arbitrary `{label, url}` pairs
> and will pick up real policy URLs with no code change.

---

## Data model

Five reserved pages, seeded via `defaultTheme.js`'s existing system-page
mechanism (same shape as `home`/`shop`/`product`/etc.):

```js
// New systemType values, alongside existing REQUIRED_SYSTEM_TYPES entries
const POLICY_SYSTEM_TYPES = [
  'policy_refund',
  'policy_privacy',
  'policy_terms',
  'policy_shipping',
  'policy_legal',
];
```

Each seeded page:

```js
{
  id: 'policy-refund',           // stable id, one per policy
  name: 'Return & refund policy',
  slug: '/policies/refund-policy',
  type: 'system',
  systemType: 'policy_refund',
  sections: [],                  // body authored as rich text, not sections
  body: '',                      // Tiptap JSON/HTML — starts empty ("No policy set")
  hiddenFromNav: true,           // not offered as a generic nav-menu "page" pick separately from the Policies category
  locked: true,                  // slug/name/delete locked; body editable
}
```

`REQUIRED_SYSTEM_TYPES` is **not** extended to include these — policy pages
are always-seeded but their emptiness is a valid, expected state (unlike
`shop`/`product`, which must be non-empty to function). A new
`requiredPolicyPages()` (or an extension of `mergeRequiredSystemPages()`) can
seed them without asserting on content.

Privacy policy note: Shopify auto-generates and marks Privacy as
"Automated." Out of scope here — ours starts as "No policy set" like the
rest, same as every other policy. *(Flagging as a deliberate simplification,
not an oversight — see Decisions NOT Taken.)*

---

## UI

### `SettingsIndex.jsx` (`/settings`)

Minimal card list (reuses `src/ce-ui/ui/card.tsx`), one row:

```
Settings
┌─────────────────────────────────────────┐
│ Policies                              › │
│ Return rules and written policies        │
└─────────────────────────────────────────┘
```

### `PoliciesSettings.jsx` (`/settings/policies`)

Mirrors the screenshot layout:

**Card 1 — Return and cancellation rules**
- Disabled/greyed card, "Coming soon" badge, no functional "Add rule" button
  (rendered but disabled, or omitted — lean towards omitted to avoid a dead
  click target).

**Card 2 — Written policies**
- 5 rows, each: icon, label, status badge, chevron.
  - Badge = "No policy set" when `body` is empty, "Set" (or similar) once
    content exists. No "Automated" badge (Privacy is treated like the rest —
    see note above).
  - Row click → opens `RichTextEditor.jsx` (reused as-is) scoped to that
    policy page's `body`, save via existing `runDraftAction`/`ACTIONS`
    dispatch used by `PageEditor.jsx`, not a new save path.
- **Contact information** row: not a policy page — reads/links to
  `CompanyProfile.jsx` data, badge shows "Required"/"Set" based on whether
  required company fields are filled.

---

## Storefront routability

The 5 policy pages are seeded as system pages specifically so the same
mechanism that guarantees `/shop` and `/product` resolve in the live preview
also guarantees `/policies/*` resolve — no bespoke routing code. The
integration point is wherever the preview currently maps a page's `slug` to
rendered output for existing system pages; this plan wires the 5 new
`systemType`s into that same map with a simple rich-text-body renderer
(reuse whatever renders `body`/Tiptap content elsewhere, e.g. the same
renderer `PageEditor.jsx`'s preview uses).

Exact file(s) for this step need confirmation once implementation starts —
flagged as the one part of this plan not fully pinned down by the
exploration so far (see Verification Checklist item on this).

---

## i18n

New `src/locales/{en,id}/settings.json`, registered in `src/i18n.js`,
following the existing `profile.*` key-shape convention from
`dashboard.json`:

```json
{
  "settings": {
    "title": "Settings",
    "sidebar": { "policies": "Policies" },
    "policies": {
      "title": "Policies",
      "rules": {
        "title": "Return and cancellation rules",
        "subtitle": "Set conditions and fees for return and cancellation requests",
        "comingSoon": "Coming soon"
      },
      "written": {
        "title": "Written policies",
        "subtitle": "Policies are linked in the footer of checkout and can be added to your online store menu",
        "noPolicySet": "No policy set",
        "refund": "Return and refund policy",
        "privacy": "Privacy policy",
        "terms": "Terms of service",
        "shipping": "Shipping policy",
        "legal": "Legal notice",
        "contact": "Contact information",
        "required": "Required"
      }
    }
  }
}
```

(`dashboard.json`'s existing `sidebar.settings` key is reused for the nav
label; the block above is the page-content namespace.)

---

## Verification Checklist

- [ ] `/settings` renders hub with one Policies card
- [ ] `/settings/policies` renders both cards matching screenshot layout
- [ ] Return/cancellation rules card is visibly disabled with "Coming soon", no working "Add rule"
- [ ] All 5 written-policy rows + Contact information row render with correct badges
- [ ] Clicking a written-policy row opens rich-text editor pre-scoped to that page
- [ ] Saving a policy body persists via existing draft/dispatch mechanism (survives navigating away and back)
- [ ] Policy pages cannot be deleted or have their slug changed from the general Pages CMS
- [ ] `PageLinkCombobox`'s "Policies" category shows real 5 entries (incl. new Legal notice), sourced from `state.pages`
- [ ] A policy link added to `footer-menu` or a footer `link_columns` column renders correctly in the footer (no renderer changes needed — confirms existing plumbing)
- [ ] `/policies/refund-policy` (and the other 4 slugs) resolve and render the authored body in the live storefront preview
- [ ] i18n: all new strings resolve in both `en` and `id`
- [ ] No existing return/order flows are touched (this is settings + content model only)

---

## Decisions NOT Taken

| Feature | Decision | Reason |
|---|---|---|
| Return/cancellation rule engine (conditions, fees, "Add rule") | Not built | Explicitly out of scope per user — Coming Soon stub only |
| Privacy policy "Automated" auto-generation | Not built | Treated like every other written policy (manual body, starts empty) — simplification, flagged above |
| Real backend API / `policyService.js` | Not built | Mock-only per user; reuses existing Pages CMS demo-draft state, no network calls |
| Reorganizing all existing flat settings pages under the new hub | Not built | User asked for minimal hub — only Policies hosted for now |
| Hiding policy pages from the general Pages list | Not built | Shown there too, badged "Policy", locked slug/delete — avoids a second hidden data model merchants can't find |

---

## Decisions Needed (before implementation starts)

1. ~~Policy pages' visibility in the general Pages list~~ — **Resolved**:
   shown in `/online-store/pages` with a "Policy" badge, locked slug/delete.
2. **Exact storefront preview file(s)** that resolve a system page's slug to
   rendered output. The earlier exploration confirmed the *pattern*
   (`requiredSystemPages` in `defaultTheme.js` guarantees pages like `shop`/
   `product` always exist in the draft) but not the specific file that does
   the "given the current preview URL, find the matching page in `state.pages`
   and render it" lookup — i.e. the actual URL → page → rendered-content
   routing inside the live theme preview. Without finding this, the 5 new
   policy pages would exist as data but nothing would render when navigating
   to `/policies/refund-policy` in the preview. This is a read-only
   investigation step, not a decision for the user — will be done first,
   before any file is edited.

---

## Addendum: modal editor (superseded full-page-editor UX)

After the initial implementation, real Shopify screenshots showed each
policy is edited in a **per-row modal** (template banner + collapsible
disclaimer + rich-text editor + Cancel/Save), not by navigating to a full
page. Implemented as:

- `src/pages/settings/PolicyEditorModal.jsx` — the modal (ce-ui `Popup`,
  `platform="desktop"`). Saves via the same `ACTIONS.UPDATE_PAGE` and the
  same content→sections sync PageEditor.jsx uses (extracted to
  `src/pages/section-builder/sections/pageContentSync.js` so both share it).
- `src/pages/settings/policyTemplates.js` — generic (not legally vetted)
  placeholder template HTML per policy kind, inserted via "Insert template",
  plus the shared disclaimer text.
- **Contact information** was reclassified as a 6th entry in
  `POLICY_SYSTEM_TYPES`/`createDefaultPages()` (`policy_contact`) — Shopify
  edits it the same way as the other five (rich text + template + modal),
  not as a link out to Business Information. Its empty-state badge reads
  "Required" instead of "No policy set", matching Shopify's compliance-flag
  framing.
- **Privacy** gets a "Use automated policy" toggle (`page.automated`,
  defaults `true`) — when on, content is generated live from company data
  (`buildAutomatedPrivacyPolicy`) and shown read-only instead of the rich
  text editor; toggling off reverts to a normal editable/template policy.
- `Online Store > Pages` still shows all six with a "Policy" badge and
  edits them via the full `PageEditor.jsx` (name/slug still locked there) —
  a second, still-valid entry point, per the earlier decision.

## What Is NOT in Scope

- Return/cancellation rule builder logic
- Real/backend-persisted policy data
- Publishing policy pages to a real (non-preview) live storefront/CDN
- Changes to `footer/Renderer.jsx`, `footer/schema.js`, `MenusManagement.jsx`
- Reorganizing existing settings pages (Plan, Billing, Users, etc.) under the new hub
- Multi-policy versioning/history, translations of policy body content, or country-specific policy variants
